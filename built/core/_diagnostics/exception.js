"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const environment = tslib_1.__importStar(require("../environment"));
const _ = tslib_1.__importStar(require("lodash"));
const stringHelper = tslib_1.__importStar(require("../_util/stringhelper"));
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends Exception{ } throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript

Note: you can control if additional properties are logged via options.logProperties=true.  While stack frames will only be logged when envLevel!=PROD.
*/
class Exception extends Error {
    // /** extra custom data you wish to attach to your error object that you want logged. */
    // public data?: any;
    constructor(message, options = {}) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype); //fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        //jsHelper.setPrototypeOf( this, new.target.prototype );
        options = {
            stackFramesToTruncate: 0,
            //logProperties:false,
            ...options
        };
        //this.options = options;
        //this.data = options.any;
        if (options.innerError != null) {
            //make sure that what's passed is actually an error object
            options.innerError = toError(options.innerError);
        }
        //if (environment.logLevel > environment.LogLevel.DEBUG) {
        //	innerException = null;
        //} else {
        //	if (innerException != null) {
        //		this.message = message + ": " + innerException.message;
        //	}
        //}
        /** split up the stack for manipulation during ```.ctor()```.  will recombine at end of  ```.ctor()```. */
        let splitStack = this.stack.split("\n");
        if (options.innerError != null && typeof (options.innerError.stack) === "string") {
            let newStack = options.innerError.stack.split("\n");
            newStack.unshift("innerException stack:");
            newStack.unshift(splitStack[1]);
            newStack.unshift(splitStack[0]);
            splitStack = newStack;
        }
        //truncate stackframes
        if (options.stackFramesToTruncate > 0) {
            //in nodejs, the first frame is actually message, so keep it.
            let messageFrame = splitStack.shift();
            for (let i = 0; i < options.stackFramesToTruncate; i++) {
                splitStack.shift();
            }
            if (messageFrame != null) {
                //put message back
                splitStack.unshift(messageFrame);
            }
        }
        //max stackframes
        if (options.maxStackFrames != null) {
            splitStack.length = options.maxStackFrames + 1;
        }
        //recombine our array back to the normal stack string.
        this.stack = splitStack.join("\n");
        if (options.innerError != null && typeof (options.innerError.message) === "string" && message.includes(options.innerError.message) !== true) {
            //include the innerError message in our message, but only if it wasn't manually added there already.
            this.message = message + "   innerException: " + options.innerError.message;
        }
        else {
            this.message = message; //making sure it's set for explicit order when serializing to JSON
        }
        //get name based on type.  snippet taken from ./runtime/reflection.ts code
        if (this.constructor.name != null) {
            //es6
            this.name = this.constructor.name;
        }
        else {
            //es5
            let results = (Exception._getTypeNameOrFuncNameRegex).exec((this).constructor.toString());
            this.name = (results != null && results.length > 1) ? results[1] : "";
        }
        this.innerError = options.innerError; //putting this last to help ensure json serialization order
    }
    /** includes stack track in string*/
    toString() {
        return errorToString(this);
    }
    toJson() {
        return errorToJson(this);
    }
}
//public options: IExceptionOptions;
Exception._getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
exports.Exception = Exception;
/** all errors thrown by xlib extend this error type */
class XlibException extends Exception {
}
exports.XlibException = XlibException;
/**
 * an exception that includes a statusCode for returning via http requests
 */
class HttpStatusCodeException extends Exception {
    constructor(message, statusCode, innerException) {
        super(message, { innerError: innerException });
        this.statusCode = statusCode;
    }
}
exports.HttpStatusCodeException = HttpStatusCodeException;
// 	/** wrap any error inside of a new Exception object.   original error will be contained in the "innerException" property.
// 	 * useful for returning a stack at the current location.
// 	 * also see ```.castErr()``` for another useful Error method.
// 	 */
// 	export function wrapErr(
// 		ex: string | Error,
// 		/** optional message, if not specified, the wrapped ex.message will be used */
// 		message?: string ) {
// 		if ( typeof ex === "string" ) {
// 			let newMessage = ex;
// 			if ( message != null ) {
// 				newMessage = message + " " + newMessage;
// 			}
// 			return new Exception( newMessage, { stackFramesToTruncate: 1 } );
// 		}
// 		if ( ex instanceof Error ) {
// 			let newMessage = ex.message;
// 			if ( message != null ) {
// 				newMessage = message;
// 			}
// 			return new Exception( newMessage, { innerException: ex, stackFramesToTruncate: 1 } );
// 		}
// }
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
function toError(ex) {
    if (ex instanceof Error) {
        return ex;
    }
    let message;
    if (typeof ex === "string") {
        message = ex;
    }
    else if (typeof ex.message === "string") {
        message = ex.message;
    }
    else {
        try {
            let json = JSON.parse(ex);
            message = stringHelper.summarize(JSON.stringify(json), 200);
        }
        catch (_a) {
            message = "??? unknown, can not parse ???";
        }
    }
    const toReturn = new Exception(message, { maxStackFrames: 0 });
    //apply other properties
    if (typeof (ex.innerError) === "string") {
        toReturn.innerError = ex.innerError;
    }
    if (typeof (ex.name) === "string") {
        toReturn.name = ex.name;
    }
    if (ex.stack != null) {
        if (typeof (ex.stack) === "string") {
            toReturn.stack = ex.stack;
        }
        else if (_.isArray(ex.stack) === true) {
            toReturn.stack = ex.stack.join(",\n");
        }
    }
    return toReturn;
}
exports.toError = toError;
/** get a string representation of the error */
function errorToString(ex, options) {
    let exJson = errorToJson(ex, options);
    exJson.stack = exJson.stack == null ? "" : exJson.stack.join("\n");
    return JSON.stringify(exJson);
}
exports.errorToString = errorToString;
// let t1: ErrorAsJson<MyException>;
/** convert an error and all it's properties to JSON.   */
function errorToJson(error, options) {
    if (error == null) {
        return { message: "", name: "NullNotError" };
    }
    options = { ...options };
    //let error = toError( _error );
    let stackArray;
    let innerError = error.innerError;
    if (options.alwaysShowFullStack !== true && environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST) {
        //sanitize
        stackArray = ["no stack or extra properties unless envLevel=DEV|TEST, or logLevel=DEBUG|TRACE"];
        innerError = undefined;
    }
    else {
        let stack = error.stack;
        if (stack == null) {
            stack = "none";
        }
        if (typeof stack === "string") {
            //toReturn.stack = toReturn.stack.substring(0,400);
            stackArray = stack.split("\n");
        }
        else if (_.isArray(stack)) {
            //array;
            stackArray = stack;
        }
        else if (typeof stack.toString === "function") {
            stackArray = [stack.toString()];
        }
        else {
            stackArray = ["unknown"];
        }
    }
    let serialized;
    try {
        if (options.alwaysShowProperties !== true && environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST) {
            //don't show extra properties
            let _tmpEx = error;
            serialized = {
                name: _tmpEx.name,
                message: _tmpEx.message,
                innerError: _tmpEx.innerError,
                stack: _tmpEx.stack
            };
            serialized = JSON.parse(JSON.stringify(serialized));
        }
        else {
            serialized = JSON.parse(JSON.stringify(error));
        }
    }
    catch (ex) {
        serialized = {};
    }
    if (options.maxStacks != null && stackArray.length > options.maxStacks) {
        stackArray.length = options.maxStacks;
    }
    let innerErrorJson;
    if (innerError != null) {
        try {
            innerErrorJson = errorToJson(innerError);
        }
        catch (_a) {
            //eat error
            //innerErrorJson = serialized.innerError as any;
            innerErrorJson = { name: "UnknownErrorToJson", message: "" };
        }
    }
    let toReturn = {
        ...serialized,
        name: error.name,
        message: error.message,
        stack: stackArray,
        innerError: innerErrorJson,
    };
    return toReturn;
}
exports.errorToJson = errorToJson;
//# sourceMappingURL=exception.js.map