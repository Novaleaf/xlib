"use strict";
//export import _common = require("./reflection/_common");
//import stringHelper = require("../stringhelper");
//import arrayHelper = require("../arrayhelper");
Object.defineProperty(exports, "__esModule", { value: true });
const ex = require("./_diagnostics/exception");
/** primitive types as identified by javascript, plus well known object types */
var Type;
(function (Type) {
    /** null is not undefined, unfortunately  */
    Type[Type["null"] = 0] = "null";
    Type[Type["undefined"] = 1] = "undefined";
    Type[Type["string"] = 2] = "string";
    Type[Type["number"] = 3] = "number";
    Type[Type["boolean"] = 4] = "boolean";
    Type[Type["function"] = 5] = "function";
    /** unknown (custom) object types.  you can use .getTypeName(obj) to get the actual type name */
    Type[Type["object"] = 6] = "object";
    /** a class that can be constructed via the "new" keyword */
    Type[Type["classCtor"] = 7] = "classCtor";
    /** derrives from error.   can use .getTypeName(err) to get names of errors that derrive from the Error base type*/
    Type[Type["Error"] = 8] = "Error";
    Type[Type["Array"] = 9] = "Array";
    Type[Type["RegExp"] = 10] = "RegExp";
    Type[Type["Date"] = 11] = "Date";
})(Type = exports.Type || (exports.Type = {}));
//OBSOLETE: just use getType() instead
//export function isFunction(it) {
//	return Object.prototype.toString.call(it) === "[object Function]";
//}
/** provides the primitive type of a variable. better than using 'typeof()' because this handles array and null. */
function getType(obj) {
    if (obj === null) {
        return Type.null;
    }
    const type = typeof (obj);
    switch (type) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
            return Type[type];
        case "object":
            {
                let name;
                if (obj instanceof Array) {
                    name = "Array";
                }
                else if (obj instanceof Error) {
                    name = "Error";
                }
                else if (obj instanceof RegExp) {
                    name = "RegExp";
                }
                else if (obj instanceof Date) {
                    name = "Date";
                }
                else {
                    name = "object";
                }
                return Type[name];
            }
        case "function":
            {
                //check if class
                const asFunction = obj;
                const isClass = /^\s*class\s+/.test(asFunction.toString());
                if (isClass) {
                    return Type["classCtor"];
                }
                return Type[type];
            }
        default:
            throw new ex.XlibException("getType(), unknown primitive type: " + String(type));
    }
}
exports.getType = getType;
/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
function getTypeName(obj) {
    let type = getType(obj);
    switch (type) {
        case Type.object:
        case Type.Error: {
            let name;
            if (obj.constructor) {
                if (obj.constructor.name != null) {
                    //es6
                    name = obj.constructor.name;
                }
                else if (obj.constructor.toString) {
                    let _getTypeNameOrFuncNameRegex = /\s*function\s*(\S{1,})\s*\(/;
                    let results = (_getTypeNameOrFuncNameRegex).exec((obj).constructor.toString());
                    name = (results && results.length > 1) ? results[1] : typeof (obj);
                }
                else {
                    name = typeof (obj);
                }
            }
            else {
                name = typeof (obj);
            }
            return name;
            // let _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
            // let results = ( _getTypeNameOrFuncNameRegex ).exec( ( obj ).constructor.toString() );
            // return ( results && results.length > 1 ) ? results[ 1 ] : "";
        }
        case Type.classCtor:
            {
                const objAsFunction = obj;
                const str = objAsFunction.toString().trim();
                const results = /\s*class\s*(\S{1,})\s*/.exec(str);
                const name = results ? results[1] : "[unknown classCtor]";
                return name;
            }
        case Type.function:
            {
                const objAsFunction = obj;
                const str = objAsFunction.toString().trim();
                const results = /\s*function\s*(\S{1,})\s*\(/.exec(str);
                const name = results ? results[1] : "[anonymous]";
                return name;
            }
        default:
            {
                const str = Type[type]; //type.toString();
                return str;
            }
    }
}
exports.getTypeName = getTypeName;
function getArgumentNames(argsOrFunction) {
    let func;
    if (typeof (argsOrFunction) === "function") {
        func = argsOrFunction;
    }
    else {
        let args = argsOrFunction;
        func = args.callee;
    }
    let reg = /\(([\s\S]*?)\)/;
    let params = reg.exec(func.toString());
    let paramNames;
    if (params) {
        paramNames = params[1].split(",");
    }
    else {
        paramNames = [];
    }
    return paramNames;
}
exports.getArgumentNames = getArgumentNames;
/** returns a key-value collection of argument names (keys) and their mapped input arg (values).
 * if no argumentNames are passed in, the current function's argument names are used.
 * useful for debugging/logging parameters */
function mapArgumentsValues(args, argumentNames) {
    if (argumentNames == null) {
        let caller = args.callee;
        argumentNames = getArgumentNames(caller);
    }
    let toReturn = {};
    for (let i = 0; i < args.length; i++) {
        toReturn[argumentNames[i]] = args[i];
    }
    return toReturn;
}
exports.mapArgumentsValues = mapArgumentsValues;
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
//# sourceMappingURL=reflection.js.map