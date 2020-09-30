import * as _ from "lodash"

/* eslint-disable no-restricted-globals */
/** shape of all errors.   either derived from the ```Error``` object, or Error objects serialized to JSON */
export interface IError {
	/** the name of the Error class (typeName) */
	name: string
	/** human readable and ***actionable*** error message */
	message: string
	/** while almost always available, it may not be set under unusual circumstances */
	stack?: string
	/** may be set if the error was created via xlib.diagnostics.Exception  */
	innerError?: IError
	/** may be set if the error was created via xlib.diagnostics.Exception  */
	details?: { [ key: string ]: unknown }
}

/** the shape of Errors that xlib serializes (the same as normal Error serialization, except the stack is an array, not a single string)*/
export interface IErrorJson {
	/** the name of the Error class (typeName) */
	name: string;
	/** human readable and ***actionable*** error message */
	message: string;
	/** while almost always available, it may not be set under unusual circumstances */
	stack?: string[];
	/** optional, can pass an innerException of you use xlib.diagnostics.Exception */
	innerError?: IErrorJson;

	// /** additional fields may be attached to your error object.  if so, they will be serialized here */
	// [ keys: string ]: any;

	/** may be set if the error was created via xlib.diagnostics.Exception  */
	details?: { [ key: string ]: unknown }
}


/** passed to {@link Exception} constructor */
export interface IExceptionOptions {
	innerError?: Error;
	/** truncate logging frames from the top of the stack. 
	 * a good way to remove logging/util functions from the trace. */
	stackFramesToTruncate?: number;
	// /** extra custom data you wish to attach to your error object that you want logged. */
	// data?: TData;
	/** if you wish to restrict the number of stack frames stored, set this.   by default all stack frames are stored. */
	maxStackFrames?: number;
	// /** set to true if you wish additional properties of your exception to be included when the exception is serialized (to json or string).  This may be a security risk, so is false by default. */
	// logProperties?: boolean;

	/** additional details you want present in the error object.  found under .details */
	details?: { [ key: string ]: unknown }
}


export function getStackTrace(): string[] {
	const stackStr = Error().stack
	if ( stackStr == null ) {
		return []
	}
	return stackStr.split( "\n" ).slice( 2 ) //ln 0 is "Error", ln 1 is self.
}

/** An `Error` object that includes improved features
 * @remarks
 * ## important usage
 * If you derive from this and have a custom constructor, be sure to call the base class's `super()` in your constructor.  This will ensure that your derived class inherits from `Error`
 * 
 * @example
 * ```typescript
 * class MyException extends Exception{ } throw new MyException("boo");
 * ```
 * 
 * @see
core idea from https://www.typescriptlang.org/docs/handbook/2/classes.html#inheriting-built-in-types

*/ //Note: you can control if additional properties are logged via options.logProperties=true.  While stack frames will only be logged when envLevel!=PROD.
export class Exception extends Error {

	public stack: string;
	//public options: IExceptionOptions;
	private static _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;

	public innerError?: Error;
	// /** extra custom data you wish to attach to your error object that you want logged. */
	// public data?: any;

	public details?: { [ key: string ]: unknown }

	public constructor( public message: string, options: IExceptionOptions = {} ) {

		super( message )
		Object.setPrototypeOf( this, new.target.prototype )//fix inheritance, new in ts2.2: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
		//jsHelper.setPrototypeOf( this, new.target.prototype );

		options = {
			stackFramesToTruncate: 0,
			//logProperties:false,
			...options
		}


		//this.options = options;

		//this.data = options.any;

		if ( options.innerError != null ) {
			//make sure that what's passed is actually an error object
			options.innerError = toError( options.innerError )
		}
		this.details = options.details

		//if (environment.logLevel > environment.LogLevel.DEBUG) {
		//	innerException = null;
		//} else {
		//	if (innerException != null) {
		//		this.message = message + ": " + innerException.message;
		//	}
		//}

		/** split up the stack for manipulation during ```.ctor()```.  will recombine at end of  ```.ctor()```. */
		let splitStack = super.stack?.split( "\n" ) ?? []

		if ( options.innerError != null && typeof ( options.innerError.stack ) === "string" ) {
			const newStack = options.innerError.stack.split( "\n" )
			newStack.unshift( "innerException stack:" )
			newStack.unshift( splitStack[ 1 ] )
			newStack.unshift( splitStack[ 0 ] )
			splitStack = newStack
		}

		//truncate stackframes
		if ( options.stackFramesToTruncate! > 0 ) {
			//in nodejs, the first frame is actually message, so keep it.
			const messageFrame = splitStack.shift()
			for ( let i = 0; i < options.stackFramesToTruncate!; i++ ) {
				splitStack.shift()
			}
			if ( messageFrame != null ) {
				//put message back
				splitStack.unshift( messageFrame )
			}
		}

		//max stackframes
		if ( options.maxStackFrames != null ) {
			splitStack.length = options.maxStackFrames + 1
		}

		//recombine our array back to the normal stack string.
		this.stack = splitStack.join( "\n" )


		if ( options.innerError != null && typeof ( options.innerError.message ) === "string" && message.includes( options.innerError.message ) !== true ) {
			//include the innerError message in our message, but only if it wasn't manually added there already.
			this.message = message + "   innerException: " + options.innerError.message
		} else {
			this.message = message//making sure it's set for explicit order when serializing to JSON
		}


		//get name based on type.  snippet taken from ./runtime/reflection.ts code
		if ( ( this.constructor ).name != null ) {
			//es6
			this.name = ( this.constructor ).name
		} else {
			//es5
			const results = ( Exception._getTypeNameOrFuncNameRegex ).exec( ( this ).constructor.toString() )
			this.name = ( results != null && results.length > 1 ) ? results[ 1 ] : ""
		}

		this.innerError = options.innerError //putting this last to help ensure json serialization order

	}

	/** includes stack track in string*/
	public toString() {
		return errorToString( this )
	}
	public toJson<T extends Error = this>() {
		return errorToJson<T>( this )
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
	constructor( message: string, public statusCode: number, options: IExceptionOptions ) {
		super( message, options )
	}
}



/** ensures you have an Error object.
	* If you pass in an error, you will get it back.  If you pass in anything else, a new Error will be created and a string represtation of your input will be set as the ```message``` parameter.
 @remarks
	* useful for ```try{}catch(ex){}``` statements, where you are uncertain what the thrown error is.
	* @example
 ```typescript
	* try{
	*  await someClass.someMethod();
	* }catch(_err){
	*  const err = __.diag.toError(_err);
	* //use err as a normal Error object
	* }
 ```
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toError( ex: any | Error ): Error {
	return toError_worker( ex, new Set() )
}

function toError_worker( ex: any | Error, /** prevent infinite recursion */ _innerErrorRecursionTracker: Set<any> ): Error {

	if ( _innerErrorRecursionTracker.has( ex ) ) {
		return new Error( "circular reference in innerError" )
	}
	_innerErrorRecursionTracker.add( ex )

	if ( ex == null ) {
		throw new XlibException( "missing argument 'ex'" )
	}
	if ( ex instanceof Error ) {
		return ex
	}

	let message: string
	if ( typeof ex === "string" ) {
		message = ex
	} else if ( typeof ex.message === "string" ) {
		message = ex.message
	} else {
		try {
			const json = JSON.parse( ex )
			message = JSON.stringify( json ).slice( 0, 200 )
			//message = stringHelper.summarize( JSON.stringify( json ), 200 );
		} catch {
			message = "??? unknown, can not parse ???"
		}
	}

	const toReturn = new Exception( message, { maxStackFrames: 0 } )
	//apply other properties
	// if ( typeof ( ex.innerError ) === "string" ) {
	// 	toReturn.innerError = toError(ex.innerError)
	// }
	if ( ex.innerError != null ) {
		toReturn.innerError = toError_worker( ex.innerError, _innerErrorRecursionTracker )
	}
	toReturn.details = ex.details




	if ( typeof ( ex.name ) === "string" ) {
		toReturn.name = ex.name
	}
	if ( ex.stack != null ) {
		if ( typeof ( ex.stack ) === "string" ) {
			toReturn.stack = ex.stack
		} else if ( Array.isArray( ex.stack ) && ex.stack.join != null ) {
			toReturn.stack = ( ex.stack as string[] ).join( ",\n" )
		}
	}
	return toReturn
}


/** get a string representation of the error */
export function errorToString( ex: Error | IError, options?: IErrorToJsonOptions ): string {
	const exJson = errorToJson( ex, options )
	//exJson.stack = exJson.stack?.join( "\n" ) ?? ""
	return JSON.stringify( exJson )
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
	/** by default, we will hide the extra properties if the exception ctor options specify it.  pass TRUE to never hide properties */
	alwaysShowProperties?: boolean;
}

import * as types from "../_internal/types"

type ErrorAsJson<TError extends Error> =
	//IErrorJson & TError; //inaccurate, as it unions all properties (that are actually overridden, not unioned)
	// eslint-disable-next-line @typescript-eslint/ban-types
	types.PropsUnion<IErrorJson, types.PropsRemove<TError, Function>>;

import * as environment from "../environment"
// let t1: ErrorAsJson<MyException>;

/** convert an error and all it's properties to JSON.   */
export function errorToJson<TError extends Error>( error: TError | IError, options: IErrorToJsonOptions = {} ): ErrorAsJson<TError> {

	return errorToJson_worker( error, options, new Set() )

}
function errorToJson_worker<TError extends Error>( error: TError | IError, options: IErrorToJsonOptions = {}, _circularRefDetection: Set<any> ): ErrorAsJson<TError> {

	if ( _circularRefDetection.has( error ) ) {
		return {
			name: "circular reference",
			message: "error converting innerError to json due to circular reference",

		} as ANY
	}
	_circularRefDetection.add( error )

	options = { ...options }


	if ( error == null ) {
		//return { message: "", name: "NullNotError" } as any

	}
	//options = { ...options }


	//let error = toError( _error );
	let stackArray: string[]
	const innerError: IError | undefined = ( error as IError ).innerError


	//convert stack to array
	let stack = error.stack
	if ( stack == null ) {
		stack = "none"
	}
	if ( typeof stack === "string" ) {
		//toReturn.stack = toReturn.stack.substring(0,400);
		stackArray = stack.split( "\n" )
	} else if ( _.isArray( stack ) ) {
		//array;
		stackArray = stack as string[]
	} else if ( typeof ( stack as object ).toString === "function" ) {
		stackArray = [ ( stack as object ).toString() ]
	} else {
		stackArray = [ "unknown" ]
	}

	//sanitize: remove stack traces if in production
	if ( options.alwaysShowFullStack !== true && environment.isProd() && environment.isDebug() === false ) {
		switch ( environment.getLogLevel() ) {
			case "info":
				options.maxStacks = Math.min( options.maxStacks ?? 2, 2 )
				stackArray[ 1 ] = "only 1 stackFrame is shown because env=PROD && log=INFO"
				break
			default:
				options.maxStacks = Math.min( options.maxStacks ?? 1, 1 )
				stackArray[ 0 ] = "no stackFrames shown because env=PROD && log>INFO"
		}
	}

	// if ( options.alwaysShowFullStack !== true && environment.isProd() && environment.getLogLevel() > environment.LogLevel.TRACE.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST ) {
	// 	//sanitize
	// 	stackArray = [ "no stack or extra properties unless envLevel=DEV|TEST, or logLevel=DEBUG|TRACE" ]
	// 	innerError = undefined
	// } else {

	// }

	//sanitize: set max stack length
	stackArray.slice( 0, options.maxStacks ?? Number.MAX_SAFE_INTEGER )

	// if ( options.maxStacks != null && stackArray.length > options.maxStacks ) {
	// 	stackArray.length = options.maxStacks
	// }

	/////////////////////////////

	let serialized: IErrorJson
	if ( options.alwaysShowProperties === true ) {
		serialized = _.cloneDeep( error ) as never as IErrorJson
	} else {
		serialized = {
			name: error.name,
			message: error.message,
		}
	}
	//common values
	serialized.stack = stackArray
	if ( innerError != null ) {
		serialized.innerError = errorToJson_worker( innerError, options, _circularRefDetection )
	}

	return serialized as never

	// try {
	// 	if ( options.alwaysShowProperties !== true && environment.logLevel > environment.LogLevel.DEBUG && environment.envLevel > environment.EnvLevel.TEST ) {
	// 		//don't show extra properties
	// 		const _tmpEx = error as Exception
	// 		serialized = {
	// 			name: _tmpEx.name,
	// 			message: _tmpEx.message,
	// 			innerError: _tmpEx.innerError,
	// 			stack: _tmpEx.stack
	// 		}
	// 		serialized = JSON.parse( JSON.stringify( serialized ) )
	// 	} else {
	// 		serialized = JSON.parse( JSON.stringify( error ) )
	// 	}
	// } catch ( ex ) {
	// 	serialized = {} as any
	// }
	// if ( options.maxStacks != null && stackArray.length > options.maxStacks ) {
	// 	stackArray.length = options.maxStacks
	// }

	// let innerErrorJson: IErrorJson | undefined

	// if ( innerError != null ) {
	// 	try {
	// 		innerErrorJson = errorToJson( innerError )
	// 	} catch {
	// 		//eat error
	// 		//innerErrorJson = serialized.innerError as any;
	// 		innerErrorJson = { name: "UnknownErrorToJson", message: "" }
	// 	}
	// }


	// const toReturn = {
	// 	...serialized,
	// 	name: error.name,
	// 	message: error.message,
	// 	stack: stackArray,
	// 	innerError: innerErrorJson,
	// }


	// return toReturn as any

}
