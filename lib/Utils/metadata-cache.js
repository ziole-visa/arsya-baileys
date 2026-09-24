/**
 * arsya-baileys — Metadata cache with TTL
 * Built-in group/community metadata cache + in-flight request coalescing.
 */

import { LRUCache } from 'lru-cache';

export const DEFAULT_METADATA_CACHE = {
  enabled: true,
  /** TTL in seconds (default 5 minutes) */
  ttl: 300,
  /** max entries (LRU) */
  max: 1000,
};

/** Resolve metadataCache config: false → disabled; object → merge defaults */
export function resolveMetadataCacheOptions(config) {
  const raw = config?.metadataCache;
  if (raw === false) {
    return { enabled: false, ttl: 0, max: 0 };
  }
  const merged = {
    ...DEFAULT_METADATA_CACHE,
    ...(raw && typeof raw === 'object' ? raw : {}),
  };
  merged.enabled = merged.enabled !== false;
  merged.ttl = Math.max(0, Number(merged.ttl) || DEFAULT_METADATA_CACHE.ttl);
  merged.max = Math.max(1, Number(merged.max) || DEFAULT_METADATA_CACHE.max);
  if (!merged.enabled) merged.ttl = 0;
  return merged;
}

/**
 * TTL cache for metadata keyed by jid.
 * Coalesces concurrent fetches for the same key.
 */
export class MetadataCache {
  constructor({ ttl = 300, max = 1000, logger } = {}) {
    this.ttl = Math.max(0, Number(ttl) || 0);
    this.max = Math.max(1, Number(max) || 1);
    this.logger = logger;
    this.store = new LRUCache({
      max: this.max,
      ttl: this.ttl > 0 ? this.ttl * 1000 : undefined,
      ttlAutopurge: this.ttl > 0,
      updateAgeOnGet: true,
    });
    this.inflight = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, coalesced: 0 };
  }

  get(key) {
    if (!key) return undefined;
    const hit = this.store.get(key);
    if (hit !== undefined) this.stats.hits += 1;
    else this.stats.misses += 1;
    return hit;
  }

  set(key, value) {
    if (!key || value === undefined || value === null) return;
    this.store.set(key, value);
    this.stats.sets += 1;
  }

  delete(key) {
    if (key) this.store.delete(key);
  }

  clear() {
    this.store.clear();
    this.inflight.clear();
  }

  /**
   * Get from cache or run `fetcher(jid)` once (coalesced).
   * @param {string} key
   * @param {(key: string) => Promise<any>} fetcher
   * @param {{ force?: boolean }} [opts]
   */
  async getOrFetch(key, fetcher, { force = false } = {}) {
    if (!force) {
      const cached = this.get(key);
      if (cached !== undefined) return cached;
    }
    if (this.inflight.has(key)) {
      this.stats.coalesced += 1;
      return this.inflight.get(key);
    }
    const promise = Promise.resolve()
      .then(() => fetcher(key))
      .then((value) => {
        if (value !== undefined && value !== null) this.set(key, value);
        return value;
      })
      .catch((err) => {
        this.logger?.warn?.({ err, key }, '[arsya-baileys] metadata fetch failed');
        throw err;
      })
      .finally(() => {
        this.inflight.delete(key);
      });
    this.inflight.set(key, promise);
    return promise;
  }

  get size() {
    return this.store.size;
  }
}

/**
 * Create a MetadataCache from SocketConfig.
 * Returns null when metadataCache is disabled.
 */
export function createMetadataCache(config) {
  const opts = resolveMetadataCacheOptions(config);
  if (!opts.enabled) return null;
  return new MetadataCache({
    ttl: opts.ttl,
    max: opts.max,
    logger: config?.logger,
  });
}

export default {
  DEFAULT_METADATA_CACHE,
  resolveMetadataCacheOptions,
  MetadataCache,
  createMetadataCache,
};
