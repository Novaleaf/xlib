/** https://github.com/petkaantonov/bluebird  Bluebird is a fully featured promise library with focus on innovative features and performance
 * global.Promise is aliased to this.
 */
export import bluebird = require("bluebird");
import * as bb from "bluebird";
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
export declare function awaitInspect<T>(promise: PromiseLike<T>): bb<{
    toInspect: bb<T>;
}>;
/** inversion of control (IoC) to let the caller specify work that will be done by the async method.     values can be a promise, function (sync or async), or result */
export declare type IocCallback<TArgs = void, TResults = any> = Promise<TResults> | ((args: TArgs) => Promise<TResults>) | ((args: TArgs) => TResults) | TResults;
/** gets a promise which includes the "fulfill()" and "reject()" methods to allow external code to fullfill it.*/
export declare function CreateExposedPromise<TReturn = void>(): IExposedPromise<TReturn, never>;
export declare function CreateExposedPromise<TReturn = void, TTags = void>(tags: TTags, callback?: (fulfill: (resultOrThenable?: TReturn | PromiseLike<TReturn>) => void, reject: (error: any) => void) => void): IExposedPromise<TReturn, TTags>;
export interface IExposedPromise<TReturn = void, TTags = never> extends bb<TReturn> {
    fulfill: (resultOrThenable?: TReturn | PromiseLike<TReturn>) => void;
    reject: (error: Error) => void;
    /** custom data for tracking state you might need, such as informing if the promise is being executed */
    tags?: TTags;
}
export declare namespace _obsolete {
    /** for a given function signature which returns a promise, construct a facade that will fulfill once all outstanding calls finish, and each call will be executed sequentially (not in parallel!)*/
    function sequentializePromisedFunction<T>(__this: any, func: (...args: any[]) => bb<T>): (...args: any[]) => bb<T[]>;
    /** constructs a unified promise for your returned (callback function) promises.  wraps a lodash foreach, just adds Promise.all() glue code.
    NOTE: executes all asynchronously.  if you need to only execute + complete one promise at a time, use Promise.each() instead. */
    function forEachParallel<TIn, TOut>(array: TIn[], callback: (value: TIn) => TOut | bb<TOut>): bb<TOut[]>;
}
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
import * as retry from "bluebird-retry";
export { retry };
/**
 *  same as Bluebird's .timeout() method but does not cancel the input promise.  just error's the chain from this point onward.
 */
//# sourceMappingURL=promise.d.ts.map