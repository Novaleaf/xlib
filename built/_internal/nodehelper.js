"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
/** return all key-value arguments passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */
exports.getCommandlineArgs = (() => {
    /** cached query so we only get args once per js load*/
    var parsedCommandlineArgs;
    function _getCommandlineArgs() {
        if (parsedCommandlineArgs == null) {
            if (typeof (process) === "undefined") {
                throw new Error("process (base object) is missing.  this function is meant for nodejs use.  are you running in a browser?");
            }
            else {
                //declare require: any;
                //var process = require("process");
                var rawVars = process.argv;
                parsedCommandlineArgs = {};
                for (var i = rawVars.length - 1; i >= 0; i--) {
                    var pair = rawVars[i].split("=");
                    if (pair.length !== 2) {
                        //skip
                        continue;
                    }
                    var key = pair[0];
                    var value = pair[1];
                    parsedCommandlineArgs[key] = value;
                }
            }
        }
        return parsedCommandlineArgs;
    }
    return _getCommandlineArgs;
})();
/** return a key-value argument passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */
function getCommandlineArg(key, valueIfNullOrEmpty) {
    var parsedArgs = exports.getCommandlineArgs();
    var result = parsedArgs[key];
    if (valueIfNullOrEmpty != null) {
        if (result == null || result.length === 0) {
            return valueIfNullOrEmpty;
        }
    }
    return result;
}
exports.getCommandlineArg = getCommandlineArg;
//# sourceMappingURL=nodehelper.js.map