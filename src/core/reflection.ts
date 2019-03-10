
//export import _common = require("./reflection/_common");
//import stringHelper = require("../stringhelper");
//import arrayHelper = require("../arrayhelper");

import * as ex from "./_diagnostics/exception";



/** primitive types as identified by javascript, plus well known object types */
export enum Type {
	/** null is not undefined, unfortunately  */
	"null",
	"undefined",
	"string",
	"number",
	"boolean",
	"function",

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
export function getType( obj: any ): Type {
	if ( obj === null ) {
		return Type.null;
	}
	const type = typeof ( obj );
	switch ( type ) {
		case "string":
		case "number":
		case "boolean":
		case "undefined":
			return Type[ type ];
		case "object":
			{
				let name: string;
				if ( obj instanceof Array ) {
					name = "Array";
				} else if ( obj instanceof Error ) {
					name = "Error";
				} else if ( obj instanceof RegExp ) {
					name = "RegExp";
				} else if ( obj instanceof Date ) {
					name = "Date";
				} else {
					name = "object";
				}
				return Type[ name as keyof typeof Type ];
			}
		case "function":
			{
				//check if class
				const asFunction = obj as Function;
				const isClass = /^\s*class\s+/.test( asFunction.toString() );
				if ( isClass ) {
					return Type[ "classCtor" ];
				}
				return Type[ type ];
			}
		default:
			throw new ex.XlibException( "getType(), unknown primitive type: " + String( type ) );
	}
}

/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
export function getTypeName( obj: any ): string {
	let type = getType( obj );
	switch ( type ) {
		case Type.object:
		case Type.Error: {
			let name: string;
			if ( obj.constructor ) {
				if ( obj.constructor.name != null ) {
					//es6
					name = obj.constructor.name;
				} else if ( obj.constructor.toString ) {
					let _getTypeNameOrFuncNameRegex = /\s*function\s*(\S{1,})\s*\(/;
					let results = ( _getTypeNameOrFuncNameRegex ).exec( ( obj ).constructor.toString() );
					name = ( results && results.length > 1 ) ? results[ 1 ] : typeof ( obj );
				} else {
					name = typeof ( obj );
				}
			} else {
				name = typeof ( obj );
			}
			return name;
			// let _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
			// let results = ( _getTypeNameOrFuncNameRegex ).exec( ( obj ).constructor.toString() );
			// return ( results && results.length > 1 ) ? results[ 1 ] : "";
		}
		case Type.classCtor:
			{
				const objAsFunction = obj as Function;
				const str = objAsFunction.toString().trim();
				const results = /\s*class\s*(\S{1,})\s*/.exec( str );
				const name = results ? results[ 1 ] : "[unknown classCtor]";
				return name;
			}
		case Type.function:
			{
				const objAsFunction = obj as Function;
				const str = objAsFunction.toString().trim();
				const results = /\s*function\s*(\S{1,})\s*\(/.exec( str )
				const name = results ? results[ 1 ] : "[anonymous]";
				return name;
			}
		default:
			{
				const str = Type[ type ]; //type.toString();
				return str;
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
export function getArgumentNames( args: IArguments ): string[];
export function getArgumentNames( func: Function ): string[];
export function getArgumentNames( argsOrFunction: any ): string[] {
	let func: Function;
	if ( typeof ( argsOrFunction ) === "function" ) {
		func = argsOrFunction;
	} else {
		let args: IArguments = argsOrFunction;
		func = args.callee;
	}
	let reg = /\(([\s\S]*?)\)/;
	let params = reg.exec( func.toString() );
	let paramNames: string[];
	if ( params ) {
		paramNames = params[ 1 ].split( "," );
	} else {
		paramNames = [];
	}
	return paramNames;
}

/** returns a key-value collection of argument names (keys) and their mapped input arg (values).  
 * if no argumentNames are passed in, the current function's argument names are used.
 * useful for debugging/logging parameters */
export function mapArgumentsValues( args: IArguments, argumentNames?: string[] ): { [ argName: string ]: any } {
	if ( argumentNames == null ) {
		let caller = args.callee;
		argumentNames = getArgumentNames( caller );
	}
	let toReturn: { [ argName: string ]: any } = {};
	for ( let i = 0; i < args.length; i++ ) {
		toReturn[ argumentNames[ i ] ] = args[ i ];
	}
	return toReturn;
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


