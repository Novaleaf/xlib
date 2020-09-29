"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// tslint:disable: no-bitwise
const _ = tslib_1.__importStar(require("lodash"));
/** color strings for console use.  also used by logger */
exports.Chalk = require("chalk");
/** remove ansi characters from string.  also used by logger. */
exports.stripAnsi = require("strip-ansi");
/**
 * escapes strings for html presentation.
 * firstly decodeUriComponent's the string, then html escapes it
 * @param value
 * @param disableAutoUriDecode
 */
function htmlEscapeEscapedUserInput(value) {
    return _.escape(decodeURIComponent(value));
}
exports.htmlEscapeEscapedUserInput = htmlEscapeEscapedUserInput;
/**
 * converts escaped string back to the encudeUriComponent value
 * @param value
 */
function htmlUnescapeEscapedUserInput(value) {
    return encodeURIComponent(_.unescape(value));
}
exports.htmlUnescapeEscapedUserInput = htmlUnescapeEscapedUserInput;
/**
 *  sanitizes strings by escaping most non-alphanumerics
 * @param value
 */
function escapeUserInput(value) {
    return encodeURIComponent(value);
}
exports.escapeUserInput = escapeUserInput;
/**
 *  unsanitizes strings sanitized via .sanitizeUserInput();
 * @param value
 */
function unescapeUserInput(value) {
    return decodeURIComponent(value);
}
exports.unescapeUserInput = unescapeUserInput;
/** helper for the .isUnicodeDoubleByte() method */
const _isUnicodeDoubleByte_regex = /[^\u0000-\u00ff]/; // Small performance gain from pre-compiling the regex
/** does the string contain characters larger than a single byte */
function isUnicodeDoubleByte(str) {
    //from: https://stackoverflow.com/questions/147824/how-to-find-whether-a-particular-string-has-unicode-characters-esp-double-byte
    if (str == null || str.length === 0) {
        return false;
    }
    if (str.charCodeAt(0) > 255) {
        return true;
    }
    return _isUnicodeDoubleByte_regex.test(str);
}
exports.isUnicodeDoubleByte = isUnicodeDoubleByte;
/**
 * basic, simple check if the string has been encoded via encodeURIComponent() or encodeURI()
 * may return false-positives, but never false-negatives.
 * @param value
 */
function isEncodedMaybe(value) {
    if (value.indexOf("%") < 0) {
        return false;
    }
    return true;
}
exports.isEncodedMaybe = isEncodedMaybe;
function count(target, subStrToCount, ignoreCase = false, startingPosition = 0, /**default false.  if true, we allow overlapping finds, such as "aa" in the string "aaa" would return 2*/ allowOverlaps = false) {
    if (target == null) {
        return 0;
    }
    if (ignoreCase === true) {
        target = target.toLowerCase();
        subStrToCount = subStrToCount.toLowerCase();
    }
    let counted = 0;
    if (subStrToCount == null || subStrToCount.length === 0) {
        throw new Error("subStrToCount length is zero");
    }
    while (true) {
        let index = target.indexOf(subStrToCount, startingPosition);
        if (index >= 0) {
            counted++;
            if (allowOverlaps === true) {
                startingPosition = index + 1;
            }
            else {
                startingPosition = index + subStrToCount.length;
            }
        }
        else {
            break;
        }
    }
    return counted;
}
exports.count = count;
function indexOf(target, toFind, ignoreCase = false, startingPosition = 0) {
    if (ignoreCase === true) {
        target = target.toLowerCase();
        toFind = toFind.toLowerCase();
    }
    return target.indexOf(toFind, startingPosition);
}
exports.indexOf = indexOf;
/** if the target is encapsulated by prefix/suffix, returns the unencapsulated version
otherwise, returns the target (non modified)
*/
function between(target, prefix, suffix, ignoreCase = false, trimFirst = false) {
    if (trimFirst) {
        target = target.trim();
    }
    //copy target in case we need to compare case-insensitive.
    let compareTarget = target;
    if (ignoreCase) {
        compareTarget = compareTarget.toLowerCase();
        prefix = prefix.toLowerCase();
        suffix = suffix.toLowerCase();
    }
    if (compareTarget.indexOf(prefix) === 0 && endsWith(compareTarget, suffix)) {
        return target.substring(prefix.length, target.length - suffix.length);
    }
    else {
        return target;
    }
}
exports.between = between;
/** if the string is longer than the maxLength, creates a summary (first + last) and returns it (ommiting the middle) */
function summarize(str, /** default = 100 */ maxLength = 100) {
    if (str == null) {
        return "NULL";
    }
    let tempStr;
    if (typeof (str) === "string") {
        tempStr = str;
    }
    else {
        if (typeof (str.substring) !== "function" || typeof (str.length) !== "number") {
            try {
                tempStr = JSON.stringify(str);
            }
            catch (ex) {
                tempStr = "ERROR SUMMARIZING";
            }
        }
        else {
            //has str-like settings
            tempStr = str.substring(0, length);
        }
    }
    if (tempStr.length <= maxLength) {
        return tempStr;
    }
    let half = (maxLength - 3) / 2;
    // tslint:disable-next-line: restrict-plus-operands
    let toReturn = tempStr.substring(0, half) + "..." + tempStr.substring(tempStr.length - half);
    return toReturn;
}
exports.summarize = summarize;
/** converts a string to something that can be used as a machine-readable id.
input is converted to lowercase, alphanumeric with underscore (or your choosen 'whitespaceChar').
example:  "  (hi)   world!" ==> "hi_world"
the rules: maximum of 1 underscore at a time, and won't prefix/suffix with underscores (or your chosen 'whitespaceChar'*/
function toId(str, whitespaceChar = "_") {
    //strip out invalid characters (valid=alphanumeric) groups are replaced by a single whitespace (which will be replaced in a following line)
    let toReturn = str;
    //lowercase
    toReturn = toReturn.toLowerCase();
    //convert to alpha-numeric, with any groups of non-alpha being converted to a single space
    toReturn = toReturn.replace(/[^0-9a-z]+/g, " ");
    //replace multiple spaces with a single space
    //toReturn = toReturn.replace(/ +(?= )/g, '');
    //trim (remove leading and trailing spaces)
    toReturn = toReturn.trim();
    //replace spaces with whitespace char  (groups of spaces converted to single space, but not needed because we do that earlier)
    toReturn = toReturn.replace(/\s+/g, whitespaceChar);
    return toReturn;
}
exports.toId = toId;
///**
// * creates a human-readable key.   similar to toId(), but also replaces underscores with "x" and "l" with "5".
// * example: "  (hi)   world!" ==> "hixwor5d"
// */
//export function toKey(str: string): string {
//    var toReturn = toId(str, "");
//    toReturn = replaceAll(toReturn, "l", "3");
//    toReturn = replaceAll(toReturn, "i", "5");
//    toReturn = replaceAll(toReturn, "1", "7");
//    toReturn = replaceAll(toReturn, "o", "9");
//    toReturn = replaceAll(toReturn, "0", "8");
//    //toReturn = replaceAll(toReturn,"_", "x");
//    return toReturn;
//}
function ipV4toInt(ip) {
    let parts = ip.split(".");
    let res = 0;
    res += parseInt(parts[0], 10) << 24;
    res += parseInt(parts[1], 10) << 16;
    res += parseInt(parts[2], 10) << 8;
    res += parseInt(parts[3], 10);
    return res;
}
exports.ipV4toInt = ipV4toInt;
function intToIpV4(int) {
    let part1 = int & 255;
    let part2 = ((int >> 8) & 255);
    let part3 = ((int >> 16) & 255);
    let part4 = ((int >> 24) & 255);
    // tslint:disable-next-line: restrict-plus-operands
    return part4 + "." + part3 + "." + part2 + "." + part1;
}
exports.intToIpV4 = intToIpV4;
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
function repeat(toRepeate, numberOfTimes) {
    return Array(numberOfTimes + 1).join(toRepeate);
}
exports.repeat = repeat;
function replaceAll(target, strToFind, replaceWith, ignoreCase = false) {
    let flags = "g"; //global match
    if (ignoreCase === true) {
        flags += "i";
    }
    return target.replace(RegExp(escapeRegExp(strToFind), flags), replaceWith);
}
exports.replaceAll = replaceAll;
function insertAt(target, toInsert, insertPosition) {
    return [target.slice(0, insertPosition), toInsert, target.slice(insertPosition)].join("");
}
exports.insertAt = insertAt;
function remove(target, ...textToRemove) {
    if (target == null) {
        return target;
    }
    let loop;
    do {
        loop = false;
        for (let i = 0; i < textToRemove.length; i++) {
            let toTrim = textToRemove[i];
            let trimLen = toTrim.length;
            while (target.indexOf(toTrim) === 0) {
                target = target.substr(trimLen);
                loop = true;
            }
            while (endsWith(target, toTrim)) {
                target = target.substr(0, target.length - trimLen);
                loop = true;
            }
        }
    } while (loop);
    return target;
}
exports.remove = remove;
function removePrefix(target, ...prefixToRemove) {
    if (target == null) {
        return target;
    }
    let loop;
    do {
        loop = false;
        for (let i = 0; i < prefixToRemove.length; i++) {
            let toTrim = prefixToRemove[i];
            let trimLen = toTrim.length;
            while (target.indexOf(toTrim) === 0) {
                target = target.substr(trimLen);
                loop = true;
            }
            //while (endsWith(target, toTrim)) {
            //	target = target.substr(0, target.length - trimLen);
            //	loop = true;
            //}
        }
    } while (loop);
    return target;
}
exports.removePrefix = removePrefix;
function removeSuffix(target, ...suffixToRemove) {
    if (target == null) {
        return target;
    }
    let loop;
    do {
        loop = false;
        for (let i = 0; i < suffixToRemove.length; i++) {
            let toTrim = suffixToRemove[i];
            let trimLen = toTrim.length;
            //while (target.indexOf(toTrim) === 0) {
            //	target = target.substr(trimLen);
            //	loop = true;
            //}
            while (endsWith(target, toTrim)) {
                target = target.substr(0, target.length - trimLen);
                loop = true;
            }
        }
    } while (loop);
    return target;
}
exports.removeSuffix = removeSuffix;
function removeAfter(target, textToFind, keepFindText = false, /** search from back if true*/ lastIndexOf) {
    let index;
    if (lastIndexOf === true) {
        index = target.lastIndexOf(textToFind);
    }
    else {
        index = target.indexOf(textToFind);
    }
    if (index < 0) {
        return target; //trim not found, so return original
    }
    if (keepFindText) {
        index += textToFind.length;
    }
    return target.substring(0, index);
}
exports.removeAfter = removeAfter;
//
function removeBefore(target, textToFind, keepFindText = false, /** search from back if true*/ lastIndexOf) {
    let index;
    if (lastIndexOf === true) {
        index = target.lastIndexOf(textToFind);
    }
    else {
        index = target.indexOf(textToFind);
    }
    if (index < 0) {
        return target; //trim not found, so return original
    }
    if (keepFindText === false) {
        index += textToFind.length;
    }
    return target.substring(index);
}
exports.removeBefore = removeBefore;
function endsWith(target, toFind) {
    return target.lastIndexOf(toFind) === target.length - toFind.length;
}
exports.endsWith = endsWith;
function isNullOrEmpty(str) {
    if (str == null || str.length === 0) {
        return true;
    }
    return false;
}
exports.isNullOrEmpty = isNullOrEmpty;
/** removes any leading bit-order-marker from utf8 strings */
function tryRemoveBom(str) {
    if (str == null) {
        return str;
    }
    if (str.length < 1) {
        return str;
    }
    let firstChar = str[0];
    //check for zero-width non-breaking space U+FEFF
    let thisEndian = "\ufeff"; //little endian on windows
    let otherEndian = "\ufffe";
    if (firstChar === thisEndian || firstChar === otherEndian) {
        return str.substring(1);
    }
    else {
        //if (str.length < 4) { return str;}
        ////check for utf8 bom EFBBBF
        //var first3 = str.substr(0, 3);
        //if(first3=="\uEFBBBF
        return str;
    }
}
exports.tryRemoveBom = tryRemoveBom;
/** escape a string for use as a literal match in a regex expression
copied from http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
*/
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
exports.escapeRegExp = escapeRegExp;
/**
 *  Converting to, and from, base64url https://en.wikipedia.org/wiki/Base64#RFC_4648
example:   base64=```'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='``` base64Url=```'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'```
uses the npm package: https://www.npmjs.com/package/base64url
 */
exports.base64Url = require("base64url");
/**
 *  base64 encode and decode functions
 */
var base64;
(function (base64) {
    function encode(input) {
        let isStr = _.isString(input);
        if (isStr !== true || (typeof (btoa) === "undefined" && typeof (Buffer) !== "undefined")) {
            if (isStr) {
                //nodejs does not define bota or atob
                return Buffer.from(input, "utf8").toString("base64");
            }
            else {
                return input.toString("base64");
            }
        }
        return btoa(input);
    }
    base64.encode = encode;
    function decode(base64Encoded) {
        if (typeof (atob) === "undefined" && typeof (Buffer) !== "undefined") {
            //nodejs does not define bota or atob
            return Buffer.from(base64Encoded, "base64").toString("utf8");
        }
        return atob(base64Encoded);
    }
    base64.decode = decode;
    function toBuffer(base64Encoded) {
        return Buffer.from(base64Encoded, "base64");
    }
    base64.toBuffer = toBuffer;
})(base64 = exports.base64 || (exports.base64 = {}));
///** common js method, missing from typescript d.ts */
//declare function escape(input: string): string;
///** common js method, missing from typescript d.ts */
//declare function unescape(input: string): string;
///** create a unique string every time it"s called */
//export function createUniqueString(): string {
//	return collections.hashHelper.createUniqueCodeInternal();
//}
/** returns a 32bit integer.  same algorithm as used with java, so output should match */
function hash(input) {
    /* tslint:disable */
    var hash = 0, i, c, l;
    if (input.length == 0) {
        return hash;
    }
    for (i = 0, l = input.length; i < l; i++) {
        c = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash |= 0; // Convert to 32bit integer
    }
    /* tslint:enable */
    return hash;
}
exports.hash = hash;
//# sourceMappingURL=stringhelper.js.map