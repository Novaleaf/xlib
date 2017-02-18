//declare class Error {
//	public name: string;
//	public message: string;
//	public stack: string;
//	constructor(message?: string);
//}
//import * as environment from "./environment";
import * as environment from "./environment";


export interface IExceptionOptions {
	innerException?: Error;
	/** truncate extra stack frames from the stack that's attached to this, a good way to remove logging/util functions from the trace */
	stackFramesToTruncate?: number;
	data?: any;
}
//let err: Error;

//err.
/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export class Exception extends Error {

	public stack: string;
	public options: IExceptionOptions;
	private static _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
	constructor(public message: string, options?: IExceptionOptions	) {

		super(message);

		if (options == null) {
			options = {	};
		}
		if (options.stackFramesToTruncate == null) {
			options.stackFramesToTruncate = 0;
		}
		this.options = options;
		
		//if (environment.logLevel > environment.LogLevel.DEBUG) {
		//	innerException = null;
		//} else {
		//	if (innerException != null) {
		//		this.message = message + ": " + innerException.message;
		//	}
		//}
		if (options.innerException != null) {
			this.message = message + " +details: " + options.innerException.message;
		}
		

		//get name based on type.  snippet taken from ./runtime/reflection.ts code
		//this.name = "Exception";
		var results = (Exception._getTypeNameOrFuncNameRegex).exec((this).constructor.toString());
		this.name = (results && results.length > 1) ? results[1] : "";



		//this.message = message;
		//this.stack = (<any>new Error()).stack;		

		//remove our Error ctor from the stack (reduce unneeded verbosity of stack trace)
		let defaultFramesToRemove = 1;
		let tempStack: string;
		if (this.stack == null) {
			tempStack = new Error("Error Shim").stack as string;
			//remove our extra errorShim ctor off the stack trace
			defaultFramesToRemove = 2; 
		} else {
			tempStack = this.stack;
		}

		//truncate the stack if set by options
		let _array = tempStack.split("\n");
		
		if (_array.length > (defaultFramesToRemove + options.stackFramesToTruncate)) { 
			let line1 = _array.shift();
			let line2 = _array.shift();

			for (let i = 0; i < options.stackFramesToTruncate; i++) {
				_array.shift();
			}
			//put the message as the first item in the stack (as what normally is seen)
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
			if (stack.join != null) {			//if (__.arrayHelper.isArray(stack)) {
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
			if (this.options.innerException == null) {
				return this.message;
			} else {
				return this.message + "\n\t innerException: " + this.options.innerException.message;
			}
		} else {
			if (this.options.innerException == null) {
				return this.toStringWithStack();
			} else {
				return Exception.exceptionToString(this) + "\n\t innerException: " + this.options.innerException.toString();
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