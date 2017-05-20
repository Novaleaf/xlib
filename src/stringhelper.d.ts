/// <reference types="node" />
/// <reference types="sprintf-js" />
/** Clean up user-submitted HTML, preserving whitelisted elements and whitelisted attributes on a per-element basis
 https://www.npmjs.com/package/sanitize-html
*/
import * as sanitizeHtml from "sanitize-html";
export { sanitizeHtml };
/**
 * basic, simple check if the string has been encoded via encodeURIComponent() or encodeURI()
 * may return false-positives, but never false-negatives.
 * @param value
 */
export declare function isEncodedMaybe(value: string): boolean;
export declare function count(target: string, subStrToCount: string, ignoreCase?: boolean, startingPosition?: number, /**default false.  if true, we allow overlapping finds, such as "aa" in the string "aaa" would return 2*/ allowOverlaps?: boolean): number;
export declare function indexOf(target: string, toFind: string, ignoreCase?: boolean, startingPosition?: number): number;
/** if the target is encapsulated by prefix/suffix, returns the unencapsulated version
otherwise, returns the target (non modified)
*/
export declare function between(target: string, prefix: string, suffix: string, ignoreCase?: boolean, trimFirst?: boolean): string;
/** if the string is longer than the maxLength, creates a summary (first + last) and returns it (ommiting the middle) */
export declare function summarize(str: string | any, /** default = 100 */ maxLength?: number): any;
/** converts a string to something that can be used as a machine-readable id.
input is converted to lowercase, alphanumeric with underscore (or your choosen 'whitespaceChar').
example:  "  (hi)   world!" ==> "hi_world"
the rules: maximum of 1 underscore at a time, and won't prefix/suffix with underscores (or your chosen 'whitespaceChar'*/
export declare function toId(str: string, whitespaceChar?: string): string;
export declare function ipV4toInt(ip: string): number;
export declare function intToIpV4(int: number): string;
export declare function capitalize(str: string): string;
export declare function repeat(toRepeate: string, numberOfTimes: number): string;
export declare function replaceAll(target: string, strToFind: string, replaceWith: string, ignoreCase?: boolean): string;
export declare function insertAt(target: string, toInsert: string, insertPosition: number): string;
export declare function remove(target: string, ...textToRemove: string[]): string;
export declare function removePrefix(target: string, ...prefixToRemove: string[]): string;
export declare function removeSuffix(target: string, ...suffixToRemove: string[]): string;
/**
 * removes the beginning of a string until the point where it no longer matches another.   good for removing prefixing paths
 * @param target
 * @param match
 */
export declare function removeMatchingPrefix(target: string, match: string): string;
export declare function removeAfter(target: string, textToFind: string, keepFindText?: boolean): string;
export declare function removeBefore(target: string, textToFind: string, keepFindText?: boolean): string;
export declare function endsWith(target: string, toFind: string): boolean;
export declare function isNullOrEmpty(str: string): boolean;
/** removes any leading bit-order-marker from utf8 strings */
export declare function tryRemoveBom(str: string): string;
/** escape a string for use as a literal match in a regex expression
copied from http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
*/
export declare function escapeRegExp(str: string): string;
/**
 *  Converting to, and from, base64url https://en.wikipedia.org/wiki/Base64#RFC_4648
example:   base64=```'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='``` base64Url=```'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'```
copied source code from the npm package: https://www.npmjs.com/package/base64url on 20160926.
 */
import * as base64Url from "./internal/base64url";
export { base64Url };
/**
 *  base64 encode and decode functions
 */
export declare module base64 {
    function encode(input: string | Buffer): string;
    function decode(base64Encoded: string, encoding?: string): string;
    function toBuffer(base64Encoded: string): Buffer;
}
/** returns a 32bit integer.  same algorithm as used with java, so output should match */
export declare function hash(input: string): number;
/**format strings */
import * as _sprintf from "sprintf-js";
export declare var format: typeof _sprintf.sprintf;
export declare var format2: typeof _sprintf.vsprintf;
