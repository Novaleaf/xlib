import * as browserHelper from "./_internal/browser-helper"
import * as nodeHelper from "./_internal/node-helper"

import { XlibException } from "./diagnostics/exception"
import * as _ from "lodash"

//import { parseEnum } from "./util/enum-helper"

/**
 * pollyfill globalThis.  from https://mathiasbynens.be/notes/globalthis
 */

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
declare const __magic__: any
( function () {
	if ( typeof globalThis === "object" ) return
	// eslint-disable-next-line no-extend-native
	Object.defineProperty( Object.prototype, "__magic__", {
		get: function () {
			return this
		},
		configurable: true // This makes it possible to `delete` the getter later.
	} )
	__magic__.globalThis = __magic__ // lolwat
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	delete ( Object.prototype as any ).__magic__
}() )
/** explicitly get the  ```globalThis``` object. 
 * @remarks
 * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
*/
export function getGlobal(): typeof globalThis {
	return globalThis
}


import * as platformJs from "platform"

/** reads specific envVar keys `NODE_ENV` or `ENV` for values that specify an environment.
 * @remarks
 * see {@link getEnvVar} 
	*/
// export enum EnvLevel {
// 	/** the default if no envVar is detected */
// 	DEV = 10,
// 	TEST = 20,
// 	UAT = 30,
// 	PROD = 40,
// }
export type EnvLevel = "dev" | "test" | "uat" | "prod"

/** read specific enVar key `LOG_LEVEL`  used by the xlib.diagnostics.logging system to determine what messages to filter out */
// export enum LogLevel {

// 	TRACE = 10,
// 	/** Exception details default to include a full stack trace */
// 	DEBUG = 20,
// 	/** Exception details default to include the first frame of the stack */
// 	INFO = 30,
// 	/** Exception details default to include no stack */
// 	WARN = 40,
// 	ERROR = 50,
// 	FATAL = 60,

// 	SILENT = 70,
// }


export type LogLevel = "trace" |
	/** Exception details default to include a full stack trace */
	"debug" |
	/** Exception details default to include the first frame of the stack */
	"info" |
	/** Exception details default to include no stack */
	"warn" |
	"error" | "fatal" | "silent"


export type PlatformType = "browser" | "node" | "embedded" | "unknown"

export type OsName = "win" | "linux" | "mac" | "ios" | "android" | "unknown"

export interface IEnvInfo {
	platform: PlatformType
	os: OsName
	/** defaults to {@link EnvLevel.PROD} unless otherwise set via envVars.  */
	env: EnvLevel
	log: LogLevel
	rawDetails: {
		/** platform details according to https://github.com/bestiejs/platform.js/ */
		platformJs: {  /**
			* The platform description.
			*/
			description?: string;
			/**
			 * The name of the browser's layout engine.
			 *
			 * The list of common layout engines include:
			 * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
			 */
			layout?: string;
			/**
			 * The name of the product's manufacturer.
			 *
			 * The list of manufacturers include:
			 * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
			 * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
			 * "Nokia", "Samsung" and "Sony"
			 */
			manufacturer?: string;
			/**
			 * The name of the browser/environment.
			 *
			 * The list of common browser names include:
			 * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
			 * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
			 * "Opera Mini" and "Opera"
			 *
			 * Mobile versions of some browsers have "Mobile" appended to their name:
			 * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
			 */
			name?: string;
			/**
			 * The alpha/beta release indicator.
			 */
			prerelease?: string;
			/**
			 * The name of the product hosting the browser.
			 *
			 * The list of common products include:
			 *
			 * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
			 * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
			 */
			product?: string;
			/**
			 * The browser's user agent string.
			 */
			ua?: string;
			/**
			 * The version of the OS.
			 */
			version?: string;
			/**
			 * The name of the operating system.
			 */
			os?: {
				/**
				 * The CPU architecture the OS is built for.
				 */
				architecture?: number;
				/**
				 * The family of the OS.
				 *
				 * Common values include:
				 * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
				 * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
				 * "SuSE", "Android", "iOS" and "Windows Phone"
				 */
				family?: string;
				/**
				 * The version of the OS.
				 */
				version?: string;
			}
		}
		// /** env may be overridden by {@link setEnvLevel()} so this will always show the initial env determined on run */
		// initialEnv: EnvLevel
	}
}

let _envInfo: IEnvInfo
export function getEnvInfo( {
	/** by default returns cached result of last call.  pass true to requery envInfo  */
	refresh = false
} = {} ): IEnvInfo {

	if ( _envInfo == null || refresh !== true ) {

		_envInfo = {

			platform: ( (): PlatformType => {

				const name = platformJs.name?.toLowerCase()

				if ( name == null ) return "unknown"
				if ( name.includes( "browser" ) ) return "browser"
				if ( name.includes( "mobile" ) ) return "browser"
				if ( name.includes( "node" ) ) return "node"
				switch ( name.slice( 0, 4 ) ) {
					case "chro":
					case "fire":
					case "ie":
					case "ie m": //"ie mobile"
					case "edge":
					case "safa":
					case "oper":
					case "maxt": //maxthon
						return "browser"
					case "phan": //phantomjs
					case "adob": //adobe air
					case "rhin": //rhino
					case "ring": //ringojs
					case "elec"://electron
					case "nw.j": //nw.js
						return "embedded"
				}

				if ( name.includes( " os" ) ) return "embedded"

				const desc = platformJs.description?.toLowerCase()
				if ( desc == null ) return "unknown"
				if ( desc.includes( "browser" ) ) return "browser"
				if ( desc.includes( "firefox" ) ) return "browser"
				if ( desc.includes( "chrom" ) ) return "browser"

				return "unknown"

			} )(),

			os: ( (): OsName => {
				if ( typeof ( process ) !== "undefined" ) {
					switch ( process.platform ) {
						case "win32":
							return "win"
						case "darwin":
							return "mac"
						case "linux":
							return "linux"
						default:
							return "unknown"
					}
				}

				try {
					if ( navigator.appVersion.indexOf( "Win" ) !== -1 ) { return "win" }
					if ( navigator.appVersion.indexOf( "Mac" ) !== -1 ) { return "mac" }
					if ( navigator.appVersion.indexOf( "Linux" ) !== -1 ) { return "linux" }
				} catch ( ex ) { }
				return "unknown"
			} )(),

			env: "dev",  //need to set after creating _envInfo due to race condition
			log: "trace", //need to set after creating _envInfo due to race condition

			rawDetails: {
				platformJs: _.cloneDeep( platformJs ),// JSON.parse( JSON.stringify( platformJs ) ),
				//initialEnv: EnvLevel.DEV //set below
			}
		}




		//last minute fixup detections
		{
			//force node if node explicit values found, assuming platform.js didn't detect some fancy embedded
			if ( _envInfo.platform !== "embedded" ) {
				if ( typeof process !== "undefined" && /node|io\.js/.test( process?.release?.name ) ) {
					//detect node, from: https://www.geeksforgeeks.org/how-to-check-whether-a-script-is-running-under-node-js-or-not/				
					_envInfo.platform = "node"
				}
			}

			// if ( _envInfo.platform === "unknown" ) {

			// 	if ( typeof ( window ) !== "undefined" ) {
			// 		_envInfo.platform = "browser"
			// 	}
			// }

			if ( platformJs.os?.family != null ) {
				const fam = platformJs.os.family.toLowerCase()
				if ( fam.includes( "android" ) ) _envInfo.os = "android"
				if ( fam.startsWith( "ios" ) ) _envInfo.os = "ios"

				if ( _envInfo.os === "unknown" ) {
					_envInfo.os = ( (): OsName => {
						switch ( fam.slice( 0, 3 ) ) {
							case "win": return "win"
							case "mac": return "mac"
							case "and": return "android"
							case "ios": return "ios"
							case "lin":
							case "ubu":
							case "kai":
							case "cen":
							case "deb":
							case "fed":
							case "kub":
								return "linux"
							default:
								return "unknown"
						}
					} )()
				}
			}
		}



		//set env details
		_envInfo.env = ( (): EnvLevel => {
			const foundEnvVar = getEnvironmentVariable( "NODE_ENV" ) ?? getEnvironmentVariable( "ENV" ) ?? "DEV"
			switch ( foundEnvVar?.trim().slice( 0, 3 ).toLowerCase() ) {
				case "dev":
					return "dev"
				case "tes":
					return "test"
				case "uat":
					return "uat"
				case "pro":
					return "prod"
				default:
					console.warn( `unknown envLevel found in "NODE_ENV" | "ENV" envVars.  found "${ foundEnvVar }".  defaulting to DEV` )
					return "dev"
			}
		} )()
		//_envInfo.rawDetails.initialEnv = _envInfo.env

		//set log details
		_envInfo.log = ( (): LogLevel => {
			const foundEnvVar = getEnvironmentVariable( "LOG_LEVEL" )

			switch ( foundEnvVar?.trim().slice( 0, 3 ).toLowerCase() ) {
				case "tra":
					return "trace"
				case "deb":
					return "debug"
				case "inf":
					return "info"
				case "war":
					return "warn"
				case "err":
					return "error"
				case "fat":
					return "fatal"
				case "sil":
					return "silent"
				default:
					console.warn( `unknown logLevel found in "LOG_LEVEL" envVar.  found "${ foundEnvVar }".  defaulting to TRACE` )
					return "trace"
			}

			// const toReturn = parseEnum( LogLevel, foundEnvVar )
			// if ( toReturn == null ) {
			// 	console.warn( `unknown logLevel found in "LOG_LEVEL" envVar.  found "${ foundEnvVar }".  defaulting to TRACE` )
			// 	return LogLevel.TRACE
			// }
			// return toReturn

			// // LogLevel[ foundEnvVar?.toUpperCase() as never ]
			// if ( typeof toReturn === "string" ) return LogLevel[ toReturn as never ] as never as LogLevel
			// if ( typeof toReturn === "number" ) return toReturn as never as LogLevel
			// console.warn( `unknown logLevel found in envVars.  found "${ foundEnvVar }".  defaulting to TRACE` )
			// return LogLevel.TRACE
		} )()

	}


	// //disallow external modification
	// const toReturn = _.clone( _envInfo )

	// //apply overrides
	// if ( _envLevelOverride !== undefined ) {
	// 	toReturn.env = _envLevelOverride
	// }

	return _envInfo as Readonly<IEnvInfo>
}

// interface IEnum<T> {
// 	[ id: string ]: IEnum<T>[keyof IEnum<T>];
// 	[ nu: number ]: IEnum<T>[keyof IEnum<T>];
// }




// let _envLevelOverride: EnvLevel | undefined

// /**  Override the envLevel.  You can manually change this at runtime, but if so, it is advisable to do so only once, at the start of your application */
// export function setEnvLevel( env: EnvLevel ) {
// 	_envLevelOverride = env
// }

export function getEnvLevel(): EnvLevel {
	//	return _envLevelOverride ?? _envInfo?.env ?? getEnvInfo().env
	return _envInfo?.env ?? getEnvInfo().env
}

/** returns true if "prod" envLevel */
export function isProd(): boolean {
	return getEnvLevel() === "prod"
}

/** returns true if "trace" || "debug" logLevel. */
export function isDebug(): boolean {
	return _.includes( [ "trace", "debug" ], getLogLevel() )
}

export function getLogLevel(): LogLevel {
	return _envInfo?.log ?? getEnvInfo().log
}

/** read an "environment variable".
nodejs / phantomjs: reads from commandline switches (prefered) or system environment variables.
browser:  reads from querystring (prefered), or cookie, or <html data-key> attribute (least prefered).
 */
export function getEnvironmentVariable( key: string,
	{/**what to return if the value is null or Empty. By default, when the envVar doesn't exist we'll return undefined*/ defaultValue = undefined as unknown as string,
		/** for better performance we cache environmental variables after the first query.   pass true to force a requery */refresh = false
	} = {} ): string | undefined {
	let result: string | undefined
	switch ( _envInfo.platform ) {
		case "browser":
			//try to find in querystring
			result = browserHelper.getQuerystringVariable( key )
			if ( result != null && result.length > 0 ) {
				break
			}
			//try to find in cookie
			result = browserHelper.getCookie( key )
			if ( result != null && result.length > 0 ) {
				break
			}
			//try to find in html attribute
			result = browserHelper.getDomAttribute( "html", "data-" + key, true )
			if ( result != null && result.length > 0 ) {
				break
			}
			result = browserHelper.getDomAttribute( "html", key, true )
			if ( result != null && result.length > 0 ) {
				break
			}
			break
		case "node":
		case "embedded":
			//seach commandline
			result = nodeHelper.getCommandlineArg( key )
			if ( result != null && result.length > 0 ) {
				break
			}
			//search system env vars
			result = process.env[ key ]
			if ( result != null && result.length > 0 ) {
				break
			}
			break

		default:
			throw new XlibException( `unsupported plaform type.  platform=${ _envInfo.platform }  envInfo=${ JSON.stringify( _envInfo ) }` )
	}
	//have our result (including if it's null/empty)
	if ( defaultValue == null ) {
		return result
	}
	if ( result == null || result.length === 0 ) {
		return defaultValue
	}
	return result
}



