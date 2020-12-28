
import * as reflection from "./reflection"
import * as _ from "lodash"
import * as stringHelper from "./str"
import * as numHelper from "./num"
import * as dsv from "d3-dsv"
import * as time from "./time"
import * as exception from "./exception"


export class UrlValidator {

	public isValid = true;
	public errorMessage?: string;

	public url?: URL;

	constructor(
		input: string | URL,
		public options?: {
			/** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
			allowLocalhost?: boolean;
			/** default false to avoid reading the local file system */
			allowFileProtocol?: boolean;
			/** default false to avoid obsolete protocol */
			allowGopherProtocol?: boolean;
			/** default false to mitigate network scans.  setting to true allows local subnet ip's. */
			allowPrivateIp?: boolean;
			/** default false, allow domain name using non-printable ascii characters */
			allowUnicodeDomain?: boolean;
		}
	) {
		this.options = {
			//option defaults
			allowFileProtocol: false,
			allowLocalhost: false,
			allowPrivateIp: false,
			allowGopherProtocol: false,
			allowUnicodeDomain: false,
			//merge in user defined options
			...options
		}
		options = this.options

		try {
			if ( input instanceof URL ) {
				this.url = new URL( input.toString() )
			} else if ( typeof ( input ) === "string" ) {
				const inputString = input.trim()
				this.url = new URL( inputString )
			} else {
				throw new exception.XlibException( "input is not string or URL" )
			}

			if ( this.url.protocol !== "data:" ) {
				//check hostname
				const hostname = this.url.hostname.toLowerCase()
				if ( hostname.length === 0 ) {
					throw new exception.XlibException( `invalid hostname blank: "${ hostname }"` )
				}
				if ( options.allowUnicodeDomain === true ) {
					//ok
				} else if ( isAscii( hostname ) !== true ) {
					throw new exception.XlibException( `invalid hostname characters of "${ hostname }"` )
				}
				if ( options.allowLocalhost === true ) {
					//ok
				} else if ( hostname === "localhost" || hostname === "127.0.0.1" ) {
					throw new exception.XlibException( `invalid hostname of "${ hostname }"` )
				}


				if ( options.allowPrivateIp === true ) {
					//ok
				} else {
					if ( isPrivateIp( hostname ) === true ) {
						if ( options.allowLocalhost === true && hostname === "127.0.0.1" ) {
							//ok, we allow localhost
						} else {
							throw new exception.XlibException( `invalid hostname ip of "${ hostname }"` )
						}
					}
				}
			}


			//check protocol
			const protocol = this.url.protocol
			switch ( protocol ) {
				case "gopher:":
					if ( options.allowGopherProtocol === true ) {
						break
					} else {
						throw new exception.XlibException( `invalid protocol of "${ protocol }"` )
					}
				case "file:":
					if ( options.allowFileProtocol === true ) {
						break
					} else {
						throw new exception.XlibException( `invalid protocol of "${ protocol }"` )
					}
				case "http:":
				case "https:":
				case "ftp:":
				case "ws:":
				case "wss:":
				case "data:":
					//ok;
					break
				default:
					throw new exception.XlibException( `invalid protocol of "${ protocol }"` )
			}
		} catch ( ex ) {
			this.isValid = false
			if ( ex instanceof exception.XlibException ) {
				this.errorMessage = ex.message
			} else {
				this.errorMessage = `unknown error: ${ ex }`
			}
		}
	}


}


/** from  https://stackoverflow.com/questions/8113546/how-to-determine-whether-an-ip-address-in-private*/
export function isPrivateIp( ipV4Address: string ) {
	const ipParts = ipV4Address.trim().split( "." ).map( ( str ) => numHelper.parseInt( str ) )
	if ( ipParts.length !== 4 ) {
		return false
	}
	if (
		( ipParts[ 0 ] === 10 ) // single class A network
		|| ( ipParts[ 0 ] === 172 && ipParts[ 1 ] >= 16 && ipParts[ 1 ] <= 31 ) // 16 contiguous class B network
		|| ( ipParts[ 0 ] === 192 && ipParts[ 1 ] === 168 ) // 256 contiguous class C network
		|| ( ipParts[ 0 ] === 169 && ipParts[ 1 ] === 254 ) // Link-local address also referred to as Automatic Private IP Addressing
		|| ( ipParts[ 0 ] === 100 && ipParts[ 1 ] === 64 && ipParts[ 2 ] <= 192 ) // 100.64.0.0/10 for use in carrier-grade NAT environments. see https://en.wikipedia.org/wiki/Carrier-grade_NAT
		|| ( ipParts[ 0 ] === 127 ) // localhost
	) {
		return true
	}
	return false
}
/** verify that a string only contains ascii characters (no unicode) */
function isAscii(
	toCheck: string,
	/** default is "printable" */
	charSet: "standard" | "extended" | "printable" = "printable" ) {
	if ( typeof ( toCheck as ANY ) !== "string" ) {
		return false
	}
	if ( toCheck.length === 0 ) {
		return true
	}
	//test regex from https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
	switch ( charSet ) {
		case "printable":
			return /^[\x20-\x7F]*$/.test( toCheck )
		case "extended":
			// eslint-disable-next-line no-control-regex
			return /^[\x00-\xFF]*$/.test( toCheck )
		case "standard":
			// eslint-disable-next-line no-control-regex
			return /^[\x00-\x7F]*$/.test( toCheck )
		default:
			throw new exception.XlibException( "invalid charSet option to validation.isAscii()" )
	}
}

