"use strict";

import nodeHelper = require("../node/nodehelper");
import browserHelper = require("../browser/browserhelper");
import ex = require("./exception");

export enum PlatformType {
	None,
	Browser,
	NodeJs,
	PhantomJs,
	Unknown,
}
/** global var if we are running under phantomjs */
declare var phantom: any;

////declare var module; //not defined when using the requirejs loader :(, so we have to look for GLOBAL only.
///** global var if we are running under nodejs*/
//declare var GLOBAL: any;


/** info on the type of platform we are currently executing under */
export var platformType: PlatformType = function (): PlatformType {
	if (typeof (phantom) !== "undefined") {
		return PlatformType.PhantomJs;
	}
	if (typeof (window) !== "undefined") {
		return PlatformType.Browser;
	}


	if (//typeof (module) !== 'undefined' && (<any>module).exports &&
		typeof (global) !== "undefined") {
		return PlatformType.NodeJs;
	}

	return PlatformType.Unknown;

} ();




export enum OsName {
	unknown,
	/** mac */
	darwin,
	freebsd,
	linux,
	sunos,
	/** windows (may be x64) */
	win32,
	unix,
}
/** the name of the os we detect running.  uses user agent in browsers, process.platform in nodejs */
export var osName: OsName = (() => {
	if (typeof (process) !== "undefined") {
		return (OsName as any)[process.platform];
	}
	try {
		if (navigator.appVersion.indexOf("Win") !== -1) { return OsName.win32; }
		if (navigator.appVersion.indexOf("Mac") !== -1) { return OsName.darwin; }
		if (navigator.appVersion.indexOf("X11") !== -1) { return OsName.unix; }
		if (navigator.appVersion.indexOf("Linux") !== -1) { return OsName.linux; }
	} catch (ex) { }
	return OsName.unknown;
})();


/** returns the current global object.
		depending on platform, this is:
		window (browser, phantomjs);
		GLOBAL (nodejs) */
export function getGlobal(): any {
	switch (platformType) {
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

export enum LogLevel {
	TRACE = 10,
	DEBUG = 20,
	INFO = 30,
	WARN = 40,
	ERROR = 50,
	FATAL = 60,
}
/** the logLevel of your environment.  used as the default when constructing a logging.Logger()
 * nodejs: set by running "node entrypoint.js logLevel=DEBUG" or by setting your systemenv var: logLevel=DEBUG
 * browser: set by adding "logLevel=DEBUG" in your querystring, add a cookie, or as a attribute of your html tag
  */
export var logLevel: LogLevel = (LogLevel as any)[getEnvironmentVariable("logLevel", null)];
if (logLevel == null) {
	logLevel = LogLevel.TRACE;
	console.info("logLevel varible is not set.  \n\tdefaulting to logLevel=TRACE.");
	console.info("\tPossible values are TRACE, DEBUG, INFO, WARN, ERROR, FATAL.");
	console.info("\tHow to modify: ");
	console.info("\t\tnodejs: set by running 'node entrypoint.js logLevel=DEBUG' or by setting your systemenv var: logLevel=DEBUG");
	console.info("\t\tbrowser: set by adding 'logLevel= DEBUG' in your querystring, add a cookie, or as a attribute of your html tag");

} else {
	console.info("logLevel=" + LogLevel[logLevel]);
}


export var isDebugBreakEnabled: boolean = (() => {
	if (logLevel <= LogLevel.DEBUG && global.v8debug != null) {
		global.v8debug.Debug.setBreakOnException();
		return true;
	}
	return false;
})();

export enum EnvLevel {
	DEV = 10,
	//TEST = 20,
	//PREPROD = 30,
	PROD = 40,
}
export var envLevel: EnvLevel = (EnvLevel as any)[getEnvironmentVariable("envLevel", null)];
if (envLevel == null) {
	envLevel = EnvLevel.DEV;
	console.info("envLevel varible is not set.  \n\tdefaulting to envLevel=DEV.");
	console.info("\tPossible values are DEV, PROD.");
	console.info("\tHow to modify: ");
	console.info("\t\tnodejs: set by running 'node entrypoint.js envLevel=PROD' or by setting your systemenv var: envLevel=PROD");
	console.info("\t\tbrowser: set by adding 'envLevel=PROD' in your querystring, add a cookie, or as a attribute of your html tag");

} else {
	console.info("envLevel=" + EnvLevel[envLevel]);
}


export enum TestLevel {
	NONE = 0,
	//TEST = 20,
	//PREPROD = 30,
	FULL = 40,
}
export var testLevel: TestLevel = (TestLevel as any)[getEnvironmentVariable("testLevel", null)];
if (testLevel == null) {
	testLevel = TestLevel.FULL;
	console.info("testLevel varible is not set.  \n\tdefaulting to testLevel=FULL.");
	console.info("\tPossible values are NONE, FULL.");
	console.info("\tHow to modify: ");
	console.info("\t\tnodejs: set by running 'node entrypoint.js testLevel=FULL' or by setting your systemenv var: testLevel=FULL");
	console.info("\t\tbrowser: set by adding 'testLevel=FULL' in your querystring, add a cookie, or as a attribute of your html tag");

} else {
	console.info("testLevel=" + TestLevel[testLevel]);
}





///** if mocha tests are enabled.  this is set to true if the "describe" global object is found. */
//export var isTest: boolean;
//if (typeof (getGlobal()["describe"]) !== "undefined") {
//	isTest = true;
//} else {
//	isTest = false;
//}


/** no op the input function if not running LogLevel <= DEBUG.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
export function _ifDebug(fcn: Function): any {
	if (logLevel <= LogLevel.DEBUG) {
		return fcn;
	} else {
		//no op
		/* tslint:disable */
		return () => { };
		/* tslint:enable */
	}
}


/** no op the input function if not running in test mode.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
export function _ifTest(fcn: Function): any {
	if (testLevel >=TestLevel.FULL) {
		return fcn;
	} else {
		//no op
		/* tslint:disable */
		return () => { };
		/* tslint:enable */
	}
}


/** read an "environment variable".
nodejs / phantomjs: reads from commandline switches (prefered) or system environment variables.
browser:  reads from querystring (prefered), or cookie, or <html data-key> attribute (least prefered).
 */
export function getEnvironmentVariable(key: string, valueIfNullOrEmpty?: string) {
	var result: string;
	switch (platformType) {
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
			throw new ex.CorelibException("unsupported plaform type: " + platformType.toString());
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
/* tslint:disable */
///** initialization events for environment variables */
//module environmentInitialization {
//	/** this is only set if running in node with the debug switch */
//	declare var v8debug: any;
//	/** global object only set if we are running under a phantomjs server */
//	declare var phantom: any;
//	declare var process: any, GLOBAL: any;
//	declare var require: any;

//	/** internal helper to read webpage variables to set our debug/trace state */
//	function __initializeLogger() {
//		/** IE doesn't support stack traces in asserts, so we polyfill it to add support */
//		function polyFillConsole() {
//			var thisConsole: any;
//			//special for IE, replace console functions with versions that emit a stacktrace
//			if (browserHelper.ieVersion != null) {
//				var oldConsole = window.console;
//				window.console = <any>{};
//				thisConsole = window.console;

//				thisConsole.assert = (test: boolean, message?: any, ...optionalArgs: any[]) => {
//					if (test) {
//						return;
//					}
//					message = message == null ? "" : message;
//					message = jsHelper.apply(stringHelper.format, null, optionalArgs, message.toString());
//					oldConsole.assert(false, message);
//					var stackTrace = jsHelper.stackTrace();
//					console.log(stackTrace.join("\n"));
//				};
//				thisConsole.error = (message: any, ...optionalArgs: any[]) => {
//					message = message == null ? "" : message;
//					message = jsHelper.apply(stringHelper.format, null, optionalArgs, message.toString());
//					oldConsole.error(false, message);
//					var stackTrace = jsHelper.stackTrace();
//					console.log(stackTrace.join("\n"));
//				}
//				thisConsole.log = (message?: any, ...optionalArgs: any[]) => {
//					if (message != null) {
//						message = jsHelper.apply(stringHelper.format, null, optionalArgs, message.toString());
//						oldConsole.log(message);
//					} else {
//						oldConsole.log();
//					}
//				}

//			} else {
//				thisConsole = console;
//			}
//			if (thisConsole.debug == null) {
//				thisConsole.debug = (message?: any, ...optionalArgs: any[]) => {
//					if (message != null) {
//						message = jsHelper.apply(stringHelper.format, null, optionalArgs, message.toString());
//						console.log(message);
//					} else {
//						console.log();
//					}
//				}
//			}

//		}

//		polyFillConsole();

//		function _initBuildModes() {
//			var traceMsg: string = "";
//			switch (platformType) {
//				case PlatformType.Browser:
//					//set our debug / trace variables
//					var debugAttributeValue = browserHelper.getDomAttribute("script", "data-debug");
//					if (debugAttributeValue) {
//						if (debugAttributeValue.toLowerCase() === "true" || (debugAttributeValue.toLowerCase() === "auto" && (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.hostname.indexOf("dev") >= 0))) {
//							environment._DEBUG_MODE = true;

//						}
//						//else if (debugAttributeValue.toLowerCase() === "auto") {
//						//}
//					}
//					var traceAttributeValue = __.browserHelper.getDomAttribute("script", "data-trace");
//					if (traceAttributeValue) {
//						if (traceAttributeValue.toLowerCase() === "true" || (traceAttributeValue.toLowerCase() === "auto" && (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.hostname.indexOf("dev") >= 0 || window.location.hostname.indexOf("uat.") >= 0))) {
//							environment._TRACE_MODE = true;
//						}
//					}
//					var testAttributeValue = __.browserHelper.getFirstAttribute("script", "data-test");
//					if (testAttributeValue) {
//						if (testAttributeValue.toLowerCase() === "true" || (testAttributeValue.toLowerCase() === "auto" && (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.hostname.indexOf("dev") >= 0))) {
//							environment._TEST_MODE = true;
//						}
//					}

//					//check querystring
//					if (window.location.href.toLowerCase().indexOf("alldebugon") >= 0) {
//						environment._DEBUG_MODE = environment._TRACE_MODE = environment._TEST_MODE = true;
//					} else {
//						if (window.location.href.toLowerCase().indexOf("debug=true") >= 0) {
//							environment._DEBUG_MODE = true;
//						}
//						if (window.location.href.toLowerCase().indexOf("trace=true") >= 0) {
//							environment._TRACE_MODE = true;
//						}
//						if (window.location.href.toLowerCase().indexOf("test=true") >= 0) {
//							environment._TEST_MODE = true;
//						}
//						if (window.location.href.toLowerCase().indexOf("debug=false") >= 0) {
//							environment._DEBUG_MODE = false;
//						}
//						if (window.location.href.toLowerCase().indexOf("trace=false") >= 0) {
//							environment._TRACE_MODE = false;
//						}
//						if (window.location.href.toLowerCase().indexOf("test=false") >= 0) {
//							environment._TEST_MODE = false;
//						}
//					}

//					if (environment._TRACE_MODE) {
//						traceMsg = " 'data-trace' attribute was set to true.   \nto change log settings, set the following attributes on a script element before requirejs gets loaded:  'data-debug', 'data-trace', or 'data-test'. we always set these to TRUE for localhost (use 127.0.0.1 to avoid)  also you can enable by adding the word 'alldebugon', 'debug=true', 'trace=true', 'test=true' in the url.";
//					}
//					break;
//				case jsHelper.PlatformType.NodeJs:
//					var red, yellow, reset;
//					red = '\u001b[31m';
//					yellow = '\u001b[33m';
//					reset = '\u001b[0m'; //- See more at: http://roguejs.com/2011-11-30/console-colors-in-node-js/#sthash.NBwT3RyC.dpuf

//					//fallback to NODE_ENV if we don't have explicit logger settings defined
//					var nodeEnv: string = process.env["NODE_ENV"] || "prod";
//					if (nodeEnv.toLowerCase().indexOf("dev") >= 0) {
//						//enable all logging in dev mode
//						environment._DEBUG_MODE = true;
//						environment._TRACE_MODE = environment._TEST_MODE = false;
//					}
//					//now we apply overrides, if any
//					var debugEnv: string = GLOBAL["DEBUG"] || process.env["DEBUG"];
//					var traceEnv: string = GLOBAL["TRACE"] || process.env["TRACE"];
//					var testEnv: string = GLOBAL["TEST"] || process.env["TEST"];

//					if (debugEnv != null && debugEnv.toLowerCase() === "true") {
//						environment._DEBUG_MODE = true;
//					}
//					if (traceEnv != null && traceEnv.toLowerCase() === "true") {
//						environment._TRACE_MODE = true;
//					}
//					if (testEnv != null && testEnv.toLowerCase() === "true") {
//						environment._TEST_MODE = true;
//					}
//					jsHelper.forEach(<string[]>process.argv, (arg) => {
//						if (arg.toLowerCase().indexOf("--debug") >= 0) {

//							environment._DEBUG_MODE = environment._TRACE_MODE = environment._TEST_MODE = true;
//							console.log(yellow + "--debug switch specified.  setting DEBUG/TRACE/TEST to true" + reset);
//						}
//					});

//					if (environment._TRACE_MODE) {


//						traceMsg = "to change log settings, set NODE_ENV to 'dev'/'prod', or set the environment variables DEBUG,TRACE,TEST to 'true'/'false', or run node with the '--debug' arg.,  order of priority (lowest to highest) is NODE_ENV, envVars, --debug arg.\nIf NODE_ENV is not set, we assume 'NODE_ENV=dev', which by defaults sets the initial value of logging.debug to true but logging.test/trace to false ";
//						traceMsg = stringHelper.format("{0}=== [TRACE MODE ENABLED ] ==={1}\n{2}", yellow, reset, traceMsg);
//					}
//					break;
//				case jsHelper.PlatformType.PhantomJs:

//					//console.log("debugMode0=");
//					//console.log(environment._DEBUG_MODE);

//					var system = require("system");


//					//fallback to NODE_ENV if we don't have explicit logger settings defined
//					var nodeEnv: string = system.env["PHANTOM_ENV"] || "prod";
//					if (nodeEnv.toLowerCase().indexOf("dev") >= 0) {
//						//enable all logging in dev mode
//						environment._DEBUG_MODE = true;
//						environment._TRACE_MODE = environment._TEST_MODE = false;
//					}

//					//console.log("debugMode1=");
//					//console.log(environment._DEBUG_MODE);

//					//now we apply overrides, if any
//					var debugEnv: string = phantom["DEBUG"] || system.env["DEBUG"];
//					var traceEnv: string = phantom["TRACE"] || system.env["TRACE"];
//					var testEnv: string = phantom["TEST"] || system.env["TEST"];

//					if (debugEnv != null && debugEnv.toLowerCase() === "true") {
//						environment._DEBUG_MODE = true;
//					}
//					if (traceEnv != null && traceEnv.toLowerCase() === "true") {
//						environment._TRACE_MODE = true;
//					}
//					if (testEnv != null && testEnv.toLowerCase() === "true") {
//						environment._TEST_MODE = true;
//					}

//					//console.log("debugMode2=");
//					//console.log(environment._DEBUG_MODE);

//					jsHelper.forEach(<string[]>system.args, (arg) => {
//						//console.log(arg);
//						if (arg.toLowerCase().indexOf("debug") >= 0) {

//							environment._DEBUG_MODE = environment._TRACE_MODE = environment._TEST_MODE = true;
//							console.log("--debug switch specified.  setting DEBUG/TRACE/TEST to true");
//						}
//					});

//					//console.log("debugMode3=");
//					//console.log(environment._DEBUG_MODE);

//					if (environment._TRACE_MODE) {


//						traceMsg = "to change log settings, set PHANTOM_ENV to 'dev'/'prod', or set the environment variables DEBUG,TRACE,TEST to 'true'/'false', or run phantom with the '--debug' arg.,  order of priority (lowest to highest) is NODE_ENV, envVars, --debug arg.\nIf PHANTOM_ENV is not set, we assume 'PHANTOM_ENV=dev', which by defaults sets the initial value of logging.debug to true but logging.test/trace to false ";
//						traceMsg = stringHelper.format("{0}=== [TRACE MODE ENABLED ] ==={1}\n{2}", yellow, reset, traceMsg);
//					}
//					break;
//				default:
//					environment._DEBUG_MODE = environment._TRACE_MODE = environment._TEST_MODE = true;
//					traceMsg = stringHelper.format("Unknown platform type '{0}', so DEBUG/TRACE/TEST is set to true", jsHelper.PlatformType[jsHelper.platformType]);
//					break;
//			}
//			if (environment._TRACE_MODE) {
//				log.trace("corelib.Logger", " ======== TRACE MODE ENABLED! ======== \n{0}\n---------------------------------------", traceMsg);
//			}
//			//if (__.browserHelper.isBrowser) {
//			//	//set our debug / trace variables
//			//	var debugAttributeValue = __.browserHelper.getFirstAttribute("script", "data-debug");
//			//	if (debugAttributeValue && debugAttributeValue.toLowerCase() === "true") {
//			//		environment._DEBUG_MODE = true;
//			//	}
//			//	var traceAttributeValue = __.browserHelper.getFirstAttribute("script", "data-trace");
//			//	if (traceAttributeValue && traceAttributeValue.toLowerCase() === "true") {
//			//		environment._TRACE_MODE = true;
//			//	}
//			//	var testAttributeValue = __.browserHelper.getFirstAttribute("script", "data-test");
//			//	if (testAttributeValue && testAttributeValue.toLowerCase() === "true") {
//			//		environment._TEST_MODE = true;
//			//	}
//			//} else {

//			//	//we are probably running in node, so check node's debug values

//			//	// if the v8debug object exists, set DEBUG and TRACE and TEST on
//			//	// or if we are running under phantomjs, and we somewhere set "debugMode=true" in the global phantom object
//			//	//if (typeof v8debug === "object" || (typeof phantom !== "undefined"))// && (<any>phantom).debugMode===true))
//			//	{
//			//		environment._DEBUG_MODE = environment._TRACE_MODE = environment._TEST_MODE = true;
//			//	}
//			//}

//			//setup env based on our set build modes
//			if (environment._DEBUG_MODE) {
//				if (typeof (Error) !== "undefined" && (<any>Error).stackTraceLimit) {
//					//chrome / webkit / v8 feature for increasing stack trace above 10.  see https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
//					(<any>Error).stackTraceLimit = 100;
//				}
//			}
//		}
//		_initBuildModes();

//	}
//	__initializeLogger();
//}
/* tslint:enable */

