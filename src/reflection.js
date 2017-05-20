"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//export import _common = require("./reflection/_common");
//import stringHelper = require("../stringhelper");
//import arrayHelper = require("../arrayhelper");
var ex = require("./exception");
var _ = require("lodash");
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
    /** derrives from error.   can use .getTypeName(err) to get names of errors that derrive from the Error base type*/
    Type[Type["Error"] = 7] = "Error";
    Type[Type["Array"] = 8] = "Array";
    Type[Type["RegExp"] = 9] = "RegExp";
    Type[Type["Date"] = 10] = "Date";
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
    var type = typeof (obj);
    switch (type) {
        case "string":
        case "number":
        case "boolean":
        case "function":
        case "undefined":
            return Type[type];
        case "object":
            var name;
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
        default:
            throw new ex.CorelibException("getType(), unknown primitive type: " + String(type));
    }
}
exports.getType = getType;
/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
function getTypeName(obj) {
    var type = getType(obj);
    switch (type) {
        case Type.object:
        case Type.Error:
            //by default, try reading the obj.constructor.name property
            if (obj.constructor != null && obj.constructor.name != null && _.isString(obj.constructor.name) === true && obj.constructor.name.length > 0) {
                return obj.constructor.name;
            }
            if (obj.constructor == null || obj.constructor.toString == null) {
                return "[*POJO*]";
            }
            //fall back to extracting the name from the obj.constructor.toString() text
            var ctorStr = (obj).constructor.toString();
            if (ctorStr.indexOf("class") === 0) {
                try {
                    var _getTypeNameOrClassNameRegex = /class\s(.{1,}?)\s/;
                    var results = (_getTypeNameOrClassNameRegex).exec(ctorStr);
                    return (results && results.length > 1) ? results[1] : "UnknownType";
                }
                catch (ex) {
                    try {
                        return typeof (obj);
                    }
                    catch (ex) {
                        return "UnknownType";
                    }
                }
            }
            else if (ctorStr.indexOf("function") === 0) {
                try {
                    var _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
                    var results = (_getTypeNameOrFuncNameRegex).exec(ctorStr);
                    return (results && results.length > 1) ? results[1] : "UnknownType";
                }
                catch (ex) {
                    try {
                        return typeof (obj);
                    }
                    catch (ex) {
                        return "UnknownType";
                    }
                }
            }
            else {
                return "UnknownType";
            }
        default:
            var str = Type[type]; //type.toString();
            return str;
    }
}
exports.getTypeName = getTypeName;
function getArgumentNames(argsOrFunction) {
    var func;
    if (typeof (argsOrFunction) === "function") {
        func = argsOrFunction;
    }
    else {
        var args = argsOrFunction;
        func = args.callee;
    }
    var reg = /\(([\s\S]*?)\)/;
    var params = reg.exec(func.toString());
    var paramNames;
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
        var caller = args.callee;
        argumentNames = getArgumentNames(caller);
    }
    var toReturn = {};
    for (var i = 0; i < args.length; i++) {
        toReturn[argumentNames[i]] = args[i];
    }
    return toReturn;
}
exports.mapArgumentsValues = mapArgumentsValues;
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
//# sourceMappingURL=reflection.js.map