export declare class AutoReconnect {
  constructor(opts: {
    factory: (config: any) => any;
    config: any;
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldReconnect?: (err: any, sock: any) => boolean;
    onReconnect?: (info: { attempt: number; delayMs: number; error?: any; sock: any }) => void;
    logger?: any;
  });
  factory: (config: any) => any;
  config: any;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldReconnect?: (err: any, sock: any) => boolean;
  onReconnect?: (info: { attempt: number; delayMs: number; error?: any; sock: any }) => void;
  logger?: any;
  attempt: number;
  sock: any;
  get retries(): number;
  start(): any;
  stop(): void;
}
export default AutoReconnect;
//# sourceMappingURL=auto-reconnect.d.ts.map
