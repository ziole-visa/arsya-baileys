/**
 * arsya-baileys — Auto decrypt retry helpers
 * Used by messages-recv to re-attempt decrypt / retry-receipt flows.
 */

import { delay } from './generics.js';

export const DEFAULT_DECRYPT_RETRY = {
  enabled: true,
  maxAttempts: 3,
  delayMs: 400,
};

export function resolveDecryptRetryOptions(config) {
  const raw = config?.autoDecryptRetry;
  if (raw === false) {
    return { enabled: false, maxAttempts: 1, delayMs: 0 };
  }
  const merged = {
    ...DEFAULT_DECRYPT_RETRY,
    ...(raw && typeof raw === 'object' ? raw : {}),
  };
  merged.maxAttempts = Math.max(1, Number(merged.maxAttempts) || 1);
  merged.delayMs = Math.max(0, Number(merged.delayMs) || 0);
  merged.enabled = merged.enabled !== false;
  if (!merged.enabled) merged.maxAttempts = 1;
  return merged;
}

/**
 * Run `fn` with up to maxAttempts tries. `shouldRetry(err, attempt)` decides retry.
 * Non-retryable errors are rethrown immediately.
 */
export async function withDecryptRetry(fn, { maxAttempts = 3, delayMs = 400, shouldRetry, logger, label = 'decrypt' } = {}) {
  const attempts = Math.max(1, maxAttempts);
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const retryable = typeof shouldRetry === 'function' ? shouldRetry(err, attempt) : true;
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

export default { DEFAULT_DECRYPT_RETRY, resolveDecryptRetryOptions, withDecryptRetry };
