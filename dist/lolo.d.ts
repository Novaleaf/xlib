/// <reference types="bluebird" />
import _numHelper = require("./numhelper");
import _jsHelper = require("./jshelper");
import serialization = require("./serialization");
export declare var JSONX: serialization.JsonX;
import validation = require("./validation");
export declare var scrub: typeof validation.scrub;
import Promise = require("bluebird");
export declare var defaultIfNull: typeof _jsHelper.defaultIfNull;
import _exception = require("./exception");
export declare var Exception: typeof _exception.Exception;
export import moment = require("moment");
export declare function utcNow(): Date;
export declare function utcNowMoment(): moment.Moment;
export declare function utcNowTimestamp(): number;
import _cache = require("./cache");
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export declare var cache: <TValue>(key: string, fetchFunction: () => Promise<TValue>, options?: _cache.ICacheOptions | undefined) => Promise<TValue>;
/**
 *   shortcut for ```environment.isDev```
 */
export declare var isDevCodeEnabled: boolean;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export declare var isTestCodeEnabled: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export declare var isLogTrace: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export declare var isLogDebug: boolean;
export declare var format: typeof _numHelper.format;
