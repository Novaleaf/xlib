"use strict";

import exception = require("./exception");
import stringHelper = require("./stringhelper");
import numHelper = require("./numhelper");
import _ = require("lodash");

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
export function sha512(
    /** if an array, generates a hash of all values */
    input: string | Buffer | string[] | Buffer[]
): string {
    /** set to true to use base64 output instead of base64Url*/
    let useNormalBase64Encode: boolean = true;
    //if (_.isArray(input) !== true) {
    //    input = [input] as any[];
    //}
    var hashFunction = crypto.createHash("sha512");

    if (_.isArray(input)) {
        for (var i = 0; i < input.length; i++) {
            let currentInput = input[i];
            if (currentInput == null) {
                continue;
            }
            hashFunction.update(currentInput);
        }
    } else {
        hashFunction.update(input);
    }


    let buffer = hashFunction.digest();
    if (useNormalBase64Encode === true) {
        return buffer.toString("base64");
    } else {
        return stringHelper.base64Url.encode(buffer);
    }
}

///** JSON Web Tokens.    https://jwt.io/ */
//export import jwt = require("jsonwebtoken");  //good intro to JWT: https://stormpath.com/blog/token-auth-spa/


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
export function humanFriendlyKey(digits?: number, digitGroupings?: number, userInputToParse?: string, groupingSeperator?: string, suppressThrowOnBadInput = false): string {

    var radix = 32; //target 0-9 and a-z, except for easily mixed up characters (see keyReplacements structure below)

    if (digits == null) {
        digits = 25;
    }

    if (digitGroupings == null) {
        digitGroupings = 5;
    }

    if (groupingSeperator == null) {
        groupingSeperator = "-";
    }


    var finalKey: string[] = [];
    var initialKey: string;
    if (userInputToParse != null) {


        if (userInputToParse.length > (digits + ((digitGroupings + 3) * 3) + 4)) {
            //input is far too long, reject it without comparing
            if (suppressThrowOnBadInput === true) {
                return "";
            }
            throw new exception.CorelibException("nlib.cryptography.humanReadableKey(): parseUserInput too long");
        }
        if (userInputToParse.length < digits) {

            if (suppressThrowOnBadInput === true) {
                return "";
            }
            throw new exception.CorelibException("nlib.cryptography.humanReadableKey(): parseUserInput too short.");
        }

        userInputToParse = decodeURIComponent(userInputToParse);
        //remove non-alphanumeric inputs
        initialKey = stringHelper.toId(userInputToParse, "");

        if (initialKey.length != digits) {
            if (suppressThrowOnBadInput === true) {
                return "";
            }
            throw new exception.CorelibException("nlib.cryptography.humanReadableKey(): parseUserInput length wrong.");
        }

    } else {
        initialKey = randomIntDigitsCrypto(digits, radix);
    }

    /**
     *  don't use easily confused characters in key
     */
    let keyReplacements = {
        "o": "z",
        "i": "y",
        "l": "x",
        "u": "w"
    };


    for (var i = 0; i < initialKey.length; i++) {
        if (digitGroupings !== 0 && i % digitGroupings === 0 && i !== 0) {
            //insert digit groupins
            finalKey.push(groupingSeperator);
        }
        var char = initialKey[i];

        if (userInputToParse != null) {
            //the initialKey is formed from user input.  handle potential wrong characters (o,i,l,u)
            switch (char) {
                case "o":
                    char = "0";
                    break;
                case "i":
                case "l":
                    char = "1";
                    break;
                case "u":
                    char = "v";
                    break;
                default:
                    //noop
                    break;
            }
        } else {
            //the initialKey is formed from randomDigits.  map potential wrong characters (o,i,l,u) to (z,y,x,w)
            let replacement: string = (keyReplacements as any)[char as any];
            if (replacement != null) {
                char = replacement;
            } else {
                //noop
            }
        }
        finalKey.push(char);
    }

    var toReturn = finalKey.join("");
    //console.log("randomKey", minDigits, maxDigits, initialKey, toReturn);
    return toReturn;

}



/**
 *  ex: randomString(20, 'ABCDEFG'); // Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.
 * @param length
 * @param chars
 */
export function randomStringCrypto(length: number, chars: string) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}
/**
 *  ex: randomAsciiString(20); // Returns 'rmRptK5niTSey7NlDk5y' which is 20 characters length.
 * @param length
 */
export function randomAsciiStringCrypto(length: number) {
    return randomStringCrypto(length,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}



/**
 *  create a random number output as a string, with the specified number of digits.  
 *  uses crypto, so slower but secure.
 * @param minDigits
 * @param maxDigits set to minDigits if not specified
 * @param radix 
 */
export function randomIntDigitsCrypto(digits: number, radix = 10) {

    var output: string[] = [];

    let hexBuffer = crypto.randomBytes(digits).toString("hex");

    for (var i = 0; i < digits; i++) {
        let hex = hexBuffer.substring(i * 2, (i + 1) * 2);
        let byte = numHelper.parseInt(hex, undefined, 16);
        let num = byte % radix;

        output.push(num.toString(radix));
    }
    var toReturn = output.join("");
    return toReturn;
}