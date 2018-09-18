"use strict";
import * as _ from "lodash";
import * as bb from "bluebird";
//declare var Promise: bb<any>;


//import * as Promise from "bluebird";
// /// <reference path="../typings/all.d.ts" />

// ///** https://adambom.github.io/parallel.js/ 
// // * Parallel Computing with Javascript

// //Parallel.js is a tiny library for multi-core processing in Javascript. It was created to take full advantage of the ever-maturing web-workers API. Javascript is fast, 
//no doubt, but lacks the parallel computing capabilites of its peer languages due to its single - threaded computing model.In a world where the numbers of cores on a CPU are increasing
//faster than the speed of the cores themselves, isn't it a shame that we can't take advantage of this raw parallelism ?

// //Parallel.js solves that problem by giving you high level access to multicore processing using web workers. It runs in your browser (as long as it supports web workers). Check it out.

// //USAGE:  var p = new Parallel([1,2,3]);
// // */
// //export import Parallel = require("paralleljs");

// //also try adding https://www.npmjs.com/package/webworker-threads sometime
// export var webworker_threads = () => { throw new Error( "to implement" ); }

// /** https://github.com/caolan/async
//  * Async utilities for node and the browser
//  * Async provides around 20 functions that include the usual 'functional' suspects (map, reduce, filter, each…) as well as some common patterns for asynchronous 
//control flow( parallel, series, waterfall… ).All these functions assume you follow the Node.js convention of providing a single callback as the last argument of your async function.
//  */
// export import async = require( "async" );

// /** From https://github.com/71104/rwlock    Asynchronous read/write lock implementation for Node.js.
// == Main rules: ==
// there may be zero or more readers at a time,
// there may be only one writer at a time,
// there may be no writer if there are one or more readers already.
// == Basic usage ==
// var lock = new ReadWriteLock(); 
// //Acquiring a read lock:
// lock.readLock(function (release) {
//  // do stuff
//     release();
// });
// //Acquiring a write lock:
// lock.writeLock(function (release) {
//     // do stuff
//     release();
// });
// //Locks can be released later:
// lock.readLock(function (release) {
//     // not ready to release yet
//     setTimeout(function () {  // ok, now I'm ready
//         release();    }, 1000);
// });
//  * 
//  */
// export interface ReadWriteLock {

//     readLock( wrapFcn: ( release: () => void ) => any );
//     readLock(
//         /**
//          * Every ReadWriteLock instance allows you to work on a virtually unlimited number of completely independent read/write locks.
// Locks are identified by names called "keys". Every exposed method has an optional "key" first argument indicating the lock to work on; if you don't specify a key, the default lock is used.
//          */
//         key: string, wrapFcn: ( release: () => void ) => any );
//     writeLock( wrapFcn: ( release: () => void ) => any );
//     writeLock(
//         /**
//          * Every ReadWriteLock instance allows you to work on a virtually unlimited number of completely independent read/write locks.
// Locks are identified by names called "keys". Every exposed method has an optional "key" first argument indicating the lock to work on; if you don't specify a key, the default lock is used.
//          */
//         key: string, wrapFcn: ( release: () => void ) => any );

// }

// /** From https://github.com/71104/rwlock    Asynchronous read/write lock implementation for Node.js.
// == Main rules: ==
// there may be zero or more readers at a time,
// there may be only one writer at a time,
// there may be no writer if there are one or more readers already.
// == Basic usage ==
// var lock = new ReadWriteLock(); 
// //Acquiring a read lock:
// lock.readLock(function (release) {
//  // do stuff
//     release();
// });
// //Acquiring a write lock:
// lock.writeLock(function (release) {
//     // do stuff
//     release();
// });
// //Locks can be released later:
// lock.readLock(function (release) {
//     // not ready to release yet
//     setTimeout(function () {  // ok, now I'm ready
//         release();    }, 1000);
// });
//  * 
//  */
// export var ReadWriteLock: {
//     new(): ReadWriteLock;
// } = require( "rwlock" );

import * as promise from "./promise";
import * as diagnostics from "./diagnostics";

const log = diagnostics.log; // const log = new diagnostics.Logger( __filename );

/** an async+promise capable, readerwriter lock.
 * 
 * allows multiple readers (non-exclusive read lock) and single-writers (exclusive write lock)
 * 
 * additionally, allows storage of a value that is atomically written (a helper shortcut for common use: using this value is not required) 
 * 
 * when a race occurs, writes take precidence
 */
export class AsyncReaderWriterLock<TValue=void> {

    constructor( options?: { /** set to true to set the initial state to blocking (a single write already in progress)*/ writeInProgress: boolean } ) {
        options = { writeInProgress: false, ...options };

        if ( options.writeInProgress === true ) {
            this.tryWriteBegin();
        }
    }
    public toJson() {
        return {
            currentWrite: this.currentWrite ? this.currentWrite.tags : null,
            pendingWrites: this.pendingWrites.length,
            currentReads: this.currentReads.length,
            pendingReads: this.pendingReadCount,
            value: this._value ? "yes" : "no",
        };
    }
    private writeCounter: number = 0;
    private currentReads: promise.IExposedPromise[] = [];
    private pendingReadCount = 0;

    private pendingWrites: promise.IExposedPromise<void, { writeId: number }>[] = [];

    private currentWrite: promise.IExposedPromise<void, { writeId: number }>;

    private _value: TValue;
    // /** if no writes are waiting, will quickly return. otherwise will do a normal blocking wait 
    //  * 
    //  * returns the 
    // */
    // public pulseRead() {
    //     if ( this.currentWrite != null ) {
    //         throw new Error( "AsyncReaderWriterLock: you are attempting to read the value while a write is occuring.  call .readBegin() first" );
    //     }
    //     return this._value;// as Readonly<TValue>;
    // }

    /** returns true if a write is pending (in progress or queued). if false, you can read without being blocked. */
    public isWritePending() {
        return this.pendingWrites.length > 0;
    }


    public async readBegin(): Promise<TValue> {
        //let readToken = 

        if ( this.pendingWrites.length > 0 ) {
            //this.pendingReads.push(promise.CreateExposedPromise());
            this.pendingReadCount++;
            while ( this.pendingWrites.length > 0 ) {
                await Promise.all( this.pendingWrites );
            }
            this.pendingReadCount--;
        }
        log.assert( this.pendingWrites.length === 0, "expect writeQueue to be zero length" );
        log.assert( this.currentWrite == null, "race, current write should not be possible while start reading" );
        this.currentReads.push( promise.CreateExposedPromise() );

        return this._value;
    }

    public readEnd() {
        log.assert( this.currentReads.length > 0, "out of current reads, over decremented?" );
        log.assert( this.currentWrite == null, "race, current write should not be possible while reading" );
        this.currentReads.pop().fulfill();
    }

    /** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
    public tryWriteBegin(): boolean {
        if ( this.pendingWrites.length > 0 || this.currentReads.length > 0 ) {
            return false;
        }

        //do sync writeBegin        
        log.assert( this.currentWrite == null, "race, current write should not be possible while start writing (tryWriteBegin)" );
        const writeId = this.writeCounter++;
        let thisWrite = promise.CreateExposedPromise( undefined, { writeId } );
        this.pendingWrites.push( thisWrite );
        this.currentWrite = thisWrite;
        log.assert( this.currentWrite === this.pendingWrites[ 0 ], "current write should be at head of queue.  (tryWriteBegin)" );

        return true;
    }

    public async writeBegin() {
        const writeId = this.writeCounter++;
        let thisWrite = promise.CreateExposedPromise( undefined, { writeId } );
        this.pendingWrites.push( thisWrite );
        //wait until it's this write's turn
        while ( this.pendingWrites[ 0 ].tags.writeId !== writeId ) {
            await this.pendingWrites[ 0 ];
        }
        //wait while there are still active reads
        while ( this.currentReads.length > 0 ) {
            await bb.all( this.currentReads );
        }
        //now on the item        
        log.assert( this.currentWrite == null, "race, current write should not be possible while start writing" );
        this.currentWrite = thisWrite;
        log.assert( this.currentWrite === this.pendingWrites[ 0 ], "current write should be at head of queue.  (writeBegin)" );
    }

    public async writeEnd(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue> ) {


        try {
            //log.assert( thisWrite._tags.writeId === writeId, "writeId mismatch" );
            if ( valueOrWritePromise instanceof bb || ( _.isObject( valueOrWritePromise ) && _.isFunction( ( valueOrWritePromise as any as bb<any> ).then ) ) ) {
                this._value = await bb.resolve( valueOrWritePromise );
            } else {
                this._value = valueOrWritePromise as any;
            }
        } finally {
            log.assert( this.currentWrite != null, "race, current write should be set" );
            log.assert( this.currentWrite === this.pendingWrites[ 0 ], "current write should be at head of queue.  (writeEnd)" );
            let thisWrite = this.pendingWrites.shift();
            this.currentWrite = null;
            thisWrite.fulfill();
        }

    }

    /** hold a non-exclusive read lock for the duration of the promise. */
    public async read(/** until this promise returns, a non-exclusive read lock will be held*/ readFcn?: ( value: TValue ) => ( PromiseLike<any> | any ) ) {

        if ( readFcn == null && this.currentWrite == null ) {
            //high performance scenario where we just return the value without doing awaits
            return this._value;
        }
        await this.readBegin();

        try {
            if ( readFcn != null ) {
                await bb.resolve( this._value ).then( readFcn );
            }
            return this._value;
        } finally {
            this.readEnd();
        }
    }
    /** hold an exclusive write lock for the duration of the promise. */
    public async write(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue> ) {

        let toWrite: TValue;
        await this.writeBegin();
        return this.writeEnd( valueOrWritePromise );


    }


}

/** required arguments when constructing a new autoscaler */

export interface IAutoscalerOptions {
	/** minimum parallel requests you allow, regardless of how long the autoscaler has been idle.  should be 1 or more.  
	*/
    minParallel: number,
	/** optional.  set a max to number of parallel requests no matter how active the calls 
		* @default undefined (no limit)
	*/
    maxParallel?: number,
    /** if we get a "BACKOFF" rejection (from the ```failureListener```), how long we should wait before trying to expand again. */
    backoffDelayMs: number,
    /** when we are at max parallel and still able to successfully submit requests (not getting "BACKOFF" errors), how long to delay before increasing our parallel count by 1. */
    growDelayMs: number,
    /** when we are under our max parallel, how long before our max should decrease by 1 */
    decayDelayMs: number,
	/** optional.  when we get a backoff rejection, we will reduce maxActive by this amount.
		* @default 1
	 */
    backoffPenaltyCount?: number,
};


/** while this is probably only useful+used by the ```net.RemoteHttpEndpoint``` class, this is a generic autoscaler implementation, 
	* meaning that it will scale requests to a ```backendWorker``` function, gradually increasing activeParallel requests over time.   Requests exceeding activeParallel will be queued in a FIFO fashion.
	* 
	the only requirement is that the target ```backendWorker``` function  return a promise, 
    * and you specify a ```failureListener``` function that can tell the difference between a failure and a need for backing off.
    */
export class Autoscaler<TWorkerFunc extends ( ...args: any[] ) => Promise<TResult>, TResult, TError extends Error>{

    constructor(
        private options: IAutoscalerOptions,
        private backendWorker: TWorkerFunc,
        /** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "BACKOFF" if the request should be retried  */
        private failureListener: ( ( err: TError ) => "FAIL" | "BACKOFF" ),
    ) {

        //apply defaults
        this.options = { backoffPenaltyCount: 1, ...options };

        if ( this.options.minParallel < 1 ) {
            throw new Error( "minParallel needs to be 1 or more" );
        }

        this.metrics = { activeCount: 0, lastBackoff: new Date( 0 ), lastGrow: new Date( 0 ), lastMax: new Date( 0 ), maxActive: 0 };



    }

    private metrics: {
        maxActive: number,
        lastBackoff: Date,
        activeCount: number,
        /** the last time we grew our maxActive count  */
        lastGrow: Date,
        /** the last time we were at our maxActive count */
        lastMax: Date,
    };

    private pendingCalls: { args: any[], requesterPromise: promise.IExposedPromise<TResult> }[] = [];

    private activeCalls: { args: any[], requesterPromise: promise.IExposedPromise<TResult>, activeMonitorPromise: bb<any> }[] = [];

    public toJson() {
        return { pendingCalls: this.pendingCalls.length, activeCalls: this.activeCalls.length, metrics: this.metrics, options: this.options };
    }

    public submitRequest: TWorkerFunc = ( async ( ...args: any[] ): Promise<TResult> => {
        const requesterPromise = promise.CreateExposedPromise<TResult>();
        this.pendingCalls.push( { args, requesterPromise } );
        this._tryCallBackend();
        return requesterPromise;
    } ) as any;

    private _tryCallBackend() {
        while ( true ) {

            // ! /////////////  do housekeeping ///////////////////

            //check if we have to abort for various reasons
            if ( this.pendingCalls.length === 0 ) {
                //nothing to do
                return;
            }
            if ( this.metrics.activeCount >= this.metrics.maxActive ) {
                //make note that we are at our limit of requests
                this.metrics.lastMax = new Date();
            }
            if ( this.options.maxParallel != null && this.metrics.activeCount >= this.options.maxParallel ) {
                //at our hard limit of parallel requests
                return;
            }
            if ( this.metrics.activeCount >= this.metrics.maxActive //we are at our max...
                && ( this.metrics.lastGrow.getTime() + this.options.growDelayMs < Date.now() ) //we haven't grew recently...
                && ( this.metrics.lastBackoff.getTime() + this.options.backoffDelayMs < Date.now() ) //we haven't recieved a "BACKOFF" rejection recently...
            ) {
                //time to grow
                this.metrics.maxActive++;
                this.metrics.lastGrow = new Date();
            }
            if ( this.options.decayDelayMs != null && this.metrics.activeCount < this.metrics.maxActive && this.metrics.lastMax.getTime() + this.options.decayDelayMs < Date.now() ) {
                //time to reduce our maxActive
                const reduceCount = Math.round( ( Date.now() - this.metrics.lastMax.getTime() ) / this.options.decayDelayMs );//accumulating decays in case the autoScaler has been idle
                log.assert( reduceCount >= 0 );
                this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - reduceCount );
                //pretend we are at max, to properly delay decaying.
                this.metrics.lastMax = new Date();
            }

            if ( this.metrics.activeCount >= this.metrics.maxActive ) {
                //we are at our maxActive, wait for a free slot
                return;
            }

            // ! ////////// Done with housekeeping and didn't early abort.   time to call the backend  /////////////////

            const { args, requesterPromise } = this.pendingCalls.shift();
            const activeMonitorPromise = bb.resolve( this.backendWorker( ...args ) )
                .then( ( result ) => {
                    requesterPromise.fulfill( result );
                }, ( _err ) => {
                    //failure, see what to do about it
                    let verdict = this.failureListener( _err );
                    switch ( verdict ) {
                        case "FAIL":
                            requesterPromise.reject( _err );
                            break;
                        case "BACKOFF":
                            //apply special backoffPenaltyCount options, if they exist
                            if ( this.options.backoffPenaltyCount != null && this.metrics.lastBackoff.getTime() + this.options.backoffDelayMs < Date.now() ) {
                                //this is a "fresh" backoff.
                                //we have exceeded backend capacity and been notified with a "BACKOFF" failure.  reduce our maxParallel according to the options.backoffPenaltyCount
                                this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - this.options.backoffPenaltyCount );
                            }
                            //set our backoff time
                            this.metrics.lastBackoff = new Date();
                            //put request in front to try again
                            this.pendingCalls.unshift( { args, requesterPromise } );
                            break;
                    }
                } )
                .finally( () => {
                    //remove this from actives array
                    this.metrics.activeCount--;
                    _.remove( this.activeCalls, ( activeCall ) => activeCall.requesterPromise === requesterPromise );
                    //try another pass
                    this._tryCallBackend();
                } );

            this.metrics.activeCount++;
            this.activeCalls.push( { args, requesterPromise, activeMonitorPromise } );
        }

    }



}