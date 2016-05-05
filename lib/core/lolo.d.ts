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
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export declare var cache: <TValue>(key: string, fetchFunction: () => Promise<TValue>, options?: {
    fetchExpiresAmount?: number;
    fetchExpiresUnits?: string;
    awaitNewOnExpired?: boolean;
    awaitNewOnExpiredThreshhold?: moment.Duration;
    noClone?: boolean;
    shallowClone?: boolean;
    gcAfterMultipler?: number;
}) => Promise<TValue>;
/**
 *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
 */
export declare var isDev: boolean;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export declare var isTest: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export declare var isTrace: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export declare var isDebug: boolean;
/**
 *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
 */
export declare var isProd: boolean;
export declare var format: typeof _numHelper.format;
