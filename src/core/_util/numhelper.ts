"use strict";
/* tslint:disable:no-bitwise */

import * as ex from "../_diagnostics/exception";
import * as crypto from "crypto";
/** max for a signed 8bit integer. (127) */
export var INT8_MAX = 127;

/** min for a signed 8bit integer. (-128) */
export var INT8_MIN = -128;
/** max for a signed 16bit integer. (32767) */
export var INT16_MAX = 32767;
export var INT16_MIN = -32768;
export var INT32_MAX = 2147483647;
export var INT32_MIN = -2147483648;
/** largest exact integer supported in javascript.  2^53.  (53 bit mantissa) after this, floating point rounding will occur
from http://stackoverflow.com/questions/307179/what-is-javascripts-max-int-whats-the-highest-integer-value-a-number-can-go-t */
export var INT_MAX = 9007199254740992;
/** largest exact integer supported in javascript.  2^53.  (53 bit mantissa) after this, floating point rounding will occur
from http://stackoverflow.com/questions/307179/what-is-javascripts-max-int-whats-the-highest-integer-value-a-number-can-go-t */
export var INT_MIN = -9007199254740992;




/**
 * formats values into strings using special heuristics to guess what is user friendly.
 * @param num
 */
export function format( value: number,/** default=5 */significantDigits = 5, separatorChar?: string ): string {

    if ( isNaN( value ) ) { return "NaN"; }
    let digits = countDigits( value );
    let roundDigits = digits - significantDigits;

    value = round( value, roundDigits );

    return toStringDigitGroupings( value, separatorChar );
}

var _aguid = require( "aguid" );
/**
 * npm aguid module, generate a deterministic v4 uuid from input, or a random one if no input is given. https://github.com/dwyl/aguid
 */
export function guid(/** if input is supplied, output is deterministic. */ input?: string ): string {
    return _aguid( input );
}

/** fast hash a int32, not very great spread */
export function hash( input: number ): number {
    //from http://stackoverflow.com/questions/9624963/java-simplest-integer-hash
    if ( !( input <= INT32_MAX && input % 1 === 0 ) ) { throw new ex.XlibException( "must supply integer" ); }
    input ^= ( input >>> 20 ) ^ ( input >>> 12 );
    return input ^ ( input >>> 7 ) ^ ( input >>> 4 );
}
/**
 * ensure that the value specified is a number and is finite.
 * @param x
 */
export function isReal( x: number ): boolean {
    if ( isNaN( x ) || !isFinite( x ) ) { return false; }
    return true;
}

export function randomFloat( min_inc = 0.0, max_exc = 1.0 ) {
    //implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * ( max_exc - min_inc ) + min_inc;
}
export function randomInt( min_inc = 0, max_exc = INT32_MAX ) {
    //implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.floor( Math.random() * ( max_exc - min_inc ) ) + min_inc;
}
export function randomBool(/** the probability that true will be returned.  default 0.5 (50%) */trueChance = 0.5 ): boolean {
    return Math.random() < trueChance;
    //return randomInt(0, 2) === 0; 
}

export function round( value: number,
    /** default = 0.  round(123.456,10)=>0;    round(123.456,2)=>100;   round(123.456,-2)=>123.46;   round(123.456,0)=>123;   round(123.456,-10)=>123.456;*/
    digitsOrNegativeForDecimals: number = 0 ) {

    let mult = Math.pow( 10, -digitsOrNegativeForDecimals );

    return Math.round( value * mult ) / mult;
}
/** check that two nombers are close enough to eachother.     all parameters are combined when calculating, IE:   ```maxValue =  ( ( input * ( 1 + percentTollerance ) )  + spreadTollerance ) ```*/
export function aboutEqual( input: number, checkAgainst: number,
    /** how many percent different the two numbers can be 
     * 
     * Default is ```0```, meaning this parameter is ignored */
    percentTollerance: number,
    /** a fixed spread tollerance that the numbers should be within   
     * 
     * Default is ```0```, meaning this parameter is ignored */
    spreadTollerance: number = 0 ): boolean {
    return ( ( ( input * ( 1 + percentTollerance ) ) + spreadTollerance ) >= checkAgainst
        && ( ( input * ( 1 - percentTollerance ) ) - spreadTollerance ) <= checkAgainst );
}

/** randomize order of elements in this array */
export function randomizeArray( myArray: any[] ) {
    //from here http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
    // tslint:disable-next-line:one-variable-per-declaration
    var i = myArray.length, j, temp;
    if ( i === 0 ) { return; }
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = myArray[ i ];
        myArray[ i ] = myArray[ j ];
        myArray[ j ] = temp;
    }
}
/**
 *  ex: randomString(20, 'ABCDEFG'); // Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.
 * @param length
 * @param chars
 */
export function randomStringCrypto( length: number, chars: string ) {
    if ( chars == null ) {
        throw new Error( 'Argument \'chars\' is undefined' );
    }

    var charsLength = chars.length;
    if ( charsLength > 256 ) {
        throw new Error( 'Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken' );
    }

    var randomBytes = crypto.randomBytes( length );
    var result = new Array( length );

    var cursor = 0;
    for ( var i = 0; i < length; i++ ) {
        cursor += randomBytes[ i ];
        result[ i ] = chars[ cursor % charsLength ];
    }

    return result.join( '' );
}
/**
 *  ex: randomAsciiString(20); // Returns 'rmRptK5niTSey7NlDk5y' which is 20 characters length.
 * @param length
 */
export function randomAsciiStringCrypto( length: number ) {
    return randomStringCrypto( length,
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' );
}
/**
 *  create a random number output as a string, with the specified number of digits.  
 * @param minDigits
 * @param maxDigits set to minDigits if not specified
 * @param radix 
 */
export function randomIntDigits( digits: number, radix = 10 ) {

    var output: string[] = [];

    for ( var i = 0; i < digits; i++ ) {
        var num = randomInt( 0, radix );
        output.push( num.toString( radix ) );
    }
    var toReturn = output.join( "" );
    return toReturn;

    //var minValueInc = Math.pow(radix, minDigits-1);//  minDigits * radix;
    //var maxValueExc = Math.pow(radix, maxDigits);//(maxDigits + 1) * radix;
    //var randValue = randomInt(minValueInc, maxValueExc);

    //var toReturn = randValue.toString(radix);

    ////console.log("randomIntDigits", minValueInc, maxValueExc, randValue, toReturn);
    //return toReturn;
}

/**
 *  create a random number output as a string, with the specified number of digits.  
 *  uses crypto, so slower but secure.
 * @param minDigits
 * @param maxDigits set to minDigits if not specified
 * @param radix 
 */
export function randomIntDigitsCrypto( digits: number, radix = 10 ) {

    var output: string[] = [];

    let hexBuffer = crypto.randomBytes( digits ).toString( "hex" );

    for ( var i = 0; i < digits; i++ ) {
        let hex = hexBuffer.substring( i * 2, ( i + 1 ) * 2 );
        let byte = parseInt( hex, undefined, 16 );
        let num = byte % radix;

        output.push( num.toString( radix ) );
    }
    var toReturn = output.join( "" );
    return toReturn;
}
/**
 *  count number of digits in a number
 * @param value
 * @param countDecimals
 */
export function countDigits( value: number,/** default false, count only the whole digits */
    countDecimals = false ) {
    //solution from http://stackoverflow.com/questions/14879691/get-number-of-digits-with-javascript
    if ( countDecimals === true ) {
        value = Number( String( value ).replace( /[^0-9]/g, '' ) );
    }
    return Math.max( Math.floor( Math.log( Math.abs( value ) ) * Math.LOG10E ), 0 ) + 1;
}

/** how the clamp function should process the input (what kind of result should be returned) */
export enum ClampType {
    /** value not set, an error */
    none,
    /** if value is below min, returns min.  likewise for above max */
    clamp,
    /** if value is below min, loops over to max (or vice-versa) */
    loop,
    /** oscillate the returned value between min/max range */
    bounce,
	/** return the remainder (amount value lies beyond min/max range), not the clamped value.
	if inside clamp range, returns zero.  if below min, returns negative.  if above range, returns positive. */
    remainder,
}


/**
 *  clamp a number to be within the range specified
 */
export function clamp( value: number, min_inc: number, max_inc: number, /** defaults to "clamp" */ clampType: ClampType = ClampType.clamp ): number {
    var range = max_inc - min_inc;
    var remainder: number;
    if ( value < min_inc ) {
        remainder = value - min_inc;
    } else if ( value > max_inc ) {
        remainder = value - max_inc;
    } else {
        remainder = 0;
    }
    if ( remainder === 0 ) {
        if ( clampType === ClampType.remainder ) { return 0; }
        return value;
    }

    var modRemainder = remainder % range;

    switch ( clampType ) {
        case ClampType.clamp:
            if ( remainder < 0 ) { return min_inc; }
            return max_inc;

        case ClampType.remainder:
            return remainder;

        case ClampType.loop:
            if ( remainder < 0 ) { return max_inc - modRemainder; }
            return min_inc + modRemainder;

        case ClampType.bounce:
            var flipBounce = ( Math.floor( Math.abs( remainder / range ) ) % 2 ) === 1;
            if ( ( remainder < 0 && !flipBounce ) || ( remainder > 0 && flipBounce ) ) { return min_inc + modRemainder; }
            return max_inc - modRemainder;

        default:
            throw new ex.XlibException( "unknown ClampType: " + ClampType );
    }
}

/** interpolate between values
base implementation works for numbers.  override .update() to extend functionality to other types */
export class Interpolator {
    public current: number;
    public startRate: number;
    private clampType: ClampType;
    constructor( public start: number, public min: number, public max: number, public rate: number, public isBounce: boolean, public isEnabled = true ) {
        this.clampType = isBounce ? ClampType.bounce : ClampType.loop;
        this.current = start;
        this.startRate = rate;
    }
    public update( elapsedMs: number ) {
        if ( !this.isEnabled ) { return this.current; }
        var delta = this.rate * elapsedMs / 1000;

        var newCurrent = this.current + delta;

        this.current = clamp( newCurrent, this.min, this.max, this.clampType );

        if ( this.isBounce ) {
            //if we do a bounce, flip our rate (this is buggy if we are going so fast to do multiple bounces in 1 update, but that"s acceptable for now)
            var remainder = clamp( newCurrent, this.min, this.max, ClampType.remainder );
            if ( remainder !== 0 ) {
                this.rate = -this.rate;
            }
        }
        return this.current;
    }
}

/** truncate a float to int.   negative number safe, and fast performance */
export function toInt( value: number ): number {
    //using bitwise operator, as per: http://stackoverflow.com/questions/596467/how-do-i-convert-a-float-number-to-a-whole-number-in-javascript
    return ~~value;
}
/**
 * a string with a separator for every number digit group (more than 4 digits)
 * @param num
 */
export function toStringDigitGroupings(
    num: number,
    /** default comma */
    separatorChar = ",",
    /** if true, decimals will have digits grouped with a space.  default=false */
    groupDecimalsWithSpace = false ): string {

    if ( isNaN( num ) ) { return "NaN"; }
    var str = num.toString().split( '.' );
    if ( str[ 0 ].length >= 5 ) {
        str[ 0 ] = str[ 0 ].replace( /(\d)(?=(\d{3})+$)/g, '$1' + separatorChar );
    }
    if ( groupDecimalsWithSpace === true ) {
        if ( str[ 1 ] != null && str[ 1 ].length >= 5 ) {
            str[ 1 ] = str[ 1 ].replace( /(\d{3})/g, '$1 ' );
        }
    }
    return str.join( '.' );
}

/** parses the value into an integer. */
export function parseInt( toParse: any,/** invalid strings are returned as this (default=NaN) */invalidResult = NaN, radix = 10 ) {
    //logger.assert(typeof (toParse) === "string", "input is not a string");
    var result = global[ "parseInt" ]( toParse, radix );
    if ( isNaN( result ) ) {
        return invalidResult;
    } else {
        return result;
    }
}
/** parses the value into a float. */
export function parseFloat( toParse: any,/** invalid strings are returned as this (default=NaN) */invalidResult = NaN, /** the default parseFloat implementation allows for trailing text.  specifying isStrict=TRUE makes only numbers + "Infinity" allowed to be parsed.   */isStrict = false ) {

    var result: number;
    if ( isStrict === true ) {
        if ( /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
            .test( toParse ) ) {
            result = Number( toParse );
        } else {
            result = NaN;
        }
    } else {
        result = global[ "parseFloat" ]( toParse );
    }

    if ( isNaN( result ) ) {
        return invalidResult;
    } else {
        return result;
    }
}

export function parseBoolean( toParse: string | number, invalidResult = false, throwOnInvalid = false ) {
    if ( typeof toParse === "string" ) {
        let str = toParse.toLowerCase().trim();
        switch ( str ) {
            case "true":
                //case "yes":
                //case "1":
                return true;
            case "false":
                //case "no":
                //case "0":
                return false;
            default:
                if ( throwOnInvalid === true ) {
                    throw new ex.XlibException( "unable to parseBoolean on input value= " + toParse );
                }
                return invalidResult;
        }
    }
    if ( typeof toParse === "number" ) {
        return toParse !== 0;
    }
    if ( throwOnInvalid === true ) {
        throw new ex.XlibException( "unable to parseBoolean on input value= " + toParse );
    }
    return invalidResult;
}

//module tests {
//	"use strict";
//	describe("abc", () => {
//		describe("second level", () => {
//			it("should fail", () => {
//				throw new Error("boom!");
//			});
//		});
//	});
//}
