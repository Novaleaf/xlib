/// <reference types="node" />
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/crypto.html
 * -------------------
 * The crypto module offers a way of encapsulating secure credentials to be used as part of a secure HTTPS net or http connection.  It also offers a set of wrappers for OpenSSL's hash, hmac, cipher, decipher, sign and verify methods.
 * When to use: if the other classes/functions in this ```security``` module do not meet your needs.
 */
export import crypto = require("crypto");
/**
 * generate a sha512 hash of your inputs, and returns it as a base64 encoded string. (88 characters in length)
 * @param input
 */
export declare function sha512(
    /** if an array, generates a hash of all values */
    input: string | Buffer | string[] | Buffer[]): string;
/** JSON Web Tokens.    https://jwt.io/ */
export import jwt = require("jsonwebtoken");
/**
 * returns a user-friendly alpha-numeric key.  By Default, constructs a cryptographically secure random one, or parses and normalizes one provided by userInput.
 * The key comprises the characters 0-9 and a-z, but not the characters o,i,l,u to avoid human transcription errors.
 * When parsing userInput, non-alphanumeric characters are discarded, and if the characters o,i,l,u are used, they are converted to 0,1,1,v respectively.
 * @param digits default = 25. length of the key you want to return, NOT including the digitGrouping seperators.
 * @param digitGroupings default=5.  to aid in humanreadableness, adds a seperator between groups of digits this size.
 * @param userInputToParse optional, attempts to parse user input, auto-correcting common (recoverable) human transcription errors.  if the parse is successfully, will output the same key, but in a "normalized" format (your digit groupings) key that can be used for comparison against the stored userkey.
 * @param groupingSeperator set the character used for sperating digit groups.  default is "-"
 * @param suppressThrowOnBadInput default false.  if true, returns empty string ("") when a blatently invalid key is detected.  when false, thrown an exception.
 */
export declare function humanFriendlyKey(digits?: number, digitGroupings?: number, userInputToParse?: string, groupingSeperator?: string, suppressThrowOnBadInput?: boolean): string;
/**
 *  ex: randomString(20, 'ABCDEFG'); // Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.
 * @param length
 * @param chars
 */
export declare function randomStringCrypto(length: number, chars: string): string;
/**
 *  ex: randomAsciiString(20); // Returns 'rmRptK5niTSey7NlDk5y' which is 20 characters length.
 * @param length
 */
export declare function randomAsciiStringCrypto(length: number): string;
/**
 *  create a random number output as a string, with the specified number of digits.
 *  uses crypto, so slower but secure.
 * @param minDigits
 * @param maxDigits set to minDigits if not specified
 * @param radix
 */
export declare function randomIntDigitsCrypto(digits: number, radix?: number): string;
