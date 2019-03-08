"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const bb = require("bluebird");
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
const promise = require("./promise");
const diagnostics = require("./diagnostics");
const log = diagnostics.log; // const log = new diagnostics.Logger( __filename );
/** an async+promise capable, readerwriter lock.
 *
 * allows multiple readers (non-exclusive read lock) and single-writers (exclusive write lock)
 *
 * additionally, allows storage of a value that is atomically written (a helper shortcut for common use: using this value is not required)
 *
 * when a race occurs, writes take precidence
 */
class AsyncReaderWriterLock {
    constructor(options) {
        this.writeCounter = 0;
        this.currentReads = [];
        this.pendingReadCount = 0;
        this.pendingWrites = [];
        options = Object.assign({ writeInProgress: false }, options);
        if (options.writeInProgress === true) {
            this.tryWriteBegin();
        }
    }
    toJson() {
        return {
            currentWrite: this.currentWrite ? this.currentWrite.tags : null,
            pendingWrites: this.pendingWrites.length,
            currentReads: this.currentReads.length,
            pendingReads: this.pendingReadCount,
            value: this._value ? "yes" : "no",
        };
    }
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
    isWritePending() {
        return this.pendingWrites.length > 0;
    }
    /** begin a read lock.   the returned promise resolves once the lock is aquired
     *
     * many simulatanious read locks are allowed, and be sure to call [[readEnd]] for each call of [[readBegin]]
     */
    readBegin() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            //let readToken = 
            if (this.pendingWrites.length > 0) {
                //this.pendingReads.push(promise.CreateExposedPromise());
                this.pendingReadCount++;
                while (this.pendingWrites.length > 0) {
                    yield Promise.all(this.pendingWrites);
                }
                this.pendingReadCount--;
            }
            log.assert(this.pendingWrites.length === 0, "expect writeQueue to be zero length");
            log.assert(this.currentWrite == null, "race, current write should not be possible while start reading");
            this.currentReads.push(promise.CreateExposedPromise());
            return this._value;
        });
    }
    /** release your read lock */
    readEnd() {
        log.assert(this.currentReads.length > 0, "out of current reads, over decremented?");
        log.assert(this.currentWrite == null, "race, current write should not be possible while reading");
        let readToken = this.currentReads.pop();
        if (readToken) {
            readToken.fulfill();
        }
    }
    /** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
    tryWriteBegin() {
        if (this.pendingWrites.length > 0 || this.currentReads.length > 0) {
            return false;
        }
        //do sync writeBegin        
        log.assert(this.currentWrite == null, "race, current write should not be possible while start writing (tryWriteBegin)");
        const writeId = this.writeCounter++;
        let thisWrite = promise.CreateExposedPromise({ writeId });
        this.pendingWrites.push(thisWrite);
        this.currentWrite = thisWrite;
        log.assert(this.currentWrite === this.pendingWrites[0], "current write should be at head of queue.  (tryWriteBegin)");
        return true;
    }
    /** take a write lock.   returned promise resolves once your lock is aquired. */
    writeBegin() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const writeId = this.writeCounter++;
            let thisWrite = promise.CreateExposedPromise({ writeId });
            this.pendingWrites.push(thisWrite);
            //wait until it's this write's turn
            while (this.pendingWrites[0].tags.writeId !== writeId) {
                yield this.pendingWrites[0];
            }
            //wait while there are still active reads
            while (this.currentReads.length > 0) {
                yield bb.all(this.currentReads);
            }
            //now on the item        
            log.assert(this.currentWrite == null, "race, current write should not be possible while start writing");
            this.currentWrite = thisWrite;
            log.assert(this.currentWrite === this.pendingWrites[0], "current write should be at head of queue.  (writeBegin)");
        });
    }
    /** finish the write lock, allowing writing of the stored [[value]] when doing so */
    writeEnd(
    /**write the data [[value]], or if a promise is passed, an exclusive write lock will be held until it exits*/
    valueOrWritePromise) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                //log.assert( thisWrite._tags.writeId === writeId, "writeId mismatch" );
                if (valueOrWritePromise instanceof bb || (_.isObject(valueOrWritePromise) && _.isFunction(valueOrWritePromise.then))) {
                    this._value = yield bb.resolve(valueOrWritePromise);
                }
                else {
                    this._value = valueOrWritePromise;
                }
            }
            finally {
                log.assert(this.currentWrite != null, "race, current write should be set");
                log.assert(this.currentWrite === this.pendingWrites[0], "current write should be at head of queue.  (writeEnd)");
                let thisWrite = this.pendingWrites.shift();
                this.currentWrite = null;
                thisWrite.fulfill();
            }
        });
    }
    /** hold a non-exclusive read lock for the duration of the promise. */
    read(/** until this promise returns, a non-exclusive read lock will be held*/ readFcn) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (readFcn == null && this.currentWrite == null) {
                //high performance scenario where we just return the value without doing awaits
                return this._value;
            }
            yield this.readBegin();
            try {
                if (readFcn != null) {
                    yield bb.resolve(this._value).then(readFcn);
                }
                return this._value;
            }
            finally {
                this.readEnd();
            }
        });
    }
    /** hold an exclusive write lock for the duration of the promise. */
    write(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let toWrite;
            yield this.writeBegin();
            return this.writeEnd(valueOrWritePromise);
        });
    }
}
exports.AsyncReaderWriterLock = AsyncReaderWriterLock;
;
/** while this is probably only useful+used by the ```net.RemoteHttpEndpoint``` class, this is a generic autoscaler implementation,
    * meaning that it will scale requests to a ```backendWorker``` function, gradually increasing activeParallel requests over time.   Requests exceeding activeParallel will be queued in a FIFO fashion.
    *
    the only requirement is that the target ```backendWorker``` function  return a promise,
    * and you specify a ```failureListener``` function that can tell the difference between a failure and a need for backing off.
    */
class Autoscaler {
    constructor(options, backendWorker, 
    /** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "TOO_BUSY" if the request should be retried  */
    failureListener) {
        this.options = options;
        this.backendWorker = backendWorker;
        this.failureListener = failureListener;
        this.pendingCalls = [];
        this.activeCalls = [];
        /** submit a request to the backend worker.
         *
         * **Important note**: to avoid "unhandled promise rejections" you need to make sure the returned Promise has a catch() applied to it.
         * **NOT** just store the promise in an array to inspect later.  This is because if the request fails, the returned promise gets rejected, and if the Promise internal logic doesn't see a .catch() it will show the global "unhandled rejected promse" soft error message.
         */
        this.submitRequest = 
        //a worker with generic input/return args, cast to our specific worker function's sig
        ((...args) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const requesterPromise = promise.CreateExposedPromise();
            this.pendingCalls.push({ args, requesterPromise });
            this._tryCallBackend();
            return requesterPromise;
        }));
        this._lastTryCallTime = new Date();
        //apply defaults
        this.options = Object.assign({ busyExtraPenalty: 1 }, options);
        if (this.options.minParallel < 1) {
            throw new Error("minParallel needs to be 1 or more");
        }
        this.metrics = { activeCount: 0, tooBusyWaitStart: new Date(0), lastGrow: new Date(0), lastMax: new Date(0), maxActive: options.minParallel, lastDecay: new Date(0), lastTooBusy: new Date(0) };
    }
    toJson() {
        return { pendingCalls: this.pendingCalls.length, activeCalls: this.activeCalls.length, metrics: this.metrics, options: this.options };
    }
    _tryCallBackend() {
        const now = new Date();
        try {
            while (true) {
                // ! /////////////  do housekeeping ///////////////////
                //check if we have to abort for various reasons
                if (this.pendingCalls.length === 0) {
                    //nothing to do
                    return;
                }
                if (this.metrics.activeCount >= this.metrics.maxActive) {
                    //make note that we are at our limit of requests
                    this.metrics.lastMax = now;
                }
                if (this.options.maxParallel != null && this.metrics.activeCount >= this.options.maxParallel) {
                    //at our hard limit of parallel requests
                    return;
                }
                if (this.metrics.activeCount >= this.metrics.maxActive //we are at our max...
                    && (this.metrics.lastGrow.getTime() + this.options.growDelayMs < now.getTime()) //we haven't grew recently...
                    && (this.metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < now.getTime()) //we are not in a options.busyWaitMs interval (haven't recieved a "TOO_BUSY" rejection recently...)
                ) {
                    //time to grow
                    this.metrics.maxActive++;
                    this.metrics.lastGrow = now;
                }
                const lastTryMsAgo = now.getTime() - this._lastTryCallTime.getTime();
                if (this.options.idleOrBusyDecreaseMs != null && this.metrics.lastDecay.getTime() + (this.options.idleOrBusyDecreaseMs + lastTryMsAgo) < now.getTime()) {
                    //havent decayed recently
                    if ((this.metrics.lastMax.getTime() + (this.options.idleOrBusyDecreaseMs + lastTryMsAgo) < now.getTime()) //havent been at max recently
                        || (this.metrics.lastTooBusy.getTime() + this.options.idleOrBusyDecreaseMs > now.getTime()) //OR we have gotten "TOO_BUSY" rejections since our last decay, so backoff
                    ) {
                        //time to reduce our maxActive
                        const reduceCount = 1 + Math.round((now.getTime() - this.metrics.lastMax.getTime()) / this.options.idleOrBusyDecreaseMs); //accumulating decays in case the autoScaler has been idle
                        log.assert(reduceCount >= 0);
                        this.metrics.maxActive = Math.max(this.options.minParallel, this.metrics.maxActive - reduceCount);
                        //pretend we are at max, to properly delay growing.
                        this.metrics.lastMax = now;
                        this.metrics.lastDecay = now;
                    }
                }
                if (this.metrics.activeCount >= this.metrics.maxActive) {
                    //we are at our maxActive, wait for a free slot
                    return;
                }
                // ! ////////// Done with housekeeping and didn't early abort.   time to call the backend  /////////////////
                const { args, requesterPromise } = this.pendingCalls.shift();
                const activeMonitorPromise = bb.resolve(this.backendWorker(...args))
                    .then((result) => {
                    requesterPromise.fulfill(result);
                }, (_err) => {
                    //failure, see what to do about it
                    let verdict = this.failureListener(_err);
                    switch (verdict) {
                        case "FAIL":
                            requesterPromise.reject(_err);
                            break;
                        case "TOO_BUSY":
                            const tooBusyNow = new Date();
                            this.metrics.lastTooBusy = tooBusyNow;
                            //apply special backoffPenaltyCount options, if they exist
                            if (this.options.busyExtraPenalty != null && this.metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < tooBusyNow.getTime()) {
                                //this is a "fresh" backoff.
                                //we have exceeded backend capacity and been notified with a "TOO_BUSY" failure.  reduce our maxParallel according to the options.backoffPenaltyCount
                                this.metrics.maxActive = Math.max(this.options.minParallel, this.metrics.maxActive - this.options.busyExtraPenalty);
                                //set our "fresh" tooBusy time
                                this.metrics.tooBusyWaitStart = tooBusyNow;
                            }
                            //put request in front to try again
                            this.pendingCalls.unshift({ args, requesterPromise });
                            break;
                    }
                    return Promise.resolve();
                })
                    .finally(() => {
                    //remove this from actives array
                    this.metrics.activeCount--;
                    _.remove(this.activeCalls, (activeCall) => activeCall.requesterPromise === requesterPromise);
                    //try another pass
                    this._tryCallBackend();
                });
                this.metrics.activeCount++;
                this.activeCalls.push({ args, requesterPromise, activeMonitorPromise });
            }
        }
        catch (_err) {
            log.error(_err);
        }
        finally {
            this._lastTryCallTime = now;
            if (this.pendingCalls.length > 0 && this.metrics.activeCount >= this.metrics.maxActive) {
                //we have pending work, try again at minimum our next potential grow interval
                clearTimeout(this._heartbeatHandle); //only 1 pending callback, regardless of how many calls there were
                this._heartbeatHandle = setTimeout(() => { this._tryCallBackend(); }, this.options.growDelayMs);
            }
        }
    }
}
exports.Autoscaler = Autoscaler;
//# sourceMappingURL=threading.js.map