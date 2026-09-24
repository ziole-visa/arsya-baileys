export type MediaDownloadRetryOptions = {
  enabled?: boolean;
  maxAttempts?: number;
  delayMs?: number;
};
export declare const DEFAULT_MEDIA_DOWNLOAD_RETRY: {
  enabled: boolean;
  maxAttempts: number;
  delayMs: number;
};
export declare const RETRYABLE_MEDIA_STATUS: number[];
export declare function resolveMediaDownloadRetryOptions(config?: {
  mediaDownloadRetry?: false | MediaDownloadRetryOptions;
}): {
  enabled: boolean;
  maxAttempts: number;
  delayMs: number;
};
export declare function defaultShouldRetryMedia(err: any): boolean;
export declare function withMediaDownloadRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts?: MediaDownloadRetryOptions & {
    shouldRetry?: (err: any, attempt: number) => boolean;
    logger?: {
      warn?: (...args: any[]) => void;
    };
    label?: string;
  },
): Promise<T>;
export declare function downloadToBuffer(
  message: {
    mediaKey?: Uint8Array | null;
    directPath?: string | null;
    url?: string | null;
  },
  type: string,
  opts?: {
    startByte?: number;
    endByte?: number;
    options?: RequestInit;
  },
  retry?: MediaDownloadRetryOptions & {
    shouldRetry?: (err: any, attempt: number) => boolean;
    logger?: unknown;
    label?: string;
  },
): Promise<Buffer>;
export declare function downloadContentFromMessageWithRetry(
  message: {
    mediaKey?: Uint8Array | null;
    directPath?: string | null;
    url?: string | null;
  },
  type: string,
  opts?: {
    startByte?: number;
    endByte?: number;
    options?: RequestInit;
  },
  retry?: MediaDownloadRetryOptions & {
    shouldRetry?: (err: any, attempt: number) => boolean;
    logger?: unknown;
    label?: string;
  },
): Promise<any>;
declare const _default: {
  DEFAULT_MEDIA_DOWNLOAD_RETRY: typeof DEFAULT_MEDIA_DOWNLOAD_RETRY;
  RETRYABLE_MEDIA_STATUS: typeof RETRYABLE_MEDIA_STATUS;
  resolveMediaDownloadRetryOptions: typeof resolveMediaDownloadRetryOptions;
  defaultShouldRetryMedia: typeof defaultShouldRetryMedia;
  withMediaDownloadRetry: typeof withMediaDownloadRetry;
  downloadToBuffer: typeof downloadToBuffer;
  downloadContentFromMessageWithRetry: typeof downloadContentFromMessageWithRetry;
};
export default _default;
