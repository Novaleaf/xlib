/* eslint-disable no-bitwise */


// tslint:disable: no-bitwise

import * as _ from "lodash"
import * as ex from "../diagnostics/exception"

// /** color strings for console use.  also used by logger */
// export import Chalk = require( "chalk" );

// /** remove ansi characters from string.  also used by logger. */
// export import stripAnsi = require( "strip-ansi" );


/**
 * escapes strings for html presentation.
 * firstly decodeUriComponent's the string, then html escapes it
 * @param value
 * @param disableAutoUriDecode
 */
export function htmlEscapeEscapedUserInput( value: string ): string {

    return _.escape( decodeURIComponent( value ) )

}


/**
 * converts escaped string back to the encudeUriComponent value
 * @param value
 */
export function htmlUnescapeEscapedUserInput( value: string ): string {
    return encodeURIComponent( _.unescape( value ) )
}

/**
 *  sanitizes strings by escaping most non-alphanumerics
 * @param value
 */
export function escapeUserInput( value: string ): string {
    return encodeURIComponent( value )
}
/**
 *  unsanitizes strings sanitized via .sanitizeUserInput();
 * @param value
 */
export function unescapeUserInput( value: string ): string {
    return decodeURIComponent( value )
}

/** helper for the .isUnicodeDoubleByte() method */
// eslint-disable-next-line no-control-regex
const _isUnicodeDoubleByte_regex = /[^\u0000-\u00ff]/ // Small performance gain from pre-compiling the regex
/** does the string contain characters larger than a single byte */
export function isUnicodeDoubleByte( str: string ) {
    //from: https://stackoverflow.com/questions/147824/how-to-find-whether-a-particular-string-has-unicode-characters-esp-double-byte
    if ( str == null || str.length === 0 ) {
        return false
    }
    if ( str.charCodeAt( 0 ) > 255 ) { return true }
    return _isUnicodeDoubleByte_regex.test( str )
}

/**
 * basic, simple check if the string has been encoded via encodeURIComponent() or encodeURI()
 * may return false-positives, but never false-negatives.
 * @param value
 */
export function isEncodedMaybe( value: string ) {

    if ( value.indexOf( "%" ) < 0 ) {
        return false
    }
    return true
}
export function count( target: string, subStrToCount: string, ignoreCase = false, startingPosition = 0,/**default false.  if true, we allow overlapping finds, such as "aa" in the string "aaa" would return 2*/ allowOverlaps = false ): number {
    if ( target == null ) {
        return 0
    }
    if ( ignoreCase === true ) {
        target = target.toLowerCase()
        subStrToCount = subStrToCount.toLowerCase()
    }
    let counted = 0

    if ( subStrToCount == null || subStrToCount.length === 0 ) {
        throw new ex.XlibException( "subStrToCount length is zero" )
    }
    while ( true ) {
        const index = target.indexOf( subStrToCount, startingPosition )
        if ( index >= 0 ) {
            counted++
            if ( allowOverlaps === true ) {
                startingPosition = index + 1
            } else {
                startingPosition = index + subStrToCount.length
            }
        } else {
            break
        }
    }
    return counted
}

export function indexOf( target: string, toFind: string, ignoreCase = false, startingPosition = 0 ): number {
    if ( ignoreCase === true ) {
        target = target.toLowerCase()
        toFind = toFind.toLowerCase()
    }
    return target.indexOf( toFind, startingPosition )
}

/** if the target is encapsulated by prefix/suffix, returns the unencapsulated version
otherwise, returns the target (non modified)
*/
export function between( target: string, prefix: string, suffix: string, ignoreCase = false, trimFirst = false ) {
    if ( trimFirst ) {
        target = target.trim()
    }
    //copy target in case we need to compare case-insensitive.
    let compareTarget = target
    if ( ignoreCase ) {
        compareTarget = compareTarget.toLowerCase()
        prefix = prefix.toLowerCase()
        suffix = suffix.toLowerCase()
    }

    if ( compareTarget.indexOf( prefix ) === 0 && endsWith( compareTarget, suffix ) ) {
        return target.substring( prefix.length, target.length - suffix.length )
    } else {
        return target
    }
}

/** if the string is longer than the maxLength, creates a summary (first + last) and returns it (ommiting the middle) */
export function summarize( str: string | ANY,/** default = 100 */ maxLength: number = 100 ) {
    if ( str == null ) {
        return "NULL"
    }
    let tempStr: string
    if ( typeof ( str ) === "string" ) {
        tempStr = str
    } else {
        if ( typeof ( str.substring ) !== "function" || typeof ( str.length ) !== "number" ) {
            try {
                tempStr = JSON.stringify( str )
            } catch ( ex ) {
                tempStr = "ERROR SUMMARIZING"
            }
        } else {
            //has str-like settings
            tempStr = str.substring( 0, length )
        }
    }

    if ( tempStr.length <= maxLength ) {
        return tempStr
    }
    const half = ( maxLength - 3 ) / 2
    // tslint:disable-next-line: restrict-plus-operands
    const toReturn = tempStr.substring( 0, half ) + "..." + tempStr.substring( tempStr.length - half )

    return toReturn
}


/** converts a string to something that can be used as a machine-readable id.
input is converted to lowercase, alphanumeric with underscore (or your choosen 'whitespaceChar').
example:  "  (hi)   world!" ==> "hi_world"
the rules: maximum of 1 underscore at a time, and won't prefix/suffix with underscores (or your chosen 'whitespaceChar'*/
export function toId( str: string, whitespaceChar = "_" ): string {
    //strip out invalid characters (valid=alphanumeric) groups are replaced by a single whitespace (which will be replaced in a following line)
    let toReturn = str
    //lowercase
    toReturn = toReturn.toLowerCase()
    //convert to alpha-numeric, with any groups of non-alpha being converted to a single space
    toReturn = toReturn.replace( /[^0-9a-z]+/g, " " )
    //replace multiple spaces with a single space
    //toReturn = toReturn.replace(/ +(?= )/g, '');
    //trim (remove leading and trailing spaces)
    toReturn = toReturn.trim()
    //replace spaces with whitespace char  (groups of spaces converted to single space, but not needed because we do that earlier)
    toReturn = toReturn.replace( /\s+/g, whitespaceChar )
    return toReturn
}

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

export function capitalize( str: string ): string {
    return str.charAt( 0 ).toUpperCase() + str.slice( 1 )
}
export function repeat( toRepeate: string, numberOfTimes: number ): string {
    return Array( numberOfTimes + 1 ).join( toRepeate )
}

export function replaceAll( target: string, strToFind: string, replaceWith: string, ignoreCase = false ): string {
    let flags = "g" //global match
    if ( ignoreCase === true ) {
        flags += "i"
    }

    return target.replace( RegExp( escapeRegExp( strToFind ), flags ), replaceWith )

}
export function insertAt( target: string, toInsert: string, insertPosition: number ): string {
    return [ target.slice( 0, insertPosition ), toInsert, target.slice( insertPosition ) ].join( "" )
}

export function remove( target: string, ...textToRemove: Array<string> ): string {
    if ( target == null ) {
        return target
    }
    let loop
    do {
        loop = false
        for ( let i = 0; i < textToRemove.length; i++ ) {
            const toTrim = textToRemove[ i ]
            const trimLen = toTrim.length
            while ( target.indexOf( toTrim ) === 0 ) {
                target = target.substr( trimLen )
                loop = true
            }
            while ( endsWith( target, toTrim ) ) {
                target = target.substr( 0, target.length - trimLen )
                loop = true
            }
        }
    } while ( loop )

    return target
}
export function removePrefix( target: string, ...prefixToRemove: Array<string> ): string {
    if ( target == null ) {
        return target
    }
    let loop
    do {
        loop = false
        for ( let i = 0; i < prefixToRemove.length; i++ ) {
            const toTrim = prefixToRemove[ i ]
            const trimLen = toTrim.length
            while ( target.indexOf( toTrim ) === 0 ) {
                target = target.substr( trimLen )
                loop = true
            }
            //while (endsWith(target, toTrim)) {
            //	target = target.substr(0, target.length - trimLen);
            //	loop = true;
            //}
        }
    } while ( loop )

    return target
}
export function removeSuffix( target: string, ...suffixToRemove: Array<string> ): string {
    if ( target == null ) {
        return target
    }
    let loop
    do {
        loop = false
        for ( let i = 0; i < suffixToRemove.length; i++ ) {
            const toTrim = suffixToRemove[ i ]
            const trimLen = toTrim.length
            //while (target.indexOf(toTrim) === 0) {
            //	target = target.substr(trimLen);
            //	loop = true;
            //}
            while ( endsWith( target, toTrim ) ) {
                target = target.substr( 0, target.length - trimLen )
                loop = true
            }
        }
    } while ( loop )

    return target
}

export function removeAfter( target: string, textToFind: string, keepFindText: boolean = false, /** search from back if true*/ lastIndexOf?: boolean ) {
    let index: number
    if ( lastIndexOf === true ) {
        index = target.lastIndexOf( textToFind )
    } else {
        index = target.indexOf( textToFind )
    }
    if ( index < 0 ) {
        return target //trim not found, so return original
    }
    if ( keepFindText ) {
        index += textToFind.length
    }
    return target.substring( 0, index )
}
//
export function removeBefore( target: string, textToFind: string, keepFindText: boolean = false,/** search from back if true*/ lastIndexOf?: boolean ) {
    let index: number
    if ( lastIndexOf === true ) {
        index = target.lastIndexOf( textToFind )
    } else {
        index = target.indexOf( textToFind )
    }
    if ( index < 0 ) {
        return target //trim not found, so return original
    }
    if ( keepFindText === false ) {
        index += textToFind.length
    }
    return target.substring( index )
}


export function endsWith( target: string, toFind: string ): boolean {
    return target.lastIndexOf( toFind ) === target.length - toFind.length
}

export function isNullOrEmpty( str: string ): boolean {
    if ( str == null || str.length === 0 ) { return true }
    return false
}
/** removes any leading bit-order-marker from utf8 strings */
export function tryRemoveBom( str: string ): string {
    if ( str == null ) { return str }
    if ( str.length < 1 ) { return str }
    const firstChar = str[ 0 ]

    //check for zero-width non-breaking space U+FEFF
    const thisEndian = "\ufeff" //little endian on windows
    const otherEndian = "\ufffe"

    if ( firstChar === thisEndian || firstChar === otherEndian ) {
        return str.substring( 1 )
    } else {
        //if (str.length < 4) { return str;}
        ////check for utf8 bom EFBBBF
        //var first3 = str.substr(0, 3);
        //if(first3=="\uEFBBBF
        return str
    }
}
/** escape a string for use as a literal match in a regex expression
copied from http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
*/
export function escapeRegExp( str: string ): string {
    return str.replace( /[-[\]/{}()*+?.\\^$|]/g, "\\$&" )
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


///** common js method, missing from typescript d.ts */
//declare function escape(input: string): string;
///** common js method, missing from typescript d.ts */
//declare function unescape(input: string): string;


///** create a unique string every time it"s called */
//export function createUniqueString(): string {
//	return collections.hashHelper.createUniqueCodeInternal();
//}

/** returns a 32bit integer.  same algorithm as used with java, so output should match */
export function hash( input: string ): number {
    /* tslint:disable */
    let hash = 0, i, c, l
    if ( input.length === 0 ) { return hash }
    for ( i = 0, l = input.length; i < l; i++ ) {
        c = input.charCodeAt( i )
        hash = ( ( hash << 5 ) - hash ) + c
        hash |= 0 // Convert to 32bit integer
    }
    /* tslint:enable */
    return hash
}

// import _sprintf = require( "sprintf-js" );
// export var format = _sprintf.sprintf;
// export var format2 = _sprintf.vsprintf;


///** string.format, supports the following style:  formatAlt(" hello {0}!","world")
//*/
//export function formatAlt(toFormat: string, ...args: any[]): string {
//	var newArgs: string[] = [];

//	//convert our args to strings
//	for (var i = 0; i < args.length; i++) {
//		if (args[i] == null) {
//			//replace null with string
//			args[i] = "NULL";
//		} else {
//			//convert our arg to string
//			var originalArg = args[i];
//			args[i] = originalArg.toString();
//			//if we show a non-meaningful "object" lets try to at least show it's typeName.
//			if (args[i] === "[object Object]") {
//				try {
//					var _getTypeNameOrFuncNameRegex = /function (.{1,})\(/;
//					var results = (_getTypeNameOrFuncNameRegex).exec((originalArg).constructor.toString());
//					var typeName = (results && results.length > 1) ? results[1] : "";
//					args[i] = typeName; // JSON.stringify(originalArg);
//				} catch (ex) {
//					//eat it, just show our first string version
//				}
//			}
//		}

//	}

//	//if (logger._DEBUG_MODE) {
//	//	//verify that our toFormat string has proper formatting numbers
//	//	for (var i = 0; i < args.length; i++) {
//	//		var toFind = "{" + i.toString() + "}";
//	//		if (toFormat.indexOf(toFind) < 0) {
//	//			logger.inspectDebug("__.format() missing from string", toFind, toFormat);
//	//			//logger.assert(false, "__.format() failed.  missing '{0}' from your string '{1}'", toFind, toFormat);
//	//		}
//	//	}
//	//}


//	//__.forEach(args, (arg) => { newArgs.push(arg == null ? "NULL" : arg.toString()); });
//	newArgs = args;
//	return toFormat.replace(/\{(\d+)\}/g, <any>function (argToken, argNum) { //HACK: typescript 0.9.5, added <any> cast
//		return typeof newArgs[argNum] !== "undefined"
//			? newArgs[argNum].toString()
//			: argToken
//			;
//	});
//};
