/** shape of errors */
export interface IError {
    name: string;
    message: string;
    stack?: string;
}
export interface IErrorJson {
    name: string;
    message: string;
    stack?: string[];
    innerException?: any;
}
/** get a stack trace*/
export declare function getStackTrace(/**
    * regexp choosing the frame you wish to start after.  or number of frames to remove from the front
    */ startingFrameExclusive?: RegExp | number | string, 
/** max frames to return */ maxFrames?: number, keepStartingFrame?: boolean): string[];
/** extract stack frames.   note that the first frame contains the message, so if you don't want that, pass the optional ```startingFrame``` parameter */
export declare function extractStackFrames(/** error or stack string */ error: IError | string, /** @default undefined (all frames)*/ frames?: number, /** @default 0 */ startingFrame?: number): string[];
export interface IExceptionOptions {
    innerException?: Error;
    /** truncate extra stack frames from the stack that's attached to this,
     * a good way to remove logging/util functions from the trace */
    stackFramesToTruncate?: number;
    /** extra data you want logged. */
    data?: any;
    /** number of stack frames to support (excludes first "message" line) */
    maxStackFrames?: number;
}
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export declare class Exception extends Error {
    message: string;
    stack: string;
    private static _getTypeNameOrFuncNameRegex;
    innerException: Error;
    data: any;
    constructor(message: string, options?: IExceptionOptions);
    /** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
     * useful for returning a stack at the current location.
     * also see ```.castErr()``` for another useful Error method.
     */
    static wrapErr(ex: string | Error, 
    /** optional message, if not specified, the wrapped ex.message will be used */
    message?: string): Exception;
    /** convert a string to Error object, or return existing Error object.
     * useful for ```try{}catch(ex){}``` statements
    */
    static castErr(ex: string | Error): Error;
    /** includes stack track in string*/
    toString(): string;
    toJson(): IErrorJson;
    /** get a string representation of the exception, with full stack-track (if any exists) */
    static exceptionToString(ex: Error): string;
    static exceptionToJsonObj(_ex: IError | string, maxStacks?: number): IErrorJson;
}
/** all errors thrown by corelib extend this error type */
export declare class CorelibException extends Exception {
}
/**
 * an exception that includes a statusCode for returning via http requests
 */
export declare class HttpStatusCodeException extends Exception {
    statusCode: number;
    constructor(message: string, statusCode: number, innerException?: Error);
    toJson(): {
        statusCode: number;
        name: string;
        message: string;
        stack?: string[];
        innerException?: any;
    };
}
//# sourceMappingURL=exception.d.ts.map