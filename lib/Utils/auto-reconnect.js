/**
 * arsya-baileys — Auto reconnect helper
 * Wraps makeWASocket recreation with exponential backoff on connection close.
 * Logged-out / bad-session will NOT reconnect (user must re-pair).
 */

import { DisconnectReason } from '../Types/index.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_IGNORED = new Set([
  DisconnectReason.loggedOut,
  DisconnectReason.badSession,
  DisconnectReason.multideviceMismatch,
  DisconnectReason.forbidden,
]);

export class AutoReconnect {
  /**
   * @param {object} opts
   * @param {(config: any) => any} opts.factory  function that creates a new socket (e.g. makeWASocket)
   * @param {any} opts.config  connection config passed to factory
   * @param {number} [opts.maxRetries=5]
   * @param {number} [opts.baseDelayMs=1000]
   * @param {number} [opts.maxDelayMs=30000]
   * @param {(err: any, sock: any) => boolean} [opts.shouldReconnect] custom predicate
   * @param {(info: any) => void} [opts.onReconnect] called with { attempt, delayMs, error, sock }
   * @param {object} [opts.logger]
   */
  constructor({ factory, config, maxRetries = 5, baseDelayMs = 1000, maxDelayMs = 30000, shouldReconnect, onReconnect, logger }) {
    if (typeof factory !== 'function') {
      throw new Error('[arsya-baileys] AutoReconnect: factory (makeWASocket) is required');
    }
    this.factory = factory;
    this.config = config;
    this.maxRetries = Math.max(0, Number(maxRetries) || 0);
    this.baseDelayMs = Math.max(50, Number(baseDelayMs) || 1000);
    this.maxDelayMs = Math.max(this.baseDelayMs, Number(maxDelayMs) || 30000);
    this.shouldReconnect = shouldReconnect;
    this.onReconnect = onReconnect;
    this.logger = logger || config?.logger;
    this.attempt = 0;
    this.sock = null;
    this._stopped = false;
    this._reconnecting = false;
    this._unsubscribe = null;
  }

  get retries() {
    return this.attempt;
  }

  _log(level, obj, msg) {
    const log = this.logger?.[level];
    if (typeof log === 'function') log.call(this.logger, obj, msg);
  }

  _canReconnect(error) {
    if (this._stopped) return false;
    if (typeof this.shouldReconnect === 'function') {
      try {
        return Boolean(this.shouldReconnect(error, this.sock));
      } catch {
        return false;
      }
    }
    const statusCode =
      error?.output?.statusCode ??
      error?.data?.statusCode ??
      error?.statusCode;
    if (statusCode !== undefined && DEFAULT_IGNORED.has(statusCode)) {
      return false;
    }
    return true;
  }

  _delayFor(attempt) {
    const exp = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** Math.max(0, attempt - 1));
    const jitter = Math.floor(Math.random() * Math.min(250, exp * 0.2));
    return exp + jitter;
  }

  /** Create first socket and attach listener. Returns the socket. */
  start() {
    this._stopped = false;
    this.attempt = 0;
    this._attach(this.factory(this.config));
    return this.sock;
  }

  _attach(sock) {
    this.sock = sock;
    if (this._unsubscribe) {
      try { this._unsubscribe(); } catch { /* ignore */ }
      this._unsubscribe = null;
    }
    const handler = ({ connection, lastDisconnect }) => {
      if (connection !== 'close' || this._stopped || this._reconnecting) return;
      const error = lastDisconnect?.error;
      if (!this._canReconnect(error)) {
        this._log('info', { error }, '[arsya-baileys] AutoReconnect: not reconnecting (fatal disconnect)');
        this.stop();
        return;
      }
      void this._reconnect(error);
    };
    sock.ev.on('connection.update', handler);
    this._unsubscribe = () => {
      try { sock.ev.off('connection.update', handler); } catch { /* ignore */ }
    };
    return sock;
  }

  async _reconnect(error) {
    if (this._reconnecting || this._stopped) return;
    if (this.attempt >= this.maxRetries) {
      this._log('error', { attempt: this.attempt, error }, '[arsya-baileys] AutoReconnect: max retries reached');
      this.stop();
      return;
    }
    this._reconnecting = true;
    this.attempt += 1;
    const delayMs = this._delayFor(this.attempt);
    this._log('warn', { attempt: this.attempt, maxRetries: this.maxRetries, delayMs, error }, '[arsya-baileys] AutoReconnect: reconnecting…');
    await sleep(delayMs);
    if (this._stopped) {
      this._reconnecting = false;
      return;
    }
    try {
      const old = this.sock;
      const next = this.factory(this.config);
      this._attach(next);
      try { old?.ev?.removeAllListeners?.('connection.update'); } catch { /* ignore */ }
      this._reconnecting = false;
      if (typeof this.onReconnect === 'function') {
        try { this.onReconnect({ attempt: this.attempt, delayMs, error, sock: next }); } catch { /* ignore */ }
      }
      // reset attempt on successful open
      const onOpen = ({ connection }) => {
        if (connection === 'open') {
          this.attempt = 0;
          try { next.ev.off('connection.update', onOpen); } catch { /* ignore */ }
        }
      };
      next.ev.on('connection.update', onOpen);
    } catch (err) {
      this._reconnecting = false;
      this._log('error', { err, attempt: this.attempt }, '[arsya-baileys] AutoReconnect: failed to recreate socket');
      void this._reconnect(err);
    }
  }

  stop() {
    this._stopped = true;
    if (this._unsubscribe) {
      try { this._unsubscribe(); } catch { /* ignore */ }
      this._unsubscribe = null;
    }
  }
}

export default AutoReconnect;
