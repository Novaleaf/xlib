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
/** if an array, generates a hash of all values (passing each value to consecutively update the returning hash) */
input: string | Buffer | Array<string> | Array<Buffer>): string;
/** JSON Web Tokens.    https://jwt.io/ */
export import jwt = require("jsonwebtoken");
/**
 * returns a user-friendly alpha-numeric key.  By Default, constructs a cryptographically secure random one, or parses and normalizes one provided by userInput.
 * The key comprises the characters 0-9 and a-z, but not the characters o,i,l,u to avoid human transcription errors.
 * When parsing userInput, non-alphanumeric characters are discarded, and if the characters o,i,l,u are used, they are converted to 0,1,1,v respectively.
 * @param digits default = 25. length of the key you want to return, NOT including the digitGrouping seperators.
 * @param digitGroupings default=5.  to aid in humanreadableness, adds a seperator between groups of digits this size.
 * @param userInputToParse optional, attempts to parse user input, outputs a normalized key that can be used for comparison against the stored userkey.
 * @param groupingSeperator set the character used for sperating digit groups.  default is "-"
 * @param suppressThrowOnBadInput default false.  if true, returns empty string ("") when a blatently invalid key is detected.  when false, thrown an exception.
 */
export declare function humanFriendlyKey(digits?: number, digitGroupings?: number, userInputToParse?: string, groupingSeperator?: string, suppressThrowOnBadInput?: boolean): string;
/** well known elliptic curves.   note:
* see: https://w3c.github.io/webcrypto/#ecdsa
 */
export declare type ECNamedCurves = "P-256" | "P-384" | "P-521";
/** generate an elliptic curve key pair. */
export declare function generateECKeyPair(/** defaults to ```P-256``` */ namedCurve?: ECNamedCurves): Promise<{
    pub: string;
    pri: string;
}>;
/** a custom alternative to JWT that is aprox 50% the size.  only really useful when you are under a size limit (eg: 255chars or smaller).

Designed for manditory key signing (use elliptic curve for smallest signature size) and supports token expiration.

if size doesn't matter, use [[jwt]] instead as that's a standard and implementations are available on various platforms+languages.
*/
export declare namespace tinyToken {
    /** create and signs a token.  */
    function sign(data: string | {}, 
    /** can be any priKey in ```PEM``` format, but for tiny and secure tokens, we recomend using a key generated from [[generateECKeyPair]] (```P-256``` for the smallest yet secure).
    
    Convienience Note: if your priKey is a ```string``` and does not start/end with the default PEM plaintext achor lines (eg: ```-----BEGIN PRIVATE KEY-----<eol>``` we will add them for you automatically);
    */
    privateKey: string | Buffer, options?: {
        /** duration.  eg: ```5m``` = 5min.  see  https://www.npmjs.com/package/ms */
        expires?: string;
        /** by default the current date+time is used when signing.  you can override this.   this value is rounded down to the closest second */
        currentDate?: Date;
    }): Promise<string>;
    /** verify and parse a token */
    function verify<TData = string | {}>(token: string, 
    /** public key for the keyPair used when calling [[create()]]
    
    Convienience Note: if your pubKey is a ```string``` and does not start/end with the default PEM plaintext achor lines (eg: ```-----BEGIN PUBLIC KEY-----<eol>``` we will add them for you automatically);*/
    publicKey: string | Buffer, options?: {
        /** default false.  if true, we won't reject the promise when a validation fails (bad sig, expired).  instead you'll need to check the resulting payload yourself */
        allowValidationFailure?: boolean;
        /** by default the current date+time is used when verifying.  you can override this.    this value is rounded down to the closest second */
        currentDate?: Date;
    }): Promise<{
        data: TData;
        created: Date;
        isExpired: boolean;
        isSigValid: boolean;
        isValid: boolean;
    }>;
}
//# sourceMappingURL=security.d.ts.map