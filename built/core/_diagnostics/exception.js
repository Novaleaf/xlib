"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment = require("../environment");
const _ = require("lodash");
const stringHelper = require("../_util/stringhelper");
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
class Exception extends Error {
    constructor(message, _options = {}) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype); //fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        //jsHelper.setPrototypeOf( this, new.target.prototype ); 
        const options = Object.assign({ stackFramesToTruncate: 0 }, _options);
        this.data = options.data;
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
        if (options.innerError != null && typeof (options.innerError.message) === "string") {
            this.message = message + "	innerException: " + options.innerError.message;
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
            var results = (Exception._getTypeNameOrFuncNameRegex).exec((this).constructor.toString());
            this.name = (results && results.length > 1) ? results[1] : "";
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
    toJson() {
        let baseJson = super.toJson(); //  Exception.exceptionToJsonObj( this );
        return Object.assign({}, baseJson, { statusCode: this.statusCode });
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
    return toReturn;
}
exports.toError = toError;
/** get a string representation of the error */
function errorToString(ex, options) {
    let exJson = errorToJson(ex, options);
    exJson.stack = exJson.stack == null ? "" : exJson.stack.join("\n"); //add line breaks to stack
    return JSON.stringify(exJson);
}
exports.errorToString = errorToString;
/** convert an error and all it's properties to JSON.   */
function errorToJson(error, options) {
    if (error == null) {
        return { message: "", name: "NullNotError" };
    }
    options = Object.assign({}, options);
    //let error = toError( _error );
    let stackArray;
    let innerError = error.innerError;
    if (options.alwaysShowFullStack !== true && environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST) {
        //sanitize
        stackArray = ["no stack unless env is DEV or TEST, or logLevel is DEBUG or TRACE"];
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
        serialized = JSON.parse(JSON.stringify(error));
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
    let toReturn = Object.assign({}, serialized, { name: error.name, message: error.message, stack: stackArray, innerError: innerErrorJson });
    return toReturn;
}
exports.errorToJson = errorToJson;
//# sourceMappingURL=exception.js.map