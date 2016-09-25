/// <reference types="bluebird" />
import moment = require("moment");
import Promise = require("bluebird");
export interface ICacheItem<TValue> {
    /** if UNDEFINED the cache is invalid.   Important note:  NULL is a valid cached value.*/
    value: TValue;
    expires: moment.Moment;
    /** set if a fetch is occuring.  if true, we will not kick off another fetch, but (if awaitNewOnExpired) will await the currentFetch results */
    currentFetch?: Promise<TValue>;
    /** specifies when this can be collected by the GC (when cache item is not used) */
    gcAfter: moment.Moment;
}
export interface ICacheOptions {
    /**if we need to fetch, how long the new value will be valid for.  default 10 minutes. */
    fetchExpiresAmount?: number;
    /** default "minutes" */
    fetchExpiresUnits?: moment.UnitOfTime;
    /** if true, doesn't return the currently cached value, (if any).  If false (the default), will ignore any errors from the fetchFunction(), returning the last known good value instead.            */
    awaitNewOnExpired?: boolean;
    /** optionally you could return a duration in which the old value would still be returnable.   if beyond expires+duration then the value would be considered too old to return.*/
    awaitNewOnExpiredThreshhold?: moment.Duration;
    /** if true, returns the cached item directly.  the default (false) is to always return a copy of the value to avoid side-effects. */
    noClone?: boolean;
    /** if true, does a shallow-copy.  defaults to deep copying */
    shallowClone?: boolean;
    /** multipler for how long the cache item should be kept after the fetchExpires threshhold is exceeded.    default is 3x (so a total of 4x from when the request was made)*/
    gcAfterMultipler?: number;
}
/**
 * caches values in memory, mostly to help avoiding excessive db queries, but can be used for any similar reasons.
 * if you want your own namespace, construct your own instance of this class.   If you don't care, use the default ```defaultCache``` instance, or use the lolo shortcut: ```__.cache```
 */
export declare class Cache {
    constructor();
    private _storage;
    private _cleanupKeys;
    private _cleanupNextPosition;
    /**
     * allows caching values for a period of time.   upon expiring, new values will be fetched via the "fetchFunction".
     * by default we return the cached value, and lazily (asynchronously) populate the value with the fetchFunction.
    if you want the returned value to block until the fecthFunction completes (which may cause performance issues) then set the "awaitNewOnExpired" parameter in the fetchFunction return.
     * @param key
     * @param fetchFunction
     */
    read<TValue>(key: string, fetchFunction: () => Promise<TValue>, options?: ICacheOptions): Promise<TValue>;
    /**
     *  force update/insert the cache.   to delete, set newCacheItem to null
     * @param key
     * @param newCacheItem
     */
    write<TValue>(key: string, newCacheItem: ICacheItem<TValue>): void;
    /**
     *  lazy "garbage collector", every .get() call we will walk one item in our cache to see if it's expired.   if so, we remove it.
     * @param now
     */
    private _tryGCOne(now);
}
/**
 *  default cache
 */
export declare var defaultCache: Cache;
