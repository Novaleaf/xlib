/// <reference types="node" />
export interface IExceptionOptions {
    innerException?: Error;
    /** truncate extra stack frames from the stack that's attached to this, a good way to remove logging/util functions from the trace */
    stackFramesToTruncate?: number;
    data?: any;
}
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export declare class Exception extends Error {
    message: string;
    stack: string;
    options: IExceptionOptions;
    private static _getTypeNameOrFuncNameRegex;
    constructor(message: string, options?: IExceptionOptions);
    /** includes stack track in string*/
    toStringWithStack(): string;
    /** get a string representation of the exception, with full stack-track (if any exists) */
    static exceptionToString(ex: Error): string;
    toString(): string;
}
/** all errors thrown by corelib extend this error type */
export declare class CorelibException extends Exception {
}
/**
 * an exception that includes a statusCode for returning via http requests
 */
export declare class HttpStatusCodeException extends Exception {
    statusCode: number;
    constructor(message: string, innerException?: Error | Exception | any, statusCode?: number);
}
