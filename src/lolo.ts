"use strict";

import _stringHelper = require("./stringhelper");
import _numHelper = require("./numhelper");
import _arrayHelper = require("./arrayhelper");
import _jsHelper = require("./jshelper");

import serialization = require("./serialization");
export var JSONX = serialization.JSONX;

import validation = require("./validation");
export var scrub = validation.scrub;

import Promise = require("bluebird");

export var defaultIfNull = _jsHelper.defaultIfNull;

import _exception = require("./exception");
export var Exception = _exception.Exception;

export import moment = require("moment");

export function utcNow(): Date {
    return moment.utc().toDate();
}
export function utcNowMoment() {
    return moment.utc();
}

export function utcNowTimestamp(): number {
    return moment.utc().toDate().getTime();
}
import _cache = require("./cache");
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export var cache = _cache.defaultCache.read.bind(_cache.defaultCache) as typeof _cache.defaultCache.read;


///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;

import environment = require("./environment");
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

export var formatNum = _numHelper.format;

//export var apply = _jsHelper.apply;

export import apply = _jsHelper.apply;

