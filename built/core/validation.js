"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numHelper = require("./_util/numhelper");
/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
exports.validator = require("validator");
exports.sanitizeHtml = require("sanitize-html");
const diagnostics = require("./diagnostics");
const url_1 = require("url");
const log = diagnostics.log; // var log = new diagnostics.Logger( __filename );
class UrlValidator {
    constructor(input, options) {
        this.options = options;
        this.isValid = true;
        this.options = Object.assign({ 
            //option defaults
            allowFileProtocol: false, allowLocalhost: false, allowPrivateIp: false, allowGopherProtocol: false, allowUnicodeDomain: false }, options);
        options = this.options;
        try {
            if (input instanceof url_1.URL) {
                this.url = new url_1.URL(input.toString());
            }
            else if (typeof (input) === "string") {
                let inputString = input.trim();
                this.url = new url_1.URL(inputString);
            }
            else {
                throw new Error("input is not string or URL");
            }
            if (this.url.protocol !== "data:") {
                //check hostname
                const hostname = this.url.hostname.toLowerCase();
                if (hostname.length === 0) {
                    throw new Error(`invalid hostname blank: "${hostname}"`);
                }
                if (options.allowUnicodeDomain === true) {
                    //ok
                }
                else if (isAscii(hostname) !== true) {
                    throw new Error(`invalid hostname characters of "${hostname}"`);
                }
                if (options.allowLocalhost === true) {
                    //ok
                }
                else if (hostname === "localhost" || hostname === "127.0.0.1") {
                    throw new Error(`invalid hostname of "${hostname}"`);
                }
                if (options.allowPrivateIp === true) {
                    //ok
                }
                else {
                    if (isPrivateIp(hostname) === true) {
                        if (options.allowLocalhost === true && hostname === "127.0.0.1") {
                            //ok, we allow localhost
                        }
                        else {
                            throw new Error(`invalid hostname ip of "${hostname}"`);
                        }
                    }
                }
            }
            //check protocol
            const protocol = this.url.protocol;
            switch (protocol) {
                case "gopher:":
                    if (options.allowGopherProtocol === true) {
                        break;
                    }
                    else {
                        throw new Error(`invalid protocol of "${protocol}"`);
                    }
                case "file:":
                    if (options.allowFileProtocol === true) {
                        break;
                    }
                    else {
                        throw new Error(`invalid protocol of "${protocol}"`);
                    }
                case "http:":
                case "https:":
                case "ftp:":
                case "ws:":
                case "wss:":
                case "data:":
                    //ok;
                    break;
                default:
                    throw new Error(`invalid protocol of "${protocol}"`);
            }
        }
        catch (ex) {
            this.isValid = false;
            if (ex instanceof Error) {
                this.errorMessage = ex.message;
            }
            else {
                this.errorMessage = "unknown error:" + ex;
            }
        }
    }
}
exports.UrlValidator = UrlValidator;
/** from  https://stackoverflow.com/questions/8113546/how-to-determine-whether-an-ip-address-in-private*/
function isPrivateIp(ipV4Address) {
    const ipParts = ipV4Address.trim().split(".").map((str) => numHelper.parseInt(str));
    if (ipParts.length !== 4) {
        return false;
    }
    if ((ipParts[0] === 10) // single class A network
        || (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) // 16 contiguous class B network
        || (ipParts[0] === 192 && ipParts[1] === 168) // 256 contiguous class C network
        || (ipParts[0] === 169 && ipParts[1] === 254) // Link-local address also referred to as Automatic Private IP Addressing
        || (ipParts[0] === 127) // localhost
    ) {
        return true;
    }
    return false;
}
exports.isPrivateIp = isPrivateIp;
/** verify that a string only contains ascii characters (no unicode) */
function isAscii(toCheck, 
/** default is "printable" */
charSet = "printable") {
    if (typeof toCheck !== "string") {
        return false;
    }
    if (toCheck.length === 0) {
        return true;
    }
    //test regex from https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
    switch (charSet) {
        case "printable":
            return /^[\x20-\x7F]*$/.test(toCheck);
        case "extended":
            return /^[\x00-\xFF]*$/.test(toCheck);
        case "standard":
            return /^[\x00-\x7F]*$/.test(toCheck);
        default:
            throw new Error("invalid charSet option to validation.isAscii()");
    }
}
//# sourceMappingURL=validation.js.map