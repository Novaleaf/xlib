"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var Promise = require("bluebird");
/**
 * abstract class used for elements stored in the AtomicCache object
 */
var AtomicCacheItem = (function () {
    function AtomicCacheItem(key, 
        /** max amount of time between uses of the cacheItem before we dispose it */
        _maxUnusedDuration, 
        /** max amount of time between sync's */
        _maxDesyncedDuration, 
        /** if set, and the first sync (during initialization) fails, all future .get() calls within the given duration will return rejected with the same error originally returned from sync.
        This is useful if for example, the user requests a key that does not exist, and you don't want to keep looking that up in the database.
        If you use this, be sure you put retry logic into your doSyncWithMaster_Helper_Full() and doSyncWithMaster_Helper_Read() functions.
        */
        _blacklistIfFirstSyncFailsDuration) {
        if (_blacklistIfFirstSyncFailsDuration === void 0) { _blacklistIfFirstSyncFailsDuration = null; }
        this.key = key;
        this._maxUnusedDuration = _maxUnusedDuration;
        this._maxDesyncedDuration = _maxDesyncedDuration;
        this._blacklistIfFirstSyncFailsDuration = _blacklistIfFirstSyncFailsDuration;
        this._syncPending = Promise.resolve();
        /** private helper to know when we have read the state from datastore */
        this._isInitialized = false;
        /** private helper to know when this should not be used again */
        this._isDisposed = false;
        this._lastUsedTime = moment();
        this._trySyncWithMaster();
    }
    Object.defineProperty(AtomicCacheItem.prototype, "lastUsedTime", {
        /** read only:  the last time this was used */
        get: function () {
            return this._lastUsedTime;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  if it's time to resync
     */
    AtomicCacheItem.prototype.isTimeToResync = function () {
        var now = moment();
        if (this._lastSyncTime.clone().add(this._maxDesyncedDuration) <= now) {
            //out of sync
            return true;
        }
        return false;
    };
    /**
     *  attempts to sync with master, if there is any sync work to be done
     */
    AtomicCacheItem.prototype._trySyncWithMaster = function (forceSync) {
        var _this = this;
        if (forceSync === void 0) { forceSync = false; }
        if (this._syncPending.isResolved() !== true) {
            //another sync is in progress, so lets return that one's promise;
            return this._syncPending;
        }
        if (this._isInitialized !== true) {
            //this is the initialization
            //no need to do a full sync, just read
            this._syncPending = this.doSyncWithMaster_Helper_Read()
                .catch(function (initError) {
                //handle _blacklistIfFirstSyncFails logic if set (via ctor)
                if (_this._blacklistIfFirstSyncFailsDuration != null) {
                    _this._blacklistIfFirstSyncFails_Timeout = moment().add(_this._blacklistIfFirstSyncFailsDuration);
                    _this._blacklistIfFirstSyncFails_InitError = initError;
                }
                return Promise.reject(initError);
            })
                .then(function (readSyncResults) {
                _this._isInitialized = true;
                _this._lastSyncTime = moment();
                if (_this.hasDataToWrite() === true) {
                    //async update a full sync
                    _this.doSyncWithMaster_Helper_Full().then(function () {
                        _this._lastSyncTime = moment();
                    });
                }
                return Promise.resolve(readSyncResults);
            });
            return this._syncPending;
        }
        else {
            //already initialized
            if (this.hasDataToWrite() === true && (this.isTimeToResync() === true || forceSync === true)) {
                //time to sync and have data to write, so need to do full sync
                this._syncPending = this.doSyncWithMaster_Helper_Full()
                    .then(function (fullResults) {
                    _this._lastSyncTime = moment();
                    return Promise.resolve(fullResults);
                });
                return this._syncPending;
            }
            else if (forceSync === true || this.isTimeToResync() === true) {
                //time to sync and have NO data to write, so just read
                this._syncPending = this.doSyncWithMaster_Helper_Read()
                    .then(function (fullResults) {
                    _this._lastSyncTime = moment();
                    return Promise.resolve(fullResults);
                });
                return this._syncPending;
            }
            else {
                //no data to write and not desynced
                return Promise.resolve();
            }
        }
    };
    AtomicCacheItem.prototype.get = function () {
        var _this = this;
        return Promise.try(function () {
            if (_this._isDisposed === true) {
                throw new Error("already disposed");
            }
            _this._lastUsedTime = moment();
            if (_this._blacklistIfFirstSyncFails_InitError != null) {
                if (_this._blacklistIfFirstSyncFails_Timeout < moment()) {
                    return Promise.reject(_this._blacklistIfFirstSyncFails_InitError);
                }
                else {
                    //clear out the error
                    _this._blacklistIfFirstSyncFails_InitError = null;
                }
            }
            //let toReturn: TValue;
            if (_this._isInitialized !== true) {
                //no sync yet, so wait for that
                return _this._trySyncWithMaster()
                    .then(function () {
                    //let currentData = this._creditBalance.data;
                    var toReturn = _this.calculateCurrentValue();
                    return Promise.resolve(toReturn);
                });
            }
            else {
                //return current balance data
                var toReturn = _this.calculateCurrentValue();
                _this._trySyncWithMaster();
                return Promise.resolve(toReturn);
            }
        });
    };
    AtomicCacheItem.prototype.getForceSync = function () {
        var _this = this;
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._lastUsedTime = moment();
        if (this._blacklistIfFirstSyncFails_InitError != null) {
            if (this._blacklistIfFirstSyncFails_Timeout < moment()) {
                return Promise.reject(this._blacklistIfFirstSyncFails_InitError);
            }
            else {
                //clear out the error
                this._blacklistIfFirstSyncFails_InitError = null;
            }
        }
        return this._trySyncWithMaster(true)
            .then(function () {
            return _this.get();
        });
    };
    AtomicCacheItem.prototype.modify = function (params) {
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._lastUsedTime = moment();
        this.cacheModificationsLocally(params);
        if (this._blacklistIfFirstSyncFails_InitError != null) {
            if (this._blacklistIfFirstSyncFails_Timeout < moment()) {
                return;
            }
            else {
                //clear out the error
                this._blacklistIfFirstSyncFails_InitError = null;
            }
        }
        this._trySyncWithMaster(); //async attempt
    };
    /**
 * if last use is too old, will return true and dispose.
 */
    AtomicCacheItem.prototype.tryDisposeIfTooOld = function (forceDisposeNow) {
        if (forceDisposeNow === void 0) { forceDisposeNow = false; }
        if (forceDisposeNow === true) {
            this._dispose();
            return true;
        }
        var disposeAfter = this._lastUsedTime.clone().add(this._maxUnusedDuration);
        if (disposeAfter >= moment()) {
            return false;
        }
        //dispose
        this._dispose();
        return true;
    };
    /**
     * do a final sync with the master and mark this object as unusable
     */
    AtomicCacheItem.prototype._dispose = function () {
        if (this._isDisposed === true) {
            throw new Error("already disposed");
        }
        this._isDisposed = true;
        if (this.hasDataToWrite() === true) {
            //do a final sync
            this._trySyncWithMaster();
        }
    };
    return AtomicCacheItem;
}());
exports.AtomicCacheItem = AtomicCacheItem;
/**
 *  allows for local caching of values, plus ability to atomically synchronize modifications with the master
 *  this pattern is known to work with google datastore (via transactions) so can probably be adapted to anything else too.
 * this is useful for data that is tollerant of eventual-consistency.  not so useful as-is for immediate/atomic consistency needs.
 */
var AtomicCache = (function () {
    function AtomicCache(_cacheItemCtor, _autoTryCleanupInterval) {
        var _this = this;
        this._cacheItemCtor = _cacheItemCtor;
        this._autoTryCleanupInterval = _autoTryCleanupInterval;
        this._storage = {};
        this._nextInspectIndex = 0;
        this._inspectKeys = [];
        setInterval(function () {
            _this._tryCleanupOne();
        }, this._autoTryCleanupInterval.asMilliseconds());
    }
    AtomicCache.prototype._tryCleanupOne = function (/** set to true to force cleaning up all keys immediately  for testing "new apiKey" roundtrip times.  default false. */ testingForceDispose) {
        var _this = this;
        if (testingForceDispose === void 0) { testingForceDispose = false; }
        if (this._nextInspectIndex >= this._inspectKeys.length) {
            //past end, re-aquire
            this._nextInspectIndex = 0;
            this._inspectKeys = Object.keys(this._storage);
        }
        if (this._inspectKeys.length < 1) {
            return; //nothing to do;
        }
        //try to clean up (dispose) an item that's too old
        var currentIndex = this._nextInspectIndex;
        this._nextInspectIndex++;
        var key = this._inspectKeys[currentIndex];
        if (this._storage[key].tryDisposeIfTooOld(testingForceDispose) === true) {
            delete this._storage[key];
            //since we clean up 1, try to clean another (keep going till we hit 1 that doesn't cleanup)
            setTimeout(function () {
                //log.info("disposing " + key);
                return _this._tryCleanupOne(testingForceDispose);
            });
        }
    };
    AtomicCache.prototype._getItem = function (key) {
        var item = this._storage[key];
        if (item == null || item.tryDisposeIfTooOld() === true) {
            item = this._cacheItemCtor(key); // new CacheItem(key);
            this._storage[key] = item;
        }
        return item;
    };
    AtomicCache.prototype.getTestForceNew = function (key) {
        var _this = this;
        var item = this._getItem(key);
        var toReturn = item.get().then(function (value) {
            setTimeout(function () {
                _this._tryCleanupOne(true);
            });
            return value;
        });
        //force invalidate to test
        //item.lastUsedTime = moment(0);
        //item._dispose();
        return toReturn;
    };
    AtomicCache.prototype.get = function (apiKey) {
        var _this = this;
        var item = this._getItem(apiKey);
        var toReturn = item.get().then(function (value) {
            setTimeout(function () {
                _this._tryCleanupOne();
            });
            return value;
        });
        return toReturn;
    };
    AtomicCache.prototype.getForceRefresh = function (apiKey) {
        var _this = this;
        var item = this._getItem(apiKey);
        var toReturn = item.getForceSync().then(function (value) {
            setTimeout(function () {
                _this._tryCleanupOne();
            });
            return value;
        });
        return toReturn;
    };
    AtomicCache.prototype.modify = function (key, params) {
        var item = this._getItem(key);
        item.modify(params);
        //let toReturn = item.getBalance();
        //this._tryCleanupOne();
        //return toReturn;
        //
        return item.get();
    };
    return AtomicCache;
}());
exports.AtomicCache = AtomicCache;
//# sourceMappingURL=atomic-cache.js.map