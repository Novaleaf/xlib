import * as _ from "lodash"

export function arrayBufferToString( buffer: ArrayBuffer ) {
	return String.fromCharCode.apply( null, new Uint8Array( buffer ) as ANY )
}
export function stringToArrayBuffer( str: string ) {
	const buf = new ArrayBuffer( str.length * 2 ) // 2 bytes for each char
	const bufView = new Uint16Array( buf )
	for ( let i = 0, strLen = str.length; i < strLen; i++ ) {
		bufView[ i ] = str.charCodeAt( i )
	}
	return buf
}


export function ipV4toInt( ip: string ): number {
	const parts = ip.split( "." )
	let res = 0


	res += parseInt( parts[ 0 ], 10 ) << 24
	res += parseInt( parts[ 1 ], 10 ) << 16
	res += parseInt( parts[ 2 ], 10 ) << 8
	res += parseInt( parts[ 3 ], 10 )

	return res
}
export function intToIpV4( int: number ): string {
	const part1 = int & 255
	const part2 = ( ( int >> 8 ) & 255 )
	const part3 = ( ( int >> 16 ) & 255 )
	const part4 = ( ( int >> 24 ) & 255 )

	// tslint:disable-next-line: restrict-plus-operands
	return part4 + "." + part3 + "." + part2 + "." + part1
}



import base64url from "base64url"
/**
 *  Converting to, and from, base64url https://en.wikipedia.org/wiki/Base64#RFC_4648
example:   base64=```'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='``` base64Url=```'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'```
uses the npm package: https://www.npmjs.com/package/base64url
 */
export const base64Url: {
	/** base64url encode stringOrBuffer
	```
	Example
	
> base64url('ladies and gentlemen, we are floating in space')
'bGFkaWVzIGFuZCBnZW50bGVtYW4sIHdlIGFyZSBmbG9hdGluZyBpbiBzcGFjZQ'
	```*/
	encode( input: string | Buffer ): string;
	/** Convert a base64url encoded string into a raw string. Encoding defaults to 'utf8'.
	```
	> base64url.decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg')
'ride: dreams burn down'
	```*/
	decode( b64UrlEncoded: string, encoding?: string ): string;
	/** Convert a base64 encoded string to a base64url encoded string
	
Example
	```
> base64url.fromBase64('qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA==')
'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'
	```
	*/
	fromBase64( b64Encoded: string ): string;

	/** Convert a base64url encoded string to a base64 encoded string
	```
> base64url.toBase64('qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA')
'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='
	```
	*/
	toBase64( b64UrlEncoded: string ): string;
	/**
	Convert a base64url encoded string to a Buffer
	```
> base64url.toBuffer('c3Bpcml0dWFsaXplZA')
<Buffer 73 70 69 72 69 74 75 61 6c 69 7a 65 64>
	```*/
	toBuffer( b64UrlEncoded: string ): Buffer;
} = base64url



//export const base64Url = _base64Url.default

/**
 *  base64 encode and decode functions
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace base64 {
	export function encode( input: string | Buffer ): string {
		const isStr = _.isString( input )
		if ( isStr !== true || ( typeof ( btoa ) === "undefined" && typeof ( Buffer ) !== "undefined" ) ) {
			if ( isStr ) {
				//nodejs does not define bota or atob
				return Buffer.from( input as string, "utf8" ).toString( "base64" )
			} else {
				return ( input as Buffer ).toString( "base64" )
			}
		}
		return btoa( input as string )
	}
	export function decode( base64Encoded: string ): string {
		if ( typeof ( atob ) === "undefined" && typeof ( Buffer ) !== "undefined" ) {
			//nodejs does not define bota or atob
			return Buffer.from( base64Encoded, "base64" ).toString( "utf8" )
		}
		return atob( base64Encoded )
	}

	export function toBuffer( base64Encoded: string ): Buffer {
		return Buffer.from( base64Encoded, "base64" )
	}
}

