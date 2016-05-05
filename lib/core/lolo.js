"use strict";
var _numHelper = require("./numhelper");
var _jsHelper = require("./jshelper");
var serialization = require("./serialization");
exports.JSONX = serialization.JSONX;
var validation = require("./validation");
exports.scrub = validation.scrub;
exports.defaultIfNull = _jsHelper.defaultIfNull;
var _exception = require("./exception");
exports.Exception = _exception.Exception;
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
var _cache = require("./cache");
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
var environment = require("./environment");
/**
 *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
 */
exports.isDev = environment.envLevel <= environment.EnvLevel.DEV;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
exports.isTest = environment.testLevel === environment.TestLevel.FULL;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
exports.isTrace = environment.logLevel <= environment.LogLevel.TRACE;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
exports.isDebug = environment.logLevel <= environment.LogLevel.DEBUG;
/**
 *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
 */
exports.isProd = environment.envLevel === environment.EnvLevel.PROD;
exports.format = _numHelper.format;
//# sourceMappingURL=lolo.js.map