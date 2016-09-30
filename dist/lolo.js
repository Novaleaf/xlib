"use strict";
import * as numHelper from "./numhelper";
import * as _jsHelper from "./jshelper";
import * as serialization from "./serialization";
export var JSONX = serialization.JSONX;
import * as validation from "./validation";
export var scrub = validation.scrub;
export var defaultIfNull = _jsHelper.defaultIfNull;
import * as _exception from "./exception";
export var Exception = _exception.Exception;
import * as moment from "moment";
export { moment };
export function utcNow() {
    return moment.utc().toDate();
}
export function utcNowMoment() {
    return moment.utc();
}
export function utcNowTimestamp() {
    return moment.utc().toDate().getTime();
}
import * as _cache from "./cache";
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export var cache = _cache.defaultCache.read.bind(_cache.defaultCache);
import * as environment from "./environment";
/**
 *   shortcut for ```environment.isDev```
 */
export var isDevCodeEnabled = environment.isDev;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export var isTestCodeEnabled = environment.isTest;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export var isLogTrace = environment.logLevel <= environment.LogLevel.TRACE;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export var isLogDebug = environment.logLevel <= environment.LogLevel.DEBUG;
///**
// *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
// */
//export var isProd = environment.envLevel === environment.EnvLevel.PROD;
export var formatNum = numHelper.format;
//export var apply = _jsHelper.apply;
export var apply = _jsHelper.apply;
/** fixes lodash.d.ts type signature problems */
export var forEach = _.forEach;
export var forEachRight = _.forEachRight;
export var forIn = _.forIn;
export var forInRight = _.forInRight;
export var forOwn = _.forOwn;
export var forOwnRight = _.forOwnRight;
//# sourceMappingURL=lolo.js.map