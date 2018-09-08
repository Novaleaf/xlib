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
    readBegin(): Promise<TValue>;
    readEnd(): void;
    /** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
    tryWriteBegin(): boolean;
    writeBegin(): Promise<void>;
    writeEnd(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue>): Promise<void>;
    /** hold a non-exclusive read lock for the duration of the promise. */
    read(/** until this promise returns, a non-exclusive read lock will be held*/ readFcn?: (value: TValue) => (PromiseLike<any> | any)): Promise<TValue>;
    /** hold an exclusive write lock for the duration of the promise. */
    write(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue>): Promise<void>;
}
//# sourceMappingURL=threading.d.ts.map