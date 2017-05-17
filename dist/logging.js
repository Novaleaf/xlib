"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ex = require("./exception");
var environment = require("./environment");
var stringHelper = require("./stringhelper");
var serialization = require("./serialization");
var reflection = require("./reflection");
//import Stream = require("stream");
//import PrettyStream = require("bunyan-prettystream");
var _ = require("lodash");
//import * as __ from "./lolo";
var moment = require("moment");
var assert = require("assert");
var jsHelper = require("./jshelper");
var Exception = ex.Exception;
var LoggerFatalException = (function (_super) {
    __extends(LoggerFatalException, _super);
    function LoggerFatalException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LoggerFatalException;
}(Exception));
//export class NewLogger {
//    constructor(public name: string,
//        public logLevel?: environment.LogLevel   //= environment.logLevel
//    ) {
//        if (logLevel == null) {
//            logLevel = environment.logLevel;
//        }
//    }
//    public echo(text: string) {
//        console.log(this.name + text + "..." + text + "...");
//    }
//}
/** coloring for node console */
var Chalk = require("chalk");
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
    for (var i = 0; i < sections.length; i++) {
        var num = parseInt(sections[i]);
        //color names from http://www.w3schools.com/cssref/css_colornames.asp
        switch (num) {
            case 0: //reset
            case 27:
                result = _.clone(defaultColor);
                break;
            case 1:
                //bold
                result.bold = true;
                break;
            case 2: //faint
            case 21: //bold off
            case 22:
                result.bold = false;
                break;
            case 7:
                var tmp = result.foreground;
                result.foreground = result.background;
                result.background = tmp;
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
        }
    }
    return result;
}
/** console logger logs to screen as simple text...*/
var Logger = (function () {
    //INTERNAL NOTE:  This is a replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) 
    //works well, but it would be better with a pluggable global listener, to log to various other locations (email)
    function Logger(
        /** IMPORTANT: almost always, you should pass ```__filename``` as the name.    \n\n Effective naming is important. it is used as a Key to selectively enable/disable/adjust the log levels via the logging.Logger.adjustLogLevels() static method */
        name, 
        /** (optional) the verbosity of this log object.   defaults to the environment.logLevel */
        logLevel, 
        /** (optional) additional options */
        options) {
        if (logLevel === void 0) { logLevel = environment.logLevel; }
        /** (optional) additional options */
        if (options === void 0) { options = {}; }
        this.name = name;
        this.logLevel = logLevel;
        if (options.doNotTrimName !== true) {
            this.name = stringHelper.removeMatchingPrefix(name, __dirname);
        }
    }
    /** converts objects to strings, leaves primitive types intact */
    Logger.prototype._normalizeArgs = function (args) {
        //generate log string
        var finalArgs = [];
        _.forEach(args, function (arg) {
            var typeName = reflection.getTypeName(arg);
            var type = reflection.getType(arg);
            switch (type) {
                case reflection.Type.Error:
                    var objArg;
                    try {
                        objArg = (serialization.JSONX.inspectStringify(arg, 4, false, true, undefined, undefined, "\t"));
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
                        objArg = (serialization.JSONX.inspectStringify(arg, 4, false, false, undefined, undefined, "\t"));
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
    };
    Logger.prototype._log = function (targetLogLevel, args) {
        if (targetLogLevel < this.logLevel) {
            return;
        }
        return this._doLog.apply(this, arguments);
    };
    Logger.prototype._doLog = function (targetLogLevel, args) {
        var finalArgs;
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                finalArgs = args;
                break;
            case environment.PlatformType.NodeJs:
            default:
                finalArgs = this._normalizeArgs(args);
                break;
        }
        var logLevelColor = Chalk.bgBlack;
        switch (targetLogLevel) {
            case environment.LogLevel.TRACE:
                logLevelColor = Chalk.bgWhite;
                break;
            case environment.LogLevel.DEBUG:
                logLevelColor = Chalk.bgGreen;
                break;
            case environment.LogLevel.INFO:
                logLevelColor = Chalk.bgCyan;
                break;
            case environment.LogLevel.WARN:
                logLevelColor = Chalk.bgYellow;
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
        }
        //format
        switch (environment.platformType) {
            // *****************************************************************
            // *****************************************************************
            // *****************************************************************
            // ****************   TODO: pretty coloring for chrome, as started below.
            //case environment.PlatformType.Browser:
            //    {
            //        //format for chrome color output:   https://developers.google.com/web/tools/chrome-devtools/console/console-write
            //        finalArgs.unshift(`%c${environment.LogLevel[targetLogLevel]}`);
            //        finalArgs.push("color: blue; font-size: x-large");
            //        finalArgs.unshift(Chalk.cyan(this.name));
            //        finalArgs.unshift(Chalk.gray(moment().toISOString()));
            //    }
            //    break;
            default:
                {
                    //terminal output
                    finalArgs.unshift(logLevelColor(environment.LogLevel[targetLogLevel]));
                    finalArgs.unshift(Chalk.cyan(this.name));
                    finalArgs.unshift(Chalk.gray(moment().toISOString()));
                }
                break;
        }
        //on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
        switch (environment.platformType) {
            case environment.PlatformType.Browser:
                switch (targetLogLevel) {
                    case environment.LogLevel.TRACE:
                    case environment.LogLevel.DEBUG:
                        if (console.groupCollapsed != null) {
                            console.groupCollapsed.apply(console, finalArgs); //("...trace...");
                            console.trace("...trace...");
                            console.groupEnd();
                        }
                        else {
                            console.debug.apply(console, finalArgs);
                        }
                        break;
                    case environment.LogLevel.INFO:
                        //console.info.apply(console, finalArgs);
                        if (console.groupCollapsed != null) {
                            console.groupCollapsed.apply(console, finalArgs); //("...trace...");
                            console.trace("...trace...");
                            console.groupEnd();
                        }
                        else {
                            console.info.apply(console, finalArgs);
                        }
                        break;
                    case environment.LogLevel.WARN:
                        console.warn.apply(console, finalArgs);
                        break;
                    case environment.LogLevel.ERROR:
                        if (environment.isDev === true) {
                            console.assert.bind(console, false).apply(console, finalArgs);
                        }
                        else {
                            console.error.apply(console, finalArgs);
                        }
                        break;
                    case environment.LogLevel.FATAL:
                        if (environment.isDev === true) {
                            console.assert.bind(console, false).apply(console, finalArgs);
                        }
                        else {
                            console.error.apply(console, finalArgs);
                        }
                        break;
                    default:
                        throw new LoggerFatalException("unknown targetLogLevel");
                }
                break;
            //on node, we use only show stacktrace for explicit trace call or errors.
            case environment.PlatformType.NodeJs:
            default:
                switch (targetLogLevel) {
                    case environment.LogLevel.TRACE:
                        console.trace.apply(console, finalArgs);
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
                }
                break;
        }
        return finalArgs;
    };
    /**
     *  highest verbosity
     * @param args
     */
    Logger.prototype.trace = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(environment.LogLevel.TRACE, args);
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(environment.LogLevel.DEBUG, args);
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(environment.LogLevel.INFO, args);
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(environment.LogLevel.WARN, args);
    };
    /**
     *  log as an error, and returns an exception you can throw.
    ex:  throw log.error("something bad");
     * @param args
     */
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var finalArgs = this._log(environment.LogLevel.ERROR, args);
        if (finalArgs != null) {
            var message = void 0;
            if (finalArgs.length > 2) {
                message = finalArgs[3];
            }
            else {
                message = finalArgs.join("\n");
            }
            return new ex.Exception(message, { stackFramesToTruncate: 1 });
        }
        else {
            return new ex.Exception("Error", { stackFramesToTruncate: 1 });
        }
    };
    /**
     * useful for doing simple checks at production time.  if the condition fails, will log the error and then throw.
     * @param testCondition
     * @param args
     */
    Logger.prototype.errorAndThrowIfFalse = function (testCondition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (testCondition === true) {
            return;
        }
        if (testCondition !== false) {
            throw new ex.Exception("first parameter to assert must evaluate to true or false");
        }
        var resultError = this.error.apply(this, args);
        // if(environment.isDev===true){
        // 	console.assert(false,"errorAndThrowIfFalse() failed test, about to throw.  investigate above error details. (note:  this assert is shown because environment.isDev===true)");
        // }
        throw resultError;
    };
    Logger.prototype.fatal = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(false);
        this.assert.apply(this, args);
        args.shift();
        throw new ex.Exception(stringHelper.format.apply(stringHelper, args), { stackFramesToTruncate: 1 });
    };
    /**
     *  for dev-time and testing,   not for catching production issues as this can be no-opted during minification.  if you want to test in a production environment, use .errorAndThrowIf()
     * @param testCondition
     * @param args
     */
    Logger.prototype.assert = function (testCondition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (testCondition === true) {
            return;
        }
        if (testCondition !== false) {
            throw new ex.CorelibException("first parameter to assert must evaluate to true or false");
        }
        var finalArgs;
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
                finalArgs.unshift(false);
                console.assert.apply(console, finalArgs);
                //assert(false, finalArgs.join("\n"));
                break;
            case environment.PlatformType.NodeJs:
                console.trace.apply(console, finalArgs);
                assert(false, finalArgs.join("\n"));
                break;
            default:
                finalArgs.unshift(false);
                //console.warn.apply(console, finalArgs);
                console.assert.apply(console, finalArgs);
                break;
        }
    };
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    Logger.prototype.todo = function (format) {
        if (format === void 0) { format = "TODO: not implemented"; }
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var msg = "TODO: " + jsHelper.apply(stringHelper.format, null, params, [format]); //.apply(null,format, params);
        this.assert(false, msg);
        throw this.error(msg);
    };
    Logger.prototype.deprecated = function (message) {
        this.warn("log.deprecated(" + message + ")");
        //this.assert(false, "implement deprecated");
    };
    /** note to redo this before shipping (any time not in envLevel===PROD mode).   when in prod mode, an error is thrown */
    Logger.prototype.refactor = function (message) {
        if (environment.envLevel === environment.EnvLevel.PROD) {
            throw this.error("log.refactor(" + message + ")");
        }
        else {
            this.warn("log.refactor(" + message + ")");
        }
    };
    return Logger;
}());
exports.Logger = Logger;
//class TestError extends Error {
//	constructor(message: string) {
//		super(message);
//		//this = new Error(message);
//		//this._error = new Error(message);
//		//this.stack = this._error.stack;
//		//this.name = this._error.name;		
//	}
//	//private _error:Error;
//}
//"use strict";
////import * as logging from "./logging";
////import * as ex from "../exception";
///** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present. 
// * usage notes: as long as this module is loaded 
// *		(which it is unless your minifer is expecting pure functions)
// *		then it's enabled automatically.  if your minifier truncates this, execute this function.
// * why use? otherwise your unit tests will throw type error when running mocha "describe" calls
// */
//export function _initializeMockMocha() {
//    if (typeof ((global as any)["describe"]) === "undefined") {
//        //var log = new logging.Logger(__filename);
//        //log.trace("mocha not present.  nooping describe function");
//        /* tslint:disable */
//        var noop: any = () => { };
//        /* tslint:enable */
//        (global as any)["describe"] = noop;
//        if (typeof ((global as any)["describe"]) === "undefined") {
//            throw new ex.CorelibException("unable to sham describe.  files containing mocha unit tests will fail, thus we failfast here.");
//        }
//    }
//}
///////** wrapper over bunyan logger, includes extra diagnostics helpers such as .assert(), and will pretty output to console if no listener is attached.*/
//////export class _Logger {
//////    /** target of this logger wrapper*/
//////    public bunyanLogger: bunyan.Logger;
//////    public options: bunyan.LoggerOptions;
//////    constructor(name: string,
//////        /** if no stream is specified we by default pretty-print bunyan output to console.   pass TRUE to disable this. */
//////        noPrettyPrint?: boolean);
//////    constructor(options: bunyan.LoggerOptions,
//////        /** if no stream is specified we by default pretty-print bunyan output to console.   pass TRUE to disable this. */
//////        noPrettyPrint?: boolean);
//////    constructor(arg: any, noPrettyPrint = false) {
//////        noPrettyPrint = true;
//////        if (typeof (arg) === "string") {
//////            this.options = { name: arg };
//////        } else {
//////            this.options = arg;
//////        }
//////        if (this.options.level == null) {
//////            this.options.level = environment.LogLevel[environment.logLevel];
//////        }
//////        if (noPrettyPrint === false && this.options.stream == null && this.options.streams == null) {
//////            //install prettyprint
//////            var prettyStream = new PrettyStream();
//////            if (environment.platformType === environment.PlatformType.Browser) {
//////                prettyStream.on("data", (data: string) => {
//////                    //convert console color to browser color
//////                    //for example:  [[37m2015-11-11T23:05:25.250Z[39m] [36m INFO[39m: /index-main.tsx/undefined on localhost:8080: [36mthis is a log of a dog, cat! meow?[39m
//////                    var text = data.trim();
//////                    var searchPosition = 0; //so we skip already searched areas
//////                    var replacements: IReplacement[] = [];
//////                    var currentColor: IAnsiColor = null;
//////                    while (true) {
//////                        var start = text.indexOf("[", searchPosition);
//////                        if (start < 0) {
//////                            break;
//////                        }
//////                        var end = text.indexOf("m", start);
//////                        if (end < 0) {
//////                            break;
//////                        }
//////                        end = end + 1; //include the m
//////                        //reaquire the start, to find closest "[" to the m, in case there are orphan "["'s laying around
//////                        start = text.lastIndexOf("[", end);
//////                        searchPosition = start + 1; //make sure our next loop doesn't include this
//////                        var potentialMatch = text.substring(start, end);
//////                        if (potentialMatch.length < 3 || potentialMatch.substring(1, potentialMatch.length - 1).match(/[a-z ]/i) != null) {
//////                            //invalid characters voids this potential match
//////                            continue;
//////                        }
//////                        //get colors
//////                        currentColor = colorCodeToString(potentialMatch, currentColor);
//////                        let replacement = <IReplacement>_.clone(currentColor);
//////                        replacement.start = start;
//////                        replacement.end = end;
//////                        replacement.matchText = potentialMatch;
//////                        replacements.push(replacement);
//////                    }
//////                    //apply replacements to string
//////                    var cssColors: string[] = [];
//////                    for (let i = replacements.length; i > 0; i--) {
//////                        let replacement = replacements[i - 1];
//////                        //var replaceValue = 
//////                        text = text.replace(replacement.matchText, "%c");
//////                        var colorString = "";
//////                        if (replacement.foreground != null) {
//////                            colorString += "color:" + replacement.foreground + ";";
//////                        }
//////                        if (replacement.background != null) {
//////                            colorString += "background:" + replacement.background + ";";
//////                        }
//////                        cssColors.unshift(colorString);
//////                    }
//////                    //set initial color
//////                    text = "%c" + text;
//////                    cssColors.unshift("color:grey;background:black;");
//////                    //apply to console
//////                    var args = cssColors.slice();
//////                    args.unshift(text);
//////                    console.log.apply(console, args);
//////                    //console.log(data);
//////                });
//////                //prettyStream.on("end", (data) => {
//////                //    console.log(data);
//////                //});
//////            } else {
//////                prettyStream.pipe(process.stdout);
//////            }
//////            this.options.stream = prettyStream;
//////            //this.prettyPrintStream = prettyStream;
//////            //this.prettyPrintStream = new Stream.Writable();
//////            //var fcn: any = (obj: any) => {
//////            //	if (obj.msg != null) {
//////            //		console.log(obj.msg);
//////            //	} else {
//////            //		console.log(JSON.stringify(obj));
//////            //	}
//////            //};
//////            //this.prettyPrintStream.write = fcn;
//////            //this.options.stream = this.prettyPrintStream;
//////            //var bstds: any = bunyan.stdSerializers;
//////            //this.options.serializers = {
//////            //	err: bstds.err,
//////            //	req: bstds.req,
//////            //	res: bstds.res,
//////            //};
//////        }
//////        if (environment.LogLevel[this.options.level] > environment.LogLevel.DEBUG) {
//////            //not in debug mode, so disable our asserts from firing (noop it)
//////            /* tslint:disable */
//////            this.assert = () => { };
//////            /* tslint:enable */
//////        }
//////        //if (this.options.src == null && environment.logLevel <= environment.EnvLevel.DEBUG) {
//////        //	this.options.src = true;
//////        //}
//////        this.bunyanLogger = bunyan.createLogger(this.options);
//////    }
//////    public trace(error: Error, format?: string, ...params: any[]): void;
//////    public trace(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public trace(obj: Object, format?: string, ...params: any[]): void;
//////    public trace(format: string, ...params: any[]): void;
//////    trace(...params: any[]): void {
//////        this.bunyanLogger.trace.apply(this.bunyanLogger, params);
//////    }
//////    public debug(error: Error, format?: string, ...params: any[]): void;
//////    public debug(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public debug(obj: Object, format?: string, ...params: any[]): void;
//////    public debug(format: string, ...params: any[]): void;
//////    debug(...params: any[]): void {
//////        this.bunyanLogger.debug.apply(this.bunyanLogger, params);
//////    }
//////    public info(error: Error, format?: string, ...params: any[]): void;
//////    public info(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public info(obj: Object, format?: string, ...params: any[]): void;
//////    public info(format: string, ...params: any[]): void;
//////    info(...params: any[]): void {
//////        this.bunyanLogger.info.apply(this.bunyanLogger, params);
//////    }
//////    public warn(error: Error, format?: string, ...params: any[]): void;
//////    public warn(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public warn(obj: Object, format?: string, ...params: any[]): void;
//////    public warn(format: string, ...params: any[]): void;
//////    warn(...params: any[]): void {
//////        this.bunyanLogger.warn.apply(this.bunyanLogger, params);
//////    }
//////    public error(error: Error, format?: string, ...params: any[]): void;
//////    public error(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public error(obj: Object, format?: string, ...params: any[]): void;
//////    public error(format: string, ...params: any[]): void;
//////    error(...params: any[]): void {
//////        this.bunyanLogger.error.apply(this.bunyanLogger, params);
//////    }
//////    /** logs as "Fatal" and then throws an exception. */
//////    public fatal(error: Error, format?: string, ...params: any[]): void;
//////    public fatal(buffer: Buffer, format?: string, ...params: any[]): void;
//////    public fatal(obj: Object, format?: string, ...params: any[]): void;
//////    public fatal(format: string, ...params: any[]): void;
//////    fatal(...params: any[]): void {
//////        this.bunyanLogger.fatal.apply(this.bunyanLogger, params);
//////        throw new LoggerFatalException(this._composeLogDataString(params));
//////    }
//////    /** construct a string-loggable version of the bunyan inputs*/
//////    private _composeLogDataString(params: any[]): string {
//////        var arg1 = params[0];
//////        var objStr = "";
//////        if (typeof (arg1) !== "string") {
//////            objStr = serialization.JSONX.stringify(arg1) + " ";
//////            params.shift();
//////        }
//////        if (typeof (params[0]) !== "string") {
//////            return serialization.JSONX.inspectToText(params);
//////            //throw new ex.CorelibException("format string is missing");
//////        }
//////        if (params.length === 1) {
//////            return objStr + params[0];
//////        }
//////        return objStr + stringHelper.format.apply(null, params);
//////    }
//////    level(value: any /* number | string */): void {
//////        this.bunyanLogger.level(value);
//////    }
//////    levels(name: any /* number | string */, value: any /* number | string */): void {
//////        this.bunyanLogger.levels(name, value);
//////    }
//////	/** if the testCondition evaluates to false, a breakpoint is triggered, then a fatal is raised.    
//////	 * This ONLY triggers when in DEBUG mode, and it is otherwise the same as log.fatal().  (Execution will stop)*/
//////    public assert(testCondition: boolean, error: Error, format?: string, ...params: any[]): void;
//////    public assert(testCondition: boolean, buffer: Buffer, format?: string, ...params: any[]): void;
//////    public assert(testCondition: boolean, obj: Object, format?: string, ...params: any[]): void;
//////    public assert(testCondition: boolean, format: string, ...params: any[]): void;
//////    assert(testCondition: boolean, ...params: any[]): void {
//////        if (testCondition === true) {
//////            return;
//////        }
//////        if (testCondition !== false) {
//////            throw new ex.CorelibException("first parameter to assert must evaluate to true or false");
//////        }
//////        var logStr = this._composeLogDataString(params);
//////        console.assert(false, logStr);
//////        debugger;
//////        this.error.apply(this, params);
//////    }
//////    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
//////    todo(format = "TODO: not implemented", ...params: any[]) {
//////        var msg = "TODO: " + stringHelper.format2(format, params);
//////        this.assert(false, msg);
//////    }
//////    deprecated(message?: string) {
//////        this.assert(false, "implement deprecated");
//////    }
//////    /** note to redo this before shipping (any time not in #DEBUG mode) */
//////    refactor(message?: string) {
//////        this.assert(false, "implement deprecated");
//////    }
//////}
////////TODO:  later optimization?  (noop logging in production?  maybe not)
////////////disable methods
//////////if (!environment._DEBUG_MODE) {
//////////	if (environment._TRACE_MODE) {
//////////		//replace assert with trace
//////////		logger.assert = (condition, message?, ...args) => { if (condition === false) { logger.trace("ASSERT", __.jsHelper.apply<string>(stringHelper.format, __, args, message)); } };
//////////	} else {
//////////		//no op calls
//////////		//console.log("noop assert");
//////////		logger.assert = () => { };
//////////	}
//////////}
//////////if (!environment._TRACE_MODE) {
//////////	//no op calls
//////////	//console.log("noop message/trace");
//////////	log.trace = () => { };
//////////	//no op calls
//////////	logger.trace = () => { };
//////////}
////////////notify if tracing
//////////var _traceAttributeValue = __.browserHelper.getFirstAttribute("script", "data-trace-keys");
//////////if (_traceAttributeValue != null) {
//////////	//trace filters specified, apply those
//////////	logger._traceKeysToEnable = _traceAttributeValue.split(",").map((value) => value.trim());
//////////} else {
//////////	if (environment._TRACE_MODE) {
//////////		//no filters specified, log it
//////////		var msg = "";
//////////		if (__.browserHelper.isBrowser) {
//////////			msg = "to disable, add the \"data-trace-keys\" attribute to your boot-loader script element, with a comma-seperated list of keys you wish to enable.  "
//////////			+ "if you wish to change keys at runtime, add/remove from logger._traceKeysToEnable";
//////////		} else {
//////////			msg = " You can change what log.trace() and logger.trace() keys will be printed by add/remove from corelib.logger._traceKeysToEnable array";
//////////		}
//////////		log.trace("corelib.Logger", " ======== NO TRACE FILTERS HAVE BEEN SPECIFIED!  ALL TRACES ENABLED!  =================  \n{0}\n-------------------------------------", msg);
//////////	}
//////////}
//# sourceMappingURL=logging.js.map