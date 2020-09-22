
import { XlibException } from "../diagnostics/exception"
//"use strict";
//import ex = require("../core/exception");


/** helpers for backend node.js stuff  NODE.JS ONLY!!! */


//var cachedServerDomain: string;
///** if on windows, always returns "localhost".
//if on linux, attempts to read the first line of '/srv/serverDomain.txt' which you'd need to populate during server install-time with your domain name. */
//export function getServerDomainFromFile(): string { //callback: (error: any, serverDomain:string)=>void) {
//	if (cachedServerDomain == null) {
//		var fs = require("fs");
//		switch (process.platform) {
//			case 'win32':
//				cachedServerDomain = "127.0.0.1";
//				break;
//			//setTimeout(() => {
//			//	callback(null, "localhost");
//			//});
//			//break;
//			default:
//				try {
//					cachedServerDomain = fs.readFileSync("/srv/serverDomain.txt").toString().trim();
//				} catch (ex) {
//					cachedServerDomain = "";
//					logger.assert(ex);
//				}
//				break;
//			//fs.readFile("/srv/serverDomain.txt", (err, buffer) => {
//			//	if (err == null) {
//			//		callback(err, buffer.toString());
//			//	} else {
//			//		callback(err, null);
//			//	}
//			//});
//		}
//	}
//	return cachedServerDomain;
//}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any


/** cached query so we only get args once per js load*/
let _parsedCommandlineArgs: { [ key: string ]: string; }

/** return all key-value arguments passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */

export function getCommandlineArgs( {
	/** for better performance we cache environmental variables after the first query.   pass true to force a requery */refresh = false
} = {} ): Record<string, string> {
	if ( _parsedCommandlineArgs == null || refresh === true ) {
		if ( typeof ( process ) === "undefined" ) {
			throw new XlibException( "process (base object) is missing.  this function is meant for nodejs use.  are you running in a browser?" )
		} else {
			//declare require: any;
			//var process = require("process");

			const rawVars = process.argv
			_parsedCommandlineArgs = {}
			for ( let i = rawVars.length - 1; i >= 0; i-- ) {
				const pair = rawVars[ i ].split( "=" )
				if ( pair.length !== 2 ) {
					//skip
					continue
				}
				const key = pair[ 0 ]
				const value = pair[ 1 ]
				_parsedCommandlineArgs[ key ] = value
			}
		}
	}
	return _parsedCommandlineArgs
}



/** return a key-value argument passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */
export function getCommandlineArg( key: string, {/**what to return if the value is null or Empty. By default, when the envVar doesn't exist we'll return undefined*/ defaultValue = undefined as unknown as string,
/** for better performance we cache environmental variables after the first query.   pass true to force a requery */refresh = false
} = {} ): string | undefined {

	const parsedArgs = getCommandlineArgs( { refresh } )

	const result = parsedArgs[ key ]
	if ( defaultValue != null ) {
		if ( result == null || result.length === 0 ) {
			return defaultValue
		}
	}
	return result
}

