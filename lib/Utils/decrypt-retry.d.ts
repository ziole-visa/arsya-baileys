export declare const DEFAULT_DECRYPT_RETRY: {
  enabled: boolean;
  maxAttempts: number;
  delayMs: number;
};
export declare function resolveDecryptRetryOptions(config?: any): {
  enabled: boolean;
  maxAttempts: number;
  delayMs: number;
};
export declare function withDecryptRetry<T>(
  fn: (attempt: number) => Promise<T> | T,
  opts?: {
    maxAttempts?: number;
    delayMs?: number;
    shouldRetry?: (err: any, attempt: number) => boolean;
    logger?: any;
    label?: string;
  },
): Promise<T>;
declare const _default: {
  DEFAULT_DECRYPT_RETRY: typeof DEFAULT_DECRYPT_RETRY;
  resolveDecryptRetryOptions: typeof resolveDecryptRetryOptions;
  withDecryptRetry: typeof withDecryptRetry;
};
export default _default;
//# sourceMappingURL=decrypt-retry.d.ts.map
