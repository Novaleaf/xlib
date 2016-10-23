"use strict";
var arrayHelper = require("./arrayhelper");
var _ = require("lodash");
var __ = require("./lolo");
var logging = require("./logging");
var environment = require("./environment");
/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
var bluebird = require("bluebird");
exports.bluebird = bluebird;
var Promise = require("bluebird");
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
/** Reactive Extensions v5 beta.  npm rxjs */
//import * as Rx from "@reactivex/rxjs";
//import Rx = require("rxjs");
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
function forEach(array, callback) {
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
        return Promise.reject(new Error('fail the first two times'));
    } else {
        return Promise.resolve('succeed the third time');
    }
}

retry(myfunc).done(function(result) {
    console.log(result);
});
 */
exports.retry = require("./internal/bluebird-retry");
/**
 *  helper class to handle async initialization logic.  for example, useful to make sure module initializations are performed before usage.
 * can also be used as a kind of "make sure something is run exactly once" logic.
 * example:
 * ```javascript
 * let log = new xlib.logging.Logger(__filename);
 * let _init = new InitializeHelper(log,()=>{return Promise.resolve()});
 * export let initialize = _init.initialize;
 * export function doStuff(){
 * _init.ensure(); //makes sure the initialization completed
 * }
 * ```
 */
var InitializeHelper = (function () {
    function InitializeHelper(_log, 
        /** the actual work that needs to be performed as part of the initialzation.  will only occur once */
        _initWorker) {
        this._log = _log;
        this._initWorker = _initWorker;
        /** the promise containing the results of the initialization (status and resulting value, if any) */
        this.result = null;
    }
    /**
     * initialize this module, or if it's already initialized, does nothing
     */
    InitializeHelper.prototype.initialize = function () {
        var _this = this;
        if (this.result != null) {
            //already called initialize, return it's promise
            return this.result;
        }
        this.result = Promise.try(function () {
            return _this._initWorker();
        });
        return this.result;
    };
    /**
     *  make sure this module's initialize method has been called.
     * if not, will log and throw an error.
     */
    InitializeHelper.prototype.ensure = function () {
        if (this.result == null || this.result.isPending()) {
            throw this._log.error("initialization still pending");
        }
    };
    return InitializeHelper;
}());
exports.InitializeHelper = InitializeHelper;
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