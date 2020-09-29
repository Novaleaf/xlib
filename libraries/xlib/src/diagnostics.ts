import * as exception from "./diagnostics/exception"
export { exception }

import * as env from "./environment"
import _ from "lodash"


import * as pino from "pino"
import * as chalk from "chalk"

//const logger = pino.default()

//! other options here: https://github.com/pinojs/pino/blob/master/docs/api.md#options
export interface ILoggerOptions {


	/** if not specified, defaults to env.logLevel */
	level?: env.LogLevel
	/** ignore some keys when printing to console.   defaults to "pid,hostname" 
	 * disabled for UAT or PROD
	*/
	ignore?: string,
	/** defaults to "yyyymmdd_HHMM:ss.l"
	 * if set to false, will be unix epoch tick.
	 * disabled for UAT or PROD
	 * @remarks
	 * [format docs here](https://www.npmjs.com/package/dateformat)
	*/
	translateTime?: string | boolean,

	/**
	 * **browser only**:  under what envLevel browser calls will redirect to console (not to the logging subsstem).
	 * This is useful for development debugging, as the browser has clickable source links
	 * **IMPORTANT**: using this skips,  the internal logging subsystem: just outputs to console.
	 * default is ["dev"]
	 * used in conjunction with {@link browserConsoleLogLevel} (both must be true)
	 * @remarks
	 * 
	 */
	browserConsoleEnvLevel?: env.EnvLevel[],

	/**
	 * **browser only**:  under what logLevel browser calls will redirect to console (not to the logging subsstem).
	 * This is useful for development debugging, as the browser has clickable source links.
	 * **IMPORTANT**: using this skips,  the internal logging subsystem: just outputs to console.
	 * default is ["trace","debug"]
	 * used in conjunction with {@link browserConsoleEnvLevel} (both must be true)
	 * @remarks
	 * 
	 */
	browserConsoleLogLevel?: env.LogLevel[],
}


export class Logger {

	/**
	 * logging subsystem.   see https://github.com/pinojs/pino
	 */
	public _pino: pino.Logger
	constructor( public name: string, public options: ILoggerOptions = {} ) {

		const envInfo = env.getEnvInfo()
		options = {
			ignore: "pid,hostname",
			translateTime: "yyyymmdd_HHMM:ss.l",
			level: envInfo.log,
			browserConsoleEnvLevel: [ "dev" ],
			browserConsoleLogLevel: [ "trace", "debug" ],
			...options,

		}

		this._pino = pino.default( {
			name,
			level: options.level?.toString().toLowerCase(),
			//options here: https://github.com/pinojs/pino-pretty
			prettyPrint: ( () => {
				if ( _.includes( [ "uat", "prod" ], envInfo.env ) ) { //}envInfo.env  >= env.EnvLevel.UAT ) {
					return false
				}

				return {
					//colorize: chalk.supportsColor as boolean, // --colorize  already the default so can disable this option
					//crlf: false, // --crlf
					errorLikeObjectKeys: [ "err" ], // --errorLikeObjectKeys
					//errorProps: "type,message", // --errorProps
					// levelFirst: false, // --levelFirst
					// messageKey: "msg", // --messageKey
					// levelKey: "level", // --levelKey
					// messageFormat: false, // --messageFormat
					//messageFormat: "{level} -------",
					//timestampKey: "time", // --timestampKey
					translateTime: options.translateTime, // --translateTime
					// search: "foo == `bar`", // --search
					ignore: options.ignore, // --ignore,
					// customPrettifiers: {}

				} as pino.PrettyOptions
			} )(),
			// //browser options here: https://github.com/pinojs/pino/blob/master/docs/browser.md
			// browser: {
			// 	//asObject: true,
			// 	//serialize: true,
			// },
		} )

		if ( envInfo.platform === "browser" && _.includes( options.browserConsoleEnvLevel, envInfo.env ) && _.includes( options.browserConsoleLogLevel, envInfo.log ) ) {
			//method replacement for sourcelinks, idea from: https://stackoverflow.com/questions/9559725/extending-console-log-without-affecting-log-line
			this.trace = Function.bind.call( console.trace, console )
			this.debug = Function.bind.call( console.debug, console )
			this.info = Function.bind.call( console.log, console )
			this.warn = Function.bind.call( console.warn, console )
			this.error = Function.bind.call( console.error, console )
			this.fatal = Function.bind.call( console.error, console )
			this.silent = () => { }
		}
	}


	/** used internally but exposed for convenience.   
	 * allows calling pino as the logger does.  
	 * If you want to access pino directly, use the _pino member
	 */
	private _callPino( method: env.LogLevel, msg: string ): void
	private _callPino( method: env.LogLevel, obj: ILogObj, msg?: string ): void
	private _callPino( method: env.LogLevel, obj: ANY, msg?: string ): void {
		this._pino[ method ]( obj, msg )
	}

	public trace( msgOrObj: string | ILogObj ): void;
	public trace( obj: ILogObj, msg: string ): void;
	public trace( obj: ANY, msg?: string ): void {
		this._callPino( "trace", obj, msg )
	}
	public debug( msgOrObj: string | ILogObj ): void;
	public debug( obj: ILogObj, msg: string ): void;
	public debug( obj: ANY, msg?: string ): void {
		this._callPino( "debug", obj, msg )
	}
	public info( msgOrObj: string | ILogObj ): void;
	public info( obj: ILogObj, msg: string ): void;
	public info( obj: ANY, msg?: string ): void {
		this._callPino( "info", obj, msg )
	}
	public warn( msgOrObj: string | ILogObj ): void;
	public warn( obj: ILogObj, msg: string ): void;
	public warn( obj: ANY, msg?: string ): void {
		this._callPino( "warn", obj, msg )
	}
	public error( msgOrObj: string | ILogObj ): void;
	public error( obj: ILogObj, msg: string ): void;
	public error( obj: ANY, msg?: string ): void {
		this._callPino( "error", obj, msg )
	}
	public fatal( msgOrObj: string | ILogObj ): void;
	public fatal( obj: ILogObj, msg: string ): void;
	public fatal( obj: ANY, msg?: string ): void {
		this._callPino( "fatal", obj, msg )
	}
	public silent( msgOrObj: string | ILogObj ): void;
	public silent( obj: ILogObj, msg: string ): void;
	public silent( obj: ANY, msg?: string ): void {
		this._callPino( "silent", obj, msg )
	}

	// private _prepErrs( msgOrObj: string | ILogObj ) {
	// 	if ( ( msgOrObj == null ) || ( typeof msgOrObj === "string" ) ) return msgOrObj

	// 	//! should not do this (leave client stack traces as-is), instead we should just sanitize data sent to the client.
	// 	// if ( msgOrObj.err != null ) {
	// 	// 	msgOrObj.err = exception.errorToJson( msgOrObj.err ) as Error
	// 	// }


	// }
}
interface ILogObj {
	[ key: string ]: unknown
	/** if provided, will be considered the "main" message for presentation purposes */
	msg?: string
	/** if provided, logs error details
	 * any other error objects will be truncated from the log.  
	 * @remarks
	 * If you want to include other error objects you need to manually serialize them via ```xlib.diagnostics.exception.errorToJson()```
	*/
	err?: Error
}

// interface LogFn {
// 	( msg: string ): void;
// 	( obj: object, msg?: string ): void;
// }