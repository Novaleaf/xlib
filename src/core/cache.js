"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bb = require("bluebird");
const _ = require("lodash");
const moment = require("moment");
const exception = require("./exception");
const diagnostics = require("./diagnostics");
var log = new diagnostics.logging.Logger(__filename);
/**
 * caches values in memory, mostly to help avoiding excessive db queries, but can be used for any similar reasons.
 * if you want your own namespace, construct your own instance of this class.   If you don't care, use the default ```defaultCache``` instance, or use the lolo shortcut: ```__.cache```
 */
class Cache {
    constructor() {
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
    read(key, fetchFunction, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options == null) {
                options = {};
            }
            if (options.fetchExpiresAmount == null) {
                options.fetchExpiresAmount = 10;
            }
            if (options.fetchExpiresUnits == null) {
                options.fetchExpiresUnits = "minutes";
            }
            if (options.gcAfterMultipler == null) {
                options.gcAfterMultipler = 3;
            }
            let fetchExpiresDuration = moment.duration(options.fetchExpiresAmount, options.fetchExpiresUnits);
            function returnOrClone(potentialValue) {
                let toReturn;
                if (options.noClone) {
                    //use newValue directly
                    toReturn = potentialValue;
                }
                else if (options.shallowClone === true) {
                    toReturn = _.clone(potentialValue);
                }
                else {
                    toReturn = _.cloneDeep(potentialValue);
                }
                return toReturn;
            }
            let now = moment();
            if (options.fetchExpiresAmount <= 0) {
                throw new exception.CorelibException("Cache: item to insert is alreadey expired (fetchExpiresAmount less than or equal to zero)");
            }
            // do a garbage collection pass (one item checked per read call) 
            this._tryGCOne(now);
            let cacheItem = this._storage[key];
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
                return bb.resolve(returnOrClone(cacheItem.value));
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
                    return bb.resolve(returnOrClone(cacheItem.value));
                }
            }
            //need to fetch a new value, so start refetching new
            cacheItem.currentFetch = bb.resolve(fetchFunction());
            //ASYNC:  after the fetch completes, update our cacheItem
            cacheItem.currentFetch.then((newValue) => {
                let now = moment();
                this._storage[key] = cacheItem; //in case gc deleted it
                cacheItem.value = newValue;
                cacheItem.expires = now.clone().add(fetchExpiresDuration);
                cacheItem.gcAfter = cacheItem.expires.clone().add(fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds");
                //we might want to clone the resule
                return bb.resolve(returnOrClone(cacheItem.value));
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
            return bb.resolve(returnOrClone(cacheItem.value));
        });
    }
    /**
     *  force update/insert the cache.   to delete, set newCacheItem to null
     * @param key
     * @param newCacheItem
     */
    write(key, newCacheItem) {
        if (newCacheItem == null) {
            delete this._storage[key];
        }
        else {
            this._storage[key] = newCacheItem;
        }
    }
    /**
     *  lazy "garbage collector", every .get() call we will walk one item in our cache to see if it's expired.   if so, we remove it.
     * @param now
     */
    _tryGCOne(now) {
        if (this._cleanupNextPosition >= this._cleanupKeys.length) {
            this._cleanupKeys = Object.keys(this._storage);
            this._cleanupNextPosition = 0;
        }
        if (this._cleanupKeys.length <= 0) {
            //nothing to try cleaning up
            return;
        }
        let key = this._cleanupKeys[this._cleanupNextPosition];
        this._cleanupNextPosition++;
        let tryCleanup = this._storage[key];
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
    }
}
exports.Cache = Cache;
/**
 *  default cache
 */
exports.defaultCache = new Cache();
//# sourceMappingURL=cache.js.map