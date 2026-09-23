export declare class SendQueue {
  constructor(opts?: {
    minIntervalMs?: number;
    maxConcurrent?: number;
    maxQueue?: number;
    logger?: any;
  });
  minIntervalMs: number;
  maxConcurrent: number;
  maxQueue: number;
  logger?: any;
  get pending(): number;
  get active(): number;
  get stats(): {
    pending: number;
    active: number;
    minIntervalMs: number;
    maxConcurrent: number;
    maxQueue: number;
  };
  push<T>(task: () => Promise<T> | T): Promise<T>;
  clear(reason?: string): number;
  close(): void;
}
export default SendQueue;
//# sourceMappingURL=send-queue.d.ts.map
