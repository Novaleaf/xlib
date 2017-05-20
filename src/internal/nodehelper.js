"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as ex from "../exception";
//import * as ex from "../exception";
/** helpers for backend node.js stuff  NODE.JS ONLY!!! */
//declare var require: any;
//declare var process: any;
///** get a list of all ip addresses of this server.  after generating the ip's, will cache results for next time you call this method */
//export var getNetworkIPs = (function () {
//	if (typeof (require) === "undefined" || typeof (process) === "undefined") {
//        return function (callback: (error: any, ipV4Addresses: string[], ipV6Addresses: string[]) => void, bypassCache?: boolean) {            
//			callback("network ip not supported on this platform", [], []);
//		}
//	}
//	var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;
//	var exec = require("child_process").exec;
//	var cachedV4: string[];
//	var cachedV6: string[];
//	var command: string;
//	var filter4RE: RegExp;
//	var filter6RE: RegExp;
//	switch (process.platform) {
//		case "win32":
//			//case 'win64': // TODO: test
//			command = "ipconfig";
//			filter4RE = /\bIPv[4][^:\r\n]+:\s*([^\s]+)/g;
//			filter6RE = /\bIPv[6][^:\r\n]+:\s*([^\s]+)/g;
//			break;
//		case "darwin":
//			command = "ipconfig";
//			filter4RE = /\binet\s+([^\s]+)/g;
//			filter6RE = /\binet6\s+([^\s]+)/g; // IPv6
//			break;
//		default:
//			command = "ipconfig";
//			filter4RE = /\binet\b[^:]+:\s*([^\s]+)/g;
//			filter6RE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
//			break;
//	}
//	return function (callback: (error: any, ipV4Addresses: string[], ipV6Addresses: string[]) => void, bypassCache?: boolean) {
//		if (cachedV4 && !bypassCache) {
//			callback(null, cachedV4, cachedV6);
//			return;
//		}
//		// system call
//		exec(command, function (error: any, stdout: any, sterr: any) {
//			cachedV4 = [];
//			cachedV6 = [];
//			var ip:string;
//			var i: number;
//			//if (!error) {
//			//ipv4
//			var matches4 = stdout.match(filter4RE) || [];
//			for (i = 0; i < matches4.length; i++) {
//				ip = matches4[i].replace(filter4RE, "$1");
//				if (!ignoreRE.test(ip)) {
//					cachedV4.push(ip);
//				}
//			}
//			//ipv6
//			var matches6 = stdout.match(filter6RE) || [];
//			for (i = 0; i < matches6.length; i++) {
//				ip = matches6[i].replace(filter6RE, "$1");
//				if (!ignoreRE.test(ip)) {
//					cachedV6.push(ip);
//				}
//			}
//			//}
//			callback(error, cachedV4, cachedV6);
//		});
//	};
//})();
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
exports.getCommandlineArgs = (function () {
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
    if (valueIfNullOrEmpty !== undefined) {
        if (result == null || result.length === 0) {
            return valueIfNullOrEmpty;
        }
    }
    return result;
}
exports.getCommandlineArg = getCommandlineArg;
//# sourceMappingURL=nodehelper.js.map