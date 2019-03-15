"use strict";
import * as _ from "lodash";
import bb from "bluebird";
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

    constructor( options?: { /** set to true to set the initial state to blocking (a single write already in progress)*/ writeInProgress: boolean; } ) {
        options = { writeInProgress: false, ...options };

        if ( options.writeInProgress === true ) {
            this.tryWriteBegin();
        }
    }
    public toJson() {
        return {
            currentWrite: this.currentWrite != null ? this.currentWrite.tags : null,
            pendingWrites: this.pendingWrites.length,
            currentReads: this.currentReads.length,
            pendingReads: this.pendingReadCount,
            value: this._value != null ? "yes" : "no",
        };
    }
    private writeCounter = 0;
    private currentReads: Array<promise.IExposedPromise> = [];
    private pendingReadCount = 0;

    private pendingWrites: Array<promise.IExposedPromise<void, { writeId: number; }>> = [];

    private currentWrite: promise.IExposedPromise<void, { writeId: number; }> | undefined;

    private _value: TValue | undefined;
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


    /** begin a read lock.   the returned promise resolves once the lock is aquired
     *
     * many simulatanious read locks are allowed, and be sure to call [[readEnd]] for each call of [[readBegin]]
     */
    public async readBegin(): Promise<TValue | undefined> {
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

    /** release your read lock */
    public readEnd() {
        log.assert( this.currentReads.length > 0, "out of current reads, over decremented?" );
        log.assert( this.currentWrite == null, "race, current write should not be possible while reading" );
        let readToken = this.currentReads.pop();
        if ( readToken != null ) {
            readToken.fulfill();
        }
    }

    /** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
    public tryWriteBegin(): boolean {
        if ( this.pendingWrites.length > 0 || this.currentReads.length > 0 ) {
            return false;
        }

        //do sync writeBegin
        log.assert( this.currentWrite == null, "race, current write should not be possible while start writing (tryWriteBegin)" );
        const writeId = this.writeCounter++;
        let thisWrite = promise.CreateExposedPromise( { writeId } );
        this.pendingWrites.push( thisWrite );
        this.currentWrite = thisWrite;
        log.assert( this.currentWrite === this.pendingWrites[ 0 ], "current write should be at head of queue.  (tryWriteBegin)" );

        return true;
    }

    /** take a write lock.   returned promise resolves once your lock is aquired. */
    public async writeBegin() {
        const writeId = this.writeCounter++;
        let thisWrite = promise.CreateExposedPromise( { writeId } );
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

    /** finish the write lock, allowing writing of the stored [[value]] when doing so */
    public async writeEnd(
        /**write the data [[value]], or if a promise is passed, an exclusive write lock will be held until it exits*/
        valueOrWritePromise?: TValue | PromiseLike<TValue> ) {


        try {
            //log.assertIf( thisWrite._tags.writeId === writeId, "writeId mismatch" );
            // tslint:disable-next-line: no-unbound-method
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
	/** minimum parallel requests (maxActive) you allow, regardless of how long the autoscaler has been idle.  should be 1 or more.
	*/
    minParallel: number;
	/** optional.  set a max to number of parallel requests (maxActive) no matter how active the calls
		* @default undefined (no limit)
	*/
    maxParallel?: number;
    /** if we get a "TOO_BUSY" rejection (from the ```failureListener```), how long we should wait before trying to expand our maxActive again. */
    busyGrowDelayMs: number;
    /** when we are at max parallel and still able to successfully submit requests (not getting "TOO_BUSY" errors), how long to delay before increasing our maxActive by 1. */
    growDelayMs: number;
    /** when we are under our max parallel, how long before our max should decrease by 1 .   Also, when we are consistently getting "TOO_BUSY" rejections, we will decrease our maxActive by 1 this often.  pass null to never decay (not recomended).*/
    idleOrBusyDecreaseMs: number;
	/** optional.  when we first get a "TOO_BUSY" rejection, we will reduce maxActive by this amount.  interval to check if we should penalize resets after ```busyWaitMs```
     * Note: when too busy, we also reduce maxActive via the ```decayDelayMs``` parameter every so often (as set by decayDelayMs)..   set to 0 to have no penalty except that set by decayDelayMs
		* @default 1
	 */
    busyExtraPenalty?: number;


    // /** while there is pending work, how often to wakeup and see if we can submit more.  should be less than half of grow/decay delayMs
    //  * @default 1/10th of the minimum of  grow/decay delayMs
    //  */
    // heartbeatMs?: number,
}


import * as luxon from "luxon";
import * as exception from "./_diagnostics/exception";

export class RetryException extends exception.Exception {

    constructor( public statePtr: IRetryState, message: string, options?: exception.IExceptionOptions ) {
        super( message, options );
    }

}

export class RetryTimeoutException extends RetryException { }


export interface IRetryOptions {

    /** exponential factor.  to bias retries towards taking more time. see [[delayHandler]] for details
     * @default 1
    */
    expFactor?: number;


    /** maximum number of attempts.  exceeding this will cause a ```RetryException``` to be thrown
     * @default null (not used)
     */
    maxRetries?: number | null;

    /** Duration Object or number of milliseconds. 
     * 
     * maximum time to wait (all attempts combined). exceeding this will cause a ```RetryException``` to be thrown . 
     * @default ```60 seconds```
     * */
    totalTimeout?: luxon.Duration | number;


    /** Duration Object or number of milliseconds. 
         * @default ```60 seconds```
     * 
     * if a try exceeds this, it will be considered failed.   If your invocation function supports aborting, be sure you also set the [[abortHandler]] property
     */
    tryTimeout?: luxon.Duration | number;

    /**  Duration Object or number of milliseconds. 
     * @default ```0ms```
     * 
     *  how long to wait on the first retry, and the minimum wait for all retries.  Defaults to zero, though also see the [[maxJitter]] property*/
    baseWait?: luxon.Duration | number;

    /**  Duration Object or number of milliseconds. 
     * @default ```5 seconds```
     * 
     *  the maximum to ever wait between each try. */
    waitCap?: luxon.Duration | number;

    /**  Duration Object or number of milliseconds.   
     * @Default of ```100ms```
     * 
     * on each retry we add a random amount of extra time delay, the amount ranging from zero to this supplied ```maxJitter``` amount.
     * 
     * Jitter helps remove pathological cases of resource contention by smoothing out loads.
     */
    maxJitter?: luxon.Duration | number;

    /** Optional.  Allows aborting a timed-out request.  
     * 
     * ***performance note:*** We do not retry until the abortHandler's returned promise resolves. */
    abortHandler?: ( err: RetryTimeoutException, ) => Promise<void>;

    /** Optional.  Allows interecepting the invocation function's response and manually decide if a failure occured.
     * 
     * return a rejected promise to retry
     * 
     * return a resolved promise to complete the invoke request. */
    responseHandler?: <TResult>( result: TResult, state: IRetryState ) => Promise<TResult>;
    /** Optional.  Allows interecepting the invocation function's error response and manually decide if a failure occured. 
     * 
     * return a rejected promise to retry
     * 
     * return a resolved promise to complete the invoke request.
    */
    responseErrorHandler?: <TResult> ( err: Error, state: IRetryState ) => Promise<TResult>;


    /** Optional.  allows overriding the algorithm computing how long to wait between retries.  
     * 
     * default is ```nextSleep = min(waitCap,randBetween(baseWait,lastSleep*(try^expFactor))) + randBetween(0,maxJitter)``` which is loosely based on this article: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ */
    delayHandler?: ( state: IRetryState ) => luxon.Duration | number;

}
/** state for this current [[Retry]].[[Retry.invoke]]() attempt */
export interface IRetryState {
    /** time that .invoke() was called */
    invokeTime: luxon.DateTime;
    /** the current, or next try.  the first try is ```1``` */
    try: number;
    /** the time the latest try started */
    tryStart: luxon.DateTime;

    /** the amount of time we last slept.   on the first try will be zero. */
    lastSleep: luxon.Duration;

    /** options passed to the [[Retry]] object ctor */
    options: IRetryOptions;

    /** the retry object associated */
    retryObject: Retry<any, any, any>;

}

import * as numHelper from "./_util/numhelper";

/** helper class to retry a ```workerFunc``` as needed, based on a configurable backoff algorithm.   Our default algorithm (see options.delayHandler)  */
export class Retry<TWorkerFunc extends ( ...args: TArgs[] ) => Promise<TResult>, TArgs, TResult>{

    constructor( public options: IRetryOptions, private workerFunc: TWorkerFunc ) {

        const rand = numHelper.randomInt;
        // tslint:disable-next-line: no-unbound-method
        const min = Math.min;

        //apply defaults
        options = {
            expFactor: 1,
            maxJitter: 100,
            baseWait: 0,
            totalTimeout: luxon.Duration.fromObject( { seconds: 60 } ),
            waitCap: luxon.Duration.fromObject( { seconds: 5 } ),
            tryTimeout: luxon.Duration.fromObject( { seconds: 60 } ),
            /** default is ```nextSleep = min(waitCap,randBetween(baseWait,lastSleep*(try^expFactor))) + randBetween(0,maxJitter)``` 
             * which is loosely based on this article: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ */
            delayHandler: ( s ) => min( s.options.waitCap.valueOf(), rand( s.options.baseWait.valueOf(), s.lastSleep.valueOf() * ( Math.pow( s.try, s.options.expFactor ) ) ) ) + rand( 0, s.options.maxJitter.valueOf() ),
            ...options
        };
        this.options = options;

    }


    // public async invoke( ...args: TArgs[] ): Promise<TResult> {


    // }

    /** invoke the workerFunc passed via the constructor, and retries as needed. */
    public invoke: TWorkerFunc = async function invoke( this: Retry<TWorkerFunc, TArgs, TResult>, ...args: any[] ) {

        const state: IRetryState = {
            lastSleep: luxon.Duration.fromMillis( 0 ),
            options: this.options,
            retryObject: this,
            invokeTime: luxon.DateTime.utc(),
            tryStart: null,
            try: 0,
        };


        //loop trys until we either have a valid return or an explicit abort.
        while ( true ) {
            state.try++;

            const timeoutMs = Math.min( this.options.totalTimeout.valueOf() - luxon.DateTime.utc().diff( state.invokeTime ).valueOf(), this.options.tryTimeout.valueOf() );
            if ( timeoutMs < 0 ) {
                throw new RetryTimeoutException( state, `timeout exceeded on try ${ state.try }.  timeLeft=${ timeoutMs }.  totalTimeout=${ this.options.totalTimeout.valueOf() }, startTime=${ state.invokeTime.toISOTime() }` );
            }


            const tryTimeoutMessage = "try timeout exceeded";
            try {
                state.tryStart = luxon.DateTime.utc();
                let invokeResult = await bb.resolve( this.invoke( ...args ) ).timeout( timeoutMs, new RetryTimeoutException( state, tryTimeoutMessage ) );
                if ( state.options.responseHandler != null ) {
                    //let user filter the result
                    invokeResult = await state.options.responseHandler( invokeResult, state );
                }
                return invokeResult;
            } catch ( _err ) {
                const err = exception.toError( _err );
                //could fail due to timeout, or error in the invoked function.
                if ( err instanceof RetryTimeoutException && err.statePtr === state && err.message === tryTimeoutMessage ) {
                    //this try timed out.
                    if ( state.options.abortHandler != null ) {
                        //allow graceful abort
                        await state.options.abortHandler( err );
                    }
                }
                //allow user handling of whatever error
                if ( state.options.responseHandler != null ) {
                    const toReturn = await state.options.responseErrorHandler<TResult>( err, state );
                    //valid toReturn.  if the above promise was rejected, await would throw.
                    return toReturn;
                }

                //if here, an error.  retry
                const delayMs = state.options.delayHandler( state ).valueOf();

                //make sure our next try time doesn't exceed our totalTimeout
                const nextRetryTime = luxon.DateTime.utc().plus( { milliseconds: delayMs } );
                const minTimeThatWillElapse = nextRetryTime.diff( state.invokeTime );
                if ( minTimeThatWillElapse.valueOf() > state.options.totalTimeout.valueOf() ) {
                    throw new RetryTimeoutException( state, `options.totalTimeout would be exceeded upon next try attempt, so aborting now (try=${ state.try }).` );
                }

                await bb.delay( delayMs );
                continue;
            }

        }

    } as any;


}

/** while this is probably only useful+used by the ```net.RemoteHttpEndpoint``` class, this is a generic autoscaler implementation,
	* meaning that it will scale requests to a ```backendWorker``` function, gradually increasing activeParallel requests over time.   Requests exceeding activeParallel will be queued in a FIFO fashion.
	*
	the only requirement is that the target ```backendWorker``` function  return a promise,
    * and you specify a ```failureListener``` function that can tell the difference between a failure and a need for backing off.
    */
export class Autoscaler<TWorkerFunc extends ( ...args: Array<any> ) => Promise<any>, TError extends Error>{

    constructor(
        private options: IAutoscalerOptions,
        private backendWorker: TWorkerFunc,
        /** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "TOO_BUSY" if the request should be retried  */
        private failureListener: ( ( err: TError ) => "FAIL" | "TOO_BUSY" ),
    ) {

        //apply defaults
        this.options = {
            busyExtraPenalty: 1,
            //heartbeatMs: Math.min( options.growDelayMs, options.idleOrBusyDecreaseMs ) / 10,
            ...options
        };

        if ( this.options.minParallel < 1 ) {
            throw new Error( "minParallel needs to be 1 or more" );
        }

        this.metrics = { activeCount: 0, tooBusyWaitStart: new Date( 0 ), lastGrow: new Date( 0 ), lastMax: new Date( 0 ), maxActive: options.minParallel, lastDecay: new Date( 0 ), lastTooBusy: new Date( 0 ) };


    }

    private metrics: {
        /** the max number of active parallel requests we currently allow.   increases and decreases based on the growDelayMs and decayDelayMs */
        maxActive: number;
        /** time in which we decided to stop growing (based on options.busyWaitMs ) */
        tooBusyWaitStart: Date;
        /** the current number of parallel requests active in our backendWorker */
        activeCount: number;
        /** the last time we grew our maxActive count  */
        lastGrow: Date;
        /** the last time we were at our maxActive count */
        lastMax: Date;
        /** the last time we got a "TOO_BUSY" rejection from the backendWorker.  note that this could happen while in a options.busyWaitMs interval, if the backend is sufficently overwhelmed */
        lastTooBusy: Date;
        /** the last time we decayed our maxActive */
        lastDecay: Date;
    };

    private pendingCalls: Array<{ args: Array<any>; requesterPromise: promise.IExposedPromise<any>; }> = [];

    private activeCalls: Array<{ args: Array<any>; requesterPromise: promise.IExposedPromise<any>; activeMonitorPromise: bb<any>; }> = [];

    public toJson() {
        return { pendingCalls: this.pendingCalls.length, activeCalls: this.activeCalls.length, metrics: this.metrics, options: this.options };
    }

    /** submit a request to the backend worker.
     *
     * **Important note**: to avoid "unhandled promise rejections" you need to make sure the returned Promise has a catch() applied to it.
     * **NOT** just store the promise in an array to inspect later.  This is because if the request fails, the returned promise gets rejected, and if the Promise internal logic doesn't see a .catch() it will show the global "unhandled rejected promse" soft error message.
     */
    public submitRequest: TWorkerFunc =
        //a worker with generic input/return args, cast to our specific worker function's sig
        ( async ( ...args: Array<any> ): Promise<any> => {
            const requesterPromise = promise.CreateExposedPromise<any>();
            this.pendingCalls.push( { args, requesterPromise } );
            this._tryCallBackend();
            return requesterPromise;
        } ) as any;


    private _lastTryCallTime = new Date();
    private _tryCallBackend() {
        const now = new Date();
        try {
            while ( true ) {

                // ! /////////////  do housekeeping ///////////////////

                //check if we have to abort for various reasons
                if ( this.pendingCalls.length === 0 ) {
                    //nothing to do
                    return;
                }
                if ( this.metrics.activeCount >= this.metrics.maxActive ) {
                    //make note that we are at our limit of requests
                    this.metrics.lastMax = now;
                }
                if ( this.options.maxParallel != null && this.metrics.activeCount >= this.options.maxParallel ) {
                    //at our hard limit of parallel requests
                    return;
                }
                if ( this.metrics.activeCount >= this.metrics.maxActive //we are at our max...
                    && ( this.metrics.lastGrow.getTime() + this.options.growDelayMs < now.getTime() ) //we haven't grew recently...
                    && ( this.metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < now.getTime() ) //we are not in a options.busyWaitMs interval (haven't recieved a "TOO_BUSY" rejection recently...)
                ) {
                    //time to grow
                    this.metrics.maxActive++;
                    this.metrics.lastGrow = now;
                }
                const lastTryMsAgo = now.getTime() - this._lastTryCallTime.getTime();
                if ( this.options.idleOrBusyDecreaseMs != null && this.metrics.lastDecay.getTime() + ( this.options.idleOrBusyDecreaseMs + lastTryMsAgo ) < now.getTime() ) {
                    //havent decayed recently
                    if (
                        ( this.metrics.lastMax.getTime() + ( this.options.idleOrBusyDecreaseMs + lastTryMsAgo ) < now.getTime() ) //havent been at max recently
                        || ( this.metrics.lastTooBusy.getTime() + this.options.idleOrBusyDecreaseMs > now.getTime() ) //OR we have gotten "TOO_BUSY" rejections since our last decay, so backoff
                    ) {
                        //time to reduce our maxActive
                        const reduceCount = 1 + Math.round( ( now.getTime() - this.metrics.lastMax.getTime() ) / this.options.idleOrBusyDecreaseMs );//accumulating decays in case the autoScaler has been idle
                        log.assert( reduceCount >= 0 );
                        this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - reduceCount );
                        //pretend we are at max, to properly delay growing.
                        this.metrics.lastMax = now;
                        this.metrics.lastDecay = now;
                    }

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
                            case "TOO_BUSY":
                                const tooBusyNow = new Date();
                                this.metrics.lastTooBusy = tooBusyNow;
                                //apply special backoffPenaltyCount options, if they exist
                                if ( this.options.busyExtraPenalty != null && this.metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < tooBusyNow.getTime() ) {
                                    //this is a "fresh" backoff.
                                    //we have exceeded backend capacity and been notified with a "TOO_BUSY" failure.  reduce our maxParallel according to the options.backoffPenaltyCount
                                    this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - this.options.busyExtraPenalty );

                                    //set our "fresh" tooBusy time
                                    this.metrics.tooBusyWaitStart = tooBusyNow;
                                }
                                //put request in front to try again
                                this.pendingCalls.unshift( { args, requesterPromise } );
                                break;
                        }
                        return Promise.resolve();
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

        } catch ( _err ) {
            log.error( _err );
        } finally {
            this._lastTryCallTime = now;
            if ( this.pendingCalls.length > 0 && this.metrics.activeCount >= this.metrics.maxActive ) {
                //we have pending work, try again at minimum our next potential grow interval
                clearTimeout( this._heartbeatHandle ); //only 1 pending callback, regardless of how many calls there were
                this._heartbeatHandle = setTimeout( () => { this._tryCallBackend(); }, this.options.growDelayMs );
            }
        }
    }
    private _heartbeatHandle: any;
}
