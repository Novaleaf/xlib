/* eslint-disable @typescript-eslint/no-namespace */

import * as crypto from "isomorphic-webcrypto"
export { crypto }

import * as hex from "./hex"
import * as exception from "./exception"
import * as stringHelper from "./str"
import * as numHelper from "./num"
import * as rand from "./rand"
import * as serialization from "./serialization"
import * as convert from "./convert"

/** supported hash algo names. */
export type HASH_ALGO_NAMES = "SHA-256" | "SHA-384" | "SHA-512"

/**
 * defaults to generate a sha512 hash of your inputs, and returns it as a base64 encoded string. (88 characters in length)
 * optional to use a different algo
 * @param input
 */
export async function hash( msg: string, algoName: HASH_ALGO_NAMES = "SHA-512" ) {
	//code from: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#Basic_example
	const encoder = new TextEncoder()
	const data = encoder.encode( msg )
	const hashBuffer = await crypto.subtle.digest( { name: algoName }, data )
	return hex.from( hashBuffer )
}



import * as jwt from "jsonwebtoken"
export { jwt }


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

	const radix = 32 //target 0-9 and a-z, except for easily mixed up characters (see keyReplacements structure below)

	if ( digits == null ) {
		digits = 25
	}

	if ( digitGroupings == null ) {
		digitGroupings = 5
	}

	if ( groupingSeperator == null ) {
		groupingSeperator = "-"
	}


	const finalKey: Array<string> = []
	let initialKey: string
	if ( userInputToParse != null ) {


		if ( userInputToParse.length > ( digits + ( ( digitGroupings + 3 ) * 3 ) + 4 ) ) {
			//input is far too long, reject it without comparing
			if ( suppressThrowOnBadInput === true ) {
				return ""
			}
			throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput too long" )
		}
		if ( userInputToParse.length < digits ) {

			if ( suppressThrowOnBadInput === true ) {
				return ""
			}
			throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput too short." )
		}

		userInputToParse = decodeURIComponent( userInputToParse )
		//remove non-alphanumeric inputs
		initialKey = stringHelper.toId( userInputToParse, "" )

		if ( initialKey.length !== digits ) {
			if ( suppressThrowOnBadInput === true ) {
				return ""
			}
			throw new exception.XlibException( "nlib.cryptography.humanReadableKey(): parseUserInput length wrong." )
		}

	} else {
		initialKey = rand.randomIntDigitsCrypto( digits, radix )
	}

	/**
	 *  don't use easily confused characters in key
	 */
	const keyReplacements: { [ key: string ]: string; } = {
		o: "z",
		i: "y",
		l: "x",
		u: "w",
		//[ key: "o" | "i" | "l" | "u"]: st

	}


	for ( let i = 0; i < initialKey.length; i++ ) {
		if ( digitGroupings !== 0 && i % digitGroupings === 0 && i !== 0 ) {
			//insert digit groupins
			finalKey.push( groupingSeperator )
		}
		let char = initialKey[ i ]

		if ( userInputToParse != null ) {
			//the initialKey is formed from user input.  handle potential wrong characters (o,i,l,u)
			switch ( char ) {
				case "o":
					char = "0"
					break
				case "i":
				case "l":
					char = "1"
					break
				case "u":
					char = "v"
					break
				default:
					//noop
					break
			}
		} else {
			//the initialKey is formed from randomDigits.  map potential wrong characters (o,i,l,u) to (z,y,x,w)
			const replacement = keyReplacements[ char ]
			if ( replacement != null ) {
				char = replacement
			} else {
				//noop
			}
		}
		finalKey.push( char )
	}

	const toReturn = finalKey.join( "" )
	//console.log("randomKey", minDigits, maxDigits, initialKey, toReturn);
	return toReturn

}



/** well known elliptic curves.   note: 
* see: https://w3c.github.io/webcrypto/#ecdsa
 */
export type ECNamedCurves =
	"P-256" | "P-384" | "P-521";

// /** generate an elliptic curve key pair. */
// export async function generateECKeyPair(/** defaults to ```P-256``` */ namedCurve: ECNamedCurves = "P-256" ) {
// 	return new Promise<{ pub: string; pri: string; }>( ( resolve, reject ) => {

// 		crypto.generateKeyPair( 'ec', {
// 			namedCurve,//: "secp112r1",// "secp256k1",// "P-256", //P-256, P-384, P-521 " P-521",// "secp521r1",// 
// 			publicKeyEncoding: {
// 				type: 'spki',
// 				format: 'pem'
// 			},
// 			privateKeyEncoding: {
// 				type: 'pkcs8',
// 				format: 'pem',
// 				cipher: undefined,//'aes-256-cbc',
// 				passphrase: undefined, //"secret word"
// 			}
// 		}, ( err: Error, pub: string, pri: string ) => {
// 			if ( err != null ) {
// 				reject( err );
// 			}
// 			resolve( { pub, pri } );
// 		} );
// 	} );

// 	await crypto.ensureSecure()

// 	crypto.subtle.exportKey()
// 	let toReturn = {

// 	}

// }

export type AsymAlgoName = ECNamedCurves

export async function genECKey( namedCurve: ECNamedCurves ) {
	await crypto.ensureSecure()
	return crypto.subtle.generateKey( {
		name: "ECDSA",
		namedCurve
	},
		true,
		[ "sign", "verify" ]
	)
}

/*** export the key pair in pkcs#8 PEM format */
export async function exportKeyPkcs8( cryptoKeyPair: CryptoKeyPair | PromiseLike<CryptoKeyPair> ) {
	//from: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey#PKCS_8_export
	//can also see: https://stackoverflow.com/a/55188241

	await crypto.ensureSecure()
	const pair = await Promise.resolve( cryptoKeyPair )
	const priBuffer = await crypto.subtle.exportKey( "pkcs8", pair.privateKey )
	const priStr = convert.arrayBufferToString( priBuffer )
	const priBase64 = convert.base64.encode( priStr )
	const priPem = `-----BEGIN PRIVATE KEY-----\n${ priBase64 }\n-----END PRIVATE KEY-----`


	const pubBuffer = await crypto.subtle.exportKey( "pkcs8", pair.publicKey )
	const pubStr = convert.arrayBufferToString( pubBuffer )
	const pubBase64 = convert.base64.encode( pubStr )
	const pubPem = `-----BEGIN PUBLIC KEY-----\n${ pubBase64 }\n-----END PUBLIC KEY-----`


	return { pub: pubPem, pri: priPem }


}

// /*
// Import a PEM encoded RSA private key, to use for RSA-PSS signing.
// Takes a string containing the PEM encoded key, and returns a Promise
// that will resolve to a CryptoKey representing the private key.
// */
// export async function importKeyPkcs8( priPem: string ) {
// 	// fetch the part of the PEM string between header and footer
// 	const pemHeader = "-----BEGIN PRIVATE KEY-----"
// 	const pemFooter = "-----END PRIVATE KEY-----"
// 	//const pemContents = priPem.substring( pemHeader.length, priPem.length - pemFooter.length )
// 	let pemContents = stringHelper.removeBefore( priPem, pemHeader )
// 	pemContents = stringHelper.removeAfter( pemContents, pemFooter )
// 	pemContents = pemContents.trim()



// 	// base64 decode the string to get the binary data
// 	const binaryDerString = convert.base64.decode( pemContents )//window.atob( pemContents )

// 	// convert from a binary string to an ArrayBuffer
// 	const binaryDer = convert.stringToArrayBuffer( binaryDerString )

// 	return window.crypto.subtle.importKey(
// 		"pkcs8",
// 		binaryDer,
// 		{
// 			name: "RSA-PSS",
// 			// Consider using a 4096-bit key for systems that require long-term security
// 			modulusLength: 2048,
// 			publicExponent: new Uint8Array( [ 1, 0, 1 ] ),
// 			hash: "SHA-256",
// 		},
// 		true,
// 		[ "sign" ]
// 	)
// }

// import * as zlib from "zlib"

// /** custom dictionary for compressing tinyToken payloads */
// const _tinyTokenDeflateDict: Buffer = Buffer.from( ":false,:true,{\"}},\":[\"]:\",\"data\":{\"created\":\"TT_DATE_MS_=155000\",\"expires\":\"" )

// /* a custom alternative to JWT that is aprox 50% the size.  only really useful when you are under a size limit (eg: 255chars or smaller).  

// Designed for manditory key signing (use elliptic curve for smallest signature size) and supports token expiration.

// if size doesn't matter, use [[jwt]] instead as that's a standard and implementations are available on various platforms+languages.
// */
// export namespace tinyToken {
// 	/** create and signs a token.  */
// 	export async function sign( data: string | {},
// 		/** can be any priKey in ```PEM``` format, but for tiny and secure tokens, we recomend using a key generated from [[generateECKeyPair]] (```P-256``` for the smallest yet secure).

// 		Convienience Note: if your priKey is a ```string``` and does not start/end with the default PEM plaintext achor lines (eg: ```-----BEGIN PRIVATE KEY-----<eol>``` we will add them for you automatically);
// 		*/
// 		privateKey: string | Buffer, options?: {
// 			/** duration.  eg: ```5m``` = 5min.  see  https://www.npmjs.com/package/ms */
// 			expires?: string;
// 			/** by default the current date+time is used when signing.  you can override this.   this value is rounded down to the closest second */
// 			currentDate?: Date;
// 		} ) {

// 		await crypto.ensureSecure()

// 		options = { currentDate: new Date(), ...options }
// 		//ensure key is in PEM format
// 		if ( typeof privateKey === "string" && privateKey.trim().startsWith( "-----BEGIN PRIVATE KEY-----" ) === false ) {
// 			privateKey = `-----BEGIN PRIVATE KEY-----\n${ privateKey.trim() }\n-----END PRIVATE KEY-----\n`
// 		}
// 		const payload = {
// 			created: new Date( numHelper.round( options.currentDate!.valueOf(), 3 ) ), //Math.floor( options.currentDate.valueOf() / 1000 ) ),
// 			expires: options.expires,
// 			data,
// 		}

// 		const payloadStringified = JSON.stringify( payload, ( key, val ) => {

// 			try {
// 				if ( typeof ( val ) === "string" && val.endsWith( "Z" ) ) {
// 					const asMs = Date.parse( val )
// 					return `TT_DATE_MS_=${ asMs }`
// 				}
// 			} catch ( _err ) { }
// 			return val
// 		} )


// 		const deflatedBuffer = await new Promise<Buffer>( ( resolve, reject ) => {

// 			zlib.deflateRaw( payloadStringified, {
// 				dictionary: _tinyTokenDeflateDict, //level: zlib.constants.Z_BEST_COMPRESSION
// 			}, ( _err, result ) => {
// 				if ( _err != null ) {
// 					reject( _err )
// 					return
// 				}
// 				resolve( result )
// 			} )
// 		} )
// 		// const deflatedBuffer = zlib.deflateRaw( payloadStringified, {
// 		// 	dictionary: _tinyTokenDeflateDict, //level: zlib.constants.Z_BEST_COMPRESSION
// 		// } )
// 		//const signer = crypto.createSign( "sha256" )
// 		//const sig = stringHelper.base64Url.encode( signer.update( deflatedBuffer ).sign( privateKey ) )
// 		const key = await crypto.subtle.importKey( "pkcs8", privateKey, )
// 		const sig = crypto.subtle.sign( "SHA-256", privateKey, deflatedBuffer )

// 		const deflated = convert.base64Url.encode( deflatedBuffer )

// 		//console.warn( `log debug: payloadStringified.len=${ payloadStringified.length } defLen=${ deflated.length }, sig.len=${ sig.length }, payloadStringified=${ payloadStringified }` )

// 		// if ( deflated.includes( "." ) || sig.includes( "." ) ) {
// 		//     throw new exception.Exception("Fatal Error:  The constructed tinyToken includes the '.' character in an invalid position.   we use the '.' character for seperating sections of the token and should not have been encoded via base64Url.")
// 		// }
// 		return `0.${ deflated }.${ sig }`
// 	}

// 	/** verify and parse a token */
// 	export async function verify<TData = string | {}>( token: string,
// 		/** public key for the keyPair used when calling [[create()]] 

// 		Convienience Note: if your pubKey is a ```string``` and does not start/end with the default PEM plaintext achor lines (eg: ```-----BEGIN PUBLIC KEY-----<eol>``` we will add them for you automatically);*/
// 		publicKey: string | Buffer,
// 		options?: {
// 			/** default false.  if true, we won't reject the promise when a validation fails (bad sig, expired).  instead you'll need to check the resulting payload yourself */
// 			allowValidationFailure?: boolean;
// 			/** by default the current date+time is used when verifying.  you can override this.    this value is rounded down to the closest second */
// 			currentDate?: Date;
// 		} ) {

// 		options = { currentDate: new Date(), allowValidationFailure: false, ...options }
// 		if ( typeof publicKey === "string" && publicKey.trim().startsWith( "-----BEGIN PUBLIC KEY-----" ) === false ) {
// 			publicKey = `-----BEGIN PUBLIC KEY-----\n${ publicKey.trim() }\n-----END PUBLIC KEY-----\n`
// 		}
// 		if ( token.startsWith( "0." ) !== true ) {
// 			return bb.reject( new Error( "Invalid Token.  Can not Parse.  not a TinyToken or a newer version.  we expected to start with '0.' " ) )
// 		}
// 		const tokenParse = token.split( ".", 10 )
// 		if ( tokenParse.length > 3 ) {
// 			return bb.reject( new Error( "Invalid Token.  Can not Parse.  not a TinyToken or a newer version.  found too many '.' characters (expected 2) " ) )
// 		}
// 		const header = tokenParse[ 0 ]
// 		const deflated = stringHelper.base64Url.toBuffer( tokenParse[ 1 ] )
// 		const sig = stringHelper.base64Url.toBuffer( tokenParse[ 2 ] )

// 		//verify signature
// 		const verifier = crypto.createVerify( "sha256" )
// 		verifier.update( deflated )
// 		const isSigValid = verifier.verify( publicKey, sig )

// 		if ( isSigValid !== true && options.allowValidationFailure !== true ) {
// 			return bb.reject( new Error( "Invalid Token.  Signature is invalid." ) )
// 		}

// 		const payloadStr = await new bb<string>( ( resolve, reject ) => {
// 			zlib.inflateRaw( deflated, { dictionary: _tinyTokenDeflateDict }, ( _err, result ) => {
// 				if ( _err != null ) {
// 					reject( _err )
// 					return
// 				}
// 				resolve( result.toString( "utf-8" ) )
// 			} )
// 		} )

// 		const payload: {
// 			data: TData;
// 			created: Date;
// 			expires: string;
// 		} = JSON.parse( payloadStr, ( key, val ) => {
// 			if ( typeof ( val ) === "string" && val.startsWith( "TT_DATE_MS_=" ) ) {
// 				const msStr = val.split( "=" )[ 1 ]
// 				const msVal = Number.parseInt( msStr )
// 				return new Date( msVal )//.toISOString();
// 			}
// 			return val
// 		} )

// 		//const created = new Date( payload.created  );

// 		//check if expired
// 		let isExpired = false
// 		if ( payload.expires != null ) {
// 			const expireDur = ms( payload.expires )
// 			isExpired = ( payload.created.valueOf() + expireDur ) < options.currentDate.valueOf()
// 		}
// 		if ( isExpired === true && options.allowValidationFailure !== true ) {
// 			return bb.reject( new Error( "Invalid Token.  Expired." ) )
// 		}


// 		const toReturn = {
// 			data: payload.data,
// 			created: payload.created,
// 			isExpired: isExpired,
// 			isSigValid: isSigValid,
// 			isValid: isExpired === false && isSigValid === true,
// 		}

// 		return toReturn


// 	}

// }