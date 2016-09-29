"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
var environment = require("./environment");
//import * as environment from "./environment";
//let err: Error;
//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
var Exception = (function (_super) {
    __extends(Exception, _super);
    function Exception(message, innerException, 
        /** truncate extra stack frames from the stack that's attached to this, a good way to remove logging/util functions from the trace */
        stackFramesToTruncate) {
        if (stackFramesToTruncate === void 0) { stackFramesToTruncate = 0; }
        _super.call(this, message);
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
        var tempStack = new Error("boogah").stack;
        //console.log("================START STACK================");
        //console.log(tempStack);
        //console.log("================END STACK================");
        var _array = tempStack.split("\n");
        if (_array.length > (2 + stackFramesToTruncate)) {
            var line1 = _array.shift();
            var line2 = _array.shift();
            for (var i = 0; i < stackFramesToTruncate; i++) {
                _array.shift();
            }
            _array.unshift((this.name + ": " + this.message));
        }
        var finalStack = _array.join("\n");
        this.stack = finalStack;
        //console.log(typeof (this.stack));
    }
    /** includes stack track in string*/
    Exception.prototype.toStringWithStack = function () {
        return Exception.exceptionToString(this);
    };
    /** get a string representation of the exception, with full stack-track (if any exists) */
    Exception.exceptionToString = function (ex) {
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
    };
    Exception.prototype.toString = function () {
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
    };
    Exception._getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
    return Exception;
}(Error));
exports.Exception = Exception;
/** all errors thrown by corelib extend this error type */
var CorelibException = (function (_super) {
    __extends(CorelibException, _super);
    function CorelibException() {
        _super.apply(this, arguments);
    }
    return CorelibException;
}(Exception));
exports.CorelibException = CorelibException;
/**
 * an exception that includes a statusCode for returning via http requests
 */
var HttpStatusCodeException = (function (_super) {
    __extends(HttpStatusCodeException, _super);
    function HttpStatusCodeException(message, innerException, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        _super.call(this, message, innerException);
        this.statusCode = statusCode;
    }
    return HttpStatusCodeException;
}(Exception));
exports.HttpStatusCodeException = HttpStatusCodeException;
//# sourceMappingURL=exception.js.map