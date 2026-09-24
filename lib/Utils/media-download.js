/**
 * arsya-baileys — Media download helpers
 * Stream / toBuffer / retry wrappers around downloadContentFromMessage.
 */

import { delay } from './generics.js';
import {
  downloadContentFromMessage,
  toBuffer as streamToBuffer,
} from './messages-media.js';

export const DEFAULT_MEDIA_DOWNLOAD_RETRY = {
  enabled: true,
  maxAttempts: 3,
  delayMs: 500,
};

/** Transient HTTP statuses worth retrying (network-ish / rate-limit / server) */
export const RETRYABLE_MEDIA_STATUS = [408, 425, 429, 500, 502, 503, 504];

export function resolveMediaDownloadRetryOptions(config) {
  const raw = config?.mediaDownloadRetry;
  if (raw === false) {
    return { enabled: false, maxAttempts: 1, delayMs: 0 };
  }
  const merged = {
    ...DEFAULT_MEDIA_DOWNLOAD_RETRY,
    ...(raw && typeof raw === 'object' ? raw : {}),
  };
  merged.maxAttempts = Math.max(1, Number(merged.maxAttempts) || 1);
  merged.delayMs = Math.max(0, Number(merged.delayMs) || 0);
  merged.enabled = merged.enabled !== false;
  if (!merged.enabled) merged.maxAttempts = 1;
  return merged;
}

function extractStatus(err) {
  if (typeof err?.status === 'number') return err.status;
  if (typeof err?.output?.statusCode === 'number') return err.output.statusCode;
  if (typeof err?.statusCode === 'number') return err.statusCode;
  return undefined;
}

/** Default predicate: network errors + transient HTTP statuses */
export function defaultShouldRetryMedia(err) {
  if (!err) return false;
  const code = err.code || err.cause?.code;
  if (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNABORTED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'UND_ERR_SOCKET' ||
    code === 'UND_ERR_CONNECT_TIMEOUT'
  ) {
    return true;
  }
  const status = extractStatus(err);
  if (typeof status === 'number') {
    return RETRYABLE_MEDIA_STATUS.includes(status);
  }
  return true;
}

/**
 * Run `fn` with up to maxAttempts tries (same house style as withDecryptRetry).
 */
export async function withMediaDownloadRetry(
  fn,
  {
    maxAttempts = 3,
    delayMs = 500,
    shouldRetry = defaultShouldRetryMedia,
    logger,
    label = 'media-download',
  } = {},
) {
  const attempts = Math.max(1, maxAttempts);
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const retryable =
        typeof shouldRetry === 'function' ? shouldRetry(err, attempt) : true;
      if (!retryable || attempt >= attempts) break;
      const wait = delayMs * attempt;
      logger?.warn?.(
        { err, attempt, maxAttempts, wait, label },
        `[arsya-baileys] ${label} failed, retrying`,
      );
      if (wait > 0) await delay(wait);
    }
  }
  throw lastErr;
}

/**
 * Download a downloadable message (mediaKey/directPath/url) to a Buffer with retry.
 * @param {{ mediaKey?: string; directPath?: string; url?: string }} message
 * @param {string} type MediaType e.g. 'image' | 'video' | 'audio' | 'document'
 * @param {{ startByte?: number; endByte?: number; options?: RequestInit }} [opts]
 * @param {{ maxAttempts?: number; delayMs?: number; shouldRetry?: (err, attempt) => boolean; logger?: any; label?: string }} [retry]
 */
export async function downloadToBuffer(message, type, opts = {}, retry = {}) {
  const stream = await downloadContentFromMessageWithRetry(message, type, opts, retry);
  return streamToBuffer(stream);
}

/**
 * downloadContentFromMessage with automatic retry on transient failures.
 */
export async function downloadContentFromMessageWithRetry(
  message,
  type,
  opts = {},
  retry = {},
) {
  return withMediaDownloadRetry(
    () => downloadContentFromMessage(message, type, opts),
    retry,
  );
}

export default {
  DEFAULT_MEDIA_DOWNLOAD_RETRY,
  RETRYABLE_MEDIA_STATUS,
  resolveMediaDownloadRetryOptions,
  defaultShouldRetryMedia,
  withMediaDownloadRetry,
  downloadToBuffer,
  downloadContentFromMessageWithRetry,
};
