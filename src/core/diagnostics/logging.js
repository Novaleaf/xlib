///// <reference path="../../../typings/all.d.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//export import bunyan = require("bunyan");
const ex = require("../exception");
const environment = require("../environment");
const stringHelper = require("../stringhelper");
const serialization = require("../serialization");
const reflection = require("../reflection");
//import PrettyStream = require("bunyan-prettystream");
const _ = require("lodash");
const moment = require("moment");
var Exception = ex.Exception;
class LoggerFatalException extends Exception {
}
/** coloring for node console */
const Chalk = require("chalk");
/**
 * helper to convert ansi color codes to string representations.    conversions taken from https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
 * @param input
 */
function colorCodeToString(input, currentColor) {
    var defaultColor = { foreground: "grey", background: "black", bold: false, highIntensity: false, };
    var result = _.clone(defaultColor);
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
    var sections = input.split(";");
    for (let i = 0; i < sections.length; i++) {
        var num = parseInt(sections[i]);
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
                var tmp = result.foreground;
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
                if (environment.logLevel <= environment.LogLevel.DEBUG) {
                    throw new LoggerFatalException("colorCodeToString() unknown color " + input);
                }
            //no action (do not set anything)
        }
    }
    return result;
}
//export class NewLogger {
//    constructor(public name: string, public logLevel = environment.logLevel) {
//    }
//    private _log(targetLogLevel: environment.LogLevel, ...args: any[]) {
//        if (targetLogLevel < this.logLevel) {
//            return;
//        }
//    }
//}
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
class Logger {
    constructor(name, logLevel = environment.logLevel) {
        this.name = name;
        this.logLevel = logLevel;
    }
    /** override the loglevel for specific, focused debugging.   */
    static overrideLogLevel(namePattern, newLogLevel) {
        Logger._overriddenStorage.push({ namePattern, newLogLevel });
    }
    /** helper for applying env.logLevelOverrides */
    static __overridenStorageHelper_parseEnv() {
        const envVar = environment.getEnvironmentVariable("logLevelOverrides", null);
        if (envVar == null || envVar.length === 0) {
            return [];
        }
        try {
            let parsedData = serialization.JSONX.parse(envVar);
            if (_.isPlainObject(parsedData) === false) {
                throw new Error(`unable to parse.  must be in format ' { [ key: string ]: string }' `);
            }
            let toReturn = [];
            _.forIn(parsedData, (value, key) => {
                toReturn.push({ namePattern: new RegExp(key), newLogLevel: environment.LogLevel[value] });
            });
            return toReturn;
        }
        catch (_ex) {
            throw new ex.Exception(`unable to parse environment logLevelOverrides. you passed: ${envVar}`, { innerException: ex.Exception.castErr(_ex) });
        }
    }
    /** converts objects to strings, leaves primitive types intact */
    _normalizeArgs(args) {
        //generate log string
        var finalArgs = [];
        _.forEach(args, (arg) => {
            var typeName = reflection.getTypeName(arg);
            var type = reflection.getType(arg);
            switch (type) {
                case reflection.Type.Error:
                    var objArg;
                    try {
                        objArg = (serialization.JSONX.inspectStringify(arg, 3, false, true, undefined, undefined, "\t"));
                        //finalArgs.push(JSON.stringify(arg,undefined,"\t"));
                    }
                    catch (ex) {
                        objArg = ("[Object???]");
                    }
                    finalArgs.push(Chalk.red.bold(objArg));
                    break;
                case reflection.Type.object:
                    var objArg;
                    try {
                        objArg = (serialization.JSONX.inspectStringify(arg, 3, false, false, undefined, undefined, "\t"));
                        //finalArgs.push(JSON.stringify(arg,undefined,"\t"));
                    }
                    catch (ex) {
                        objArg = ("[Object???]");
                    }
                    finalArgs.push(Chalk.green.bold(objArg));
                    break;
                default:
                    finalArgs.push(arg);
            }
        });
        return finalArgs;
    }
    /**
     *  returns arguments formatted for console.log use
     * @param targetLogLevel
     * @param args
     */
    _log(targetLogLevel, args) {
        let minimumLogLevel = this.logLevel;
        //allow runtime adjustment of loglevels (useful for focused debugging)
        Logger._overriddenStorage.forEach((pair) => {
            if (pair.namePattern.test(this.name)) {
                minimumLogLevel = pair.newLogLevel;
            }
        });
        if (targetLogLevel < minimumLogLevel) {
            return;
        }
        return this._doLog(targetLogLevel, args); // this._doLog.apply( this, arguments );
    }
    _doLog(targetLogLevel, args) {
        /** cleaned up args, passed to "finalArgs" */
        let normalizedArgs;
        let finalArgs;
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                finalArgs = args;
                break;
            case environment.PlatformType.NodeJs:
            default:
                normalizedArgs = this._normalizeArgs(args);
                finalArgs = _.clone(normalizedArgs);
                break;
        }
        var logLevelColor;
        switch (targetLogLevel) {
            case environment.LogLevel.TRACE:
                logLevelColor = Chalk.black.bgWhite;
                break;
            case environment.LogLevel.DEBUG:
                logLevelColor = Chalk.bgGreen;
                break;
            case environment.LogLevel.INFO:
                logLevelColor = Chalk.bgCyan;
                break;
            case environment.LogLevel.WARN:
                logLevelColor = Chalk.red.bgYellow;
                break;
            case environment.LogLevel.ERROR:
                logLevelColor = Chalk.bgMagenta;
                break;
            case environment.LogLevel.FATAL:
                logLevelColor = Chalk.bgRed;
                break;
            default:
                logLevelColor = Chalk.inverse.bold;
                throw new LoggerFatalException("unknown targetLogLevel");
            //break;
        }
        //find line number
        let lineNumberToReport = "";
        let nameToReport = this.name;
        try {
            let nameNoPrefix = stringHelper.removeBefore(nameToReport, "\\", false, true);
            nameNoPrefix = stringHelper.removeBefore(nameNoPrefix, "/", false, true);
            nameNoPrefix = stringHelper.removeAfter(nameNoPrefix, ".", false, true);
            let stack = ex.getStackTrace(`.*${nameNoPrefix}\.`, 1, true);
            if (stack.length > 0) {
                let extAndLineNumber = stringHelper.removeBefore(stack[0], ".", true, true);
                extAndLineNumber = stringHelper.removeAfter(extAndLineNumber, ")");
                //try to inject our line number into name
                if (extAndLineNumber.length > 0 && extAndLineNumber.indexOf(".") === 0 && nameToReport.indexOf(".") > 0) {
                    nameToReport = stringHelper.removeAfter(nameToReport, ".", false, true);
                    nameToReport = Chalk.magenta(`${nameToReport}${extAndLineNumber}`);
                }
                else {
                    nameToReport = Chalk.cyan(nameToReport);
                    lineNumberToReport = Chalk.magenta(`(${extAndLineNumber})`);
                }
            }
        }
        catch (ex) {
            console.error("error when finding line number of log entry.  aborting attempt to instrument log.", ex);
        }
        /** add "header" info to the log data */
        finalArgs.unshift(logLevelColor(environment.LogLevel[targetLogLevel]));
        finalArgs.unshift(lineNumberToReport);
        finalArgs.unshift(nameToReport);
        finalArgs.unshift(Chalk.gray(moment().toISOString()));
        //on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                switch (targetLogLevel) {
                    case environment.LogLevel.TRACE:
                        console.trace.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.DEBUG:
                        console.trace.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.INFO:
                        console.trace.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.WARN:
                        console.error.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.ERROR:
                        console.error.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.FATAL:
                        console.error.apply(console, finalArgs);
                        break;
                    default:
                        throw new LoggerFatalException("unknown targetLogLevel");
                    //break;
                }
                break;
            //on node, we use only show stacktrace for explicit trace call or errors.
            case environment.PlatformType.NodeJs:
            default:
                switch (targetLogLevel) {
                    case environment.LogLevel.TRACE:
                        // console.trace.apply( console, [ "test" ] );
                        // let traceArgs = [ JSON.stringify( normalizedArgs ) ];
                        // console.trace.apply( console, traceArgs );
                        // console.trace( "test" );
                        // console.trace( "test", ...normalizedArgs );
                        // console.trace( "test", ...finalArgs );
                        console.log.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.DEBUG:
                        console.log.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.INFO:
                        console.log.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.WARN:
                        console.warn.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.ERROR:
                        console.error.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.FATAL:
                        console.error.apply(console, finalArgs);
                        break;
                    default:
                        throw new LoggerFatalException("unknown targetLogLevel");
                    //break;
                }
                break;
        }
        return finalArgs;
    }
    trace(...args) {
        this._log(environment.LogLevel.TRACE, args);
    }
    debug(...args) {
        this._log(environment.LogLevel.DEBUG, args);
    }
    info(...args) {
        this._log(environment.LogLevel.INFO, args);
    }
    warn(...args) {
        this._log(environment.LogLevel.WARN, args);
    }
    /** for now, same as log.error().   later will notify via email. */
    hackAttempt(...args) {
        this.error(...args);
    }
    error(...args) {
        let finalArgs = this._log(environment.LogLevel.ERROR, args);
        //log these for our diagnostics api to pickup:   http://localhost/metrics/v2/healthcheck-errors
        let errorHistoryEntry = finalArgs.map((arg) => Chalk.stripColor(arg));
        Logger.errorHistory.unshift(errorHistoryEntry);
        if (Logger.errorHistory.length > 200) {
            Logger.errorHistory.length = 200;
        }
        if (finalArgs != null) {
            //this.info(finalArgs);
            //remove first 2 items from finalArgs
            finalArgs.shift();
            finalArgs.shift();
            let finalArgsStr = finalArgs.join("  ");
            return new ex.Exception(finalArgsStr);
        }
        else {
            return new ex.Exception("");
        }
    }
    fatal(...args) {
        args.unshift(false);
        this.assert.apply(this, args);
        args.shift();
        throw new ex.CorelibException(stringHelper.format.apply(stringHelper, args));
    }
    assert(testCondition, ...args) {
        if (testCondition === true) {
            return;
        }
        if (testCondition !== false) {
            throw new ex.CorelibException("first parameter must be a boolean (to assert must evaluate to true or false)");
        }
        let finalArgs;
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                finalArgs = args;
                break;
            case environment.PlatformType.NodeJs:
            default:
                finalArgs = this._normalizeArgs(args);
                break;
        }
        finalArgs.unshift(Chalk.bgYellow("ASSERT"));
        finalArgs.unshift(Chalk.cyan(this.name));
        finalArgs.unshift(Chalk.gray(moment().toISOString()));
        //finalArgs.unshift(false);
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
    }
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    todo(...args) {
        //	var msg = "TODO: " + stringHelper.format2( format, params );
        this.assert(false, ...args);
    }
    /** notes to do something later. */
    todo_later(...args) {
        //var msg = "TODO: LATER:" + stringHelper.format2( format, params );
        this.warn(...args);
    }
    deprecated(message) {
        this.assert(false, "implement deprecated");
    }
    /** note to redo this before shipping (any time not in #DEBUG mode) */
    refactor(...args) {
        if (environment.envLevel === environment.EnvLevel.DEV) {
            this.warn(...args);
        }
        else {
            this.fatal("refactor must be done before production", ...args);
        }
        //this.assert(false, "implement deprecated");
    }
}
/** storage of  env.logLevelOverrides  for filtering log requests  */
Logger._overriddenStorage = Logger.__overridenStorageHelper_parseEnv();
Logger.errorHistory = [];
exports.Logger = Logger;
var __isUnhandledHooked = false;
let _unhandledDefaultLogger = new Logger("logging.logPromiseUnhandledRejections");
function logPromiseUnhandledRejections(logger = _unhandledDefaultLogger) {
    if (__isUnhandledHooked === true) {
        return;
    }
    __isUnhandledHooked = true;
    logger.debug("exec xlib.diagnostics.logger.logPromiseUnhandledRejections()");
    switch (environment.platformType) {
        case environment.PlatformType.Browser:
            window.addEventListener("unhandledrejection", (e) => {
                var reason = e.detail.reason;
                var promise = e.detail.promise;
                logger.error(reason, promise);
                throw e;
            });
            break;
        case environment.PlatformType.NodeJs:
            process.on("unhandledRejection", function (reason, promise) {
                try {
                    //console.log("unhandled");
                    //console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection " + JSON.stringify({ arguments }));
                    // See Promise.onPossiblyUnhandledRejection for parameter documentation
                    logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection", reason, { promise: JSON.parse(JSON.stringify(promise)) });
                    //logger.error(reason, promise);
                }
                catch (ex) {
                    //try {
                    //	logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection TRY2", JSON.stringify({ reason, promise }));
                    //} catch (ex) {
                    console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection try 2 failed!");
                    //}
                }
                throw reason;
            });
            break;
    }
}
exports.logPromiseUnhandledRejections = logPromiseUnhandledRejections;
//# sourceMappingURL=logging.js.map