"use strict";
//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
//import * as environment from "./environment";
const environment = require("./environment");
//let err: Error;
//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
class Exception extends Error {
    constructor(message, innerException, 
        /** truncate extra stack frames from the stack that's attached to this, a good way to remove logging/util functions from the trace */
        stackFramesToTruncate = 0) {
        super(message);
        this.message = message;
        this.innerException = innerException;
        //if (environment.logLevel > environment.LogLevel.DEBUG) {
        //	innerException = null;
        //} else {
        //	if (innerException != null) {
        //		this.message = message + ": " + innerException.message;
        //	}
        //}
        if (innerException != null) {
            this.message = message + " +details: " + innerException.message;
        }
        //get name based on type.  snippet taken from ./runtime/reflection.ts code
        //this.name = "Exception";
        var results = (Exception._getTypeNameOrFuncNameRegex).exec((this).constructor.toString());
        this.name = (results && results.length > 1) ? results[1] : "";
        //this.message = message;
        //this.stack = (<any>new Error()).stack;		
        let tempStack = new Error("boogah").stack;
        //console.log("================START STACK================");
        //console.log(tempStack);
        //console.log("================END STACK================");
        let _array = tempStack.split("\n");
        if (_array.length > (2 + stackFramesToTruncate)) {
            let line1 = _array.shift();
            let line2 = _array.shift();
            for (let i = 0; i < stackFramesToTruncate; i++) {
                _array.shift();
            }
            _array.unshift(`${this.name}: ${this.message}`);
        }
        let finalStack = _array.join("\n");
        this.stack = finalStack;
        //console.log(typeof (this.stack));
    }
    /** includes stack track in string*/
    toStringWithStack() {
        return Exception.exceptionToString(this);
    }
    /** get a string representation of the exception, with full stack-track (if any exists) */
    static exceptionToString(ex) {
        var msg = ex.name + ": " + ex.message;
        var stack = ex.stack;
        if (stack) {
            if (stack.join != undefined) {
                stack = stack.join("\n");
            }
            if (environment.platformType === environment.PlatformType.NodeJs) {
                //stack already includes message
                msg = stack;
            }
            else {
                msg += "\n" + stack;
            }
        }
        return msg;
    }
    toString() {
        if (environment.logLevel > environment.LogLevel.DEBUG) {
            if (this.innerException == null) {
                return this.message;
            }
            else {
                return this.message + "\n\t innerException: " + this.innerException.message;
            }
        }
        else {
            if (this.innerException == null) {
                return this.toStringWithStack();
            }
            else {
                return Exception.exceptionToString(this) + "\n\t innerException: " + this.innerException.toString();
            }
        }
        //if (this.innerException == null) {
        //	return super.toString();
        //} else {
        //	return super.toString() + "\n\t innerException: " + this.innerException.toString();
        //}
    }
}
Exception._getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
exports.Exception = Exception;
/** all errors thrown by corelib extend this error type */
class CorelibException extends Exception {
}
exports.CorelibException = CorelibException;
/**
 * an exception that includes a statusCode for returning via http requests
 */
class HttpStatusCodeException extends Exception {
    constructor(message, innerException, statusCode = 400) {
        super(message, innerException);
        this.statusCode = statusCode;
    }
}
exports.HttpStatusCodeException = HttpStatusCodeException;
//# sourceMappingURL=exception.js.map