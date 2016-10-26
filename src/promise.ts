"use strict";

import * as arrayHelper from "./arrayhelper";
import * as _ from "lodash";
import * as __ from "./lolo";
import * as logging from "./logging";
import * as environment from "./environment";

/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance 
 * global.Promise is aliased to this.
 */
import * as bluebird from "bluebird";
export { bluebird };
import * as Promise from "bluebird";
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
} else {
	//
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
let _unhandledDefaultLogger = new logging.Logger("promise.logPromiseUnhandledRejections")
function logPromiseUnhandledRejections(logger = _unhandledDefaultLogger) {
    if (__isUnhandledHooked === true) {
        return;
    }
    __isUnhandledHooked = true;
	logger.debug("exec xlib.diagnostics.logger.logPromiseUnhandledRejections()");
    switch (environment.platformType) {
        case environment.PlatformType.Browser:
            window.addEventListener("unhandledrejection", (e: any) => {
                var reason = e.detail.reason;
                var promise = e.detail.promise;

                logger.error(reason, promise);

                throw e;
            });
            break;
        case environment.PlatformType.NodeJs:
            process.on("unhandledRejection", function (reason: any, promise: Promise<any>,whut:any) {
				try {

					
					//console.log("unhandled");
					//console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection " + JSON.stringify({ arguments }));
					// See Promise.onPossiblyUnhandledRejection for parameter documentation

					
					
					//let reason = promise.reason();
					//logger.error(promise.reason());
					//logger.error(__.JSONX.stringify(promise.reason()));
					//logger.error({abc:123,cde:"xyz"});
					logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection", reason);//, { promise: promise.toJSON() });
					//logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection", reason, { promise: JSON.parse(JSON.stringify(promise)) });
					//logger.error(reason, promise);
				} catch (ex) {
					//try {
					//	logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection TRY2", JSON.stringify({ reason, promise }));
					//} catch (ex) {
					console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection try 2 failed!");
					//}
				}
				throw reason;

            });
            break;
    }


}
logPromiseUnhandledRejections();


/** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
export function forEach<TIn, TOut>(array: TIn[], callback: (value: TIn) => TOut | Promise<TOut>): Promise<TOut[]> {
	try {
		var results: Promise<TOut>[] = [];
		_.forEach(array, (value) => {
			var resultPromise = callback(value);
			results.push(<any>resultPromise);
		});

		return bluebird.all(results);
	} catch (ex) {
		return <any>bluebird.reject(ex);
	}
}


export module _BluebirdRetryInternals {
	export interface IOptions {
		/**  initial wait time between attempts in milliseconds(default 1000)*/
		interval?: number;
		/**  if specified, increase interval by this factor between attempts*/
		backoff?: number;
		/** if specified, maximum amount that interval can increase to*/
		max_interval?: number;
		/** total time to wait for the operation to succeed in milliseconds*/
		timeout?: number;
		/** maximum number of attempts to try the operation*/
		max_tries?: number;
	}
	/**
	 *  Stopping
The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of retry.StopError from within the called function.

For example:

var retry = require('bluebird-retry');
var i = 0;
var err;
var swing = function() {
    i++;
    console.log('strike ' + i);
    if (i == 3) {
        throw new retry.StopError('yer out');
    }
    throw new Error('still up at bat');
};

retry(swing, {timeout: 10000})
.catch(function(e) {
    console.log(e.message)
});
Will display:

strike 1
strike 2
strike 3
yer out
The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*

	 */
	export declare class StopError {
		constructor(
			/** The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*/
			message?: string | Error);
	}

	export interface IRetryStatic {
		<TValue>(fn: () => Promise<TValue>, options?: IOptions): Promise<TValue>;
		/** Stopping
The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of retry.StopError from within the called function.
		The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*/
		StopError: typeof StopError;
	}
}
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
export var retry: _BluebirdRetryInternals.IRetryStatic = require("./internal/bluebird-retry");



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
export class InitializeHelper<TInitResult, TOptions>  {

    constructor(private _log: logging.Logger,
        /** the actual work that needs to be performed as part of the initialzation.  will only occur once */
        private _initWork: (/** init options passed by the this.initalize() caller */ options: TOptions) => Promise<TInitResult>) {

        if (_.isFunction(_initWork) !== true) {
            throw _log.error("the _initWork parameter must be a function.  it is not");
        }

    }

    /** the promise containing the results of the initialization (status and resulting value, if any) */
    public result: Promise<TInitResult> | undefined;
    /**
     * perform the initialization work, or if it's already initialized, does nothing
     */
    public initialize(/** init options passed to the this._initWork() worker (callee) */  options?: TOptions): Promise<TInitResult> {

        if (this.result != null) {
            //already called initialize, return it's promise
            return this.result;
        }

        this.result = Promise.try<TInitResult>(() => {
            try {
                return this._initWork(options as any);
            } catch (ex) {
                if (this._log == null) {
                    throw new Error(`Type error, most likely because you didn't call .bind() to your initialize function.  ex:  export let initialize: typeof _init.initialize = _init.initialize.bind(_init);  Error=${ex}`)
                }
                throw ex;
            }
        });
        return this.result;
    }
    /**
     *  make sure this module's initialize method has been called and has finished successfully.
     * if not, will log and throw an error.
     */
    public ensureFinished(/**optinoal. if fails, show your custom error message instead of the default */  errorMessage?:string) : void {
        if (this.result == null || this.result.isPending()) {
            throw this._log.error("initialization still pending");
        }
        if (this.result.isRejected()) {
            if (errorMessage == null) {
                throw this._log.error("init failed.  check result details:", { result: this.result.toJSON() });
            } else {
                throw this._log.error(errorMessage);
            }
        }
    }
}

export module _deprecated {
	/** gets a promise which includes the "resolve()" and "reject()" methods to allow external code to fullfill it.*/
	export function CreateExposedPromise<T>(callback?: (resolve: (resultOrThenable: T | Promise<T>) => void, reject: (error: any) => void) => void): IExposedPromise<T> {

		var resolver: (resultOrThenable: T | Promise<T>) => void;
		var rejector: (error: any) => void;

		var toReturn: IExposedPromise<T> = <any>new bluebird<T>(function (resolve, reject) {
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

	export interface IExposedPromise<R> extends Promise<R> {
		resolve: (resultOrThenable: R | Promise<R>) => void;
		reject: (error: any) => void;

	}


	/** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
	export function sequentializePromisedFunction<T>(__this: any, func: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T[]> {
		//todo: error handling.

		var __enqueuedCallArguments: any[] = [];
		var __isExecuting = false;
		var __batchPromise: IExposedPromise<T[]> = CreateExposedPromise<T[]>();
		var __batchResults: T[] = [];

		function __resetVariables() {
			__isExecuting = false;
			__batchResults = [];
			__batchPromise = CreateExposedPromise<T[]>();
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

			var currentPromise: Promise<T> = func.apply(__this, args);
			currentPromise.then((currentValue) => {
				__batchResults.push(currentValue);
				__doNext();
			}, (error) => {
				var tempPromise = __batchPromise;
				__resetVariables();
				tempPromise.reject(error);
			});
		}



		function __toReturn(): Promise<T[]> {

			var args: any[] = arrayHelper.copy(<any>arguments);

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


}