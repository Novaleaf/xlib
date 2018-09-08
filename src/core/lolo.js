"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const _numHelper = require("./numhelper");
const _jsHelper = require("./jshelper");
const serialization = require("./serialization");
exports.JSONX = serialization.JSONX;
const validation = require("./validation");
exports.scrub = validation.scrub;
exports.defaultIfNull = _jsHelper.defaultIfNull;
const _exception = require("./exception");
exports.Exception = _exception.Exception;
/** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
 * useful for returning a stack at the current location.
 * also see ```.castErr()``` for another useful Error method.
 */
exports.wrapErr = _exception.Exception.wrapErr;
/** convert a string to Error object, or return existing Error object.
 * useful for ```try{}catch(ex){}``` statements
*/
exports.castErr = _exception.Exception.castErr;
exports.moment = require("moment");
function utcNow() {
    return exports.moment.utc().toDate();
}
exports.utcNow = utcNow;
function utcNowMoment() {
    return exports.moment.utc();
}
exports.utcNowMoment = utcNowMoment;
function utcNowTimestamp() {
    return exports.moment.utc().toDate().getTime();
}
exports.utcNowTimestamp = utcNowTimestamp;
const _cache = require("./cache");
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
exports.cache = _cache.defaultCache.read.bind(_cache.defaultCache);
///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;
const environment = require("./environment");
const xlib_1 = require("../xlib");
// public get value() : string {
//     return 
// }
exports.env = environment.env;
// {
//     /**
//      *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
//      */
//     get isDev() { return environment.envLevel <= environment.EnvLevel.DEV; },
//     /**
//      *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
//      */
//     get isTest() { return environment.testLevel === environment.TestLevel.FULL; },
//     /**
//      *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
//      */
//     get isTrace() { return environment.logLevel <= environment.LogLevel.TRACE; },
//     /**
//      *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
//      */
//     get isDebug() { return environment.logLevel <= environment.LogLevel.DEBUG; },
//     /**
//      *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
//      */
//     get isProd() { return environment.envLevel === environment.EnvLevel.PROD; },
// }
exports.format = _numHelper.format;
//with the key+value for primitive properties, key+[Array:len] for arrays, and key+[typeName] for objects 
/** debug inspection helper. outputs JSON  */
function inspect(obj, 
/** meaning only the key+values of the given object will be shown, no children.  @default 1*/ maxDepth = 1, 
/** maximum array elements you want to display for each array.  @default 20 */ maxArrayElements = 20, 
/** when we reach maxDepth, the length we summarize the values to.  @default 100 */ summarizeLength = 100) {
    maxDepth--;
    if (maxDepth < 0 || _.isObject(obj) === false) {
        try {
            let value = obj;
            let str;
            if (value === null) {
                return "[NULL]";
            }
            if (value === undefined) {
                return "[UNDEFINED]";
            }
            if (value.toString != null) {
                str = "=" + xlib_1.stringHelper.summarize(value.toString(), summarizeLength);
            }
            //time to stop, output the value of obj
            if (_.isArray(value)) {
                return `[ARRAY:${value.length}]${str}`;
            }
            else if (_.isPlainObject(value)) {
                return `[POJO]${str}`;
            }
            else if (_.isObject(value)) {
                if (value.constructor != null && value.constructor.name != null) {
                    return `[${value.constructor.name}]${str}`;
                }
                else {
                    return `[${typeof (value)}]${str}`;
                }
            }
            else {
                //value is going to be a primitive
                if (typeof (value) === "string") {
                    return xlib_1.stringHelper.summarize(value, summarizeLength);
                }
                return value;
            }
        }
        catch (ex) {
            return `*ERROR PARSING* ${xlib_1.stringHelper.summarize(ex.message, summarizeLength)}`;
        }
    }
    //not at max depth, so operate on object or array
    if (_.isArray(obj) === true) {
        let toReturn = [];
        for (let i = 0; i < obj.length && i < maxArrayElements; i++) {
            toReturn.push(inspect(obj[i], maxDepth, maxArrayElements, summarizeLength));
        }
        if (obj.length > maxArrayElements) {
            toReturn.push(`*maxArrayElements reached.  len=${obj.length}*`);
        }
        return toReturn;
    }
    else {
        let toReturn = {};
        _.forIn(obj, (value, key) => {
            toReturn[key] = inspect(value, maxDepth);
            // try {
            //     toReturn[ key ] =
            //     if ( _.isArray( value ) ) {
            //         toReturn[ key ] = `[Array:${ value.length }]`;
            //     } else if ( _.isPlainObject( value ) ) {
            //         toReturn[ key ] = `[POJO]`;
            //     } else if ( _.isObject( value ) ) {
            //         if ( value.constructor != null && value.constructor.name != null ) {
            //             toReturn[ key ] = `[${ value.constructor.name }]`;
            //         } else {
            //             toReturn[ key ] = `[${ typeof ( value ) }]`;
            //         }
            //     } else {
            //         toReturn[ key ] = value;
            //     }
            // } catch ( ex ) {
            //     toReturn[ key ] = `*ERROR PARSING* ${ex.message}`;
            // }
        });
        return toReturn;
    }
}
exports.inspect = inspect;
//# sourceMappingURL=lolo.js.map