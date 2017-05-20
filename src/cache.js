"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var moment = require("moment");
var exception = require("./exception");
//import diagnostics = require("./diagnostics/_main")
var logging = require("./logging");
//import * as promise from "./promise";
var Promise = require("bluebird");
var log = new logging.Logger(__filename);
/**
 * caches values in memory, mostly to help avoiding excessive db queries, but can be used for any similar reasons.
 * if you want your own namespace, construct your own instance of this class.   If you don't care, use the default ```defaultCache``` instance, or use the lolo shortcut: ```__.cache```
 */
var Cache = (function () {
    function Cache() {
        this._storage = {};
        this._cleanupKeys = [];
        this._cleanupNextPosition = 0;
        this._storage = {};
    }
    /**
     * allows caching values for a period of time.   upon expiring, new values will be fetched via the "fetchFunction".
     * by default we return the cached value, and lazily (asynchronously) populate the value with the fetchFunction.
    if you want the returned value to block until the fecthFunction completes (which may cause performance issues) then set the "awaitNewOnExpired" parameter in the fetchFunction return.
     * @param key
     * @param fetchFunction
     */
    Cache.prototype.read = function (key, fetchFunction, options) {
        var _this = this;
        var _defaultGcAfterMultipler = 3;
        if (options == null) {
            options = {};
        }
        var _options = options;
        if (options.fetchExpiresAmount == null) {
            options.fetchExpiresAmount = 10;
        }
        if (options.fetchExpiresUnits == null) {
            options.fetchExpiresUnits = "minutes";
        }
        if (options.gcAfterMultipler == null) {
            options.gcAfterMultipler = _defaultGcAfterMultipler;
        }
        var fetchExpiresDuration = moment.duration(options.fetchExpiresAmount, options.fetchExpiresUnits);
        function _returnOrClone(potentialValue) {
            var toReturn;
            if (_options.noClone) {
                //use newValue directly
                toReturn = potentialValue;
            }
            else if (_options.shallowClone === true) {
                toReturn = _.clone(potentialValue);
            }
            else {
                toReturn = _.cloneDeep(potentialValue);
            }
            return toReturn;
        }
        var now = moment();
        if (options.fetchExpiresAmount <= 0) {
            throw new exception.CorelibException("Cache: item to insert is alreadey expired (fetchExpiresAmount less than or equal to zero)");
        }
        // do a garbage collection pass (one item checked per read call) 
        this._tryGCOne(now);
        var cacheItem = this._storage[key];
        if (cacheItem == null) {
            cacheItem = {
                value: undefined,
                currentFetch: null,
                expires: moment(0),
                gcAfter: now.clone().add(fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds"),
            };
            this._storage[key] = cacheItem;
        }
        if (cacheItem.value !== undefined && cacheItem.expires > now) {
            //stored is valid
            return Promise.resolve(_returnOrClone(cacheItem.value));
        }
        if (cacheItem.currentFetch != null) {
            //already a fetch in progress, so we should not kick off another
            if (options.awaitNewOnExpired === true //expired                    
                || cacheItem.value === undefined //no value                    
                || (options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.clone().add(options.awaitNewOnExpiredThreshhold).isBefore(moment())) //threshhold exceeded
            ) {
                //await currentFetch
                return cacheItem.currentFetch;
            }
            else {
                //return cached value
                return Promise.resolve(_returnOrClone(cacheItem.value));
            }
        }
        //need to fetch a new value, so start refetching new
        cacheItem.currentFetch = fetchFunction();
        //ASYNC:  after the fetch completes, update our cacheItem
        cacheItem.currentFetch.then(function (newValue) {
            var now = moment();
            _this._storage[key] = cacheItem; //in case gc deleted it
            cacheItem.value = newValue;
            cacheItem.expires = now.clone().add(fetchExpiresDuration);
            if (_options.gcAfterMultipler == null) {
                _options.gcAfterMultipler = _defaultGcAfterMultipler;
            }
            cacheItem.gcAfter = cacheItem.expires.clone().add(fetchExpiresDuration.asSeconds() * _options.gcAfterMultipler, "seconds");
            //we might want to clone the resule
            return Promise.resolve(_returnOrClone(cacheItem.value));
        });
        if (cacheItem.value === undefined) {
            //nothing cached at all, so await current fetch
            return cacheItem.currentFetch;
        }
        //we have a cached value, but it is expired
        //check if we force waiting for a new value, or are ok with returning an expired value while refetching.
        if (options.awaitNewOnExpired === true //expired                    
            || (options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.clone().add(options.awaitNewOnExpiredThreshhold).isBefore(moment())) //threshhold exceeded
        ) {
            //we don't accept an expired, await the refetch
            return cacheItem.currentFetch;
        }
        //ok with the stale value
        return Promise.resolve(_returnOrClone(cacheItem.value));
    };
    /**
     *  force update/insert the cache.   to delete, set newCacheItem to null
     * @param key
     * @param newCacheItem
     */
    Cache.prototype.write = function (key, newCacheItem) {
        if (newCacheItem == null) {
            delete this._storage[key];
        }
        else {
            this._storage[key] = newCacheItem;
        }
    };
    /**
     *  lazy "garbage collector", every .get() call we will walk one item in our cache to see if it's expired.   if so, we remove it.
     * @param now
     */
    Cache.prototype._tryGCOne = function (now) {
        if (this._cleanupNextPosition >= this._cleanupKeys.length) {
            this._cleanupKeys = Object.keys(this._storage);
            this._cleanupNextPosition = 0;
        }
        if (this._cleanupKeys.length <= 0) {
            //nothing to try cleaning up
            return;
        }
        var key = this._cleanupKeys[this._cleanupNextPosition];
        this._cleanupNextPosition++;
        var tryCleanup = this._storage[key];
        if (tryCleanup == null) {
            delete this._storage[key];
            return;
        }
        if (tryCleanup.gcAfter > now) {
            //not expired;
            return;
        }
        //no early exit clauses triggered, so cleanup
        delete this._storage[key];
        return;
    };
    return Cache;
}());
exports.Cache = Cache;
/**
 *  default cache
 */
exports.defaultCache = new Cache();
//# sourceMappingURL=cache.js.map