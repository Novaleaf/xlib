"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrayHelper = require("./arrayhelper");
const _ = require("lodash");
const __ = require("./lolo");
/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
exports.bluebird = require("bluebird");
const bb = require("bluebird");
//bluebird.longStackTraces();
if (__.isDebug == true) {
    //http://bluebirdjs.com/docs/api/promise.config.html
    exports.bluebird["config"]({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // if you owan to allow cancelation, see: http://bluebirdjs.com/docs/api/cancellation.html
        cancellation: false,
        // Enable monitoring
        monitoring: true
    });
}
else {
    //
}
if (typeof global != "undefined") {
    global.Promise = exports.bluebird;
}
if (typeof window != "undefined") {
    window["Promise"] = exports.bluebird;
}
// /** Reactive Extensions https://github.com/Reactive-Extensions/RxJS 
// ...is a set of libraries to compose asynchronous and event-based programs using observable collections and Array#extras style composition in JavaScript
//  * global.Rx is aliased to this.
//  */
// export import rx = require( "rx" );
// global[ "Rx" ] = rx;
// rx.config.Promise = bluebird;
/** gets a promise which includes the "fulfill()" and "reject()" methods to allow external code to fullfill it.*/
function CreateExposedPromise(callback, tags) {
    var fulfiller;
    var rejector;
    var toReturn = new bb(function (fulfill, reject) {
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
/** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
function sequentializePromisedFunction(__this, func) {
    //todo: error handling.
    var __enqueuedCallArguments = [];
    var __isExecuting = false;
    var __batchPromise = CreateExposedPromise();
    var __batchResults = [];
    function __resetVariables() {
        __isExecuting = false;
        __batchResults = [];
        __batchPromise = CreateExposedPromise();
    }
    function __doNext() {
        if (__enqueuedCallArguments.length == 0) {
            //no more enqueued, so resolve our batch Promise and clear things out incase there are future calls to the facade.
            var tempData = __batchResults;
            var tempPromise = __batchPromise;
            __resetVariables();
            tempPromise.fulfill(tempData);
        }
        //get the next call to process
        var args = __enqueuedCallArguments.shift();
        var currentPromise = func.apply(__this, args);
        currentPromise.then((currentValue) => {
            __batchResults.push(currentValue);
            __doNext();
        }, (error) => {
            var tempPromise = __batchPromise;
            __resetVariables();
            tempPromise.reject(error);
        });
    }
    function __toReturn() {
        var args = arrayHelper.copy(arguments);
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
exports.sequentializePromisedFunction = sequentializePromisedFunction;
/** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
function forEach(array, callback) {
    try {
        var results = [];
        _.forEach(array, (value) => {
            var resultPromise = callback(value);
            results.push(resultPromise);
        });
        return bb.all(results);
    }
    catch (ex) {
        return bb.reject(ex);
    }
}
exports.forEach = forEach;
var _BluebirdRetryInternals;
(function (_BluebirdRetryInternals) {
})(_BluebirdRetryInternals = exports._BluebirdRetryInternals || (exports._BluebirdRetryInternals = {}));
/**
 *  The ```bluebird-retry``` module:  https://www.npmjs.com/package/bluebird-retry
utility for retrying a bluebird promise until it succeeds
This very simple library provides a function for retrying an asynchronous operation until it succeeds. An "asynchronous operation" is embodied by a function that returns a promise or returns synchronously.

It supports regular intervals and exponential backoff with a configurable limit, as well as an overall timeout for the operation that limits the number of retries.

The bluebird library supplies the promise implementation.

Basic Usage
var Promise = require('bluebird');
var retry = require('bluebird-retry');

var count = 0;
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
//export var retry: _BluebirdRetryInternals.IRetryStatic = require( "bluebird-retry" );
const retry = require("bluebird-retry");
exports.retry = retry;
//# sourceMappingURL=promise.js.map