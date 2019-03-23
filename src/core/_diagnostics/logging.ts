// tslint:disable:no-console

import * as environment from "../environment";
import * as stringHelper from "../_util/stringhelper";
import * as serialization from "../serialization";
import * as reflection from "../reflection";
import * as _ from "lodash";
//import moment = require( "moment" );
//import * as luxon from "luxon";
import * as diagnostics from "../diagnostics";
import * as exception from "./exception";

import { LogLevel } from "../environment";
import * as util from "util";

/** coloring for node console */
import { default as Chalk } from "chalk";
//import * as stripAnsi from "strip-ansi";
import stripAnsi = require( "strip-ansi" );

// if ( environment.platformType === environment.PlatformType.NodeJs && environment.osName === environment.OsName.win32 ) {
// 	Chalk.enabled = true;
// 	Chalk.level = 2;
// }


interface IAnsiColor {
	foreground: string;
	background: string;
	highIntensity: boolean;
	bold: boolean;
}
/**
 * helper to convert ansi color codes to string representations.    conversions taken from https://en.wikipedia.org/wiki/ANSI_escape_code#graphics
 * @param input color code input.
 */
function colorCodeToString( input: string, currentColor?: IAnsiColor ): IAnsiColor {
	let defaultColor: IAnsiColor = { foreground: "grey", background: "black", bold: false, highIntensity: false, };

	let result = _.clone( defaultColor );

	if ( currentColor != null ) {
		result = _.clone( currentColor );
	}
	input = input.trim();
	if ( input.indexOf( "[" ) === 0 ) {
		input = input.substring( 1 );
	}

	if ( input.indexOf( "m" ) > 0 ) {
		input = input.substring( 0, input.length - 1 );
	}

	let sections = input.split( ";" );
	for ( let i = 0; i < sections.length; i++ ) {
		let num = parseInt( sections[ i ] );
		//color names from http://www.w3schools.com/cssref/css_colornames.asp
		switch ( num ) {
			case 0: //reset
			case 27: //positive
				result = _.clone( defaultColor );
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
				throw new exception.XlibException( "colorCodeToString() unknown color " + input );
			//no action (do not set anything)
		}
	}

	return result;
}


interface IReplacement extends IAnsiColor {
	start: number; end: number; matchText: string;
}
interface ILogLevelOverride { callSiteMatch: RegExp; minLevel: LogLevel; }


class LogThrowException extends exception.Exception {
	constructor( message: string, public logOutput: string[], options?: exception.IExceptionOptions ) {
		super( message, options );
	}
}
/** the results of an attempt to log. */
interface ILogResults {
	/** @returns array of strings representing all logged values.
	 *  array element 0 is time,
	 * element 1 is callsite,
	 * element 2 is logLevel.
	 * passed args are in element 3 onwards, converted to stringified JSON if objects.
	 * ```null``` is returned if not logged (such as if minLogLevel is greater than requested) */
	consoleOut?: string[];
	/** if the request was logged.   IE: if the log level was high enough to meet minLogLevel (env.LogLevel or explicit overrides).   If false, the other details such as args will be null */
	isLogged: boolean;

	time: Date;
	callsite: string;
	logLevel: LogLevel;
	/** the arguments passed to the log function. if objects, they are converted to JSON.
	 * If the request is not logged, this will be null.
	 */
	parsedArgs?: Array<string | boolean | number | Date | {}>;

}


/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
export class Logger {


	/** override the loglevel for specific, focused debugging.     */
	public static overrideLogLevel(
		/** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
	* if ommitted, will match the caller's fileName  */
		callSiteMatch: RegExp,
		/** the minimum logLevel you want to be emitted.
			*
			* ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
			* For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
			This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
		 */
		minLevel: LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL" ) {

		if ( ( typeof minLevel ) === "string" ) {
			minLevel = LogLevel[ minLevel as "TRACE" ];
		}
		minLevel = minLevel as LogLevel;
		Logger._overrides.push( { callSiteMatch, minLevel } );
	}


	/** storage of  env.logLevelOverrides  for filtering log requests .  added to  by the .initialize() static method and log._overrideLogLevel() method */
	protected static _overrides: Array<ILogLevelOverride> = [];

	/** invoke this to set a global override for the minimum log level for a given callsite.*/
	public overrideLogLevel(
		/** the minimum logLevel you want to be emitted.
			*
			* ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
			* For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
			This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
		 */
		minLevel: LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL",
		/** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
			* if ommitted, will match the caller's fileName  */
		callSiteMatch?: string | RegExp, ) {
		if ( callSiteMatch == null ) {
			let callFile = diagnostics.computeCallFile( 1 );
			callSiteMatch = new RegExp( `.*${ stringHelper.escapeRegExp( callFile ) }.*` );
		}
		if ( typeof ( callSiteMatch ) === "string" ) {
			callSiteMatch = new RegExp( callSiteMatch );
		}

		Logger.overrideLogLevel( callSiteMatch, minLevel );


	}

	public static errorHistoryMaxLength = 200;
	/** storage of errors encountered, for diagnostics reporting */
	public static errorHistory: Array<any> = [];

	/** log a message, output will not be auto-truncated to decrease verbosity */
	public traceFull( ...args: Array<any> ) {
		return this._tryLog( LogLevel.TRACE, args, true );
	}

	/** log a message, output will not be auto-truncated to decrease verbosity */
	public debugFull( ...args: Array<any> ) {
		return this._tryLog( LogLevel.DEBUG, args, true );
	}

	/** log a message, output will not be auto-truncated to decrease verbosity */
	public infoFull( ...args: Array<any> ) {
		return this._tryLog( LogLevel.INFO, args, true );
	}

	/** log a message, output will not be auto-truncated to decrease verbosity */
	public warnFull( ...args: Array<any> ) {
		return this._tryLog( LogLevel.WARN, args, true );
	}

	/** log a message, output will not be auto-truncated to decrease verbosity */
	public errorFull( ...args: Array<any> ) {
		return this._tryLog( LogLevel.ERROR, args, true );
	}

	/** log a message, output will be auto truncated in a smart way to decrease verbosity */
	public trace( ...args: Array<any> ) {
		return this._tryLog( LogLevel.TRACE, args, false );
	}

	/** log a message, output will be auto truncated in a smart way to decrease verbosity */
	public debug( ...args: Array<any> ) {
		return this._tryLog( LogLevel.DEBUG, args, false );
	}

	/** log a message, output will be auto truncated in a smart way to decrease verbosity */
	public info( ...args: Array<any> ) {
		return this._tryLog( LogLevel.INFO, args, false );
	}

	/** log a message, output will be auto truncated in a smart way to decrease verbosity */
	public warn( ...args: Array<any> ) {
		return this._tryLog( LogLevel.WARN, args, false );
	}

	/** log a message, output will be auto truncated in a smart way to decrease verbosity */
	public error( ...args: Array<any> ) {
		return this._tryLog( LogLevel.ERROR, args, false );
	}
	/** log a fatal error that is about to crash your application.   the output of this is never truncated.  (it's always full verbosity) */
	public fatal( ...args: Array<any> ) {
		return this._tryLog( LogLevel.FATAL, args, false );
	}

	/** for now, same as log.errorFull().   later will notify via email. */
	public hackAttempt( ...args: Array<any> ) {
		return this.errorFull( "hack attempt", ...args );
	}

	/** log an Error and then throw an Exception */
	public throw( ...args: Array<any> ): never {
		let results = this._tryLog( LogLevel.ERROR, args, false );
		throw new LogThrowException( results.join( ", " ), results, { stackFramesToTruncate: 1 } );
	}

	/** if the testCondition evaluates to false, log an Error and then throw an Exception  */
	throwCheck( testCondition: boolean, ...args: Array<any> ): void {
		if ( testCondition === true ) {
			return;
		}
		if ( testCondition !== false ) {
			throw new exception.XlibException( "first parameter must be a boolean (to assert must evaluate to true or false)" );
		}

		if ( args.length === 0 ) {
			args.push( "throwIf testCondition===false." );
		}

		let finalArgs = this._tryLog( LogLevel.ERROR, args, false );
		throw new LogThrowException( finalArgs.join( ", " ), finalArgs, { stackFramesToTruncate: 1 } );

	}

	/** if ```testCondition``` succeeds, nothing happens.   
	 * Otherwise, if running in ```environment.EnvLevel=PROD``` an assert will be raised (no code interuption).  
	 * If running in a non ```PROD``` environment, a code-interupting ```LogThrowException``` will then be thrown.  
	 * 
	 * 
	 * If you want an exception to always be thrown, use ```throwIf()``` instead.
	 *  */
	assert( testCondition: boolean, ...args: Array<any> ) {
		if ( testCondition === true ) {
			return;
		}
		if ( testCondition !== false ) {
			throw new exception.XlibException( "first parameter must be a boolean (to assert must evaluate to true or false)" );
		}

		if ( args.length === 0 ) {
			args.push( "tryAssert testCondition===false." );
		}

		let finalArgs = this._tryLog( LogLevel.ASSERT, args, false );
		//on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
		switch ( environment.platformType ) {
			case environment.PlatformType.Browser:
				console.assert( false, ...finalArgs );
				// finalArgs.unshift( false );
				// console.assert.apply( console, finalArgs );
				//assert(false, finalArgs.join("\n"));
				break;

			case environment.PlatformType.NodeJs:
				console.assert( false, ...finalArgs );
				// console.trace.apply( console, finalArgs );
				// assert( false, finalArgs.join( "\n" ) );
				break;
			default:
				console.assert( false, ...finalArgs );
				// finalArgs.unshift( false );
				// //console.warn.apply(console, finalArgs);
				// console.assert.apply( console, finalArgs );
				break;
		}
		switch ( environment.envLevel ) {
			case environment.EnvLevel.PROD:
				//noop
				break;
			default:
				throw new LogThrowException( finalArgs.join( ", " ), finalArgs, { stackFramesToTruncate: 1 } );
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
	public _tryLog( requestedLogLevel: LogLevel, args: Array<any>, fullOutput: boolean,
		/** if not set, the function **two levels up*** is marked as the callsite.
		if that's not what you want, you can create your callsite, example showing 3 levels up: ```callSite = diagnostics.computeStackTrace( 3, 1 )[ 0 ];``` */
		callSite?: string, ): Array<string> | undefined {

		if ( callSite == null ) {
			callSite = diagnostics.computeStackTrace( 2, 1 )[ 0 ];
		}

		if ( callSite != null && typeof requestedLogLevel !== "string" ) {
			let minLogLevel: LogLevel = environment.logLevel;

			//allow runtime adjustment of loglevels (useful for focused debugging)
			Logger._overrides.forEach( ( pair ) => {
				if ( pair.callSiteMatch.test( callSite ) ) {
					minLogLevel = pair.minLevel;
				}

			} );

			if ( requestedLogLevel < minLogLevel ) {
				return undefined;
			}
		}


		let finalArgs = this._doLog( callSite, requestedLogLevel, args, fullOutput );// this._doLog.apply( this, arguments );
		//strip colors
		finalArgs = finalArgs.map( ( arg ) => stripAnsi.default( arg ) );
		if ( requestedLogLevel >= LogLevel.ERROR ) {
			//log these for our diagnostics api to pickup:   http://localhost/metrics/v2/healthcheck-errors
			let errorHistoryEntry: Array<string> = finalArgs;
			Logger.errorHistory.unshift( errorHistoryEntry );
			if ( Logger.errorHistory.length > Logger.errorHistoryMaxLength ) {
				Logger.errorHistory.length = Logger.errorHistoryMaxLength;
			}
		}
		return finalArgs;
	}


	private _doLog( callSite: string, targetLogLevel: LogLevel, args: Array<any>, fullOutput: boolean ) {


		let logLevelColor: stringHelper.Chalk.Chalk;
		switch ( targetLogLevel ) {
			case LogLevel.TRACE:
				logLevelColor = Chalk.black.bgWhite;
				break;
			case LogLevel.DEBUG:
				logLevelColor = Chalk.bgGreen;
				break;
			case LogLevel.INFO:
				logLevelColor = Chalk.bgCyan;
				break;
			case LogLevel.WARN:
				logLevelColor = Chalk.red.bgYellow;
				break;
			case LogLevel.ERROR:
				logLevelColor = Chalk.bgMagenta;
				break;
			case LogLevel.FATAL:
				logLevelColor = Chalk.bgRed;
				break;
			case LogLevel.ASSERT:
				logLevelColor = Chalk.bgYellowBright.black;
				break;
			default:
				logLevelColor = Chalk.inverse.bold;
				throw new exception.XlibException( "unknown targetLogLevel" );
			//break;
		}

		//pretty trace callsite
		const nameToReport = Chalk.magenta( callSite );


		const finalArgs: Array<string> = [];

		/** add "header" info to the log data */
		finalArgs.unshift( logLevelColor( LogLevel[ targetLogLevel ] ) );
		//finalArgs.unshift( lineNumberToReport );
		finalArgs.unshift( nameToReport );
		finalArgs.unshift( Chalk.gray( new Date().toISOString() ) );

		//on chrome, we want to use console methods that provide trace, because it's nicely collapsed by default
		switch ( environment.platformType ) {
			case environment.PlatformType.Browser:
				finalArgs.push( ...args ); //browser can view args nicely
				switch ( targetLogLevel ) {
					case LogLevel.TRACE:
					case LogLevel.DEBUG:
					case LogLevel.INFO:
						console.trace( ...finalArgs );
						break;
					case LogLevel.WARN:
					case LogLevel.ERROR:
					case LogLevel.FATAL:
					case LogLevel.ASSERT:
						console.error( ...finalArgs );
						break;
					default:
						throw new exception.XlibException( "unknown targetLogLevel" );
					//break;
				}
				break;
			//on node, we use only show stacktrace for explicit trace call or errors.
			case environment.PlatformType.NodeJs:
			default:
				//node console needs help displaying nicely
				if ( fullOutput ) {
					finalArgs.push( ...args.map( ( arg ) => util.inspect( serialization.jsonX.inspectParse( arg, { maxDepth: Infinity, aggrigateFunctions: true, summarizeLength: Infinity, maxArrayElements: Infinity } ), { colors: true, showHidden: true, depth: Infinity, maxArrayLength: Infinity, breakLength: 300 } ) ) );
				} else {
					finalArgs.push( ...args.map( ( arg ) => util.inspect( serialization.jsonX.inspectParse( arg, { maxDepth: 2, aggrigateFunctions: true, summarizeLength: 300 } ), { colors: true, showHidden: true, depth: Infinity, maxArrayLength: Infinity, breakLength: 200 } ) ) );
				}
				switch ( targetLogLevel ) {
					case LogLevel.TRACE:
					case LogLevel.DEBUG:
					case LogLevel.INFO:
						console.log( ...finalArgs );
						break;
					case LogLevel.WARN:
						console.warn( ...finalArgs );
						break;
					case LogLevel.ERROR:
					case LogLevel.FATAL:
					case LogLevel.ASSERT:
						console.error( ...finalArgs );
						break;
					default:
						throw new exception.XlibException( "unknown targetLogLevel" );
					//break;
				}
				break;
		}

		return finalArgs;
	}


}


/** initialzie upon import */
function _self_initialize() {

	/** helper for applying env.logLevelOverrides */
	function _populateLogLevelOverridesFromEnvVars() {
		const envVar = environment.getEnvironmentVariable( "logLevelOverrides", null );
		if ( envVar == null || envVar.length === 0 ) {
			return;
		}
		try {
			let parsedData = serialization.jsonX.parse( envVar ) as { [ key: string ]: string; };
			if ( _.isPlainObject( parsedData ) === false ) {
				throw new Error( `unable to parse.  must be in format ' { [ key: string ]: string }' ` );
			}
			_.forIn( parsedData, ( value, key ) => {
				const callSiteMatch = new RegExp( key );
				const minLevel = value;
				Logger.overrideLogLevel( callSiteMatch, minLevel as any );
			} );
		} catch ( _ex ) {
			throw new exception.Exception( `unable to parse environment logLevelOverrides. you passed: ${ envVar }`, { innerError: exception.toError( _ex ) } );
		}
	}
	_populateLogLevelOverridesFromEnvVars();

	//noop log levels too low  for better performance
	// tslint:disable-next-line: no-empty
	const noopFcn = ( () => { } ) as any;
	switch ( environment.logLevel ) {
		case LogLevel.ASSERT:
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
		case LogLevel.FATAL:
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
		case LogLevel.ERROR:
			Logger.prototype.warn = noopFcn;
			Logger.prototype.warnFull = noopFcn;
			Logger.prototype.info = noopFcn;
			Logger.prototype.infoFull = noopFcn;
			Logger.prototype.debug = noopFcn;
			Logger.prototype.debugFull = noopFcn;
			Logger.prototype.trace = noopFcn;
			Logger.prototype.traceFull = noopFcn;
			break;
		case LogLevel.WARN:
			Logger.prototype.info = noopFcn;
			Logger.prototype.infoFull = noopFcn;
			Logger.prototype.debug = noopFcn;
			Logger.prototype.debugFull = noopFcn;
			Logger.prototype.trace = noopFcn;
			Logger.prototype.traceFull = noopFcn;
			break;
		case LogLevel.INFO:
			Logger.prototype.debug = noopFcn;
			Logger.prototype.debugFull = noopFcn;
			Logger.prototype.trace = noopFcn;
			Logger.prototype.traceFull = noopFcn;
			break;
		case LogLevel.DEBUG:
			Logger.prototype.trace = noopFcn;
			Logger.prototype.traceFull = noopFcn;
			break;
		case LogLevel.TRACE:
			break;
	}


}
_self_initialize();

