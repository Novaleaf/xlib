"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
//import * as environment from "./environment";
var environment = require("./environment");
//let err: Error;
//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
var Exception = (function (_super) {
    __extends(Exception, _super);
    function Exception(message, options) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        if (options == null) {
            options = {};
        }
        if (options.stackFramesToTruncate == null) {
            options.stackFramesToTruncate = 0;
        }
        _this.options = options;
        //if (environment.logLevel > environment.LogLevel.DEBUG) {
        //	innerException = null;
        //} else {
        //	if (innerException != null) {
        //		this.message = message + ": " + innerException.message;
        //	}
        //}
        if (options.innerException != null) {
            _this.message = message + " +details: " + options.innerException.message;
        }
        //get name based on type.  snippet taken from ./runtime/reflection.ts code
        //this.name = "Exception";
        var results = (Exception._getTypeNameOrFuncNameRegex).exec((_this).constructor.toString());
        _this.name = (results && results.length > 1) ? results[1] : "";
        //this.message = message;
        //this.stack = (<any>new Error()).stack;		
        //remove our Error ctor from the stack (reduce unneeded verbosity of stack trace)
        var defaultFramesToRemove = 1;
        var tempStack;
        if (_this.stack == null) {
            tempStack = new Error("Error Shim").stack;
            //remove our extra errorShim ctor off the stack trace
            defaultFramesToRemove = 2;
        }
        else {
            tempStack = _this.stack;
        }
        //truncate the stack if set by options
        var _array = tempStack.split("\n");
        if (_array.length > (defaultFramesToRemove + options.stackFramesToTruncate)) {
            var line1 = _array.shift();
            var line2 = _array.shift();
            for (var i = 0; i < options.stackFramesToTruncate; i++) {
                _array.shift();
            }
            //put the message as the first item in the stack (as what normally is seen)
            _array.unshift(_this.name + ": " + _this.message);
        }
        var finalStack = _array.join("\n");
        _this.stack = finalStack;
        return _this;
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
            if (stack.join != null) {
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
            if (this.options.innerException == null) {
                return this.message;
            }
            else {
                return this.message + "\n\t innerException: " + this.options.innerException.message;
            }
        }
        else {
            if (this.options.innerException == null) {
                return this.toStringWithStack();
            }
            else {
                return Exception.exceptionToString(this) + "\n\t innerException: " + this.options.innerException.toString();
            }
        }
        //if (this.innerException == null) {
        //	return super.toString();
        //} else {
        //	return super.toString() + "\n\t innerException: " + this.innerException.toString();
        //}
    };
    return Exception;
}(Error));
Exception._getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
exports.Exception = Exception;
/** all errors thrown by corelib extend this error type */
var CorelibException = (function (_super) {
    __extends(CorelibException, _super);
    function CorelibException() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        var _this = _super.call(this, message, innerException) || this;
        _this.statusCode = statusCode;
        return _this;
    }
    return HttpStatusCodeException;
}(Exception));
exports.HttpStatusCodeException = HttpStatusCodeException;
//# sourceMappingURL=exception.js.map