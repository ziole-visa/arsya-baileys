export type MetadataCacheOptions = {
  enabled?: boolean;
  /** TTL in seconds (default 300 = 5 minutes) */
  ttl?: number;
  /** max LRU entries (default 1000) */
  max?: number;
};
export declare const DEFAULT_METADATA_CACHE: {
  enabled: boolean;
  ttl: number;
  max: number;
};
export declare function resolveMetadataCacheOptions(config?: {
  metadataCache?: false | MetadataCacheOptions;
}): {
  enabled: boolean;
  ttl: number;
  max: number;
};
export declare class MetadataCache {
  constructor(opts?: {
    ttl?: number;
    max?: number;
    logger?: {
      warn?: (...args: any[]) => void;
      debug?: (...args: any[]) => void;
    };
  });
  ttl: number;
  max: number;
  stats: {
    hits: number;
    misses: number;
    sets: number;
    coalesced: number;
  };
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  clear(): void;
  getOrFetch<T = unknown>(
    key: string,
    fetcher: (key: string) => Promise<T>,
    opts?: {
      force?: boolean;
    },
  ): Promise<T>;
  readonly size: number;
}
export declare function createMetadataCache(config?: {
  metadataCache?: false | MetadataCacheOptions;
  logger?: unknown;
}): MetadataCache | null;
declare const _default: {
  DEFAULT_METADATA_CACHE: typeof DEFAULT_METADATA_CACHE;
  resolveMetadataCacheOptions: typeof resolveMetadataCacheOptions;
  MetadataCache: typeof MetadataCache;
  createMetadataCache: typeof createMetadataCache;
};
export default _default;
