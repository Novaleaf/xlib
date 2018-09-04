"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
//import * as environment from "./environment";
const environment = require("./environment");
const _ = require("lodash");
/** get a stack trace*/
function getStackTrace(/**
    * regexp choosing the frame you wish to start after.  or number of frames to remove from the front
    */ startingFrameExclusive, 
/** max frames to return */ maxFrames, keepStartingFrame = false) {
    let tempError = new Error();
    if (tempError.stack == null) {
        return [];
    }
    let splitStack = tempError.stack.split("\n");
    if (startingFrameExclusive != null) {
        let lastRemovedFrame;
        if (typeof startingFrameExclusive === "string") {
            startingFrameExclusive = new RegExp(startingFrameExclusive);
        }
        if (startingFrameExclusive instanceof RegExp) {
            let shouldStop = false;
            while (shouldStop === false) {
                lastRemovedFrame = splitStack.shift();
                //only stop if our just removed frame matches and next frame doesn't
                shouldStop = ((startingFrameExclusive.test(lastRemovedFrame) === true) && (startingFrameExclusive.test(splitStack[0]) === false));
                if (splitStack.length === 0) {
                    shouldStop = true;
                }
            }
        }
        else if (typeof (startingFrameExclusive) === "number" && startingFrameExclusive > 0) {
            for (var i = 0; i < startingFrameExclusive; i++) {
                lastRemovedFrame = splitStack.shift();
            }
        }
        if (keepStartingFrame === true && lastRemovedFrame != null) {
            splitStack.unshift(lastRemovedFrame);
        }
    }
    if (maxFrames != null && splitStack.length > maxFrames) {
        splitStack.length = maxFrames;
    }
    return splitStack;
}
exports.getStackTrace = getStackTrace;
/** extract stack frames.   note that the first frame contains the message, so if you don't want that, pass the optional ```startingFrame``` parameter */
function extractStackFrames(/** error or stack string */ error, /** @default undefined (all frames)*/ frames, /** @default 0 */ startingFrame) {
    let stack;
    let stackArray;
    if (typeof (error) === "string") {
        stack = error;
    }
    else {
        stack = error.stack;
    }
    if (typeof stack === "string") {
        stackArray = stack.split("\n");
    }
    else if (_.isArray(stack)) {
        stackArray = stack;
    }
    else {
        //unknown
        return [];
    }
    if (startingFrame != null) {
        for (let i = 0; i < startingFrame; i++) {
            stackArray.shift();
        }
    }
    if (frames != null && stackArray.length > frames) {
        stackArray.length = frames;
    }
    return stackArray;
}
exports.extractStackFrames = extractStackFrames;
//let err: Error;
//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
class Exception extends Error {
    constructor(message, options) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype); //fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        options = Object.assign({ stackFramesToTruncate: 0 }, options);
        this.innerException = options.innerException;
        this.data = options.data;
        //if (environment.logLevel > environment.LogLevel.DEBUG) {
        //	innerException = null;
        //} else {
        //	if (innerException != null) {
        //		this.message = message + ": " + innerException.message;
        //	}
        //}
        /** split up the stack for manipulation during ```.ctor()```.  will recombine at end of  ```.ctor()```. */
        let splitStack = this.stack.split("\n");
        if (options.innerException != null && typeof (options.innerException.stack) === "string") {
            let newStack = options.innerException.stack.split("\n");
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
            //put message back
            splitStack.unshift(messageFrame);
        }
        //max stackframes
        if (options.maxStackFrames != null) {
            splitStack.length = options.maxStackFrames + 1;
        }
        //recombine our array back to the normal stack string.
        this.stack = splitStack.join("\n");
        if (options.innerException != null && typeof (options.innerException.message) === "string") {
            this.message = message + "	innerException: " + options.innerException.message;
        }
        //get name based on type.  snippet taken from ./runtime/reflection.ts code
        if (this.constructor.name != null) {
            //es6
            this.name = this.constructor.name;
        }
        else {
            var results = (Exception._getTypeNameOrFuncNameRegex).exec((this).constructor.toString());
            this.name = (results && results.length > 1) ? results[1] : "";
        }
        //this.message = message;
        //this.stack = (<any>new Error()).stack;		
        // //remove our Error ctor from the stack (reduce unneeded verbosity of stack trace)
        // let defaultFramesToRemove = 1;
        // let tempStack: string;
        // if ( this.stack == null ) {
        // 	tempStack = new Error( "Error Shim" ).stack as string;
        // 	//remove our extra errorShim ctor off the stack trace
        // 	defaultFramesToRemove = 2;
        // } else {
        // 	tempStack = this.stack;
        // }
        // //truncate the stack if set by options
        // let _array = tempStack.split( "\n" );
        // if ( _array.length > ( defaultFramesToRemove + options.stackFramesToTruncate ) ) {
        // 	let line1 = _array.shift();
        // 	let line2 = _array.shift();
        // 	for ( let i = 0; i < options.stackFramesToTruncate; i++ ) {
        // 		_array.shift();
        // 	}
        // 	//put the message as the first item in the stack (as what normally is seen)
        // 	_array.unshift( `${ this.name }: ${ this.message }` as string );
        // }
        // let finalStack = _array.join( "\n" );
        // this.stack = finalStack;
        //console.log(typeof (this.stack));
    }
    /** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
     * useful for returning a stack at the current location.
     * also see ```.castErr()``` for another useful Error method.
     */
    static wrapErr(ex, 
    /** optional message, if not specified, the wrapped ex.message will be used */
    message) {
        if (typeof ex === "string") {
            let newMessage = ex;
            if (message != null) {
                newMessage = message + " " + newMessage;
            }
            return new Exception(newMessage, { stackFramesToTruncate: 1 });
        }
        if (ex instanceof Error) {
            let newMessage = ex.message;
            if (message != null) {
                newMessage = message;
            }
            return new Exception(newMessage, { innerException: ex, stackFramesToTruncate: 1 });
        }
    }
    /** convert a string to Error object, or return existing Error object.
     * useful for ```try{}catch(ex){}``` statements
    */
    static castErr(ex) {
        if (ex instanceof Error) {
            return ex;
        }
        const toReturn = new Exception(ex, { maxStackFrames: 0 });
        return toReturn;
    }
    /** includes stack track in string*/
    toString() {
        return Exception.exceptionToString(this);
    }
    toJson() {
        return Exception.exceptionToJsonObj(this);
    }
    /** get a string representation of the exception, with full stack-track (if any exists) */
    static exceptionToString(ex) {
        // var msg = ex.name + ": " + ex.message;
        // var stack = ( <any>ex ).stack;
        // if ( stack ) {
        // 	if ( stack.join != null ) {			//if (__.arrayHelper.isArray(stack)) {
        // 		stack = stack.join( "\n" );
        // 	}
        // 	if ( environment.platformType === environment.PlatformType.NodeJs ) {
        // 		//stack already includes message
        // 		msg = stack;
        // 	} else {
        // 		msg += "\n" + stack;
        // 	}
        // }
        // return msg;
        let exJson = this.exceptionToJsonObj(ex);
        exJson.stack = exJson.stack.join("\n"); //add line breaks to stack
        return JSON.stringify(exJson);
    }
    static exceptionToJsonObj(_ex, maxStacks) {
        let ex = this.castErr(_ex);
        let stackArray;
        let innerException = ex.innerException;
        if (environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel !== environment.EnvLevel.DEV) {
            //sanitize
            stackArray = ["no stack unless in logLevel.DEBUG or envLevel.DEV mode"];
            innerException = undefined;
        }
        else {
            let stack = ex.stack;
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
            else {
                stackArray = [stack.toString()];
            }
        }
        let serialized;
        try {
            serialized = JSON.parse(JSON.stringify(ex));
        }
        catch (ex) {
            serialized = {};
        }
        if (maxStacks != null && stackArray.length > maxStacks) {
            stackArray.length = maxStacks;
        }
        let toReturn = Object.assign({}, serialized, { name: ex.name, message: ex.message, stack: stackArray, innerException });
        return toReturn;
    }
}
//public options: IExceptionOptions;
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
    constructor(message, statusCode, innerException) {
        super(message, { innerException: innerException });
        this.statusCode = statusCode;
    }
    toJson() {
        let baseJson = super.toJson(); //  Exception.exceptionToJsonObj( this );
        return Object.assign({}, baseJson, { statusCode: this.statusCode });
    }
}
exports.HttpStatusCodeException = HttpStatusCodeException;
//# sourceMappingURL=exception.js.map