/// <reference types="bluebird" />
import * as logging from "./logging";
/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
import * as bluebird from "bluebird";
export { bluebird };
import * as Promise from "bluebird";
/** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
export declare function forEach<TIn, TOut>(array: TIn[], callback: (value: TIn) => TOut | Promise<TOut>): Promise<TOut[]>;
export declare module _BluebirdRetryInternals {
    interface IOptions {
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
    class StopError {
        constructor(
            /** The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*/
            message?: string | Error);
    }
    interface IRetryStatic {
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
export declare var retry: _BluebirdRetryInternals.IRetryStatic;
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
export declare class InitializeHelper<TInitResult, TOptions> {
    private _log;
    /** the actual work that needs to be performed as part of the initialzation.  will only occur once */
    private _initWork;
    constructor(_log: logging.Logger, 
        /** the actual work that needs to be performed as part of the initialzation.  will only occur once */
        _initWork: (/** init options passed by the this.initalize() caller */ options: TOptions) => Promise<TInitResult>);
    /** the promise containing the results of the initialization (status and resulting value, if any) */
    result: Promise<TInitResult> | undefined;
    /**
     * perform the initialization work, or if it's already initialized, does nothing
     */
    initialize(/** init options passed to the this._initWork() worker (callee) */ options?: TOptions): Promise<TInitResult>;
    /**
     *  make sure this module's initialize method has been called and has finished successfully.
     * if not, will log and throw an error.
     */
    ensureFinished(/**optinoal. if fails, show your custom error message instead of the default */ errorMessage?: string): void;
}
export declare module _deprecated {
    /** gets a promise which includes the "resolve()" and "reject()" methods to allow external code to fullfill it.*/
    function CreateExposedPromise<T>(callback?: (resolve: (resultOrThenable: T | Promise<T>) => void, reject: (error: any) => void) => void): IExposedPromise<T>;
    interface IExposedPromise<R> extends Promise<R> {
        resolve: (resultOrThenable: R | Promise<R>) => void;
        reject: (error: any) => void;
    }
    /** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
    function sequentializePromisedFunction<T>(__this: any, func: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T[]>;
}