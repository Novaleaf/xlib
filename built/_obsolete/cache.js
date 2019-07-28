"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const luxon_1 = tslib_1.__importDefault(require("luxon"));
const diagnostics = tslib_1.__importStar(require("../core/diagnostics"));
const log = diagnostics.log; // new diagnostics.Logger( __filename );
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
    async read(key, fetchFunction, options) {
        if (options == null) {
            options = {};
        }
        if (options.fetchExpiresDuration == null) {
            options.fetchExpiresDuration = luxon_1.default.Duration.fromObject({ minutes: 10 });
        }
        if (options.gcAfterMultipler == null) {
            options.gcAfterMultipler = 3;
        }
        function returnOrClone(potentialValue) {
            let toReturn;
            if (options.noClone) {
                //use newValue directly
                toReturn = potentialValue;
            }
            else if (options.shallowClone === true) {
                toReturn = lodash_1.default.clone(potentialValue);
            }
            else {
                toReturn = lodash_1.default.cloneDeep(potentialValue);
            }
            return toReturn;
        }
        let now = luxon_1.default.DateTime.utc();
        if (options.fetchExpiresDuration.valueOf() <= 0) {
            throw new diagnostics.XlibException("Cache: item to insert is alreadey expired (fetchExpiresAmount less than or equal to zero)");
        }
        // do a garbage collection pass (one item checked per read call) 
        this._tryGCOne(now);
        let cacheItem = this._storage[key];
        if (cacheItem == null) {
            cacheItem = {
                value: undefined,
                currentFetch: null,
                expires: luxon_1.default.DateTime.fromMillis(0),
                gcAfter: now.plus(luxon_1.default.Duration.fromObject({ seconds: options.fetchExpiresDuration.as("seconds") * options.gcAfterMultipler })) //now.plus( fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds" ),
            };
            this._storage[key] = cacheItem;
        }
        if (cacheItem.value !== undefined && cacheItem.expires > now) {
            //stored is valid
            return bluebird_1.default.resolve(returnOrClone(cacheItem.value));
        }
        if (cacheItem.currentFetch != null) {
            //already a fetch in progress, so we should not kick off another
            if (options.awaitNewOnExpired === true //expired                    
                || cacheItem.value === undefined //no value                    
                || (options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.plus(options.awaitNewOnExpiredThreshhold) < (luxon_1.default.DateTime.utc())) //threshhold exceeded
            ) {
                //await currentFetch
                return cacheItem.currentFetch;
            }
            else {
                //return cached value
                return bluebird_1.default.resolve(returnOrClone(cacheItem.value));
            }
        }
        //need to fetch a new value, so start refetching new
        cacheItem.currentFetch = bluebird_1.default.resolve(fetchFunction());
        //ASYNC:  after the fetch completes, update our cacheItem
        cacheItem.currentFetch.then((newValue) => {
            let _now = luxon_1.default.DateTime.utc();
            this._storage[key] = cacheItem; //in case gc deleted it
            cacheItem.value = newValue;
            cacheItem.expires = _now.plus(options.fetchExpiresDuration);
            cacheItem.gcAfter = now.plus(luxon_1.default.Duration.fromObject({ seconds: options.fetchExpiresDuration.as("seconds") * options.gcAfterMultipler })); //cacheItem.expires.plus( options.fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds" );
            //we might want to clone the resule
            return bluebird_1.default.resolve(returnOrClone(cacheItem.value));
        });
        if (cacheItem.value === undefined) {
            //nothing cached at all, so await current fetch
            return cacheItem.currentFetch;
        }
        //we have a cached value, but it is expired
        //check if we force waiting for a new value, or are ok with returning an expired value while refetching.
        if (options.awaitNewOnExpired === true //expired                    
            || (options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.plus(options.awaitNewOnExpiredThreshhold) < (luxon_1.default.DateTime.utc())) //threshhold exceeded
        ) {
            //we don't accept an expired, await the refetch
            return cacheItem.currentFetch;
        }
        //ok with the stale value
        return bluebird_1.default.resolve(returnOrClone(cacheItem.value));
    }
    /**
     *  force update/insert the cache.   to delete, set newCacheItem to null
     * @param key
     * @param newCacheItem
     */
    write(key, newCacheItem) {
        if (newCacheItem == null) {
            // tslint:disable-next-line: no-dynamic-delete
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
            // tslint:disable-next-line: no-dynamic-delete
            delete this._storage[key];
            return;
        }
        if (tryCleanup.gcAfter > now) {
            //not expired;
            return;
        }
        //no early exit clauses triggered, so cleanup
        // tslint:disable-next-line: no-dynamic-delete
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