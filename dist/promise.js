"use strict";
import * as arrayHelper from "./arrayhelper";
import * as _ from "lodash";
import * as __ from "./lolo";
import * as logging from "./logging";
import * as environment from "./environment";
import * as bluebird from "bluebird";
export { bluebird };
//bluebird.longStackTraces();
if (__.isLogDebug == true) {
    //http://bluebirdjs.com/docs/api/promise.config.html
    bluebird["config"]({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // no cancellation (the default) as that cancels the active promise and screws up multiple consumers
        cancellation: false,
        // Enable monitoring
        monitoring: true
    });
}
else {
}
if (global.Promise == null) {
    global.Promise = bluebird;
}
///** Reactive Extensions https://github.com/Reactive-Extensions/RxJS 
//...is a set of libraries to compose asynchronous and event-based programs using observable collections and Array#extras style composition in JavaScript
// * global.Rx is aliased to this.
// */
//export import rx = require("rx.all");
//(global as any)["Rx"] = rx;
//(rx as any).config.Promise = bluebird;
var __isUnhandledHooked = false;
var _unhandledDefaultLogger = new logging.Logger("promise.logPromiseUnhandledRejections");
function logPromiseUnhandledRejections(logger) {
    if (logger === void 0) { logger = _unhandledDefaultLogger; }
    if (__isUnhandledHooked === true) {
        return;
    }
    __isUnhandledHooked = true;
    logger.debug("exec xlib.diagnostics.logger.logPromiseUnhandledRejections()");
    switch (environment.platformType) {
        case environment.PlatformType.Browser:
            window.addEventListener("unhandledrejection", function (e) {
                var reason = e.detail.reason;
                var promise = e.detail.promise;
                logger.error(reason, promise);
                throw e;
            });
            break;
        case environment.PlatformType.NodeJs:
            process.on("unhandledRejection", function (reason, promise, whut) {
                try {
                    //console.log("unhandled");
                    //console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection " + JSON.stringify({ arguments }));
                    // See Promise.onPossiblyUnhandledRejection for parameter documentation
                    //let reason = promise.reason();
                    //logger.error(promise.reason());
                    //logger.error(__.JSONX.stringify(promise.reason()));
                    //logger.error({abc:123,cde:"xyz"});
                    logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection", reason); //, { promise: promise.toJSON() });
                }
                catch (ex) {
                    //try {
                    //	logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection TRY2", JSON.stringify({ reason, promise }));
                    //} catch (ex) {
                    console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection try 2 failed!");
                }
                throw reason;
            });
            break;
    }
}
logPromiseUnhandledRejections();
/** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
export function forEach(array, callback) {
    try {
        var results = [];
        _.forEach(array, function (value) {
            var resultPromise = callback(value);
            results.push(resultPromise);
        });
        return bluebird.all(results);
    }
    catch (ex) {
        return bluebird.reject(ex);
    }
}
export var _BluebirdRetryInternals;
(function (_BluebirdRetryInternals) {
})(_BluebirdRetryInternals || (_BluebirdRetryInternals = {}));
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
        return Promise.reject(new Error('fail the first two times'));
    } else {
        return Promise.resolve('succeed the third time');
    }
}

retry(myfunc).done(function(result) {
    console.log(result);
});
 */
export var retry = require("./_internal/bluebird-retry");
var _not_useful;
(function (_not_useful) {
    /** gets a promise which includes the "resolve()" and "reject()" methods to allow external code to fullfill it.*/
    function CreateExposedPromise(callback) {
        var resolver;
        var rejector;
        var toReturn = new bluebird(function (resolve, reject) {
            resolver = resolve;
            rejector = reject;
            toReturn.resolve = resolver;
            toReturn.reject = rejector;
            if (callback != null) {
                callback.apply(toReturn, arguments);
            }
        });
        return toReturn;
    }
    _not_useful.CreateExposedPromise = CreateExposedPromise;
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
                tempPromise.resolve(tempData);
            }
            //get the next call to process
            var args = __enqueuedCallArguments.shift();
            var currentPromise = func.apply(__this, args);
            currentPromise.then(function (currentValue) {
                __batchResults.push(currentValue);
                __doNext();
            }, function (error) {
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
    _not_useful.sequentializePromisedFunction = sequentializePromisedFunction;
})(_not_useful || (_not_useful = {}));
//# sourceMappingURL=promise.js.map