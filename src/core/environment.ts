"use strict";

import nodeHelper = require( "../node/nodehelper" );
import browserHelper = require( "../browser/browserhelper" );
//import ex = require("./exception");
import init = require( "../init" );

/** allow splitting up our init work near where it's asssociated variables are.   all are run by the exported .initialize() method */
const _internalInitWork: Array<( args: init.IInitArgs ) => void> = [];


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
	if ( typeof ( phantom ) !== "undefined" ) {
		return PlatformType.PhantomJs;
	}
	if ( typeof ( window ) !== "undefined" ) {
		return PlatformType.Browser;
	}


	if (//typeof (module) !== 'undefined' && (<any>module).exports &&
		typeof ( global ) !== "undefined" ) {
		return PlatformType.NodeJs;
	}

	return PlatformType.Unknown;

}();


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
export var osName: OsName;
_internalInitWork.push( ( args ) => {
	osName = ( () => {
		if ( typeof ( process ) !== "undefined" ) {
			return OsName[ process.platform ];
		}
		try {
			if ( navigator.appVersion.indexOf( "Win" ) !== -1 ) { return OsName.win32; }
			if ( navigator.appVersion.indexOf( "Mac" ) !== -1 ) { return OsName.darwin; }
			if ( navigator.appVersion.indexOf( "X11" ) !== -1 ) { return OsName.unix; }
			if ( navigator.appVersion.indexOf( "Linux" ) !== -1 ) { return OsName.linux; }
		} catch ( ex ) { }
		return OsName.unknown;
	} )();
} );



/** returns the current global object.
		depending on platform, this is:
		window (browser, phantomjs);
		GLOBAL (nodejs) */
export function getGlobal(): any {
	switch ( platformType ) {
		case PlatformType.PhantomJs:
		case PlatformType.Browser:
			return window;
		case PlatformType.NodeJs:
			return global;
		case PlatformType.None:
			return null;
		case PlatformType.Unknown:
			throw new Error( "Unknown platform.  do not know what object is global" );
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
export var logLevel: LogLevel;
_internalInitWork.push( ( args ) => {
	if ( args.logLevel != null ) {
		logLevel = args.logLevel;
	} else {
		logLevel = LogLevel[ getEnvironmentVariable( "logLevel", null ) ];
	}
	if ( logLevel == null ) {
		logLevel = LogLevel.TRACE;
		if ( args.suppressStartupMessage != true ) {
			console.info( "logLevel varible is not set.  \n\tdefaulting to logLevel=TRACE." );
			console.info( "\tPossible values are TRACE, DEBUG, INFO, WARN, ERROR, FATAL." );
			console.info( "\tHow to modify: " );
			console.info( "\t\tnodejs: set by running 'node entrypoint.js logLevel=DEBUG' or by setting your systemenv var: logLevel=DEBUG" );
			console.info( "\t\tbrowser: set by adding 'logLevel= DEBUG' in your querystring, add a cookie, or as a attribute of your html tag" );
			console.info( "\tHow to OVERRIDE: " );
			console.info( "\tpass the 'logLevelOverrides' envVar, for example: logLevelOverrides=[{'.*connection':'WARN'} " );
		}
	} else {
		if ( args.suppressStartupMessage != true ) {
			console.info( "logLevel=" + LogLevel[ logLevel ] );
		}
	}
} );


// export var isDebugBreakEnabled: boolean = ( () => {
// 	if ( logLevel <= LogLevel.DEBUG && global.v8debug != null ) {
// 		global.v8debug.Debug.setBreakOnException();
// 		return true;
// 	}
// 	return false;
// } )();

export enum EnvLevel {
	DEV = 10,
	//TEST = 20,
	//PREPROD = 30,
	PROD = 40,
}
export var envLevel: EnvLevel;
_internalInitWork.push( ( args ) => {
	if ( args.envLevel != null ) {
		envLevel = args.envLevel;
	} else {
		envLevel = EnvLevel[ getEnvironmentVariable( "envLevel", null ) ];
	}
	if ( envLevel == null ) {
		envLevel = EnvLevel.DEV;
		if ( args.suppressStartupMessage != true ) {
			console.info( "envLevel varible is not set.  \n\tdefaulting to envLevel=DEV." );
			console.info( "\tPossible values are DEV, PROD." );
			console.info( "\tHow to modify: " );
			console.info( "\t\tnodejs: set by running 'node entrypoint.js envLevel=PROD' or by setting your systemenv var: envLevel=PROD" );
			console.info( "\t\tbrowser: set by adding 'envLevel=PROD' in your querystring, add a cookie, or as a attribute of your html tag" );
		}
	} else {
		if ( args.suppressStartupMessage != true ) {
			console.info( "envLevel=" + EnvLevel[ envLevel ] );
		}
	}
} );

export enum TestLevel {
	NONE = 0,
	//TEST = 20,
	//PREPROD = 30,
	FULL = 40,
}
export var testLevel: TestLevel
_internalInitWork.push( ( args ) => {
	if ( args.testLevel != null ) {
		testLevel = args.testLevel;
	} else {
		testLevel = TestLevel[ getEnvironmentVariable( "testLevel", null ) ];
	}
	if ( testLevel == null ) {
		testLevel = TestLevel.FULL;
		if ( args.suppressStartupMessage != true ) {
			console.info( "testLevel varible is not set.  \n\tdefaulting to testLevel=FULL." );
			console.info( "\tPossible values are NONE, FULL." );
			console.info( "\tHow to modify: " );
			console.info( "\t\tnodejs: set by running 'node entrypoint.js testLevel=FULL' or by setting your systemenv var: testLevel=FULL" );
			console.info( "\t\tbrowser: set by adding 'testLevel=FULL' in your querystring, add a cookie, or as a attribute of your html tag" );
		}
	} else {
		if ( args.suppressStartupMessage != true ) {
			console.info( "testLevel=" + TestLevel[ testLevel ] );
		}
	}
} );




export const env = {

	/**
		*  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
		*/
	get isDev() { return envLevel <= EnvLevel.DEV; },

	/**
		*  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
		*/
	get isTest() { return testLevel === TestLevel.FULL; },
	/**
		*  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
		*/
	get isTrace() { return logLevel <= LogLevel.TRACE; },
	/**
		*  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
		*/
	get isDebug() { return logLevel <= LogLevel.DEBUG; },
	/**
		*  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
		*/
	get isProd() { return envLevel === EnvLevel.PROD; },

}


/** no op the input function if not running LogLevel <= DEBUG.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
export function _ifDebug( fcn: Function ): any {
	if ( logLevel <= LogLevel.DEBUG ) {
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
export function _ifTest( fcn: Function ): any {
	if ( testLevel >= TestLevel.FULL ) {
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
export function getEnvironmentVariable( key: string, valueIfNullOrEmpty?: string ) {
	var result: string;
	switch ( platformType ) {
		case PlatformType.Browser:
			//try to find in querystring
			result = browserHelper.getQuerystringVariable( key, null );
			if ( result != null && result.length > 0 ) {
				break;
			}
			//try to find in cookie
			result = browserHelper.getCookie( key, null );
			if ( result != null && result.length > 0 ) {
				break;
			}
			//try to find in html attribute
			result = browserHelper.getDomAttribute( "html", "data-" + key, true );
			if ( result != null && result.length > 0 ) {
				break;
			}
			result = browserHelper.getDomAttribute( "html", key, true );
			if ( result != null && result.length > 0 ) {
				break;
			}
			break;
		case PlatformType.NodeJs:
		case PlatformType.PhantomJs:
			//seach commandline
			result = nodeHelper.getCommandlineArg( key, null );
			if ( result != null && result.length > 0 ) {
				break;
			}
			//search system env vars
			result = process.env[ key ];
			if ( result != null && result.length > 0 ) {
				break;
			}
			break;

		default:
			throw new Error( "unsupported plaform type: " + platformType.toString() );
	}
	//have our result (including if it's null/empty)
	if ( valueIfNullOrEmpty == null ) {
		return result;
	}
	if ( result == null || result.length === 0 ) {
		return valueIfNullOrEmpty;
	}
	return result;
}



/** reads in various environmental and process details and make it easily usable by devs */
export function initialize( args: init.IInitArgs ) {
	_internalInitWork.forEach( ( fcn ) => { fcn( args ) } );
}
