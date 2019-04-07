"use strict";


import * as exception from "./_diagnostics/exception";
import * as stringHelper from "./_util/stringhelper";
import * as numHelper from "./_util/numhelper";
import * as _ from "lodash";
import bb = require( "bluebird" );
import luxon = require( "luxon" );
import ms = require( "ms" );

/** cross-platform implementation of the nodejs module: http://nodejs.org/api/crypto.html
 * -------------------
 * The crypto module offers a way of encapsulating secure credentials to be used as part of a secure HTTPS net or http connection.  It also offers a set of wrappers for OpenSSL's hash, hmac, cipher, decipher, sign and verify methods.
 * When to use: if the other classes/functions in this ```security``` module do not meet your needs.
 */
export import crypto = require( "crypto" );

/**
 * generate a sha512 hash of your inputs, and returns it as a base64 encoded string. (88 characters in length)
 * @param input
 */
export function sha512(
    /** if an array, generates a hash of all values (passing each value to consecutively update the returning hash) */
    input: string | Buffer | Array<string> | Array<Buffer>
): string {
    /** set to true to use base64 output instead of base64Url*/
    let useNormalBase64Encode = true;
    let toHash: ( string | Buffer )[];
    if ( _.isArray( input ) !== true ) {
        //input = [ input ] as any[];
        toHash = [ input as any ];
    } else {
        toHash = input as any[];
    }

    let hashFunction = crypto.createHash( "sha512" );
    for ( let i = 0; i < toHash.length; i++ ) {
        let currentInput = toHash[ i ];
        if ( currentInput == null ) {
            continue;
        }
        hashFunction.update( currentInput );
    }
    let buffer = hashFunction.digest();
    if ( useNormalBase64Encode === true ) {
        return buffer.toString( "base64" );
    } else {
        return stringHelper.base64Url.encode( buffer );
    }
}


/** JSON Web Tokens.    https://jwt.io/ */
export import jwt = require( "jsonwebtoken" );  //good intro to JWT: https://stormpath.com/blog/token-auth-spa/


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
export function humanFriendlyKey( digits?: number, digitGroupings?: number, userInputToParse?: string, groupingSeperator?: string, suppressThrowOnBadInput = false ): string {

    let radix = 32; //target 0-9 and a-z, except for easily mixed up characters (see keyReplacements structure below)

    if ( digits == null ) {
        digits = 25;
    }

    if ( digitGroupings == null ) {
        digitGroupings = 5;
    }

    if ( groupingSeperator == null ) {
        groupingSeperator = "-";
    }


    let finalKey: Array<string> = [];
    let initialKey: string;
    if ( userInputToParse != null ) {


        if ( userInputToParse.length > ( digits + ( ( digitGroupings + 3 ) * 3 ) + 4 ) ) {
            //input is far too long, reject it without comparing
            if ( suppressThrowOnBadInput === true ) {
                return "";
            }
            throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput too long" );
        }
        if ( userInputToParse.length < digits ) {

            if ( suppressThrowOnBadInput === true ) {
                return "";
            }
            throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput too short." );
        }

        userInputToParse = decodeURIComponent( userInputToParse );
        //remove non-alphanumeric inputs
        initialKey = stringHelper.toId( userInputToParse, "" );

        if ( initialKey.length !== digits ) {
            if ( suppressThrowOnBadInput === true ) {
                return "";
            }
            throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput length wrong." );
        }

    } else {
        initialKey = numHelper.randomIntDigitsCrypto( digits, radix );
    }

    /**
     *  don't use easily confused characters in key
     */
    let keyReplacements: { [ key: string ]: string; } = {
        o: "z",
        i: "y",
        l: "x",
        u: "w",
        //[ key: "o" | "i" | "l" | "u"]: st

    };


    for ( let i = 0; i < initialKey.length; i++ ) {
        if ( digitGroupings !== 0 && i % digitGroupings === 0 && i !== 0 ) {
            //insert digit groupins
            finalKey.push( groupingSeperator );
        }
        let char = initialKey[ i ];

        if ( userInputToParse != null ) {
            //the initialKey is formed from user input.  handle potential wrong characters (o,i,l,u)
            switch ( char ) {
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
            let replacement = keyReplacements[ char ];
            if ( replacement != null ) {
                char = replacement;
            } else {
                //noop
            }
        }
        finalKey.push( char );
    }

    let toReturn = finalKey.join( "" );
    //console.log("randomKey", minDigits, maxDigits, initialKey, toReturn);
    return toReturn;

}

/** well known elliptic curves.   note: 
* see: https://w3c.github.io/webcrypto/#ecdsa
 */
export type ECNamedCurves =/** secp112r1 is not commonly supported, but offers the smallest ECDSA sig of 36 bytes, so can be useful for circumstances where byte size is limited.*/
    "secp112r1" | "P-256" | "P-384" | "P-521";

/** generate an elliptic curve key pair.  generallly stick with the ```P-*``` named curves.  ```secp112r1``` is not commonly supported, but offers the smallest ECDSA sig of 36 bytes, so can be useful for circumstances where byte size is limited. */
export async function generateECKeyPair(/** defaults to ```P-256``` */ namedCurve: ECNamedCurves = "P-256" ) {
    return new bb<{ pub: string; pri: string; }>( ( resolve, reject ) => {

        crypto.generateKeyPair( 'ec', {
            namedCurve,//: "secp112r1",// "secp256k1",// "P-256", //P-256, P-384, P-521 " P-521",// "secp521r1",// 
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: undefined,//'aes-256-cbc',
                passphrase: undefined, //"secret word"
            }
        }, ( err: Error, pub: string, pri: string ) => {
            if ( err != null ) {
                reject( err );
            }
            resolve( { pub, pri } );
        } );
    } );
}

import zlib = require( "zlib" );
const _tinyTokenDeflateDict = Buffer.from( `,{"},"data":"created":"expires":"` );


/** a custom alternative to JWT that is aprox 50% the size.  only really useful when you are under a size limit (eg: 255) */
export const tinyToken = {
    /** create and signs a token.  */
    create: async function tinyToken_create( data: string | {},
        /** can be any priKey in ```PEM``` format, but for tiny and secure tokens, we recomend using a key generated from [[generateECKeyPair]] */
        privateKey: string | Buffer, options?: {
            /** duration.  eg: ```5m``` = 5min.  see  https://www.npmjs.com/package/ms */
            expires?: string;
        } ) {
        options = { ...options };
        let payload = {
            data,
            created: Math.floor( Date.now() / 1000 ),
            expires: options.expires,
        };
        const deflatedBuffer = await new bb<Buffer>( ( resolve, reject ) => {
            zlib.deflateRaw( JSON.stringify( payload ), { dictionary: _tinyTokenDeflateDict }, ( _err, result ) => {
                if ( _err != null ) {
                    reject( _err );
                    return;
                }
                resolve( result );
            } );
        } );
        const signer = crypto.createSign( "sha256" );
        const sig = stringHelper.base64Url.encode( signer.update( deflatedBuffer ).sign( privateKey ) );
        const deflated = stringHelper.base64Url.encode( deflatedBuffer );
        return `0.${ deflated }.${ sig }`;
    },

    /** verify and parse a token */
    verify: async function tinyToken_verify<TData = string | {}>( token: string,
        /** public key for the keyPair used when calling [[create()]] */publicKey: string | Buffer, options?: {
        /** default false.  if true, we won't reject the promise when a validation fails (bad sig, expired).  instead you'll need to check the resulting payload yourself */
        allowValidationFailure?: boolean;
    } ) {

        options = { allowValidationFailure: false, ...options };

        if ( token.startsWith( "0." ) !== true ) {
            return bb.reject( new Error( "Invalid Token.  Can not Parse.  not a TinyToken or a newer version.  we expected to start with '0.' " ) );
        }
        const tokenParse = token.split( ".", 10 );
        if ( tokenParse.length > 3 ) {
            return bb.reject( new Error( "Invalid Token.  Can not Parse.  not a TinyToken or a newer version.  found too many '.' characters (expected 2) " ) );
        }
        const header = tokenParse[ 0 ];
        const deflated = stringHelper.base64Url.toBuffer( tokenParse[ 1 ] );
        const sig = stringHelper.base64Url.toBuffer( tokenParse[ 2 ] );

        //verify signature
        const verifier = crypto.createVerify( "sha256" );
        verifier.update( deflated );
        const isSigValid = verifier.verify( publicKey, sig );

        if ( isSigValid !== true && options.allowValidationFailure !== true ) {
            return bb.reject( new Error( "Invalid Token.  Signature is invalid." ) );
        }

        const payloadStr = await new bb<string>( ( resolve, reject ) => {
            zlib.inflateRaw( deflated, { dictionary: _tinyTokenDeflateDict }, ( _err, result ) => {
                if ( _err != null ) {
                    reject( _err );
                    return;
                }
                resolve( result.toString( "utf-8" ) );
            } );
        } );

        let payload: {
            data: TData;
            created: number;
            expires: string;
        } = JSON.parse( payloadStr );

        const created = new Date( payload.created * 1000 );

        //check if expired
        let isExpired = false;
        if ( payload.expires != null ) {
            const expireDur = ms( payload.expires );
            isExpired = ( created.valueOf() + expireDur ) < Date.now();
        }
        if ( isExpired === true && options.allowValidationFailure !== true ) {
            return bb.reject( new Error( "Invalid Token.  Expired." ) );
        }


        let toReturn = {
            data: payload.data,
            created: created,
            isExpired: isExpired,
            isSigValid: isSigValid,
            isValid: isExpired === false && isSigValid === true,
        };

        return toReturn;


    }

};
