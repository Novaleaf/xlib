/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-globals */

//export import _common = require("./reflection/_common");
//import stringHelper = require("../stringhelper");
//import arrayHelper = require("../arrayhelper");

import * as ex from "./exception"


/** primitive types as identified by javascript, plus well known object types */
export enum Type {
	/** null is not undefined, unfortunately  */
	"null",
	"undefined",
	"string",
	"number",
	"boolean",
	"function",
	"symbol",
	/** unknown (custom) object types.  you can use .getTypeName(obj) to get the actual type name */
	"object",
	/** a class that can be constructed via the "new" keyword */
	classCtor,
	/** derrives from error.   can use .getTypeName(err) to get names of errors that derrive from the Error base type*/
	Error,
	Array,
	RegExp,
	Date,
}


//OBSOLETE: just use getType() instead
//export function isFunction(it) {
//	return Object.prototype.toString.call(it) === "[object Function]";
//}


/** provides the primitive type of a variable. better than using 'typeof()' because this handles array and null. */
export function getType( obj: unknown ): Type {
	if ( obj === null ) {
		return Type.null
	}
	const type = typeof ( obj )
	switch ( type ) {
		case "string":
		case "number":
		case "boolean":
		case "symbol":
		case "undefined":
			return Type[ type ]
		case "object":
			{
				let name: string
				if ( obj instanceof Array ) {
					name = "Array"
				} else if ( obj instanceof Error ) {
					name = "Error"
				} else if ( obj instanceof RegExp ) {
					name = "RegExp"
				} else if ( obj instanceof Date ) {
					name = "Date"
				} else {
					name = "object"
				}
				return Type[ name as keyof typeof Type ]
			}
		case "function":
			{
				//check if class
				// eslint-disable-next-line @typescript-eslint/ban-types
				const asFunction = obj as Function
				const isClass = /^\s*class\s+/.test( asFunction.toString() )
				if ( isClass ) {
					return Type.classCtor
				}
				return Type[ type ]
			}
		default:
			throw new ex.XlibException( "getType(), unknown primitive type: " + String( type ) )
	}
}

/** get all properties of an object, excluding constructor, Symbols, and props from Object.prototype 
 * 
 * **Why is this useful?** to get fields and functions of a class instantiated object.
*/
export function getPropertyNames<T>( obj: unknown ) {

	const propNames: Set<string> = new Set()

	let loops = 0
	while ( loops < 100 ) {
		loops++
		const foundNames = Object.getOwnPropertyNames( obj )
		for ( const name of foundNames ) {
			switch ( name ) {
				case "constructor":
					break
				default:
					propNames.add( name )
					break
			}
		}
		obj = Object.getPrototypeOf( obj )
		if ( obj == null || Object.prototype === obj ) {
			break
		}
	}


	return propNames
}

/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
export function getTypeName( obj: any ): string {
	const type = getType( obj )
	switch ( type ) {
		case Type.object:
		case Type.Error: {
			let name: string | undefined

			//es6
			name = obj?.constructor?.name
			if ( name == null ) {
				//es5
				const ctorStr: string | undefined = obj?.constructor?.toString()
				if ( ctorStr != null ) {
					const _getTypeNameOrFuncNameRegex = /\s*function\s*(\S{1,})\s*\(/
					const results = ( _getTypeNameOrFuncNameRegex ).exec( ctorStr )
					name = ( results && results.length > 1 ) ? results[ 1 ] : typeof ( obj )
				}
			}
			name = name ?? typeof ( obj )
			return name

			// // //xlib v17 version:
			// // {
			// // 	if ( obj.constructor ) {
			// // 		if ( obj.constructor.name != null ) {
			// // 			//es6
			// // 			name = obj.constructor.name
			// // 		} else if ( obj.constructor.toString ) {
			// // 			const results = ( _getTypeNameOrFuncNameRegex ).exec( ( obj ).constructor.toString() )
			// // 			name = ( results && results.length > 1 ) ? results[ 1 ] : typeof ( obj )
			// // 		} else {
			// // 			name = typeof ( obj )
			// // 		}
			// // 	} else {
			// // 		name = typeof ( obj )
			// // 	}
			// // 	return name
			// // 	// let _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
			// // 	// let results = ( _getTypeNameOrFuncNameRegex ).exec( ( obj ).constructor.toString() );
			// // 	// return ( results && results.length > 1 ) ? results[ 1 ] : "";
			// // }


		}
		case Type.classCtor:
			{
				const objAsFunction = obj as Function
				const str = objAsFunction.toString().trim()
				const results = /\s*class\s*(\S{1,})\s*/.exec( str )
				const name = results ? results[ 1 ] : "[unknown classCtor]"
				return name
			}
		case Type.function:
			{
				const objAsFunction = obj as Function
				const str = objAsFunction.toString().trim()
				const results = /\s*function\s*(\S{1,})\s*\(/.exec( str )
				const name = results ? results[ 1 ] : "[anonymous]"
				return name
			}
		case Type.symbol:
			{
				const objAsSymbol = obj as symbol
				const str = objAsSymbol.toString().trim()
				const results = /Symbol\((\S{1,})\)/.exec( str )
				const name = results ? results[ 1 ] : "[unknown symbol]"
				return name
			}
		default:
			{
				const str = Type[ type ]
				return str
			}
	}
}


///** output an array with all key=value pairs of the object properties.
// * example output:  ['{"key":"value"}']
// * good for debug purposes
//  */
//export function propertiesToString(obj: any): string[] {
//	let output: string[] = [];
//	runtime.jsHelper.forEachProperty(obj, (value, key) => { output.push(__.format("{\"{0}\":\"{1}\"}", key, value ? value : "NULL")); });
//	return output;
//}

/** names of all parameters of a function */
export function getArgumentNames( argsOrFunction: IArguments | Function ): string[] {
	let func: Function
	if ( typeof ( argsOrFunction ) === "function" ) {
		func = argsOrFunction
	} else {
		const args: IArguments = argsOrFunction
		func = args.callee
	}
	const reg = /\(([\s\S]*?)\)/
	const params = reg.exec( func.toString() )
	let paramNames: string[]
	if ( params ) {
		paramNames = params[ 1 ].split( "," )
	} else {
		paramNames = []
	}
	return paramNames
}

/** returns a key-value collection of argument names (keys) and their mapped input arg (values).
 * if no argumentNames are passed in, the current function's argument names are used.
 * useful for debugging/logging parameters */
export function mapArgumentsValues( args: IArguments, argumentNames?: string[] ): { [ argName: string ]: any; } {
	if ( argumentNames == null ) {
		const caller = args.callee
		argumentNames = getArgumentNames( caller )
	}
	const toReturn: { [ argName: string ]: unknown; } = {}
	for ( let i = 0; i < args.length; i++ ) {
		toReturn[ argumentNames[ i ] ] = args[ i ]
	}
	return toReturn
}

//export function _nameArgs(argumentNames: string[], args: IArguments): any {
//	let toReturn = {};
//	for (let i = 0; i < args.length; i++) {
//		toReturn[argumentNames[i]] = args[i];
//	}
//	return toReturn;
//}
//export function nameArguments(args: IArguments) {
//	let caller = args.callee;
//	let names = getArgumentNames(caller);
//	return _nameArgs(names, args);
//}
