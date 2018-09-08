"use strict";

import * as bb from "bluebird";

import stringHelper = require( "./stringhelper" );

import _ = require( "lodash" );

import jsHelper = require( "./jshelper" );

import moment = require( "moment" );

import exception = require( "./exception" );

import reflection = require( "./reflection" );

import diagnostics = require( "./diagnostics" );
var log = new diagnostics.logging.Logger( __filename );

interface ICacheItem<TValue> {
    /** if UNDEFINED the cache is invalid.   Important note:  NULL is a valid cached value.*/
    value: TValue;
    expires: moment.Moment;
    ///** if false (the default), we will return the old value and fetch the new value to revalidate the cache with.
    //* optionally you could return a duration in which the old value would still be returnable.   if beyond expires+duration then the value would be considered too old to return.
    //*/
    //awaitNewOnExpired?: boolean | moment.Duration;
    /** set if a fetch is occuring.  if true, we will not kick off another fetch, but (if awaitNewOnExpired) will await the currentFetch results */
    currentFetch?: bb<TValue>;

    /** specifies when this can be collected by the GC (when cache item is not used) */
    gcAfter: moment.Moment;
}


/**
 * caches values in memory, mostly to help avoiding excessive db queries, but can be used for any similar reasons.
 * if you want your own namespace, construct your own instance of this class.   If you don't care, use the default ```defaultCache``` instance, or use the lolo shortcut: ```__.cache```
 */
export class Cache {

    constructor() {
        this._storage = {};
    }
    private _storage: { [ key: string ]: ICacheItem<any> } = {};

    private _cleanupKeys: string[] = [];
    private _cleanupNextPosition: number = 0;

    /**
     * allows caching values for a period of time.   upon expiring, new values will be fetched via the "fetchFunction".
     * by default we return the cached value, and lazily (asynchronously) populate the value with the fetchFunction.
    if you want the returned value to block until the fecthFunction completes (which may cause performance issues) then set the "awaitNewOnExpired" parameter in the fetchFunction return.
     * @param key
     * @param fetchFunction
     */
    public async read<TValue>( key: string, fetchFunction: () => Promise<TValue>,

        options?: {
            /**if we need to fetch, how long the new value will be valid for.  default 10 minutes. */
            fetchExpiresAmount?: number;
            /** default "minutes" */
            fetchExpiresUnits?: moment.DurationInputArg2;

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
    ): Promise<TValue> {




        if ( options == null ) {
            options = {};
        }
        if ( options.fetchExpiresAmount == null ) {
            options.fetchExpiresAmount = 10;
        }
        if ( options.fetchExpiresUnits == null ) {
            options.fetchExpiresUnits = "minutes";
        }
        if ( options.gcAfterMultipler == null ) {
            options.gcAfterMultipler = 3;
        }

        let fetchExpiresDuration = moment.duration( options.fetchExpiresAmount, options.fetchExpiresUnits );

        function returnOrClone( potentialValue: TValue ): TValue {
            let toReturn: TValue
            if ( options.noClone ) {
                //use newValue directly
                toReturn = potentialValue;
            } else if ( options.shallowClone === true ) {
                toReturn = _.clone( potentialValue );
            } else {
                toReturn = _.cloneDeep( potentialValue );
            }
            return toReturn;
        }

        let now = moment();
        if ( options.fetchExpiresAmount <= 0 ) {
            throw new exception.CorelibException( "Cache: item to insert is alreadey expired (fetchExpiresAmount less than or equal to zero)" );
        }
        // do a garbage collection pass (one item checked per read call) 
        this._tryGCOne( now );

        let cacheItem = this._storage[ key ];
        if ( cacheItem == null ) {
            cacheItem = {
                value: undefined,
                currentFetch: null,
                expires: moment( 0 ),
                gcAfter: now.clone().add( fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds" ),
            };
            this._storage[ key ] = cacheItem;
        }

        if ( cacheItem.value !== undefined && cacheItem.expires > now ) {
            //stored is valid
            return bb.resolve( returnOrClone( cacheItem.value ) );
        }

        if ( cacheItem.currentFetch != null ) {
            //already a fetch in progress, so we should not kick off another

            if (
                options.awaitNewOnExpired === true //expired                    
                || cacheItem.value === undefined //no value                    
                || ( options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.clone().add( options.awaitNewOnExpiredThreshhold ).isBefore( moment() ) ) //threshhold exceeded
            ) {

                //await currentFetch
                return cacheItem.currentFetch;

            } else {
                //return cached value
                return bb.resolve( returnOrClone( cacheItem.value ) );
            }
        }



        //need to fetch a new value, so start refetching new
        cacheItem.currentFetch = bb.resolve( fetchFunction() );


        //ASYNC:  after the fetch completes, update our cacheItem
        cacheItem.currentFetch.then( ( newValue ) => {
            let now = moment();
            this._storage[ key ] = cacheItem; //in case gc deleted it

            cacheItem.value = newValue;
            cacheItem.expires = now.clone().add( fetchExpiresDuration );
            cacheItem.gcAfter = cacheItem.expires.clone().add( fetchExpiresDuration.asSeconds() * options.gcAfterMultipler, "seconds" );

            //we might want to clone the resule
            return bb.resolve( returnOrClone( cacheItem.value ) );
        } );



        if ( cacheItem.value === undefined ) {
            //nothing cached at all, so await current fetch
            return cacheItem.currentFetch;
        }
        //we have a cached value, but it is expired


        //check if we force waiting for a new value, or are ok with returning an expired value while refetching.
        if ( options.awaitNewOnExpired === true //expired                    
            || ( options.awaitNewOnExpiredThreshhold != null && cacheItem.expires.clone().add( options.awaitNewOnExpiredThreshhold ).isBefore( moment() ) ) //threshhold exceeded
        ) {
            //we don't accept an expired, await the refetch
            return cacheItem.currentFetch;
        }

        //ok with the stale value
        return bb.resolve( returnOrClone( cacheItem.value ) );
    }

    /**
     *  force update/insert the cache.   to delete, set newCacheItem to null
     * @param key
     * @param newCacheItem
     */
    public write<TValue>( key: string, newCacheItem: ICacheItem<TValue> ) {

        if ( newCacheItem == null ) {
            delete this._storage[ key ];
        } else {
            this._storage[ key ] = newCacheItem;
        }
    }

    /**
     *  lazy "garbage collector", every .get() call we will walk one item in our cache to see if it's expired.   if so, we remove it.
     * @param now
     */
    private _tryGCOne( now: moment.Moment ) {

        if ( this._cleanupNextPosition >= this._cleanupKeys.length ) {
            this._cleanupKeys = Object.keys( this._storage );
            this._cleanupNextPosition = 0;
        }
        if ( this._cleanupKeys.length <= 0 ) {
            //nothing to try cleaning up
            return;
        }

        let key = this._cleanupKeys[ this._cleanupNextPosition ];
        this._cleanupNextPosition++;
        let tryCleanup = this._storage[ key ];
        if ( tryCleanup == null ) {
            delete this._storage[ key ];
            return;
        }
        if ( tryCleanup.gcAfter > now ) {
            //not expired;
            return;
        }


        //no early exit clauses triggered, so cleanup
        delete this._storage[ key ];
        return;
    }

}

/**
 *  default cache
 */
export var defaultCache = new Cache();

