"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeHelper = require("../node/nodehelper");
const browserHelper = require("../browser/browserhelper");
/** allow splitting up our init work near where it's asssociated variables are.   all are run by the exported .initialize() method */
const _internalInitWork = [];
var PlatformType;
(function (PlatformType) {
    PlatformType[PlatformType["None"] = 0] = "None";
    PlatformType[PlatformType["Browser"] = 1] = "Browser";
    PlatformType[PlatformType["NodeJs"] = 2] = "NodeJs";
    PlatformType[PlatformType["PhantomJs"] = 3] = "PhantomJs";
    PlatformType[PlatformType["Unknown"] = 4] = "Unknown";
})(PlatformType = exports.PlatformType || (exports.PlatformType = {}));
////declare var module; //not defined when using the requirejs loader :(, so we have to look for GLOBAL only.
///** global var if we are running under nodejs*/
//declare var GLOBAL: any;
/** info on the type of platform we are currently executing under */
exports.platformType = function () {
    if (typeof (phantom) !== "undefined") {
        return PlatformType.PhantomJs;
    }
    if (typeof (window) !== "undefined") {
        return PlatformType.Browser;
    }
    if ( //typeof (module) !== 'undefined' && (<any>module).exports &&
    typeof (global) !== "undefined") {
        return PlatformType.NodeJs;
    }
    return PlatformType.Unknown;
}();
var OsName;
(function (OsName) {
    OsName[OsName["unknown"] = 0] = "unknown";
    /** mac */
    OsName[OsName["darwin"] = 1] = "darwin";
    OsName[OsName["freebsd"] = 2] = "freebsd";
    OsName[OsName["linux"] = 3] = "linux";
    OsName[OsName["sunos"] = 4] = "sunos";
    /** windows (may be x64) */
    OsName[OsName["win32"] = 5] = "win32";
    OsName[OsName["unix"] = 6] = "unix";
})(OsName = exports.OsName || (exports.OsName = {}));
_internalInitWork.push((args) => {
    exports.osName = (() => {
        if (typeof (process) !== "undefined") {
            return OsName[process.platform];
        }
        try {
            if (navigator.appVersion.indexOf("Win") !== -1) {
                return OsName.win32;
            }
            if (navigator.appVersion.indexOf("Mac") !== -1) {
                return OsName.darwin;
            }
            if (navigator.appVersion.indexOf("X11") !== -1) {
                return OsName.unix;
            }
            if (navigator.appVersion.indexOf("Linux") !== -1) {
                return OsName.linux;
            }
        }
        catch (ex) { }
        return OsName.unknown;
    })();
});
/** returns the current global object.
        depending on platform, this is:
        window (browser, phantomjs);
        GLOBAL (nodejs) */
function getGlobal() {
    switch (exports.platformType) {
        case PlatformType.PhantomJs:
        case PlatformType.Browser:
            return window;
        case PlatformType.NodeJs:
            return global;
        case PlatformType.None:
            return null;
        case PlatformType.Unknown:
            throw new Error("Unknown platform.  do not know what object is global");
    }
}
exports.getGlobal = getGlobal;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 10] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 20] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 30] = "INFO";
    LogLevel[LogLevel["WARN"] = 40] = "WARN";
    LogLevel[LogLevel["ERROR"] = 50] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 60] = "FATAL";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
_internalInitWork.push((args) => {
    if (args.logLevel != null) {
        exports.logLevel = args.logLevel;
    }
    else {
        exports.logLevel = LogLevel[getEnvironmentVariable("logLevel", null)];
    }
    if (exports.logLevel == null) {
        exports.logLevel = LogLevel.TRACE;
        if (args.suppressStartupMessage != true) {
            console.info("logLevel varible is not set.  \n\tdefaulting to logLevel=TRACE.");
            console.info("\tPossible values are TRACE, DEBUG, INFO, WARN, ERROR, FATAL.");
            console.info("\tHow to modify: ");
            console.info("\t\tnodejs: set by running 'node entrypoint.js logLevel=DEBUG' or by setting your systemenv var: logLevel=DEBUG");
            console.info("\t\tbrowser: set by adding 'logLevel= DEBUG' in your querystring, add a cookie, or as a attribute of your html tag");
            console.info("\tHow to OVERRIDE: ");
            console.info("\tpass the 'logLevelOverrides' envVar, for example: logLevelOverrides=[{'.*connection':'WARN'} ");
        }
    }
    else {
        if (args.suppressStartupMessage != true) {
            console.info("logLevel=" + LogLevel[exports.logLevel]);
        }
    }
});
// export var isDebugBreakEnabled: boolean = ( () => {
// 	if ( logLevel <= LogLevel.DEBUG && global.v8debug != null ) {
// 		global.v8debug.Debug.setBreakOnException();
// 		return true;
// 	}
// 	return false;
// } )();
var EnvLevel;
(function (EnvLevel) {
    EnvLevel[EnvLevel["DEV"] = 10] = "DEV";
    //TEST = 20,
    //PREPROD = 30,
    EnvLevel[EnvLevel["PROD"] = 40] = "PROD";
})(EnvLevel = exports.EnvLevel || (exports.EnvLevel = {}));
_internalInitWork.push((args) => {
    if (args.envLevel != null) {
        exports.envLevel = args.envLevel;
    }
    else {
        exports.envLevel = EnvLevel[getEnvironmentVariable("envLevel", null)];
    }
    if (exports.envLevel == null) {
        exports.envLevel = EnvLevel.DEV;
        if (args.suppressStartupMessage != true) {
            console.info("envLevel varible is not set.  \n\tdefaulting to envLevel=DEV.");
            console.info("\tPossible values are DEV, PROD.");
            console.info("\tHow to modify: ");
            console.info("\t\tnodejs: set by running 'node entrypoint.js envLevel=PROD' or by setting your systemenv var: envLevel=PROD");
            console.info("\t\tbrowser: set by adding 'envLevel=PROD' in your querystring, add a cookie, or as a attribute of your html tag");
        }
    }
    else {
        if (args.suppressStartupMessage != true) {
            console.info("envLevel=" + EnvLevel[exports.envLevel]);
        }
    }
});
var TestLevel;
(function (TestLevel) {
    TestLevel[TestLevel["NONE"] = 0] = "NONE";
    //TEST = 20,
    //PREPROD = 30,
    TestLevel[TestLevel["FULL"] = 40] = "FULL";
})(TestLevel = exports.TestLevel || (exports.TestLevel = {}));
_internalInitWork.push((args) => {
    if (args.testLevel != null) {
        exports.testLevel = args.testLevel;
    }
    else {
        exports.testLevel = TestLevel[getEnvironmentVariable("testLevel", null)];
    }
    if (exports.testLevel == null) {
        exports.testLevel = TestLevel.FULL;
        if (args.suppressStartupMessage != true) {
            console.info("testLevel varible is not set.  \n\tdefaulting to testLevel=FULL.");
            console.info("\tPossible values are NONE, FULL.");
            console.info("\tHow to modify: ");
            console.info("\t\tnodejs: set by running 'node entrypoint.js testLevel=FULL' or by setting your systemenv var: testLevel=FULL");
            console.info("\t\tbrowser: set by adding 'testLevel=FULL' in your querystring, add a cookie, or as a attribute of your html tag");
        }
    }
    else {
        if (args.suppressStartupMessage != true) {
            console.info("testLevel=" + TestLevel[exports.testLevel]);
        }
    }
});
exports.env = {
    /**
        *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
        */
    get isDev() { return exports.envLevel <= EnvLevel.DEV; },
    /**
        *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
        */
    get isTest() { return exports.testLevel === TestLevel.FULL; },
    /**
        *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
        */
    get isTrace() { return exports.logLevel <= LogLevel.TRACE; },
    /**
        *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
        */
    get isDebug() { return exports.logLevel <= LogLevel.DEBUG; },
    /**
        *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
        */
    get isProd() { return exports.envLevel === EnvLevel.PROD; },
};
/** no op the input function if not running LogLevel <= DEBUG.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
function _ifDebug(fcn) {
    if (exports.logLevel <= LogLevel.DEBUG) {
        return fcn;
    }
    else {
        //no op
        /* tslint:disable */
        return () => { };
        /* tslint:enable */
    }
}
exports._ifDebug = _ifDebug;
/** no op the input function if not running in test mode.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
function _ifTest(fcn) {
    if (exports.testLevel >= TestLevel.FULL) {
        return fcn;
    }
    else {
        //no op
        /* tslint:disable */
        return () => { };
        /* tslint:enable */
    }
}
exports._ifTest = _ifTest;
/** read an "environment variable".
nodejs / phantomjs: reads from commandline switches (prefered) or system environment variables.
browser:  reads from querystring (prefered), or cookie, or <html data-key> attribute (least prefered).
 */
function getEnvironmentVariable(key, valueIfNullOrEmpty) {
    var result;
    switch (exports.platformType) {
        case PlatformType.Browser:
            //try to find in querystring
            result = browserHelper.getQuerystringVariable(key, null);
            if (result != null && result.length > 0) {
                break;
            }
            //try to find in cookie
            result = browserHelper.getCookie(key, null);
            if (result != null && result.length > 0) {
                break;
            }
            //try to find in html attribute
            result = browserHelper.getDomAttribute("html", "data-" + key, true);
            if (result != null && result.length > 0) {
                break;
            }
            result = browserHelper.getDomAttribute("html", key, true);
            if (result != null && result.length > 0) {
                break;
            }
            break;
        case PlatformType.NodeJs:
        case PlatformType.PhantomJs:
            //seach commandline
            result = nodeHelper.getCommandlineArg(key, null);
            if (result != null && result.length > 0) {
                break;
            }
            //search system env vars
            result = process.env[key];
            if (result != null && result.length > 0) {
                break;
            }
            break;
        default:
            throw new Error("unsupported plaform type: " + exports.platformType.toString());
    }
    //have our result (including if it's null/empty)
    if (valueIfNullOrEmpty == null) {
        return result;
    }
    if (result == null || result.length === 0) {
        return valueIfNullOrEmpty;
    }
    return result;
}
exports.getEnvironmentVariable = getEnvironmentVariable;
/** reads in various environmental and process details and make it easily usable by devs */
function initialize(args) {
    _internalInitWork.forEach((fcn) => { fcn(args); });
}
exports.initialize = initialize;
//# sourceMappingURL=environment.js.map