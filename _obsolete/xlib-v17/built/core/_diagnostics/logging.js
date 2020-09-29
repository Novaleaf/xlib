"use strict";
// tslint:disable:no-console
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const environment = tslib_1.__importStar(require("../environment"));
const stringHelper = tslib_1.__importStar(require("../_util/stringhelper"));
const serialization = tslib_1.__importStar(require("../serialization"));
const _ = tslib_1.__importStar(require("lodash"));
//import moment = require( "moment" );
//import * as luxon from "luxon";
const diagnostics = tslib_1.__importStar(require("../diagnostics"));
const exception = tslib_1.__importStar(require("./exception"));
const environment_1 = require("../environment");
const util = tslib_1.__importStar(require("util"));
/** coloring for node console */
const chalk_1 = tslib_1.__importDefault(require("chalk"));
//import * as stripAnsi from "strip-ansi";
const stripAnsi = require("strip-ansi");
/**
 * helper to convert ansi color codes to string representations.    conversions taken from https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
 * @param input color code input.
 */
function colorCodeToString(input, currentColor) {
    let defaultColor = { foreground: "grey", background: "black", bold: false, highIntensity: false, };
    let result = _.clone(defaultColor);
    if (currentColor != null) {
        result = _.clone(currentColor);
    }
    input = input.trim();
    if (input.indexOf("[") === 0) {
        input = input.substring(1);
    }
    if (input.indexOf("m") > 0) {
        input = input.substring(0, input.length - 1);
    }
    let sections = input.split(";");
    for (let i = 0; i < sections.length; i++) {
        let num = parseInt(sections[i]);
        //color names from http://www.w3schools.com/cssref/css_colornames.asp
        switch (num) {
            case 0: //reset
            case 27: //positive
                result = _.clone(defaultColor);
                break;
            case 1:
                //bold
                result.bold = true;
                break;
            case 2: //faint
            case 21: //bold off
            case 22: //normal intensity
                result.bold = false;
                break;
            case 7: //swap
                let tmp = result.foreground;
                result.foreground = result.background;
                result.background = tmp;
                break;
            case 30:
                result.foreground = "black";
                break;
            case 31:
                result.foreground = "red";
                break;
            case 32:
                result.foreground = "green";
                break;
            case 33:
                result.foreground = "darkyellow";
                break;
            case 34:
                result.foreground = "darkblue";
                break;
            case 35:
                result.foreground = "magenta";
                break;
            case 36:
                result.foreground = "darkturquoise"; //darkcyan
                break;
            case 37:
                result.foreground = "lightgrey";
                break;
            case 39:
                result.foreground = defaultColor.foreground;
                break;
            case 40:
                result.background = "black";
                break;
            case 41:
                result.background = "darkred";
                break;
            case 42:
                result.background = "green";
                break;
            case 43:
                result.background = "yellow";
                break;
            case 44:
                result.background = "blue";
                break;
            case 45:
                result.background = "magenta";
                break;
            case 46:
                result.background = "cyan";
                break;
            case 47:
                result.background = "white";
                break;
            case 49:
                result.background = defaultColor.background;
                break;
            case 90:
                result.foreground = "lightgrey";
                break;
            case 91:
                result.foreground = "hotpink";
                break;
            case 92:
                result.foreground = "lightgreen";
                break;
            case 93:
                result.foreground = "yellow";
                break;
            case 94:
                result.foreground = "blue";
                break;
            case 95:
                result.foreground = "fuchsia";
                break;
            case 96:
                result.foreground = "cyan";
                break;
            case 97:
                result.foreground = "white";
                break;
            case 100:
                result.background = "lightgrey";
                break;
            case 101:
                result.background = "hotpink";
                break;
            case 102:
                result.background = "lightgreen";
                break;
            case 103:
                result.background = "yellow";
                break;
            case 104:
                result.background = "blue";
                break;
            case 105:
                result.background = "fuchsia";
                break;
            case 106:
                result.background = "cyan";
                break;
            case 107:
                result.background = "white";
                break;
            default:
                throw new exception.XlibException("colorCodeToString() unknown color " + input);
            //no action (do not set anything)
        }
    }
    return result;
}
class LogThrowException extends exception.Exception {
    constructor(message, logOutput, options) {
        super(message, options);
        this.logOutput = logOutput;
    }
}
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
class Logger {
    constructor() {
        //bind all functions so that "this" functions properly.
        const _this = this;
        for (const propName of Object.getOwnPropertyNames(Object.getPrototypeOf(_this))) {
            if (typeof _this[propName] === "function") {
                _this[propName] = _this[propName].bind(_this);
            }
        }
    }
    // /** helper to terminate promise chains (no floating promises).  This way if the promise fails the error gets logged, and doesn't cause a unhandled promise error.
    // how to use:   ```yourPromise.catch(log.promiseCatch)
    // */
    // public promiseCatch( ...args: any[] ): void {
    // 	this.error( ...args );
    // }
    // public promiseCatchFull( ...args: any[] ): void {
    // 	this.errorFull( ...args );
    // }
    /** override the loglevel for specific, focused debugging.     */
    static overrideLogLevel(
    /** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
* if ommitted, will match the caller's fileName  */
    callSiteMatch, 
    /** the minimum logLevel you want to be emitted.
        *
        * ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
        * For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
        This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
     */
    minLevel) {
        if ((typeof minLevel) === "string") {
            minLevel = environment_1.LogLevel[minLevel];
        }
        minLevel = minLevel;
        Logger._overrides.push({ callSiteMatch, minLevel });
    }
    /** invoke this to set a global override for the minimum log level for a given callsite.*/
    overrideLogLevel(
    /** the minimum logLevel you want to be emitted.
        *
        * ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
        * For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
        This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
     */
    minLevel, 
    /** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
        * if ommitted, will match the caller's fileName  */
    callSiteMatch) {
        if (callSiteMatch == null) {
            let callFile = diagnostics.computeCallFile(1);
            callSiteMatch = new RegExp(`.*${stringHelper.escapeRegExp(callFile)}.*`);
        }
        if (typeof (callSiteMatch) === "string") {
            callSiteMatch = new RegExp(callSiteMatch);
        }
        Logger.overrideLogLevel(callSiteMatch, minLevel);
    }
    /** log a message, output will not be auto-truncated to decrease verbosity */
    traceFull(...args) {
        return this._tryLog(environment_1.LogLevel.TRACE, args, true);
    }
    /** log a message, output will not be auto-truncated to decrease verbosity */
    debugFull(...args) {
        return this._tryLog(environment_1.LogLevel.DEBUG, args, true);
    }
    /** log a message, output will not be auto-truncated to decrease verbosity */
    infoFull(...args) {
        return this._tryLog(environment_1.LogLevel.INFO, args, true);
    }
    /** log a message, output will not be auto-truncated to decrease verbosity */
    warnFull(...args) {
        return this._tryLog(environment_1.LogLevel.WARN, args, true);
    }
    /** log a message, output will not be auto-truncated to decrease verbosity */
    errorFull(...args) {
        return this._tryLog(environment_1.LogLevel.ERROR, args, true);
    }
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    trace(...args) {
        return this._tryLog(environment_1.LogLevel.TRACE, args, false);
    }
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    debug(...args) {
        return this._tryLog(environment_1.LogLevel.DEBUG, args, false);
    }
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    info(...args) {
        return this._tryLog(environment_1.LogLevel.INFO, args, false);
    }
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    warn(...args) {
        return this._tryLog(environment_1.LogLevel.WARN, args, false);
    }
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    error(...args) {
        return this._tryLog(environment_1.LogLevel.ERROR, args, false);
    }
    /** log a fatal error that is about to crash your application.   the output of this is never truncated.  (it's always full verbosity) */
    fatal(...args) {
        return this._tryLog(environment_1.LogLevel.FATAL, args, false);
    }
    /** for now, same as log.errorFull().   later will notify via email. */
    hackAttempt(...args) {
        return this.errorFull("hack attempt", ...args);
    }
    /** log an Error and then throw an Exception */
    throw(...args) {
        let results = this._tryLog(environment_1.LogLevel.ERROR, args, false);
        throw new LogThrowException(results.join(", "), results, { stackFramesToTruncate: 1 });
    }
    /** if the testCondition evaluates to false, log an Error and then throw an Exception  */
    throwCheck(testCondition, ...args) {
        if (testCondition === true) {
            return;
        }
        if (testCondition !== false) {
            throw new exception.XlibException("first parameter must be a boolean (to assert must evaluate to true or false)");
        }
        if (args.length === 0) {
            args.push("throwIf testCondition===false.");
        }
        let finalArgs = this._tryLog(environment_1.LogLevel.ERROR, args, false);
        throw new LogThrowException(finalArgs.join(", "), finalArgs, { stackFramesToTruncate: 1 });
    }
    /** if ```testCondition``` succeeds, nothing happens.
     * Otherwise, if running in ```environment.EnvLevel=PROD``` an assert will be raised (no code interuption).
     * If running in a non ```PROD``` environment, a code-interupting ```LogThrowException``` will then be thrown.
     *
     *
     * If you want an exception to always be thrown, use ```throwIf()``` instead.
     *  */
    assert(testCondition, ...args) {
        if (testCondition === true) {
            return;
        }
        if (testCondition !== false) {
            throw new exception.XlibException("first parameter must be a boolean (to assert must evaluate to true or false)");
        }
        if (args.length === 0) {
            args.push("tryAssert testCondition===false.");
        }
        let finalArgs = this._tryLog(environment_1.LogLevel.ASSERT, args, false);
        //on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                console.assert(false, ...finalArgs);
                // finalArgs.unshift( false );
                // console.assert.apply( console, finalArgs );
                //assert(false, finalArgs.join("\n"));
                break;
            case environment.PlatformType.NodeJs:
                console.assert(false, ...finalArgs);
                // console.trace.apply( console, finalArgs );
                // assert( false, finalArgs.join( "\n" ) );
                break;
            default:
                console.assert(false, ...finalArgs);
                // finalArgs.unshift( false );
                // //console.warn.apply(console, finalArgs);
                // console.assert.apply( console, finalArgs );
                break;
        }
        switch (environment.envLevel) {
            case environment.EnvLevel.PROD:
                //noop
                break;
            default:
                throw new LogThrowException(finalArgs.join(", "), finalArgs, { stackFramesToTruncate: 1 });
        }
    }
    // /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    // todo( ...args: Array<any> ) {
    // 	//	var msg = "TODO: " + stringHelper.format2( format, params );
    // 	this.assert( false, ...args );
    // }
    // /** notes to do something later. */
    // todo_later( ...args: Array<any> ) {
    // 	//var msg = "TODO: LATER:" + stringHelper.format2( format, params );
    // 	this.warn( ...args );
    // }
    // deprecated( message?: string ) {
    // 	this.assert( false, "implement deprecated", message );
    // }
    // /** note to redo this before shipping (any time not in #DEBUG mode) */
    // refactor( ...args: Array<any> ) {
    // 	if ( environment.envLevel === environment.EnvLevel.DEV ) {
    // 		this.warn( ...args );
    // 	} else {
    // 		this.fatal( "refactor must be done before production", ...args );
    // 	}
    // 	//this.assert(false, "implement deprecated");
    // }
    /**
     *  allows procedural calls to logging.
        *
        * @returns array of strings representing all logged values.  array element 0 is time, element 1 is callsite, element 2 is logLevel.  passed args are in element 3 onwards.  ```undefined``` is returned if not logged (such as if minLogLevel is greater than requested)
     */
    _tryLog(requestedLogLevel, args, fullOutput, 
    /** if not set, the function **two levels up*** is marked as the callsite.
    if that's not what you want, you can create your callsite, example showing 3 levels up: ```callSite = diagnostics.computeStackTrace( 3, 1 )[ 0 ];``` */
    callSite) {
        if (callSite == null) {
            callSite = diagnostics.computeStackTrace(2, 1)[0];
        }
        if (callSite != null && typeof requestedLogLevel !== "string") {
            let minLogLevel = environment.logLevel;
            //allow runtime adjustment of loglevels (useful for focused debugging)
            Logger._overrides.forEach((pair) => {
                if (pair.callSiteMatch.test(callSite)) {
                    minLogLevel = pair.minLevel;
                }
            });
            if (requestedLogLevel < minLogLevel) {
                return undefined;
            }
        }
        let finalArgs = this._doLog(callSite, requestedLogLevel, args, fullOutput); // this._doLog.apply( this, arguments );
        //strip colors
        finalArgs = finalArgs.map((arg) => stripAnsi.default(arg));
        if (requestedLogLevel >= environment_1.LogLevel.ERROR) {
            //log these for our diagnostics api to pickup:   http://localhost/metrics/v2/healthcheck-errors
            let errorHistoryEntry = finalArgs;
            Logger.errorHistory.unshift(errorHistoryEntry);
            if (Logger.errorHistory.length > Logger.errorHistoryMaxLength) {
                Logger.errorHistory.length = Logger.errorHistoryMaxLength;
            }
        }
        return finalArgs;
    }
    _doLog(callSite, targetLogLevel, args, fullOutput) {
        let logLevelColor;
        switch (targetLogLevel) {
            case environment_1.LogLevel.TRACE:
                logLevelColor = chalk_1.default.black.bgWhite;
                break;
            case environment_1.LogLevel.DEBUG:
                logLevelColor = chalk_1.default.bgGreen;
                break;
            case environment_1.LogLevel.INFO:
                logLevelColor = chalk_1.default.bgCyan;
                break;
            case environment_1.LogLevel.WARN:
                logLevelColor = chalk_1.default.red.bgYellow;
                break;
            case environment_1.LogLevel.ERROR:
                logLevelColor = chalk_1.default.bgMagenta;
                break;
            case environment_1.LogLevel.FATAL:
                logLevelColor = chalk_1.default.bgRed;
                break;
            case environment_1.LogLevel.ASSERT:
                logLevelColor = chalk_1.default.bgYellowBright.black;
                break;
            default:
                logLevelColor = chalk_1.default.inverse.bold;
                throw new exception.XlibException("unknown targetLogLevel");
            //break;
        }
        //pretty trace callsite
        const nameToReport = chalk_1.default.magenta(callSite);
        const finalArgs = [];
        /** add "header" info to the log data */
        finalArgs.unshift(logLevelColor(environment_1.LogLevel[targetLogLevel]));
        //finalArgs.unshift( lineNumberToReport );
        finalArgs.unshift(nameToReport);
        finalArgs.unshift(chalk_1.default.gray(new Date().toISOString()));
        //on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                finalArgs.push(...args); //browser can view args nicely
                switch (targetLogLevel) {
                    case environment_1.LogLevel.TRACE:
                    case environment_1.LogLevel.DEBUG:
                    case environment_1.LogLevel.INFO:
                        console.trace(...finalArgs);
                        break;
                    case environment_1.LogLevel.WARN:
                    case environment_1.LogLevel.ERROR:
                    case environment_1.LogLevel.FATAL:
                    case environment_1.LogLevel.ASSERT:
                        console.error(...finalArgs);
                        break;
                    default:
                        throw new exception.XlibException("unknown targetLogLevel");
                    //break;
                }
                break;
            //on node, we use only show stacktrace for explicit trace call or errors.
            case environment.PlatformType.NodeJs:
            default:
                //node console needs help displaying nicely
                if (fullOutput) {
                    finalArgs.push(...args.map((arg) => util.inspect(serialization.jsonX.inspectParse(arg, { maxDepth: Infinity, aggrigateFunctions: true, summarizeLength: Infinity, maxArrayElements: Infinity }), { colors: true, showHidden: true, depth: Infinity, maxArrayLength: Infinity, breakLength: 300 })));
                }
                else {
                    finalArgs.push(...args.map((arg) => util.inspect(serialization.jsonX.inspectParse(arg, { maxDepth: 2, aggrigateFunctions: true, summarizeLength: 300 }), { colors: true, showHidden: true, depth: Infinity, maxArrayLength: Infinity, breakLength: 200 })));
                }
                switch (targetLogLevel) {
                    case environment_1.LogLevel.TRACE:
                    case environment_1.LogLevel.DEBUG:
                    case environment_1.LogLevel.INFO:
                        console.log(...finalArgs);
                        break;
                    case environment_1.LogLevel.WARN:
                        console.warn(...finalArgs);
                        break;
                    case environment_1.LogLevel.ERROR:
                    case environment_1.LogLevel.FATAL:
                    case environment_1.LogLevel.ASSERT:
                        console.error(...finalArgs);
                        break;
                    default:
                        throw new exception.XlibException("unknown targetLogLevel");
                    //break;
                }
                break;
        }
        return finalArgs;
    }
}
/** storage of  env.logLevelOverrides  for filtering log requests .  added to  by the .initialize() static method and log._overrideLogLevel() method */
Logger._overrides = [];
Logger.errorHistoryMaxLength = 200;
/** storage of errors encountered, for diagnostics reporting */
Logger.errorHistory = [];
exports.Logger = Logger;
/** initialzie upon import */
function _self_initialize() {
    /** helper for applying env.logLevelOverrides */
    function _populateLogLevelOverridesFromEnvVars() {
        const envVar = environment.getEnvironmentVariable("logLevelOverrides", null);
        if (envVar == null || envVar.length === 0) {
            return;
        }
        try {
            let parsedData = serialization.jsonX.parse(envVar);
            if (_.isPlainObject(parsedData) === false) {
                throw new Error(`unable to parse.  must be in format ' { [ key: string ]: string }' `);
            }
            _.forIn(parsedData, (value, key) => {
                const callSiteMatch = new RegExp(key);
                const minLevel = value;
                Logger.overrideLogLevel(callSiteMatch, minLevel);
            });
        }
        catch (_ex) {
            throw new exception.Exception(`unable to parse environment logLevelOverrides. you passed: ${envVar}`, { innerError: exception.toError(_ex) });
        }
    }
    _populateLogLevelOverridesFromEnvVars();
    //noop log levels too low  for better performance
    // tslint:disable-next-line: no-empty
    const noopFcn = (() => { });
    switch (environment.logLevel) {
        case environment_1.LogLevel.ASSERT:
            Logger.prototype.fatal = noopFcn;
            Logger.prototype.error = noopFcn;
            Logger.prototype.errorFull = noopFcn;
            Logger.prototype.warn = noopFcn;
            Logger.prototype.warnFull = noopFcn;
            Logger.prototype.info = noopFcn;
            Logger.prototype.infoFull = noopFcn;
            Logger.prototype.debug = noopFcn;
            Logger.prototype.debugFull = noopFcn;
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.FATAL:
            Logger.prototype.error = noopFcn;
            Logger.prototype.errorFull = noopFcn;
            Logger.prototype.warn = noopFcn;
            Logger.prototype.warnFull = noopFcn;
            Logger.prototype.info = noopFcn;
            Logger.prototype.infoFull = noopFcn;
            Logger.prototype.debug = noopFcn;
            Logger.prototype.debugFull = noopFcn;
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.ERROR:
            Logger.prototype.warn = noopFcn;
            Logger.prototype.warnFull = noopFcn;
            Logger.prototype.info = noopFcn;
            Logger.prototype.infoFull = noopFcn;
            Logger.prototype.debug = noopFcn;
            Logger.prototype.debugFull = noopFcn;
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.WARN:
            Logger.prototype.info = noopFcn;
            Logger.prototype.infoFull = noopFcn;
            Logger.prototype.debug = noopFcn;
            Logger.prototype.debugFull = noopFcn;
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.INFO:
            Logger.prototype.debug = noopFcn;
            Logger.prototype.debugFull = noopFcn;
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.DEBUG:
            Logger.prototype.trace = noopFcn;
            Logger.prototype.traceFull = noopFcn;
            break;
        case environment_1.LogLevel.TRACE:
            break;
    }
}
_self_initialize();
//# sourceMappingURL=logging.js.map