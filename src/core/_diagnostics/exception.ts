import * as environment from "../environment";
import * as _ from "lodash";
import * as stringHelper from "../_util/stringhelper";


/** shape of javascript ```Error```s */
export interface IError {
	name: string;
	message: string;
	stack?: string;

}

/** the shape of Errors that xlib prefers to use, IE with a stack that's an array (not a string),  and an innerException parameter*/
export interface IErrorJson {
	/** the name of the class inheriting from Error */
	name: string;
	/** human readable (and actionable) message describing the circumstances of the error*/
	message: string;
	/** the callstack.  */
	stack?: string[];
	/** optional */
	innerException?: any;
}


export interface IExceptionOptions<TData = never> {
	innerException?: Error;
	/** truncate extra stack frames from the stack that's attached to this, 
	 * a good way to remove logging/util functions from the trace */
	stackFramesToTruncate?: number;
	/** extra data you want logged. */
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

	public innerException: Error;
	public data: TData;

	constructor( public message: string, options?: IExceptionOptions<TData> ) {

		super( message );
		Object.setPrototypeOf( this, new.target.prototype );//fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
		//jsHelper.setPrototypeOf( this, new.target.prototype ); 

		options = {
			stackFramesToTruncate: 0,
			...options
		};

		if ( options.innerException != null ) {
			//make sure that what's passed is actually an error object
			this.innerException = toError( options.innerException );
		}
		this.data = options.data;


		//if (environment.logLevel > environment.LogLevel.DEBUG) {
		//	innerException = null;
		//} else {
		//	if (innerException != null) {
		//		this.message = message + ": " + innerException.message;
		//	}
		//}

		/** split up the stack for manipulation during ```.ctor()```.  will recombine at end of  ```.ctor()```. */
		let splitStack = this.stack.split( "\n" );

		if ( options.innerException != null && typeof ( options.innerException.stack ) === "string" ) {
			let newStack = options.innerException.stack.split( "\n" );
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
			//put message back
			splitStack.unshift( messageFrame );
		}

		//max stackframes
		if ( options.maxStackFrames != null ) {
			splitStack.length = options.maxStackFrames + 1;
		}

		//recombine our array back to the normal stack string.
		this.stack = splitStack.join( "\n" );




		if ( options.innerException != null && typeof ( options.innerException.message ) === "string" ) {
			this.message = message + "	innerException: " + options.innerException.message;
		}


		//get name based on type.  snippet taken from ./runtime/reflection.ts code
		if ( ( this.constructor as any ).name != null ) {
			//es6
			this.name = ( this.constructor as any ).name;
		} else {
			//es5
			var results = ( Exception._getTypeNameOrFuncNameRegex ).exec( ( this ).constructor.toString() );
			this.name = ( results && results.length > 1 ) ? results[ 1 ] : "";
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

	/** includes stack track in string*/
	public toString() {
		return errorToString( this );
	}
	public toJson() {
		return errorToJson( this );
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
export class XlibException extends Exception { }

/**
 * an exception that includes a statusCode for returning via http requests
 */
export class HttpStatusCodeException extends Exception {
	constructor( message: string, public statusCode: number, innerException?: Error ) {
		super( message, { innerException: innerException } );
	}

	public toJson() {
		let baseJson = super.toJson();//  Exception.exceptionToJsonObj( this );
		return {
			...baseJson,
			statusCode: this.statusCode,
		};
	}
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
export function toError( ex: any | Error ): Error {
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


/** get a string representation of the error, with full stack-track (if any exists) */
export function errorToString( ex: Error ): string {
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

	let exJson = errorToJson( ex );
	exJson.stack = exJson.stack.join( "\n" ) as any; //add line breaks to stack
	return JSON.stringify( exJson );
}


export function errorToJson( _error: Error | IError | string, maxStacks?: number ): IErrorJson {

	let error = toError( _error );
	let stackArray: string[];
	let innerException = ( error as any ).innerException;

	if ( environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel !== environment.EnvLevel.DEV ) {
		//sanitize
		stackArray = [ "no stack unless in logLevel.DEBUG or envLevel.DEV mode" ];
		innerException = undefined;
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
			stackArray = stack as string[];
		} else {
			stackArray = [ ( stack as any ).toString() ];
		}
	}
	let serialized: IError;
	try {
		serialized = JSON.parse( JSON.stringify( error ) );
	} catch ( ex ) {
		serialized = {} as any;
	}
	if ( maxStacks != null && stackArray.length > maxStacks ) {
		stackArray.length = maxStacks;
	}

	let toReturn = {
		...serialized,
		name: error.name,
		message: error.message,
		stack: stackArray,
		innerException,
	};


	return toReturn;

}