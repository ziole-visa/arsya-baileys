/**
 * arsya-baileys — Anti-lag send queue / rate limiter
 * Serializes & rate-limits outbound relayMessage calls so bulk sends
 * don't flood the socket (reduces 429 / connection drops / lag).
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class SendQueue {
  /**
   * @param {object} [opts]
   * @param {number} [opts.minIntervalMs=150] min delay between send starts
   * @param {number} [opts.maxConcurrent=2] max in-flight sends
   * @param {number} [opts.maxQueue=500] max pending tasks before reject
   * @param {object} [opts.logger] optional pino-like logger
   */
  constructor({ minIntervalMs = 150, maxConcurrent = 2, maxQueue = 500, logger } = {}) {
    this.minIntervalMs = Math.max(0, Number(minIntervalMs) || 0);
    this.maxConcurrent = Math.max(1, Number(maxConcurrent) || 1);
    this.maxQueue = Math.max(1, Number(maxQueue) || 1);
    this.logger = logger;
    this._queue = [];
    this._active = 0;
    this._lastStart = 0;
    this._draining = false;
    this._closed = false;
  }

  get pending() {
    return this._queue.length;
  }

  get active() {
    return this._active;
  }

  get stats() {
    return {
      pending: this._queue.length,
      active: this._active,
      minIntervalMs: this.minIntervalMs,
      maxConcurrent: this.maxConcurrent,
      maxQueue: this.maxQueue,
    };
  }

  /**
   * Enqueue a task (function returning a Promise).
   * Resolves/rejects with the task result.
   */
  push(task) {
    if (this._closed) {
      return Promise.reject(new Error('[arsya-baileys] SendQueue is closed'));
    }
    return new Promise((resolve, reject) => {
      if (this._queue.length >= this.maxQueue) {
        const err = new Error(`[arsya-baileys] SendQueue overflow (maxQueue=${this.maxQueue})`);
        if (this.logger) this.logger.warn({ stats: this.stats }, err.message);
        reject(err);
        return;
      }
      this._queue.push({ task, resolve, reject });
      void this._drain();
    });
  }

  /** Clear pending tasks (rejects them). Active tasks finish normally. */
  clear(reason = 'SendQueue cleared') {
    const dropped = this._queue.splice(0, this._queue.length);
    for (const item of dropped) {
      item.reject(new Error(`[arsya-baileys] ${reason}`));
    }
    return dropped.length;
  }

  close() {
    this._closed = true;
    this.clear('SendQueue closed');
  }

  async _drain() {
    if (this._draining) return;
    this._draining = true;
    try {
      while (this._queue.length > 0 && !this._closed) {
        if (this._active >= this.maxConcurrent) {
          await sleep(10);
          continue;
        }
        const elapsed = Date.now() - this._lastStart;
        if (this._lastStart && elapsed < this.minIntervalMs) {
          await sleep(this.minIntervalMs - elapsed);
          continue;
        }
        const item = this._queue.shift();
        if (!item) break;
        this._active += 1;
        this._lastStart = Date.now();
        Promise.resolve()
          .then(() => item.task())
          .then(item.resolve, item.reject)
          .finally(() => {
            this._active -= 1;
          });
      }
    } finally {
      this._draining = false;
      if (this._queue.length > 0 && !this._closed) {
        void this._drain();
      }
    }
  }
}

export default SendQueue;
