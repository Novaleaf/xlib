// ///// <reference path="../../../typings/all.d.ts" />
// "use strict";

// //export import bunyan = require("bunyan");
// import ex = require( "../core/exception" );
// import environment = require( "../core/environment" );
// import stringHelper = require( "../core/stringhelper" );
// import serialization = require( "../core/serialization" );
// import reflection = require( "../core/reflection" );
// import Stream = require( "stream" );
// //import PrettyStream = require("bunyan-prettystream");
// import _ = require( "lodash" );
// import moment = require( "moment" );
// import assert = require( "assert" );
// import Exception = ex.Exception;
// import * as diagnostics from "../core/diagnostics";

// import init = require( "../_internal/init" );

// class LoggerFatalException extends Exception { }

// /** coloring for node console */
// import Chalk = require( "chalk" );

// interface IAnsiColor {
// 	foreground: string;
// 	background: string;
// 	highIntensity: boolean;
// 	bold: boolean;
// }
// /**
//  * helper to convert ansi color codes to string representations.    conversions taken from https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
//  * @param input
//  */
// function colorCodeToString( input: string, currentColor?: IAnsiColor ): IAnsiColor {
// 	var defaultColor: IAnsiColor = { foreground: "grey", background: "black", bold: false, highIntensity: false, };

// 	var result = _.clone( defaultColor );

// 	if ( currentColor != null ) {
// 		result = _.clone( currentColor );
// 	}
// 	input = input.trim();
// 	if ( input.indexOf( "[" ) === 0 ) {
// 		input = input.substring( 1 );
// 	}

// 	if ( input.indexOf( "m" ) > 0 ) {
// 		input = input.substring( 0, input.length - 1 );
// 	}

// 	var sections = input.split( ";" );
// 	for ( let i = 0; i < sections.length; i++ ) {
// 		var num = parseInt( sections[ i ] );
// 		//color names from http://www.w3schools.com/cssref/css_colornames.asp
// 		switch ( num ) {
// 			case 0: //reset
// 			case 27: //positive
// 				result = _.clone( defaultColor );
// 				break;
// 			case 1:
// 				//bold
// 				result.bold = true;
// 				break;
// 			case 2: //faint
// 			case 21: //bold off
// 			case 22: //normal intensity
// 				result.bold = false;
// 				break;
// 			case 7: //swap
// 				var tmp = result.foreground;
// 				result.foreground = result.background;
// 				result.background = tmp;
// 				break;
// 			case 30:
// 				result.foreground = "black";
// 				break;
// 			case 31:
// 				result.foreground = "red";
// 				break;
// 			case 32:
// 				result.foreground = "green";
// 				break;
// 			case 33:
// 				result.foreground = "darkyellow";
// 				break;
// 			case 34:
// 				result.foreground = "darkblue";
// 				break;
// 			case 35:
// 				result.foreground = "magenta";
// 				break;
// 			case 36:
// 				result.foreground = "darkturquoise"; //darkcyan
// 				break;
// 			case 37:
// 				result.foreground = "lightgrey";
// 				break;
// 			case 39:
// 				result.foreground = defaultColor.foreground;
// 				break;
// 			case 40:
// 				result.background = "black";
// 				break;
// 			case 40:
// 				result.background = "black";
// 				break;
// 			case 41:
// 				result.background = "darkred";
// 				break;
// 			case 42:
// 				result.background = "green";
// 				break;
// 			case 43:
// 				result.background = "yellow";
// 				break;
// 			case 44:
// 				result.background = "blue";
// 				break;
// 			case 45:
// 				result.background = "magenta";
// 				break;
// 			case 46:
// 				result.background = "cyan";
// 				break;
// 			case 47:
// 				result.background = "white";
// 				break;
// 			case 49:
// 				result.background = defaultColor.background;
// 				break;
// 			case 90:
// 				result.foreground = "lightgrey";
// 				break;
// 			case 91:
// 				result.foreground = "hotpink";
// 				break;
// 			case 92:
// 				result.foreground = "lightgreen";
// 				break;
// 			case 93:
// 				result.foreground = "yellow";
// 				break;
// 			case 94:
// 				result.foreground = "blue";
// 				break;
// 			case 95:
// 				result.foreground = "fuchsia";
// 				break;
// 			case 96:
// 				result.foreground = "cyan";
// 				break;
// 			case 97:
// 				result.foreground = "white";
// 				break;
// 			case 100:
// 				result.background = "lightgrey";
// 				break;
// 			case 101:
// 				result.background = "hotpink";
// 				break;
// 			case 102:
// 				result.background = "lightgreen";
// 				break;
// 			case 103:
// 				result.background = "yellow";
// 				break;
// 			case 104:
// 				result.background = "blue";
// 				break;
// 			case 105:
// 				result.background = "fuchsia";
// 				break;
// 			case 106:
// 				result.background = "cyan";
// 				break;
// 			case 107:
// 				result.background = "white";
// 				break;
// 			default:
// 				if ( environment.logLevel <= environment.LogLevel.DEBUG ) {
// 					throw new LoggerFatalException( "colorCodeToString() unknown color " + input );
// 				}
// 			//no action (do not set anything)

// 		}
// 	}

// 	return result;
// }


// interface IReplacement extends IAnsiColor {
// 	start: number; end: number; matchText: string;
// }




// //export class NewLogger {
// //    constructor(public name: string, public logLevel = environment.logLevel) {
// //    }


// //    private _log(targetLogLevel: environment.LogLevel, ...args: any[]) {
// //        if (targetLogLevel < this.logLevel) {
// //            return;
// //        }

// //    }
// //}

// init.onInitialize( ( args: init.IInitArgs ) => { Logger.initialize( args ); } )


// /** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
// export class Logger {


// 	/** @hidden */
// 	public static initialize( args: init.IInitArgs ) {
// 		let initOverrides = Logger.__overridenStorageHelper_parseEnv();
// 		Logger._logLevelOverrides.push( ...initOverrides.logLevelOverrides );
// 	}



// 	/** override the loglevel for specific, focused debugging.   */
// 	public static overrideLogLevel( namePattern: RegExp, newLogLevel: environment.LogLevel ) {

// 		Logger._logLevelOverrides.push( { namePattern, newLogLevel } );
// 	}

// 	/** helper for applying env.logLevelOverrides */
// 	private static __overridenStorageHelper_parseEnv() {
// 		const envVar = environment.getEnvironmentVariable( "logLevelOverrides", null );
// 		if ( envVar == null || envVar.length === 0 ) {
// 			return { logLevelOverrides: [] };
// 		}
// 		try {
// 			let parsedData: { [ key: string ]: string } = serialization.jsonX.parse( envVar );
// 			if ( _.isPlainObject( parsedData ) === false ) {
// 				throw new Error( `unable to parse.  must be in format ' { [ key: string ]: string }' ` );
// 			}
// 			let logLevelOverrides: { namePattern: RegExp, newLogLevel: environment.LogLevel }[] = [];
// 			_.forIn( parsedData, ( value, key ) => {
// 				logLevelOverrides.push( { namePattern: new RegExp( key ), newLogLevel: environment.LogLevel[ value ] } );
// 			} );
// 			return { logLevelOverrides };

// 		} catch ( _ex ) {
// 			throw new ex.Exception( `unable to parse environment logLevelOverrides. you passed: ${ envVar }`, { innerException: ex.Exception.castErr( _ex ) } );
// 		}
// 	}

// 	/** storage of  env.logLevelOverrides  for filtering log requests .  added to  by the .initialize() static method and log._overrideLogLevel() method */
// 	protected static _logLevelOverrides: { namePattern: RegExp, newLogLevel: environment.LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL" }[] = [];

// 	/** invoke this to set a global override for the minimum log level for a given callsite.*/
// 	public _overrideLogLevel( minLogLevel: environment.LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL",
// 		/** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
// 			* if ommitted, will match the caller's fileName  */
// 		callSiteRegEx?: string | RegExp, ) {
// 		if ( callSiteRegEx == null ) {
// 			let callFile = diagnostics.computeCallFile( 1 );
// 			callSiteRegEx = new RegExp( `.*${ stringHelper.escapeRegExp( callFile ) }.*` );
// 		}
// 		if ( typeof ( callSiteRegEx ) === "string" ) {
// 			callSiteRegEx = new RegExp( callSiteRegEx );
// 		}
// 		Logger._logLevelOverrides.push( { namePattern: callSiteRegEx, newLogLevel: minLogLevel } );

// 	}

// 	constructor() {
// 	}
// 	/** converts objects to strings, leaves primitive types intact */
// 	private _normalizeArgs( args: any[] ) {
// 		//generate log string
// 		var finalArgs: any[] = [];

// 		_.forEach( args, ( arg ) => {
// 			var typeName = reflection.getTypeName( arg );
// 			var type = reflection.getType( arg );

// 			switch ( type ) {
// 				case reflection.Type.Error:
// 					var objArg;
// 					try {
// 						objArg = ( serialization.jsonX.inspectStringify( arg, 3, false, true, undefined, undefined, "\t" ) );
// 						//finalArgs.push(JSON.stringify(arg,undefined,"\t"));
// 					} catch ( ex ) {
// 						objArg = ( "[Object???]" );

// 					}
// 					finalArgs.push( Chalk.red.bold( objArg ) );
// 					break;
// 				case reflection.Type.object:
// 					var objArg;
// 					try {
// 						objArg = ( serialization.JSONX.inspectStringify( arg, 3, false, false, undefined, undefined, "\t" ) );
// 						//finalArgs.push(JSON.stringify(arg,undefined,"\t"));
// 					} catch ( ex ) {
// 						objArg = ( "[Object???]" );

// 					}
// 					finalArgs.push( Chalk.green.bold( objArg ) );
// 					break;
// 				default:
// 					finalArgs.push( arg );
// 			}
// 		} );
// 		return finalArgs;
// 	}
// 	/**
// 	 *  returns arguments formatted for console.log use
// 	 * @param targetLogLevel
// 	 * @param args
// 	 */
// 	private _log( targetLogLevel: environment.LogLevel, args: any[] ): any[] {

// 		const callSite = diagnostics.computeStackTrace( 2, 1 )[ 0 ];

// 		let minimumLogLevel: environment.LogLevel = environment.logLevel;
// 		//allow runtime adjustment of loglevels (useful for focused debugging)
// 		Logger._logLevelOverrides.forEach( ( pair ) => {
// 			if ( pair.namePattern.test( callSite ) ) {
// 				if ( typeof pair.newLogLevel === "string" ) {
// 					minimumLogLevel = environment.LogLevel[ pair.newLogLevel ];
// 				} else {
// 					minimumLogLevel = pair.newLogLevel;
// 				}
// 			}
// 		} );

// 		if ( targetLogLevel < minimumLogLevel ) {
// 			return;
// 		}
// 		return this._doLog( callSite, targetLogLevel, args );// this._doLog.apply( this, arguments );

// 	}

// 	private _doLog( callSite: string, targetLogLevel: environment.LogLevel, args: any[] ) {

// 		/** cleaned up args, passed to "finalArgs" */
// 		let normalizedArgs: any[];
// 		let finalArgs: any[];
// 		switch ( environment.platformType ) {
// 			case environment.PlatformType.Browser:
// 				finalArgs = args;
// 				break;
// 			case environment.PlatformType.NodeJs:
// 			default:
// 				normalizedArgs = this._normalizeArgs( args );
// 				finalArgs = _.clone( normalizedArgs );
// 				break;
// 		}

// 		var logLevelColor;
// 		switch ( targetLogLevel ) {
// 			case environment.LogLevel.TRACE:
// 				logLevelColor = Chalk.black.bgWhite;
// 				break;
// 			case environment.LogLevel.DEBUG:
// 				logLevelColor = Chalk.bgGreen;
// 				break;
// 			case environment.LogLevel.INFO:
// 				logLevelColor = Chalk.bgCyan;
// 				break;
// 			case environment.LogLevel.WARN:
// 				logLevelColor = Chalk.red.bgYellow;
// 				break;
// 			case environment.LogLevel.ERROR:
// 				logLevelColor = Chalk.bgMagenta;
// 				break;
// 			case environment.LogLevel.FATAL:
// 				logLevelColor = Chalk.bgRed;
// 				break;
// 			default:
// 				logLevelColor = Chalk.inverse.bold;
// 				throw new LoggerFatalException( "unknown targetLogLevel" );
// 			//break;
// 		}

// 		//pretty trace callsite
// 		const nameToReport = Chalk.magenta( callSite );
// 		// //find line number
// 		// let lineNumberToReport: string = "";

// 		// let nameToReport = this.name;
// 		// try {
// 		// 	let nameNoPrefix = stringHelper.removeBefore( nameToReport, "\\", false, true );
// 		// 	nameNoPrefix = stringHelper.removeBefore( nameNoPrefix, "/", false, true );
// 		// 	nameNoPrefix = stringHelper.removeAfter( nameNoPrefix, ".", false, true );
// 		// 	let stack = ex.getStackTrace( `.*${ nameNoPrefix }\.`, 1, true );
// 		// 	if ( stack.length > 0 ) {
// 		// 		let extAndLineNumber = stringHelper.removeBefore( stack[ 0 ], ".", true, true );
// 		// 		extAndLineNumber = stringHelper.removeAfter( extAndLineNumber, ")" );

// 		// 		//try to inject our line number into name
// 		// 		if ( extAndLineNumber.length > 0 && extAndLineNumber.indexOf( "." ) === 0 && nameToReport.indexOf( "." ) > 0 ) {
// 		// 			nameToReport = stringHelper.removeAfter( nameToReport, ".", false, true );
// 		// 			nameToReport = Chalk.magenta( `${ nameToReport }${ extAndLineNumber }` ) as any;
// 		// 		} else {
// 		// 			nameToReport = Chalk.cyan( nameToReport ) as any;
// 		// 			lineNumberToReport = Chalk.magenta( `(${ extAndLineNumber })` ) as any;
// 		// 		}

// 		// 	}
// 		// } catch ( ex ) {
// 		// 	console.error( "error when finding line number of log entry.  aborting attempt to instrument log.", ex );
// 		// }

// 		/** add "header" info to the log data */
// 		finalArgs.unshift( logLevelColor( environment.LogLevel[ targetLogLevel ] ) );
// 		//finalArgs.unshift( lineNumberToReport );
// 		finalArgs.unshift( nameToReport );
// 		finalArgs.unshift( Chalk.gray( moment().toISOString() ) );

// 		//on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
// 		switch ( environment.platformType ) {
// 			case environment.PlatformType.Browser:
// 				switch ( targetLogLevel ) {
// 					case environment.LogLevel.TRACE:
// 						console.trace.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.DEBUG:
// 						console.trace.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.INFO:
// 						console.trace.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.WARN:
// 						console.error.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.ERROR:
// 						console.error.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.FATAL:
// 						console.error.apply( console, finalArgs );
// 						break;
// 					default:
// 						throw new LoggerFatalException( "unknown targetLogLevel" );
// 					//break;
// 				}
// 				break;
// 			//on node, we use only show stacktrace for explicit trace call or errors.
// 			case environment.PlatformType.NodeJs:
// 			default:
// 				switch ( targetLogLevel ) {
// 					case environment.LogLevel.TRACE:
// 						// console.trace.apply( console, [ "test" ] );
// 						// let traceArgs = [ JSON.stringify( normalizedArgs ) ];
// 						// console.trace.apply( console, traceArgs );
// 						// console.trace( "test" );
// 						// console.trace( "test", ...normalizedArgs );
// 						// console.trace( "test", ...finalArgs );
// 						console.log.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.DEBUG:
// 						console.log.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.INFO:
// 						console.log.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.WARN:
// 						console.warn.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.ERROR:
// 						console.error.apply( console, finalArgs );
// 						break;
// 					case environment.LogLevel.FATAL:
// 						console.error.apply( console, finalArgs );
// 						break;
// 					default:
// 						throw new LoggerFatalException( "unknown targetLogLevel" );
// 					//break;
// 				}
// 				break;
// 		}

// 		return finalArgs;
// 	}

// 	public trace( ...args: any[] ) {
// 		this._log( environment.LogLevel.TRACE, args );
// 	}
// 	public debug( ...args: any[] ) {
// 		this._log( environment.LogLevel.DEBUG, args );
// 	}
// 	public info( ...args: any[] ) {
// 		this._log( environment.LogLevel.INFO, args );
// 	}
// 	public warn( ...args: any[] ) {
// 		this._log( environment.LogLevel.WARN, args );
// 	}

// 	/** for now, same as log.error().   later will notify via email. */
// 	public hackAttempt( ...args: any[] ) {
// 		this.error( ...args );
// 	}
// 	public errorHistory: any[] = [];

// 	public error( ...args: any[] ) {
// 		let finalArgs = this._log( environment.LogLevel.ERROR, args );

// 		//log these for our diagnostics api to pickup:   http://localhost/metrics/v2/healthcheck-errors
// 		let errorHistoryEntry: string[] = finalArgs.map( ( arg ) => Chalk.stripColor( arg ) );
// 		Logger.errorHistory.unshift( errorHistoryEntry );
// 		if ( Logger.errorHistory.length > 200 ) {
// 			Logger.errorHistory.length = 200;
// 		}

// 		if ( finalArgs != null ) {
// 			//this.info(finalArgs);
// 			//remove first 2 items from finalArgs
// 			finalArgs.shift();
// 			finalArgs.shift();

// 			let finalArgsStr = finalArgs.join( "  " );



// 			return new ex.Exception( finalArgsStr );
// 		} else {
// 			return new ex.Exception( "" );
// 		}
// 	}
// 	public fatal( ...args: any[] ) {
// 		args.unshift( false );
// 		this.assert.apply( this, args );
// 		args.shift();
// 		throw new ex.CorelibException( stringHelper.format.apply( stringHelper, args ) );
// 	}


// 	assert( testCondition: boolean, ...args: any[] ): void {
// 		if ( testCondition === true ) {
// 			return;
// 		}
// 		if ( testCondition !== false ) {
// 			throw new ex.CorelibException( "first parameter must be a boolean (to assert must evaluate to true or false)" );
// 		}

// 		let finalArgs: any[];
// 		switch ( environment.platformType ) {
// 			case environment.PlatformType.Browser:
// 				finalArgs = args;
// 				break;
// 			case environment.PlatformType.NodeJs:
// 			default:
// 				finalArgs = this._normalizeArgs( args );
// 				break;
// 		}

// 		const callSite = diagnostics.computeStackTrace( 1, 1 )[ 0 ];

// 		finalArgs.unshift( Chalk.bgYellow( "ASSERT" ) );
// 		finalArgs.unshift( Chalk.magenta( callSite ) );
// 		finalArgs.unshift( Chalk.gray( moment().toISOString() ) );
// 		//finalArgs.unshift(false);

// 		//on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
// 		switch ( environment.platformType ) {
// 			case environment.PlatformType.Browser:
// 				console.assert( false, ...finalArgs );
// 				// finalArgs.unshift( false );
// 				// console.assert.apply( console, finalArgs );
// 				//assert(false, finalArgs.join("\n"));
// 				break;

// 			case environment.PlatformType.NodeJs:
// 				console.assert( false, ...finalArgs );
// 				// console.trace.apply( console, finalArgs );
// 				// assert( false, finalArgs.join( "\n" ) );
// 				break;
// 			default:
// 				console.assert( false, ...finalArgs );
// 				// finalArgs.unshift( false );
// 				// //console.warn.apply(console, finalArgs);
// 				// console.assert.apply( console, finalArgs );
// 				break;
// 		}



// 	}
// 	/** use to mark code that needs to be finished before it can be run.   asserts when hit. */
// 	todo( ...args: any[] ) {
// 		//	var msg = "TODO: " + stringHelper.format2( format, params );
// 		this.assert( false, ...args );
// 	}

// 	/** notes to do something later. */
// 	todo_later( ...args: any[] ) {
// 		//var msg = "TODO: LATER:" + stringHelper.format2( format, params );
// 		this.warn( ...args );
// 	}


// 	deprecated( message?: string ) {
// 		this.assert( false, "implement deprecated" );
// 	}
// 	/** note to redo this before shipping (any time not in #DEBUG mode) */
// 	refactor( ...args: any[] ) {
// 		if ( environment.envLevel === environment.EnvLevel.DEV ) {
// 			this.warn( ...args );
// 		} else {
// 			this.fatal( "refactor must be done before production", ...args );
// 		}
// 		//this.assert(false, "implement deprecated");
// 	}

// }


// // var __isUnhandledHooked = false;
// // let _unhandledDefaultLogger = new Logger( "logging.logPromiseUnhandledRejections" );
// // export function logPromiseUnhandledRejections( logger = _unhandledDefaultLogger ) {
// // 	if ( __isUnhandledHooked === true ) {
// // 		return;
// // 	}
// // 	__isUnhandledHooked = true;
// // 	logger.debug( "exec xlib.diagnostics.logger.logPromiseUnhandledRejections()" );
// // 	switch ( environment.platformType ) {
// // 		case environment.PlatformType.Browser:
// // 			window.addEventListener( "unhandledrejection", ( e: any ) => {
// // 				var reason = e.detail.reason;
// // 				var promise = e.detail.promise;

// // 				logger.error( reason, promise );

// // 				throw e;
// // 			} );
// // 			break;
// // 		case environment.PlatformType.NodeJs:
// // 			process.on( "unhandledRejection", function ( reason, promise ) {
// // 				try {
// // 					//console.log("unhandled");
// // 					//console.log("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection " + JSON.stringify({ arguments }));
// // 					// See Promise.onPossiblyUnhandledRejection for parameter documentation
// // 					logger.error( "xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection", reason, { promise: JSON.parse( JSON.stringify( promise ) ) } );
// // 					//logger.error(reason, promise);
// // 				} catch ( ex ) {
// // 					//try {
// // 					//	logger.error("xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection TRY2", JSON.stringify({ reason, promise }));
// // 					//} catch (ex) {
// // 					console.log( "xlib.diagnostics.logging.logPromiseUnhandledRejections()=>unhandledRejection try 2 failed!" );
// // 					//}
// // 				}
// // 				throw reason;

// // 			} );
// // 			break;
// // 	}


// // }

// ///////** wrapper over bunyan logger, includes extra diagnostics helpers such as .assert(), and will pretty output to console if no listener is attached.*/
// //////export class _Logger {
// //////    /** target of this logger wrapper*/
// //////    public bunyanLogger: bunyan.Logger;
// //////    public options: bunyan.LoggerOptions;

// //////    constructor(name: string,
// //////        /** if no stream is specified we by default pretty-print bunyan output to console.   pass TRUE to disable this. */
// //////        noPrettyPrint?: boolean);
// //////    constructor(options: bunyan.LoggerOptions,
// //////        /** if no stream is specified we by default pretty-print bunyan output to console.   pass TRUE to disable this. */
// //////        noPrettyPrint?: boolean);
// //////    constructor(arg: any, noPrettyPrint = false) {
// //////        noPrettyPrint = true;
// //////        if (typeof (arg) === "string") {
// //////            this.options = { name: arg };
// //////        } else {
// //////            this.options = arg;
// //////        }

// //////        if (this.options.level == null) {
// //////            this.options.level = environment.LogLevel[environment.logLevel];
// //////        }

// //////        if (noPrettyPrint === false && this.options.stream == null && this.options.streams == null) {
// //////            //install prettyprint


// //////            var prettyStream = new PrettyStream();

// //////            if (environment.platformType === environment.PlatformType.Browser) {
// //////                prettyStream.on("data", (data: string) => {

// //////                    //convert console color to browser color

// //////                    //for example:  [[37m2015-11-11T23:05:25.250Z[39m] [36m INFO[39m: /index-main.tsx/undefined on localhost:8080: [36mthis is a log of a dog, cat! meow?[39m
// //////                    var text = data.trim();
// //////                    var searchPosition = 0; //so we skip already searched areas
// //////                    var replacements: IReplacement[] = [];
// //////                    var currentColor: IAnsiColor = null;
// //////                    while (true) {
// //////                        var start = text.indexOf("[", searchPosition);

// //////                        if (start < 0) {
// //////                            break;
// //////                        }
// //////                        var end = text.indexOf("m", start);
// //////                        if (end < 0) {
// //////                            break;
// //////                        }
// //////                        end = end + 1; //include the m

// //////                        //reaquire the start, to find closest "[" to the m, in case there are orphan "["'s laying around
// //////                        start = text.lastIndexOf("[", end);
// //////                        searchPosition = start + 1; //make sure our next loop doesn't include this

// //////                        var potentialMatch = text.substring(start, end);
// //////                        if (potentialMatch.length < 3 || potentialMatch.substring(1, potentialMatch.length - 1).match(/[a-z ]/i) != null) {
// //////                            //invalid characters voids this potential match
// //////                            continue;
// //////                        }

// //////                        //get colors
// //////                        currentColor = colorCodeToString(potentialMatch, currentColor);
// //////                        let replacement = <IReplacement>_.clone(currentColor);
// //////                        replacement.start = start;
// //////                        replacement.end = end;
// //////                        replacement.matchText = potentialMatch;
// //////                        replacements.push(replacement);
// //////                    }

// //////                    //apply replacements to string
// //////                    var cssColors: string[] = [];
// //////                    for (let i = replacements.length; i > 0; i--) {
// //////                        let replacement = replacements[i - 1];
// //////                        //var replaceValue = 
// //////                        text = text.replace(replacement.matchText, "%c");

// //////                        var colorString = "";
// //////                        if (replacement.foreground != null) {
// //////                            colorString += "color:" + replacement.foreground + ";";
// //////                        }
// //////                        if (replacement.background != null) {
// //////                            colorString += "background:" + replacement.background + ";";
// //////                        }
// //////                        cssColors.unshift(colorString);
// //////                    }

// //////                    //set initial color
// //////                    text = "%c" + text;
// //////                    cssColors.unshift("color:grey;background:black;");

// //////                    //apply to console
// //////                    var args = cssColors.slice();
// //////                    args.unshift(text);
// //////                    console.log.apply(console, args);


// //////                    //console.log(data);
// //////                });
// //////                //prettyStream.on("end", (data) => {
// //////                //    console.log(data);
// //////                //});
// //////            } else {
// //////                prettyStream.pipe(process.stdout);
// //////            }

// //////            this.options.stream = prettyStream;


// //////            //this.prettyPrintStream = prettyStream;

// //////            //this.prettyPrintStream = new Stream.Writable();
// //////            //var fcn: any = (obj: any) => {
// //////            //	if (obj.msg != null) {
// //////            //		console.log(obj.msg);
// //////            //	} else {
// //////            //		console.log(JSON.stringify(obj));
// //////            //	}
// //////            //};
// //////            //this.prettyPrintStream.write = fcn;
// //////            //this.options.stream = this.prettyPrintStream;
// //////            //var bstds: any = bunyan.stdSerializers;
// //////            //this.options.serializers = {
// //////            //	err: bstds.err,
// //////            //	req: bstds.req,
// //////            //	res: bstds.res,
// //////            //};

// //////        }

// //////        if (environment.LogLevel[this.options.level] > environment.LogLevel.DEBUG) {
// //////            //not in debug mode, so disable our asserts from firing (noop it)
// //////            /* tslint:disable */
// //////            this.assert = () => { };
// //////            /* tslint:enable */
// //////        }




// //////        //if (this.options.src == null && environment.logLevel <= environment.EnvLevel.DEBUG) {
// //////        //	this.options.src = true;
// //////        //}
// //////        this.bunyanLogger = bunyan.createLogger(this.options);
// //////    }

// //////    public trace(error: Error, format?: string, ...params: any[]): void;
// //////    public trace(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public trace(obj: Object, format?: string, ...params: any[]): void;
// //////    public trace(format: string, ...params: any[]): void;
// //////    trace(...params: any[]): void {
// //////        this.bunyanLogger.trace.apply(this.bunyanLogger, params);
// //////    }

// //////    public debug(error: Error, format?: string, ...params: any[]): void;
// //////    public debug(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public debug(obj: Object, format?: string, ...params: any[]): void;
// //////    public debug(format: string, ...params: any[]): void;
// //////    debug(...params: any[]): void {
// //////        this.bunyanLogger.debug.apply(this.bunyanLogger, params);
// //////    }

// //////    public info(error: Error, format?: string, ...params: any[]): void;
// //////    public info(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public info(obj: Object, format?: string, ...params: any[]): void;
// //////    public info(format: string, ...params: any[]): void;
// //////    info(...params: any[]): void {
// //////        this.bunyanLogger.info.apply(this.bunyanLogger, params);
// //////    }
// //////    public warn(error: Error, format?: string, ...params: any[]): void;
// //////    public warn(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public warn(obj: Object, format?: string, ...params: any[]): void;
// //////    public warn(format: string, ...params: any[]): void;
// //////    warn(...params: any[]): void {
// //////        this.bunyanLogger.warn.apply(this.bunyanLogger, params);
// //////    }
// //////    public error(error: Error, format?: string, ...params: any[]): void;
// //////    public error(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public error(obj: Object, format?: string, ...params: any[]): void;
// //////    public error(format: string, ...params: any[]): void;
// //////    error(...params: any[]): void {
// //////        this.bunyanLogger.error.apply(this.bunyanLogger, params);
// //////    }

// //////    /** logs as "Fatal" and then throws an exception. */
// //////    public fatal(error: Error, format?: string, ...params: any[]): void;
// //////    public fatal(buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public fatal(obj: Object, format?: string, ...params: any[]): void;
// //////    public fatal(format: string, ...params: any[]): void;
// //////    fatal(...params: any[]): void {
// //////        this.bunyanLogger.fatal.apply(this.bunyanLogger, params);


// //////        throw new LoggerFatalException(this._composeLogDataString(params));
// //////    }


// //////    /** construct a string-loggable version of the bunyan inputs*/
// //////    private _composeLogDataString(params: any[]): string {
// //////        var arg1 = params[0];
// //////        var objStr = "";
// //////        if (typeof (arg1) !== "string") {
// //////            objStr = serialization.JSONX.stringify(arg1) + " ";
// //////            params.shift();
// //////        }
// //////        if (typeof (params[0]) !== "string") {
// //////            return serialization.JSONX.inspectToText(params);
// //////            //throw new ex.CorelibException("format string is missing");
// //////        }
// //////        if (params.length === 1) {
// //////            return objStr + params[0];
// //////        }
// //////        return objStr + stringHelper.format.apply(null, params);
// //////    }

// //////    level(value: any /* number | string */): void {
// //////        this.bunyanLogger.level(value);
// //////    }
// //////    levels(name: any /* number | string */, value: any /* number | string */): void {
// //////        this.bunyanLogger.levels(name, value);
// //////    }

// //////	/** if the testCondition evaluates to false, a breakpoint is triggered, then a fatal is raised.    
// //////	 * This ONLY triggers when in DEBUG mode, and it is otherwise the same as log.fatal().  (Execution will stop)*/
// //////    public assert(testCondition: boolean, error: Error, format?: string, ...params: any[]): void;
// //////    public assert(testCondition: boolean, buffer: Buffer, format?: string, ...params: any[]): void;
// //////    public assert(testCondition: boolean, obj: Object, format?: string, ...params: any[]): void;
// //////    public assert(testCondition: boolean, format: string, ...params: any[]): void;
// //////    assert(testCondition: boolean, ...params: any[]): void {
// //////        if (testCondition === true) {
// //////            return;
// //////        }
// //////        if (testCondition !== false) {
// //////            throw new ex.CorelibException("first parameter to assert must evaluate to true or false");
// //////        }

// //////        var logStr = this._composeLogDataString(params);


// //////        console.assert(false, logStr);

// //////        debugger;
// //////        this.error.apply(this, params);
// //////    }
// //////    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
// //////    todo(format = "TODO: not implemented", ...params: any[]) {
// //////        var msg = "TODO: " + stringHelper.format2(format, params);
// //////        this.assert(false, msg);
// //////    }
// //////    deprecated(message?: string) {
// //////        this.assert(false, "implement deprecated");
// //////    }
// //////    /** note to redo this before shipping (any time not in #DEBUG mode) */
// //////    refactor(message?: string) {
// //////        this.assert(false, "implement deprecated");
// //////    }
// //////}


// ////////TODO:  later optimization?  (noop logging in production?  maybe not)
// ////////////disable methods
// //////////if (!environment._DEBUG_MODE) {
// //////////	if (environment._TRACE_MODE) {
// //////////		//replace assert with trace
// //////////		logger.assert = (condition, message?, ...args) => { if (condition === false) { logger.trace("ASSERT", __.jsHelper.apply<string>(stringHelper.format, __, args, message)); } };
// //////////	} else {
// //////////		//no op calls

// //////////		//console.log("noop assert");
// //////////		logger.assert = () => { };
// //////////	}
// //////////}
// //////////if (!environment._TRACE_MODE) {
// //////////	//no op calls
// //////////	//console.log("noop message/trace");
// //////////	log.trace = () => { };
// //////////	//no op calls
// //////////	logger.trace = () => { };
// //////////}

// ////////////notify if tracing
// //////////var _traceAttributeValue = __.browserHelper.getFirstAttribute("script", "data-trace-keys");
// //////////if (_traceAttributeValue != null) {
// //////////	//trace filters specified, apply those
// //////////	logger._traceKeysToEnable = _traceAttributeValue.split(",").map((value) => value.trim());
// //////////} else {
// //////////	if (environment._TRACE_MODE) {
// //////////		//no filters specified, log it
// //////////		var msg = "";
// //////////		if (__.browserHelper.isBrowser) {
// //////////			msg = "to disable, add the \"data-trace-keys\" attribute to your boot-loader script element, with a comma-seperated list of keys you wish to enable.  "
// //////////			+ "if you wish to change keys at runtime, add/remove from logger._traceKeysToEnable";
// //////////		} else {
// //////////			msg = " You can change what log.trace() and logger.trace() keys will be printed by add/remove from corelib.logger._traceKeysToEnable array";
// //////////		}
// //////////		log.trace("corelib.Logger", " ======== NO TRACE FILTERS HAVE BEEN SPECIFIED!  ALL TRACES ENABLED!  =================  \n{0}\n-------------------------------------", msg);

// //////////	}
// //////////}
