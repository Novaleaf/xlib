//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
import environment = require("./environment");
//import * as environment from "./environment";

//let err: Error;

//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export class Exception extends Error {

	public stack: string;
	private static _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
	constructor(public message: string, public innerException?: Error | any,
		/** truncate extra stack frames from the stack that's attached to this, a good way to remove logging/util functions from the trace */
		stackFramesToTruncate = 0) {

		super(message);
		
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

		let tempStack: string = new Error("boogah").stack as string;

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
			_array.unshift(`${this.name}: ${this.message}` as string);
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
	public static exceptionToString(ex: Error): string {
		var msg = ex.name + ": " + ex.message;
		var stack = (<any>ex).stack;
		if (stack) {
			if (stack.join != undefined) {			//if (__.arrayHelper.isArray(stack)) {
				stack = stack.join("\n");
			}
			if (environment.platformType === environment.PlatformType.NodeJs) {
				//stack already includes message
				msg = stack;
			} else {
				msg += "\n" + stack;
			}
		}
		return msg;
	}

	public toString() {

		if (environment.logLevel > environment.LogLevel.DEBUG) {
			if (this.innerException == null) {
				return this.message;
			} else {
				return this.message + "\n\t innerException: " + this.innerException.message;
			}
		} else {
			if (this.innerException == null) {
				return this.toStringWithStack();
			} else {
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
/** all errors thrown by corelib extend this error type */
export class CorelibException extends Exception { }

/**
 * an exception that includes a statusCode for returning via http requests
 */
export class HttpStatusCodeException extends Exception {
	constructor(message: string, innerException?: Error | Exception | any, public statusCode = 400) {
		super(message, innerException);
	}
}