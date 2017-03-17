"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numHelper = require("./numhelper");
var _jsHelper = require("./jshelper");
var serialization = require("./serialization");
exports.JSONX = serialization.JSONX;
//export { serialization.JSONX as JSONX };
var validation = require("./validation");
exports.scrub = validation.scrub;
exports.defaultIfNull = _jsHelper.defaultIfNull;
//export { _jsHelper.defaultIfNull as defaultIfNull };
exports.defaultIfThrow = _jsHelper.defaultIfThrow;
var _exception = require("./exception");
exports.Exception = _exception.Exception;
//export { _exception.Exception as Exception };
var moment = require("moment");
exports.moment = moment;
var _ = require("lodash");
function utcNow() {
    return moment.utc().toDate();
}
exports.utcNow = utcNow;
function utcNowMoment() {
    return moment.utc();
}
exports.utcNowMoment = utcNowMoment;
function utcNowTimestamp() {
    return moment.utc().toDate().getTime();
}
exports.utcNowTimestamp = utcNowTimestamp;
//import _cache = require("./cache");
var _cache = require("./cache");
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
exports.cache = _cache.defaultCache.read.bind(_cache.defaultCache);
//export { _cache.defaultCache.read.bind(_cache.defaultCache) as cache};
///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;
var environment = require("./environment");
/**
 *   shortcut for ```environment.isDev```
 */
exports.isDevCodeEnabled = environment.isDev;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
exports.isTestCodeEnabled = environment.isTest;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
exports.isLogTrace = environment.logLevel <= environment.LogLevel.TRACE;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
exports.isLogDebug = environment.logLevel <= environment.LogLevel.DEBUG;
///**
// *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
// */
//export var isProd = environment.envLevel === environment.EnvLevel.PROD;
exports.formatNum = numHelper.format;
//export var apply = _jsHelper.apply;
exports.apply = _jsHelper.apply;
/** same as lodash, we just fix lodash.d.ts type signature problems */
exports.forEachArray = _.forEach;
exports.forEach = _.forEach;
exports.forEachRight = _.forEachRight;
exports.forIn = _.forIn;
exports.forInRight = _.forInRight;
exports.forOwn = _.forOwn;
exports.forOwnRight = _.forOwnRight;
/** filter out items where false is returned */
exports.filter = _.filter;
/** convert an object collection into an array, using a filter.   return false to reject the element */
function filterValues(collection, enumerator) {
    // export function filterValues<TValue>( collection: { [ id: number ]: TValue }, enumerator: ( value: TValue, id: number, collection: { [ id: number ]: TValue }) => boolean ): TValue[];
    // export function filterValues<TValue>( collection: { [ key: string ]: TValue }, enumerator: ( value: TValue, key: string, collection: { [ key: string ]: TValue }) => boolean ): TValue[];
    // export function filterValues<TValue>( collection: any, enumerator: ( value: TValue, key: string | number, collection: any ) => boolean ): TValue[] {
    var toReturn = [];
    exports.forEach(collection, function (val, idOrKey) {
        if (enumerator(val, idOrKey, collection) !== false) {
            toReturn.push(val);
        }
    });
    return toReturn;
}
exports.filterValues = filterValues;
//export let defaults:<T>()=>T = _.def
/** bind a function to an object, preserving it's input parameters */
function bind(fcn, thisArg) {
    return fcn.bind(thisArg);
}
exports.bind = bind;
//# sourceMappingURL=lolo.js.map