/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
export import bluebird = require("bluebird");
import * as bb from "bluebird";
/** binds bluebird as global promise and other various init */
export declare function initialize(): void;
/** inversion of control (IoC) to let the caller specify work that will be done by the async method.     values can be a promise, function (sync or async), or result */
export declare type IocCallback<TArgs = void, TResults = any> = Promise<TResults> | ((args: TArgs) => Promise<TResults>) | ((args: TArgs) => TResults) | TResults;
/** gets a promise which includes the "fulfill()" and "reject()" methods to allow external code to fullfill it.*/
export declare function CreateExposedPromise<TReturn = void, TTags = undefined>(callback?: (fulfill: (resultOrThenable?: TReturn | PromiseLike<TReturn>) => void, reject: (error: any) => void) => void, tags?: TTags): IExposedPromise<TReturn, TTags>;
export interface IExposedPromise<TReturn = void, TTags = {}> extends bb<TReturn> {
    fulfill: (resultOrThenable?: TReturn | PromiseLike<TReturn>) => void;
    reject: (error: Error) => void;
    /** custom data for tracking state you might need, such as informing if the promise is being executed */
    tags?: TTags;
}
/** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
export declare function sequentializePromisedFunction<T>(__this: any, func: (...args: any[]) => bb<T>): (...args: any[]) => bb<T[]>;
/** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
export declare function forEach<TIn, TOut>(array: TIn[], callback: (value: TIn) => TOut | bb<TOut>): bb<TOut[]>;
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
        <TValue>(fn: () => PromiseLike<TValue>, options?: IOptions): bb<TValue>;
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
        return bb.reject(new Error('fail the first two times'));
    } else {
        return bb.resolve('succeed the third time');
    }
}

retry(myfunc).done(function(result) {
    console.log(result);
});
 */
import * as retry from "bluebird-retry";
export { retry };
/**
 *  same as Bluebird's .timeout() method but does not cancel the input promise.  just error's the chain from this point onward.
 */
//# sourceMappingURL=promise.d.ts.map