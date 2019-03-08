/** an async+promise capable, readerwriter lock.
 *
 * allows multiple readers (non-exclusive read lock) and single-writers (exclusive write lock)
 *
 * additionally, allows storage of a value that is atomically written (a helper shortcut for common use: using this value is not required)
 *
 * when a race occurs, writes take precidence
 */
export declare class AsyncReaderWriterLock<TValue = void> {
    constructor(options?: {
        writeInProgress: boolean;
    });
    toJson(): {
        currentWrite: {
            writeId: number;
        };
        pendingWrites: number;
        currentReads: number;
        pendingReads: number;
        value: string;
    };
    private writeCounter;
    private currentReads;
    private pendingReadCount;
    private pendingWrites;
    private currentWrite;
    private _value;
    /** returns true if a write is pending (in progress or queued). if false, you can read without being blocked. */
    isWritePending(): boolean;
    /** begin a read lock.   the returned promise resolves once the lock is aquired
     *
     * many simulatanious read locks are allowed, and be sure to call [[readEnd]] for each call of [[readBegin]]
     */
    readBegin(): Promise<TValue | undefined>;
    /** release your read lock */
    readEnd(): void;
    /** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
    tryWriteBegin(): boolean;
    /** take a write lock.   returned promise resolves once your lock is aquired. */
    writeBegin(): Promise<void>;
    /** finish the write lock, allowing writing of the stored [[value]] when doing so */
    writeEnd(
    /**write the data [[value]], or if a promise is passed, an exclusive write lock will be held until it exits*/
    valueOrWritePromise?: TValue | PromiseLike<TValue>): Promise<void>;
    /** hold a non-exclusive read lock for the duration of the promise. */
    read(/** until this promise returns, a non-exclusive read lock will be held*/ readFcn?: (value: TValue) => (PromiseLike<any> | any)): Promise<TValue>;
    /** hold an exclusive write lock for the duration of the promise. */
    write(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue>): Promise<void>;
}
/** required arguments when constructing a new autoscaler */
export interface IAutoscalerOptions {
    /** minimum parallel requests (maxActive) you allow, regardless of how long the autoscaler has been idle.  should be 1 or more.
    */
    minParallel: number;
    /** optional.  set a max to number of parallel requests (maxActive) no matter how active the calls
        * @default undefined (no limit)
    */
    maxParallel?: number;
    /** if we get a "TOO_BUSY" rejection (from the ```failureListener```), how long we should wait before trying to expand our maxActive again. */
    busyGrowDelayMs: number;
    /** when we are at max parallel and still able to successfully submit requests (not getting "TOO_BUSY" errors), how long to delay before increasing our maxActive by 1. */
    growDelayMs: number;
    /** when we are under our max parallel, how long before our max should decrease by 1 .   Also, when we are consistently getting "TOO_BUSY" rejections, we will decrease our maxActive by 1 this often.  pass null to never decay (not recomended).*/
    idleOrBusyDecreaseMs: number;
    /** optional.  when we first get a "TOO_BUSY" rejection, we will reduce maxActive by this amount.  interval to check if we should penalize resets after ```busyWaitMs```
     * Note: when too busy, we also reduce maxActive via the ```decayDelayMs``` parameter every so often (as set by decayDelayMs)..   set to 0 to have no penalty except that set by decayDelayMs
        * @default 1
     */
    busyExtraPenalty?: number;
}
/** while this is probably only useful+used by the ```net.RemoteHttpEndpoint``` class, this is a generic autoscaler implementation,
    * meaning that it will scale requests to a ```backendWorker``` function, gradually increasing activeParallel requests over time.   Requests exceeding activeParallel will be queued in a FIFO fashion.
    *
    the only requirement is that the target ```backendWorker``` function  return a promise,
    * and you specify a ```failureListener``` function that can tell the difference between a failure and a need for backing off.
    */
export declare class Autoscaler<TWorkerFunc extends (...args: any[]) => Promise<any>, TError extends Error> {
    private options;
    private backendWorker;
    /** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "TOO_BUSY" if the request should be retried  */
    private failureListener;
    constructor(options: IAutoscalerOptions, backendWorker: TWorkerFunc, 
    /** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "TOO_BUSY" if the request should be retried  */
    failureListener: ((err: TError) => "FAIL" | "TOO_BUSY"));
    private metrics;
    private pendingCalls;
    private activeCalls;
    toJson(): {
        pendingCalls: number;
        activeCalls: number;
        metrics: {
            /** the max number of active parallel requests we currently allow.   increases and decreases based on the growDelayMs and decayDelayMs */
            maxActive: number;
            /** time in which we decided to stop growing (based on options.busyWaitMs ) */
            tooBusyWaitStart: Date;
            /** the current number of parallel requests active in our backendWorker */
            activeCount: number;
            /** the last time we grew our maxActive count  */
            lastGrow: Date;
            /** the last time we were at our maxActive count */
            lastMax: Date;
            /** the last time we got a "TOO_BUSY" rejection from the backendWorker.  note that this could happen while in a options.busyWaitMs interval, if the backend is sufficently overwhelmed */
            lastTooBusy: Date;
            /** the last time we decayed our maxActive */
            lastDecay: Date;
        };
        options: IAutoscalerOptions;
    };
    /** submit a request to the backend worker.
     *
     * **Important note**: to avoid "unhandled promise rejections" you need to make sure the returned Promise has a catch() applied to it.
     * **NOT** just store the promise in an array to inspect later.  This is because if the request fails, the returned promise gets rejected, and if the Promise internal logic doesn't see a .catch() it will show the global "unhandled rejected promse" soft error message.
     */
    submitRequest: TWorkerFunc;
    private _lastTryCallTime;
    private _tryCallBackend;
    private _heartbeatHandle;
}
//# sourceMappingURL=threading.d.ts.map