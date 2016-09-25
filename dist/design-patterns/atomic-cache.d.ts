/// <reference types="node" />
/// <reference types="bluebird" />
import moment = require("moment");
import Promise = require("bluebird");
/**
 * abstract class used for elements stored in the AtomicCache object
 */
export declare abstract class AtomicCacheItem<TValue, TModifyParams> {
    key: string;
    /** max amount of time between uses of the cacheItem before we dispose it */
    protected _maxUnusedDuration: moment.Duration;
    /** max amount of time between sync's */
    protected _maxDesyncedDuration: moment.Duration;
    /** if set, and the first sync (during initialization) fails, all future .get() calls within the given duration will return rejected with the same error originally returned from sync.
    This is useful if for example, the user requests a key that does not exist, and you don't want to keep looking that up in the database.
    If you use this, be sure you put retry logic into your doSyncWithMaster_Helper_Full() and doSyncWithMaster_Helper_Read() functions.
    */
    protected _blacklistIfFirstSyncFailsDuration: moment.Duration | null;
    /** the last time this was synced with the datastore  max sync time is set by serverConfig.balance, and is 1 min. */
    private _lastSyncTime;
    /** the last time this was used.  older than max sync time (1 minute) and we dispose */
    private _lastUsedTime;
    private _syncPending;
    /** read only:  the last time this was used */
    readonly lastUsedTime: moment.Moment;
    /** private helper to know when we have read the state from datastore */
    private _isInitialized;
    /** private helper to know when this should not be used again */
    private _isDisposed;
    constructor(key: string, 
        /** max amount of time between uses of the cacheItem before we dispose it */
        _maxUnusedDuration: moment.Duration, 
        /** max amount of time between sync's */
        _maxDesyncedDuration: moment.Duration, 
        /** if set, and the first sync (during initialization) fails, all future .get() calls within the given duration will return rejected with the same error originally returned from sync.
        This is useful if for example, the user requests a key that does not exist, and you don't want to keep looking that up in the database.
        If you use this, be sure you put retry logic into your doSyncWithMaster_Helper_Full() and doSyncWithMaster_Helper_Read() functions.
        */
        _blacklistIfFirstSyncFailsDuration?: moment.Duration | null);
    /**
     *  if it's time to resync
     */
    protected isTimeToResync(): boolean;
    /**
     *  if there is cached data to write
     */
    protected abstract hasDataToWrite(): boolean;
    /**
     *  based on the cached value + any cached-to-write, but without knowing the actual "master" state, return the expected value.
     */
    protected abstract calculateCurrentValue(): TValue;
    protected _blacklistIfFirstSyncFails_Timeout: moment.Moment;
    protected _blacklistIfFirstSyncFails_InitError: Error | null;
    /**
     *  attempts to sync with master, if there is any sync work to be done
     */
    private _trySyncWithMaster(forceSync?);
    /**
     *  do the actual work of syncing with master.
     * inside this function you should check if anything is needed to write, or if you are ok with just reading the master data
     */
    protected abstract doSyncWithMaster_Helper_Full(): Promise<any>;
    protected abstract doSyncWithMaster_Helper_Read(): Promise<any>;
    get(): Promise<TValue>;
    getForceSync(): Promise<TValue>;
    modify(params: TModifyParams): void;
    /**
     *  cache modifyParams for apply during this.calculateCurrentValue()  (which is also used when syncing with master)
     * @param params
     */
    protected abstract cacheModificationsLocally(params: TModifyParams): void;
    /**
 * if last use is too old, will return true and dispose.
 */
    tryDisposeIfTooOld(forceDisposeNow?: boolean): boolean;
    /**
     * do a final sync with the master and mark this object as unusable
     */
    private _dispose();
}
/**
 *  allows for local caching of values, plus ability to atomically synchronize modifications with the master
 *  this pattern is known to work with google datastore (via transactions) so can probably be adapted to anything else too.
 * this is useful for data that is tollerant of eventual-consistency.  not so useful as-is for immediate/atomic consistency needs.
 */
export declare class AtomicCache<CacheItem extends AtomicCacheItem<any, any>, TValue, TModifyParams> {
    private _cacheItemCtor;
    private _autoTryCleanupInterval;
    constructor(_cacheItemCtor: (key: string) => CacheItem, _autoTryCleanupInterval: moment.Duration);
    private _storage;
    private _nextInspectIndex;
    private _inspectKeys;
    private _tryCleanupOne(/** set to true to force cleaning up all keys immediately  for testing "new apiKey" roundtrip times.  default false. */ testingForceDispose?);
    private _getItem(key);
    getTestForceNew(key: string): Promise<TValue>;
    get(apiKey: string): Promise<TValue>;
    getForceRefresh(apiKey: string): Promise<TValue>;
    modify(key: string, params: TModifyParams): Promise<TValue>;
}
