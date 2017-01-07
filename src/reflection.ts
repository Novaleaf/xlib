
//export import _common = require("./reflection/_common");
//import stringHelper = require("../stringhelper");
//import arrayHelper = require("../arrayhelper");
import * as ex from "./exception";
import _ = require("lodash");


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
	var type = typeof ( obj );
	switch ( type ) {
		case "string":
		case "number":
		case "boolean":
		case "function":
		case "undefined":
			return ( Type as any )[ type ];
		case "object":
			var name: string;
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
			return ( Type as any )[ name ];
		default:
			throw new ex.CorelibException( "getType(), unknown primitive type: " + String( type ) );
	}
}

/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
export function getTypeName( obj: any ): string {
	const type = getType( obj );
	switch ( type ) {
		case Type.object:
		case Type.Error:
			//by default, try reading the obj.constructor.name property
			if(obj.constructor!=null && obj.constructor.name !=null && _.isString(obj.constructor.name)===true && obj.constructor.name.length>0){
				return obj.constructor.name;
			}
			//fall back to extracting the name from the obj.constructor.toString() text
			const ctorStr: string = ( obj ).constructor.toString();
			if ( ctorStr.indexOf( "class" ) === 0 ) {
				try {
					const _getTypeNameOrClassNameRegex = /class\s(.{1,}?)\s/;
					const results = ( _getTypeNameOrClassNameRegex ).exec( ctorStr );
					return ( results && results.length > 1 ) ? results[ 1 ] : "UnknownType";
				} catch ( ex ) {
					try {
						return typeof ( obj );
					} catch ( ex ) {
						return "UnknownType";
					}
				}
			} else if ( ctorStr.indexOf( "function" ) === 0 ) {
				try {
					const _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
					const results = ( _getTypeNameOrFuncNameRegex ).exec( ctorStr );
					return ( results && results.length > 1 ) ? results[ 1 ] : "UnknownType";
				} catch ( ex ) {
					try {
						return typeof ( obj );
					} catch ( ex ) {
						return "UnknownType";
					}
				}

			} else {
				return "UnknownType";
			}
			
		default:
			const str = Type[ type ]; //type.toString();
			return str;

	}
}


///** output an array with all key=value pairs of the object properties.
// * example output:  ['{"key":"value"}']
// * good for debug purposes
//  */
//export function propertiesToString(obj: any): string[] {
//	var output: string[] = [];
//	runtime.jsHelper.forEachProperty(obj, (value, key) => { output.push(__.format("{\"{0}\":\"{1}\"}", key, value ? value : "NULL")); });
//	return output;
//}

/** names of all parameters of a function */
export function getArgumentNames( args: IArguments ): string[];
export function getArgumentNames( func: Function ): string[];
export function getArgumentNames( argsOrFunction: any ): string[] {
	var func: Function;
	if ( typeof ( argsOrFunction ) === "function" ) {
		func = argsOrFunction;
	} else {
		var args: IArguments = argsOrFunction;
		func = args.callee;
	}
	var reg = /\(([\s\S]*?)\)/;
	var params = reg.exec( func.toString() );
	var paramNames: string[];
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
		var caller = args.callee;
		argumentNames = getArgumentNames( caller );
	}
	var toReturn: { [ argName: string ]: any } = {};
	for ( var i = 0; i < args.length; i++ ) {
		toReturn[ argumentNames[ i ] ] = args[ i ];
	}
	return toReturn;
}

//export function _nameArgs(argumentNames: string[], args: IArguments): any {
//	var toReturn = {};
//	for (var i = 0; i < args.length; i++) {
//		toReturn[argumentNames[i]] = args[i];
//	}
//	return toReturn;
//}
//export function nameArguments(args: IArguments) {
//	var caller = args.callee;
//	var names = getArgumentNames(caller);
//	return _nameArgs(names, args);
//}


