/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export declare class Exception extends Error {
    message: string;
    innerException: Error | any;
    private static _getTypeNameOrFuncNameRegex;
    constructor(message: string, innerException?: Error | any);
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
