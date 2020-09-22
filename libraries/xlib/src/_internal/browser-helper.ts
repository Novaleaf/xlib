// tslint:disable

//import jsHelper = require("../core/jshelper");
//import ex = require("../core/exception");

import * as _ from "lodash"

/** low-level javascript helpers for use in the browser. graceful fallbacks if not a browser*/

// declare let phantom: any; //global let if we are running under phantomjs
// /** DEPRECATED:  use jsHelper.platformType instead.   
// determine if running in a browser (if false, most likely running in node.js) */
// export let isBrowser = typeof window !== "undefined" && typeof phantom === "undefined";


// /** detect ie version, or undefined if ie10+ or non ie browser.
// usage:  if(ieVersion<9){...}*/
// export let ieVersion: number = ( function () {
// 	if ( typeof ( document ) === "undefined" ) {
// 		return null;
// 	}
// 	// tslint:disable-next-line:one-variable-per-declaration
// 	let undef,
// 		v = 3,
// 		div = document.createElement( "div" ),
// 		all = div.getElementsByTagName( "i" );

// 	while (
// 		// tslint:disable-next-line:no-conditional-assignment ban-comma-operator
// 		div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><i></i><![endif]-->",
// 		all[ 0 ]
// 	) {
// 		//no op
// 	};

// 	return v > 4 ? v : undef;
// }() );
// /** detects if we are running any ie, even 10  (looks for 'trident' in user agent) */
// export let isIE: boolean = ( function () {
// 	if ( typeof ( navigator ) === "undefined" ) {
// 		return false;
// 	}
// 	if ( ieVersion || navigator.userAgent.toLowerCase().indexOf( "trident" ) >= 0 ) {
// 		return true;
// 	}
// 	return false;
// }() );

// /** provides onload() capabilities that work on old versions of IE too */
// export function onLoad( domElement: any, callback: any ): void {
// 	//throw new Error("depricated.  still used?");
// 	//jquery handling of callbacks, taken from http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
// 	if ( typeof domElement.onload === "undefined" && domElement.onreadystatechange !== "undefined" ) {
// 		throw new Error( "the element you wish to attach the callback does not have a .onload() method to attach to!" );
// 	}
// 	let done = false;
// 	domElement.onload = domElement.onreadystatechange = function ( ev: Event ) {
// 		// tslint:disable-next-line:no-invalid-this
// 		if ( !done && ( !this.readyState ||
// 			// tslint:disable-next-line:no-invalid-this
// 			this.readyState === "loaded" || this.readyState === "complete" ) ) {
// 			done = true;
// 			//jQuery.handleSuccess(s, xhr, status, data);
// 			//jQuery.handleComplete(s, xhr, status, data);

// 			callback( ev );

// 			//if (!environment._DEBUG_MODE) {
// 			// Handle memory leak in IE
// 			domElement.onload = domElement.onreadystatechange = null;
// 			//if (domElement && scriptElement.parentNode) {
// 			//	domElement.removeChild(scriptElement);
// 			//}
// 			//}
// 		}
// 	};
// }


/** get the first attribute and return it"s value from a dom element
example:
let amdMain = getFirstAttribute("script","data-amd-main");
*/
export function getDomAttribute( elementType: string, attribute: string, searchTopDown: boolean = false ): string | undefined {
	if ( typeof ( document ) === "undefined" ) {
		return undefined
	}

	const foundElement = getDomElement( elementType, attribute, undefined, searchTopDown )
	if ( foundElement == null ) { return undefined }

	return foundElement.getAttribute( attribute ) ?? undefined
}
/** get the first html element found and return it.  */
export function getDomElement( elementType: string,
	/** if not undefined, finds an element with this attribute */
	attribute?: string, attributeValue?: string, searchTopDown = false ): Element | undefined {
	if ( typeof ( document ) === "undefined" ) {
		return undefined
	}
	let foundElement: Element | undefined
	const elements = document.getElementsByTagName( elementType )
	if ( attribute == null ) {
		//return first element found
		if ( elements.length >= 1 ) {
			foundElement = elements[ 0 ]
		}
	} else {
		//search for attribute name

		const searchPredicate = ( element: Element ): boolean => {
			const foundAttributeValue = element.getAttribute( attribute )
			if ( foundAttributeValue ) {
				if ( attributeValue == null ) {
					//got it!   stop
					foundElement = element
					return true
				} else {
					//we need to match attribute"s value for success match
					if ( attributeValue === foundAttributeValue ) {
						foundElement = element
						return true
					}
				}
			}
			return false
		}

		if ( searchTopDown ) {
			_.forEach( elements, searchPredicate )
		} else {
			_.forEachRight( elements, searchPredicate )
		}
	}
	return foundElement
}

/////** async load css
////beware the styles may not be loaded before rendering occurs! */
////export function loadCss(url) {
////	let link = <HTMLLinkElement> document.createElement("link");
////	link.type = "text/css";
////	link.rel = "stylesheet";
////	link.href = url;
////	document.getElementsByTagName("head")[0].appendChild(link);
////}

import { XlibException } from "../diagnostics/exception"
/** cached query so we only get cookies once per pageload*/
let _parsedCookies: { [ key: string ]: string }

/** obatin all cookies */
export function getCookies( {
	/** by default returns cached result of last call.  pass true to requery envInfo  */
	refresh = false
} = {} ): Record<string, string> {
	if ( _parsedCookies == null || refresh === true ) {
		if ( typeof ( document ) === "undefined" ) { //for severside not using something like jsdom
			throw new XlibException( "document (base object) is missing.  this function is meant for browser use.  are you running serverside?" )
		} else {
			_parsedCookies = {}
			const rawCookies = document.cookie.split( ";" )

			for ( let i = 0; i < rawCookies.length; i++ ) {
				const keypair = rawCookies[ i ].trim()
				if ( keypair.length === 0 ) {
					continue
				}


				const raw = rawCookies[ i ]

				let key: string
				let value: string

				const splitLocation = raw.indexOf( "=" )
				if ( splitLocation === -1 ) {
					key = raw
					value = raw
				} else if ( splitLocation === 0 ) {
					//throw new Error("invalid cookie format.  cookie= " + raw);
					// tslint:disable-next-line:no-console
					console.error( "invalid cookie format.  cookie= " + raw )
					continue
				} else {
					key = raw.substring( 0, splitLocation )
					value = raw.substring( splitLocation + 1 )
				}

				//let cookie = rawCookies[i].split("=");
				//if (cookie.length > 2) {
				//	throw new Error("invalid cookie format.  cookie= " + rawCookies[i]);
				//}
				//if (cookie.length == 1) {
				//	key = cookie[0];
				//	value = cookie[0];
				//} else {
				//	key = cookie[0];
				//	value = cookie[1];
				//}
				_parsedCookies[ key ] = value
			}

			//for (let i = rawCookies.length - 1; i >= 0; i--) {
			//	let cookie = rawCookies[i].split("=");
			//	if (cookie.length !== 2) {
			//		throw new Error("invalid cookie format.  cookie= " + rawCookies[i]);
			//	}

			//	let key = cookie[0];
			//	let value = cookie[1];
			//	parsedCookies[key] = value;
			//}
		}
	}
	return _parsedCookies
}


export function getCookie( key: string, { /** value If Null Or Empty */ defaultValue = undefined as unknown as string, refresh = false } = {} ): string | undefined {



	const parsedCookies = getCookies( { refresh } )

	const result = parsedCookies[ key ]
	if ( defaultValue !== undefined ) {
		if ( result == null || result.length === 0 ) {
			return defaultValue
		}
	}
	return result
}


/** cached query so we only get cookies once per pageload*/
let _parsedQuerystrings: { [ key: string ]: string }

export function getQuerystringVariables( { refresh = false } = {} ): Record<string, string> {
	if ( _parsedQuerystrings == null || refresh === true ) {
		if ( typeof ( window ) === "undefined" ) { //for severside not using something like jsdom
			throw new XlibException( "window (base object) is missing.  this function is meant for browser use.  are you running serverside?" )
		} else {
			if ( window.location.search.length === 0 ) {
				//no querystrings to parse
				return {}
			}

			const rawVars = window.location.search.substring( 1 ).split( "&" )
			_parsedQuerystrings = {}
			for ( let i = rawVars.length - 1; i >= 0; i-- ) {
				const pair = rawVars[ i ].split( "=" )
				let key: string
				let value: string
				if ( pair.length === 1 ) {
					key = pair[ 0 ]
					value = key
				} else if ( pair.length === 2 ) {

					key = pair[ 0 ]
					value = pair[ 1 ]
				} else {
					key = pair[ 0 ]
					value = rawVars[ i ].substring( key.length )
					//throw new Error("invalid querystring format.  var= " + rawVars[i]);
				}
				_parsedQuerystrings[ key ] = value
			}
		}
	}
	return _parsedQuerystrings
}
export function getQuerystringVariable( key: string, {/** value If Null Or Empty */ defaultValue = undefined as unknown as string, refresh = false } = {} ): string | undefined {
	//from: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	const parsedQuerystrings = getQuerystringVariables( { refresh } )

	const result = parsedQuerystrings[ key ]
	if ( defaultValue !== undefined ) {
		if ( result == null || result.length === 0 ) {
			return defaultValue
		}
	}
	return result
}

