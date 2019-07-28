/** shape of all errors.   either derived from the ```Error``` object, or Error objects serialized to JSON */
export interface IError {
    /** the name of the Error class (typeName) */
    name: string;
    /** human readable and ***actionable*** error message */
    message: string;
    /** while almost always available, it may not be set under unusual circumstances */
    stack?: string;
    /** may be set if the error was created via xlib.diagnostics.Exception  */
    innerError?: IError;
}
/** the shape of Errors that xlib serializes (the same as normal Error serialization, except the stack is an array, not a single string)*/
export interface IErrorJson {
    /** the name of the Error class (typeName) */
    name: string;
    /** human readable and ***actionable*** error message */
    message: string;
    /** while almost always available, it may not be set under unusual circumstances */
    stack?: Array<string>;
    /** optional, can pass an innerException of you use xlib.diagnostics.Exception */
    innerError?: IErrorJson;
}
export interface IExceptionOptions<TData = never> {
    innerError?: Error;
    /** truncate extra stack frames from the stack that's attached to this,
     * a good way to remove logging/util functions from the trace. */
    stackFramesToTruncate?: number;
    /** if you wish to restrict the number of stack frames stored, set this.   by default all stack frames are stored. */
    maxStackFrames?: number;
}
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends Exception{ } throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript

Note: you can control if additional properties are logged via options.logProperties=true.  While stack frames will only be logged when envLevel!=PROD.
*/
export declare class Exception extends Error {
    message: string;
    stack: string;
    private static _getTypeNameOrFuncNameRegex;
    innerError?: Error;
    constructor(message: string, options?: IExceptionOptions);
    /** includes stack track in string*/
    toString(): string;
    toJson<T extends Error = this>(): types.PropsUnion<IErrorJson, Pick<T, { [K in keyof T]: T[K] extends Function ? never : K; }[keyof T]>>;
}
/** all errors thrown by xlib extend this error type */
export declare class XlibException extends Exception {
}
/**
 * an exception that includes a statusCode for returning via http requests
 */
export declare class HttpStatusCodeException extends Exception {
    statusCode: number;
    constructor(message: string, statusCode: number, innerException?: Error);
}
/** ensures you have an Error object.
    * If you pass in an error, you will get it back.  If you pass in anything else, a new Error will be created and a string represtation of your input will be set as the ```message``` parameter.
    * useful for ```try{}catch(ex){}``` statements, where you are uncertain what the thrown error is.
    * @example
    * try{
    *  await someClass.someMethod();
    * }catch(_err){
    *  const err = __.diag.toError(_err);
    * //use err as a normal Error object
    * }
*/
export declare function toError(ex: any | Error): Error;
/** get a string representation of the error */
export declare function errorToString(ex: Error | IError, options?: IErrorToJsonOptions): string;
export interface IErrorToJsonOptions {
    /** max stack depth to output
        * @default Infinity
     */
    maxStacks?: number;
    /** by default, we will hide the stack in UAT or PROD envLevel, unless DEBUG logLevel is set.    pass TRUE to never hide the stack.
        * @default false
    */
    alwaysShowFullStack?: boolean;
    /** by default, we will hide the extra properties if the exception ctor options specify it.  pass TRUE to never hide properties */
    alwaysShowProperties?: boolean;
}
import * as types from "../types";
declare type ErrorAsJson<TError extends Error> = types.PropsUnion<IErrorJson, types.PropsRemove<TError, Function>>;
/** convert an error and all it's properties to JSON.   */
export declare function errorToJson<TError extends Error>(error: TError | IError, options?: IErrorToJsonOptions): ErrorAsJson<TError>;
export {};
//# sourceMappingURL=exception.d.ts.map