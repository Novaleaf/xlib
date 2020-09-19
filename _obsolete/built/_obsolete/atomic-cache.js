"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
//import * as moment from "moment";
const luxon = tslib_1.__importStar(require("luxon"));
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
/**
 * abstract class used for elements stored in the AtomicCache object
 */
class AtomicCacheItem {
    constructor(key, 
    /** max amount of time between uses of the cacheItem before we dispose it */
    _maxUnusedDuration, 
    /** max amount of time between sync's */
    _maxDesyncedDuration, 
    /** if set, and the first sync (during initialization) fails, all future .get() calls within the given duration will return rejected with the same error originally returned from sync.
    This is useful if for example, the user requests a key that does not exist.
    If you use this, be sure you put retry logic into your doSyncWithMaster functions.
    */
    _blacklistIfFirstSyncFailsDuration = null) {
        this.key = key;
        this._maxUnusedDuration = _maxUnusedDuration;
        this._maxDesyncedDuration = _maxDesyncedDuration;
        this._blacklistIfFirstSyncFailsDuration = _blacklistIfFirstSyncFailsDuration;
        this._syncPending = bluebird_1.default.resolve();
        /** private helper to know when we have read the state from datastore */
        this._isInitialized = false;
        /** private helper to know when this should not be used again */
        this._isDisposed = false;
        this._lastUsedTime = luxon.DateTime.utc();
        this._trySyncWithMaster();
    }
    /** read only:  the last time this was used */
    get lastUsedTime() {
        return this._lastUsedTime;
    }
    /**
     *  if it's time to resync
     */
    isTimeToResync() {
        let now = luxon.DateTime.utc();
        if (this._lastSyncTime.plus(this._maxDesyncedDuration) <= now) {
            //out of sync
            return true;
        }
        return false;
    }
    /**
     *  attempts to sync with master, if there is any sync work to be done
     */
    _trySyncWithMaster(forceSync = false) {
        if (this._syncPending.isResolved() !== true) {
            //another sync is in progress, so lets return that one's bb;
            return this._syncPending;
        }
        if (this._isInitialized !== true) {
            //this is the initialization
            //no need to do a full sync, just read
            this._syncPending = this.doSyncWithMaster_Helper_Read()
                .catch((initError) => {
                //handle _blacklistIfFirstSyncFails logic if set (via ctor)
                if (this._blacklistIfFirstSyncFailsDuration != null) {
                    this._blacklistIfFirstSyncFails_Timeout = luxon.DateTime.utc().plus(this._blacklistIfFirstSyncFailsDuration);
                    this._blacklistIfFirstSyncFails_InitError = initError;
                }
                return bluebird_1.default.reject(initError);
            })
                .then((readSyncResults) => {
                this._isInitialized = true;
                this._lastSyncTime = luxon.DateTime.utc();
                if (this.hasDataToWrite() === true) {
                    //async update a full sync
                    this.doSyncWithMaster_Helper_Full().then(() => {
                        this._lastSyncTime = luxon.DateTime.utc();
                    });
                }
                return bluebird_1.default.resolve(readSyncResults);
            });
            return this._syncPending;
        }
        else {
            //already initialized
            if (this.hasDataToWrite() === true && (this.isTimeToResync() === true || forceSync === true)) {
                //time to sync and have data to write, so need to do full sync
                this._syncPending = this.doSyncWithMaster_Helper_Full()
                    .then((fullResults) => {
                    this._lastSyncTime = luxon.DateTime.utc();
                    return bluebird_1.default.resolve(fullResults);
                });
                return this._syncPending;
            }
            else if (forceSync === true || this.isTimeToResync() === true) {
                //time to sync and have NO data to write, so just read
                this._syncPending = this.doSyncWithMaster_Helper_Read()
                    .then((fullResults) => {
                    this._lastSyncTime = luxon.DateTime.utc();
                    return bluebird_1.default.resolve(fullResults);
                });
                return this._syncPending;
            }
            else {
                //no data to write and not desynced
                return bluebird_1.default.resolve();
            }
        }
    }
    get() {
        return bluebird_1.default.try(() => {
            if (this._isDisposed === true) {
                throw new Error("already disposed");
            }
            this._lastUsedTime = luxon.DateTime.utc();
            if (this._blacklistIfFirstSyncFails_InitError != null) {
                if (this._blacklistIfFirstSyncFails_Timeout < luxon.DateTime.utc()) {
                    return bluebird_1.default.reject(this._blacklistIfFirstSyncFails_InitError);
                }
                else {
                    //clear out the error
                    this._blacklistIfFirstSyncFails_InitError = null;
                }
            }
            //let toReturn: TValue;
            if (this._isInitialized !== true) {
                //no sync yet, so wait for that
                return this._trySyncWithMaster()
                    .then(() => {
                    //let currentData = this._creditBalance.data;
                    let toReturn = this.calculateCurrentValue();
                    return bluebird_1.default.resolve(toReturn);
                });
            }
            else {
                //return current balance data
                let toReturn = this.calculateCurrentValue();
                this._trySyncWithMaster();
                return bluebird_1.default.resolve(toReturn);
            }
        });
    }
    getForceSync() {
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._lastUsedTime = luxon.DateTime.utc();
        if (this._blacklistIfFirstSyncFails_InitError != null) {
            if (this._blacklistIfFirstSyncFails_Timeout < luxon.DateTime.utc()) {
                return bluebird_1.default.reject(this._blacklistIfFirstSyncFails_InitError);
            }
            else {
                //clear out the error
                this._blacklistIfFirstSyncFails_InitError = null;
            }
        }
        return this._trySyncWithMaster(true)
            .then(() => {
            return this.get();
        });
    }
    modify(params) {
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._lastUsedTime = luxon.DateTime.utc();
        this.cacheModificationsLocally(params);
        if (this._blacklistIfFirstSyncFails_InitError != null) {
            if (this._blacklistIfFirstSyncFails_Timeout < luxon.DateTime.utc()) {
                return;
            }
            else {
                //clear out the error
                this._blacklistIfFirstSyncFails_InitError = null;
            }
        }
        this._trySyncWithMaster(); //async attempt
    }
    /**
 * if last use is too old, will return true and dispose.
 */
    tryDisposeIfTooOld(forceDisposeNow = false) {
        if (forceDisposeNow === true) {
            this._dispose();
            return true;
        }
        let disposeAfter = this._lastUsedTime.plus(this._maxUnusedDuration);
        if (disposeAfter >= luxon.DateTime.utc()) {
            return false;
        }
        //dispose
        this._dispose();
        return true;
    }
    /**
     * do a final sync with the master and mark this object as unusable
     */
    _dispose() {
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._isDisposed = true;
        if (this.hasDataToWrite() === true) {
            //do a final sync
            this._trySyncWithMaster();
        }
    }
}
exports.AtomicCacheItem = AtomicCacheItem;
/**
 *  allows for local caching of values, plus ability to atomically synchronize modifications with the master
 *  this pattern is known to work with google datastore (via transactions) so can probably be adapted to anything else too.
 * this is useful for data that is tollerant of eventual-consistency.  not so useful as-is for immediate/atomic consistency needs.
 */
class AtomicCache {
    constructor(_cacheItemCtor, _autoTryCleanupInterval) {
        this._cacheItemCtor = _cacheItemCtor;
        this._autoTryCleanupInterval = _autoTryCleanupInterval;
        this._storage = {};
        this._nextInspectIndex = 0;
        this._inspectKeys = [];
        setInterval(() => {
            this._tryCleanupOne();
        }, this._autoTryCleanupInterval.as("millisecond"));
    }
    _tryCleanupOne(/** set to true to force cleaning up all keys immediately  for testing "new apiKey" roundtrip times.  default false. */ testingForceDispose = false) {
        if (this._nextInspectIndex >= this._inspectKeys.length) {
            //past end, re-aquire
            this._nextInspectIndex = 0;
            this._inspectKeys = Object.keys(this._storage);
        }
        if (this._inspectKeys.length < 1) {
            return; //nothing to do;
        }
        //try to clean up (dispose) an item that's too old
        let currentIndex = this._nextInspectIndex;
        this._nextInspectIndex++;
        let key = this._inspectKeys[currentIndex];
        if (this._storage[key].tryDisposeIfTooOld(testingForceDispose) === true) {
            // tslint:disable-next-line: no-dynamic-delete
            delete this._storage[key];
            //since we clean up 1, try to clean another (keep going till we hit 1 that doesn't cleanup)
            setTimeout(() => {
                //log.info("disposing " + key);
                this._tryCleanupOne(testingForceDispose);
                return;
            });
        }
    }
    _getItem(key) {
        let item = this._storage[key];
        if (item == null || item.tryDisposeIfTooOld() === true) {
            item = this._cacheItemCtor(key); // new CacheItem(key);
            this._storage[key] = item;
        }
        return item;
    }
    getTestForceNew(key) {
        let item = this._getItem(key);
        let toReturn = item.get().then((value) => {
            setTimeout(() => {
                this._tryCleanupOne(true);
            });
            return value;
        });
        //force invalidate to test
        //item.lastUsedTime = moment(0);
        //item._dispose();
        return toReturn;
    }
    get(apiKey) {
        let item = this._getItem(apiKey);
        let toReturn = item.get().then((value) => {
            setTimeout(() => {
                this._tryCleanupOne();
            });
            return value;
        });
        return toReturn;
    }
    getForceRefresh(apiKey) {
        let item = this._getItem(apiKey);
        let toReturn = item.getForceSync().then((value) => {
            setTimeout(() => {
                this._tryCleanupOne();
            });
            return value;
        });
        return toReturn;
    }
    modify(key, params) {
        let item = this._getItem(key);
        item.modify(params);
        //let toReturn = item.getBalance();
        //this._tryCleanupOne();
        //return toReturn;
        //
        return item.get();
    }
}
exports.AtomicCache = AtomicCache;
//# sourceMappingURL=atomic-cache.js.map