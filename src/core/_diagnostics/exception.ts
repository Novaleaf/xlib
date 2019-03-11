import * as environment from "../environment";
import * as _ from "lodash";
import * as stringHelper from "../_util/stringhelper";


/** shape of all errors.   either derived from the ```Error``` object, or Error objects serialized to JSON */
export interface IError {
	/** the name of the Error class (typeName) */
	name: string;
	/** human readable and ***actionable*** error message */
	message: string;
	/** while almost always available, it may not be set under unusual circumstances */
	stack?: string;
	/** may be set if the error was created via xlib.diagnostics.Exception  */
	innerError?: IError;
}

/** the shape of Errors that xlib serializes (the same as normal Error serialization, except the stack is an array, not a single string)*/
export interface IErrorJson {
	/** the name of the Error class (typeName) */
	name: string;
	/** human readable and ***actionable*** error message */
	message: string;
	/** while almost always available, it may not be set under unusual circumstances */
	stack?: Array<string>;
	/** optional, can pass an innerException of you use xlib.diagnostics.Exception */
	innerError?: IErrorJson;

	// /** additional fields may be attached to your error object.  if so, they will be serialized here */
	// [ keys: string ]: any;
}


export interface IExceptionOptions<TData = never> {
	innerError?: Error;
	/** truncate extra stack frames from the stack that's attached to this,
	 * a good way to remove logging/util functions from the trace */
	stackFramesToTruncate?: number;
	/** extra custom data you wish to attach to your error object that you want logged. */
	data?: TData;
	/** if you wish to restrict the number of stack frames stored, set this.   by default all stack frames are stored. */
	maxStackFrames?: number;
}

/** class to allow extending of javascript errors (custom errors thrown by exceptions)
usage example:  class MyException extends base.Exception{}  throw new MyException("boo");
from https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
*/
export class Exception<TData=never> extends Error {

	public stack: string;
	//public options: IExceptionOptions;
	private static _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;

	public innerError?: Error;
	/** extra custom data you wish to attach to your error object that you want logged. */
	public data?: TData;

	constructor( public message: string, _options: IExceptionOptions<TData> = {} ) {

		super( message );
		Object.setPrototypeOf( this, new.target.prototype );//fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
		//jsHelper.setPrototypeOf( this, new.target.prototype );

		const options = {
			stackFramesToTruncate: 0,
			..._options
		};

		this.data = options.data;

		if ( options.innerError != null ) {
			//make sure that what's passed is actually an error object
			options.innerError = toError( options.innerError );
		}

		//if (environment.logLevel > environment.LogLevel.DEBUG) {
		//	innerException = null;
		//} else {
		//	if (innerException != null) {
		//		this.message = message + ": " + innerException.message;
		//	}
		//}

		/** split up the stack for manipulation during ```.ctor()```.  will recombine at end of  ```.ctor()```. */
		let splitStack = this.stack.split( "\n" );

		if ( options.innerError != null && typeof ( options.innerError.stack ) === "string" ) {
			let newStack = options.innerError.stack.split( "\n" );
			newStack.unshift( "innerException stack:" );
			newStack.unshift( splitStack[ 1 ] );
			newStack.unshift( splitStack[ 0 ] );
			splitStack = newStack;
		}

		//truncate stackframes
		if ( options.stackFramesToTruncate > 0 ) {
			//in nodejs, the first frame is actually message, so keep it.
			let messageFrame = splitStack.shift();
			for ( let i = 0; i < options.stackFramesToTruncate; i++ ) {
				splitStack.shift();
			}
			if ( messageFrame != null ) {
				//put message back
				splitStack.unshift( messageFrame );
			}
		}

		//max stackframes
		if ( options.maxStackFrames != null ) {
			splitStack.length = options.maxStackFrames + 1;
		}

		//recombine our array back to the normal stack string.
		this.stack = splitStack.join( "\n" );


		if ( options.innerError != null && typeof ( options.innerError.message ) === "string" && message.includes( this.innerError.message ) !== true ) {
			this.message = message + "	innerException: " + options.innerError.message;
		} else {
			this.message = message;//making sure it's set for explicit order when serializing to JSON
		}


		//get name based on type.  snippet taken from ./runtime/reflection.ts code
		if ( ( this.constructor as any ).name != null ) {
			//es6
			this.name = ( this.constructor as any ).name;
		} else {
			//es5
			let results = ( Exception._getTypeNameOrFuncNameRegex ).exec( ( this ).constructor.toString() );
			this.name = ( results != null && results.length > 1 ) ? results[ 1 ] : "";
		}

		this.innerError = options.innerError; //putting this last to help ensure json serialization order

	}

	/** includes stack track in string*/
	public toString() {
		return errorToString( this );
	}
	public toJson<T extends Error = this>() {
		return errorToJson<T>( this );
	}


	// disabling because in node8.x this gets in the way.
	// public toString() {

	// 	if ( environment.logLevel > environment.LogLevel.DEBUG ) {
	// 		if ( this.options.innerException == null ) {
	// 			return this.message;
	// 		} else {
	// 			return this.message + "	innerException: " + this.options.innerException.message;
	// 		}
	// 	} else {
	// 		if ( this.options.innerException == null ) {
	// 			return this.toStringWithStack();
	// 		} else {
	// 			return Exception.exceptionToString( this ) + "	 innerException: " + this.options.innerException.toString();
	// 		}
	// 	}


	// 	//if (this.innerException == null) {
	// 	//	return super.toString();
	// 	//} else {
	// 	//	return super.toString() + "\n\t innerException: " + this.innerException.toString();
	// 	//}
	// }

}


/** all errors thrown by xlib extend this error type */
export class XlibException<TData=never> extends Exception<TData> { }

/**
 * an exception that includes a statusCode for returning via http requests
 */
export class HttpStatusCodeException<TData=never> extends Exception<TData> {
	constructor( message: string, public statusCode: number, innerException?: Error ) {
		super( message, { innerError: innerException } );
	}

	// public toJson(): IErrorJson & { statusCode: number } {

	// 	type X = this;
	// 	let x: X;

	// 	let asJson = errorToJson<X>( this );

	// 	//asJson.


	// 	let baseJson = super.toJson<HttpStatusCodeException>();//  Exception.exceptionToJsonObj( this );

	// 		return {
	// 		...baseJson,
	// 			statusCode: this.statusCode,
	// 	};
	// }
}


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
export function toError( ex: any | Error ): Error & IError {
	if ( ex instanceof Error ) {
		return ex;
	}

	let message: string;
	if ( typeof ex === "string" ) {
		message = ex;
	} else if ( typeof ex.message === "string" ) {
		message = ex.message;
	} else {
		try {
			let json = JSON.parse( ex );
			message = stringHelper.summarize( JSON.stringify( json ), 200 );
		} catch {
			message = "??? unknown, can not parse ???";
		}
	}

	const toReturn = new Exception( message, { maxStackFrames: 0 } );
	return toReturn;
}


/** get a string representation of the error */
export function errorToString( ex: Error | IError, options?: IErrorToJsonOptions ): string {
	let exJson = errorToJson( ex, options );
	exJson.stack = exJson.stack == null ? "" : exJson.stack.join( "\n" ) as any;
	return JSON.stringify( exJson );
}

export interface IErrorToJsonOptions {
	/** max stack depth to output
		* @default Infinity
	 */
	maxStacks?: number;
	/** by default, we will hide the stack in UAT or PROD envLevel, unless DEBUG logLevel is set.    pass TRUE to never hide the stack.
		* @default false
	*/
	alwaysShowFullStack?: boolean;
}


type ErrorAsJson<TError extends Error> = PropsUnion<IErrorJson, PropsRemove<TError, Function>>;


// class MyException extends Exception {
// 	public someVal = 22;
// };
// let t1: ErrorAsJson<MyException>;

/** convert an error and all it's properties to JSON.   */
export function errorToJson<TError extends Error>( error: TError | IError, options?: IErrorToJsonOptions ): ErrorAsJson<TError> {

	if ( error == null ) {
		return { message: "", name: "NullNotError" } as any;
	}
	options = { ...options };

	//let error = toError( _error );
	let stackArray: Array<string>;
	let innerError: any = ( error as any ).innerError;

	if ( options.alwaysShowFullStack !== true && environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST ) {
		//sanitize
		stackArray = [ "no stack unless env is DEV or TEST, or logLevel is DEBUG or TRACE" ];
		innerError = undefined;
	} else {
		let stack = error.stack;
		if ( stack == null ) {
			stack = "none";
		}
		if ( typeof stack === "string" ) {
			//toReturn.stack = toReturn.stack.substring(0,400);
			stackArray = stack.split( "\n" );
		} else if ( _.isArray( stack ) ) {
			//array;
			stackArray = stack as Array<string>;
		} else if ( typeof ( stack as any ).toString === "function" ) {
			stackArray = [ ( stack as any ).toString() ];
		} else {
			stackArray = [ "unknown" ];
		}
	}
	let serialized: IError;
	try {
		serialized = JSON.parse( JSON.stringify( error ) );
	} catch ( ex ) {
		serialized = {} as any;
	}
	if ( options.maxStacks != null && stackArray.length > options.maxStacks ) {
		stackArray.length = options.maxStacks;
	}

	let innerErrorJson: IErrorJson | undefined;

	if ( innerError != null ) {
		try {
			innerErrorJson = errorToJson( innerError );
		} catch{
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


	return toReturn as any;

}
