"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
exports.bluebird = require("bluebird");
const bb = require("bluebird");
const environment = require("./environment");
//bluebird.longStackTraces();
/** binds bluebird as global promise and other various init */
//export function initialize() {
if (environment.isDebug()) {
    //http://bluebirdjs.com/docs/api/promise.config.html
    exports.bluebird["config"]({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // if you owan to allow cancelation, see: http://bluebirdjs.com/docs/api/cancellation.html
        cancellation: false,
        // Enable monitoring
        monitoring: true,
    });
}
else {
    //noop
}
if (typeof global != "undefined") {
    global.Promise = exports.bluebird;
}
if (typeof window != "undefined") {
    window["Promise"] = exports.bluebird;
}
//}
/** helper to avoid throws in your code (so in dev time, avoid triggering "break on all exceptions").
    * **VERY** useful in codepaths that reject during normal operation, but not very useful otherwise.
    *
    * will await the promise to fulfill/reject, then return a resolved bluebird promise so you can inspect the error or obtain the results.
    @example
    const awaitInspect = xlib.promise.awaitInspect;
    const {toInspect} = await awaitInspect(yourClass.asyncMethod());
if(toInspect.isFulfilled()){
    const value = toInspect.value();
    //do stuff with value
}else{
    const err = toInspect.reason();
    //do stuff with err
}
 */
function awaitInspect(promise) {
    let toInspect = bb.resolve(promise);
    let results = { toInspect };
    // let tryToReturn = {
    // 	the
    // };
    let toReturn = CreateExposedPromise();
    toInspect.then((result) => {
        toReturn.fulfill(results);
    }, (err) => {
        toReturn.fulfill(results);
    });
    // toInspect.finally( () => {
    // 	toReturn.fulfill( results );
    // } );
    return toReturn;
}
exports.awaitInspect = awaitInspect;
function CreateExposedPromise(...args) {
    const tags = args[0];
    const callback = args[1];
    let fulfiller;
    let rejector;
    let toReturn = new bb(function (fulfill, reject) {
        fulfiller = fulfill;
        rejector = reject;
        if (callback != null) {
            callback.apply(toReturn, arguments);
        }
    });
    toReturn.fulfill = fulfiller;
    toReturn.reject = rejector;
    toReturn.tags = tags;
    return toReturn;
}
exports.CreateExposedPromise = CreateExposedPromise;
var _obsolete;
(function (_obsolete) {
    /** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
    function sequentializePromisedFunction(__this, func) {
        //todo: error handling.
        let __enqueuedCallArguments = [];
        let __isExecuting = false;
        let __batchPromise = CreateExposedPromise();
        let __batchResults = [];
        function __resetVariables() {
            __isExecuting = false;
            __batchResults = [];
            __batchPromise = CreateExposedPromise();
        }
        function __doNext() {
            if (__enqueuedCallArguments.length == 0) {
                //no more enqueued, so resolve our batch Promise and clear things out incase there are future calls to the facade.
                let tempData = __batchResults;
                let tempPromise = __batchPromise;
                __resetVariables();
                tempPromise.fulfill(tempData);
            }
            //get the next call to process
            let args = __enqueuedCallArguments.shift();
            let currentPromise = func.apply(__this, args);
            currentPromise.then((currentValue) => {
                __batchResults.push(currentValue);
                __doNext();
            }, (error) => {
                let tempPromise = __batchPromise;
                __resetVariables();
                tempPromise.reject(error);
            });
        }
        function __toReturn() {
            let args = _.clone(arguments);
            __enqueuedCallArguments.push(args);
            if (__isExecuting === true) {
                return __batchPromise;
            }
            __isExecuting = true;
            __doNext();
            return __batchPromise;
        }
        return __toReturn;
    }
    _obsolete.sequentializePromisedFunction = sequentializePromisedFunction;
    /** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
    NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
    function forEachParallel(array, callback) {
        try {
            let results = [];
            _.forEach(array, (value) => {
                let resultPromise = callback(value);
                results.push(resultPromise);
            });
            return bb.all(results);
        }
        catch (ex) {
            return bb.reject(ex);
        }
    }
    _obsolete.forEachParallel = forEachParallel;
})(_obsolete = exports._obsolete || (exports._obsolete = {}));
// export module _BluebirdRetryInternals {
// 	export interface IOptions {
// 		/**  initial wait time between attempts in milliseconds(default 1000)*/
// 		interval?: number;
// 		/**  if specified, increase interval by this factor between attempts*/
// 		backoff?: number;
// 		/** if specified, maximum amount that interval can increase to*/
// 		max_interval?: number;
// 		/** total time to wait for the operation to succeed in milliseconds*/
// 		timeout?: number;
// 		/** maximum number of attempts to try the operation*/
// 		max_tries?: number;
// 	}
// 	/**
// 	 *  Stopping
// The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of retry.StopError from within the called function.
// For example:
// let retry = require('bluebird-retry');
// let i = 0;
// let err;
// let swing = function() {
//     i++;
//     console.log('strike ' + i);
//     if (i == 3) {
//         throw new retry.StopError('yer out');
//     }
//     throw new Error('still up at bat');
// };
// retry(swing, {timeout: 10000})
// .catch(function(e) {
//     console.log(e.message)
// });
// Will display:
// strike 1
// strike 2
// strike 3
// yer out
// The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*
// 	 */
// 	export declare class StopError {
// 		constructor(
// 			/** The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*/
// 			message?: string | Error );
// 	}
// 	export interface IRetryStatic {
// 		<TValue>( fn: () => PromiseLike<TValue>, options?: IOptions ): bb<TValue>;
// 		/** Stopping
// The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of retry.StopError from within the called function.
// 		The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*/
// 		StopError: typeof StopError;
// 	}
// }
/**
 *  The ```bluebird-retry``` module:  https://www.npmjs.com/package/bluebird-retry
utility for retrying a bluebird promise until it succeeds
This very simple library provides a function for retrying an asynchronous operation until it succeeds. An "asynchronous operation" is embodied by a function that returns a promise or returns synchronously.

It supports regular intervals and exponential backoff with a configurable limit, as well as an overall timeout for the operation that limits the number of retries.

The bluebird library supplies the promise implementation.

Basic Usage
let Promise = require('bluebird');
let retry = require('bluebird-retry');

let count = 0;
function myfunc() {
    console.log('myfunc called ' + (++count) + ' times');
    if (count < 3) {
        return bb.reject(new Error('fail the first two times'));
    } else {
        return bb.resolve('succeed the third time');
    }
}

retry(myfunc).done(function(result) {
    console.log(result);
});
 */
//export let retry: _BluebirdRetryInternals.IRetryStatic = require( "bluebird-retry" );
const retry = require("bluebird-retry");
exports.retry = retry;
//# sourceMappingURL=promise.js.map