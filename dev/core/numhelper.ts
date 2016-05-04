"use strict";
/* tslint:disable:no-bitwise */

import ex = require("./exception");
import crypto = require("crypto");

export var INT8_MAX = 127;
export var INT8_MIN = -128;
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


export module hashHelper {
    "use strict";
    //var hashPrefix = randomInt().toString(36);
    var hashSuffixCounter = 0;
    var hashPrefix = Date.now().toString(36);
	/** returns a string that is unique for this application instance.
	NOT RANDOM!  Also this is not unique across multiple application instances unless they were started up at different times*/
    export function createUniqueCodeInternal(): string {
        hashSuffixCounter = hashSuffixCounter % INT_MAX;
        return hashPrefix + ((hashSuffixCounter++)).toString(36);
    }

    /** internal helper. if no hashcode, null is returned */
    export function getHashCode(item): string {
        if (item.__noenum_novaleaf_corelib_collections_hashCode != null) { return item.__noenum_novaleaf_corelib_collections_hashCode; }
        if (item.hashCode != null) {
            return item.hashCode.toString();
        }
        if (item.getHashCode != null) {
            return item.getHashCode().toString();
        }
        var type = typeof (item);
        if (type === "string") { return item; }
        if (type === "number") { return item.toString(); }
        return null;
    }

	/** SNIPPET TAKEN FROM JSHELPER: disallow enumeration of a property
	return true if succesfull false otherwise (such as if platform doesn't support it)*/
    function disablePropertyEnumeration(obj: any, propertyName: string): boolean {
        try {
            if (Object.defineProperty != null) {
                Object.defineProperty(obj, propertyName, { enumerable: false });
                return true;
            } else {
                return false;
            }
        } catch (ex) {
            //could not set for some reason
            return false;
        }
    }

    /** if hashCode exists, returns it.  otherwise will create one */
    export function tryCreateHashCode(item): string {
        //return existing hashcode, if any
        var hashCode = getHashCode(item);
        if (hashCode != null) { return hashCode; }
        //need to create
        if (item.hashCode != null) {
            //if object has a hashcode already defined.... use it
            item.__noenum_novaleaf_corelib_collections_hashCode = item.hashCode;
            if (typeof (item.__noenum_novaleaf_corelib_collections_hashCode) === "number") {
                item.__noenum_novaleaf_corelib_collections_hashCode = item.__noenum_novaleaf_corelib_collections_hashCode.toString();
            }
            if (typeof (item.__noenum_novaleaf_corelib_collections_hashCode) !== "string") {
                throw new ex.CorelibException("hash error:  your value.hashCode property did not return a string");
            }
        } else if (item.getHashCode != null) {
            //if object has a hashcode already defined.... use it
            item.__noenum_novaleaf_corelib_collections_hashCode = item.getHashCode();
            if (typeof (item.__noenum_novaleaf_corelib_collections_hashCode) === "number") {
                item.__noenum_novaleaf_corelib_collections_hashCode = item.__noenum_novaleaf_corelib_collections_hashCode.toString();
            }
            if (typeof (item.__noenum_novaleaf_corelib_collections_hashCode) !== "string") {
                throw new ex.CorelibException("hash error:  your value.getHashCode() method did not return a string");
            }
        } else {
            //define our own
            item.__noenum_novaleaf_corelib_collections_hashCode = createUniqueCodeInternal();
        }


        //define our injected hashcode as non-enumerable, doesn"t work on ie<9
        disablePropertyEnumeration(item, "__noenum_novaleaf_corelib_collections_hashCode");
        //return new hashcode
        return item.__noenum_novaleaf_corelib_collections_hashCode;
    }
}

export interface IHashCode {
    getHashCode(): string;
}


/**
 * formats values into strings using special heuristics to guess what is user friendly.
 * @param num
 */
export function format(value: number,/** default=5 */significantDigits = 5, seperatorChar?:string):string {

	let digits = countDigits(value);
	let roundDigits = digits - significantDigits;

	value = round(value, roundDigits);

	return toStringDigitGroupings(value, seperatorChar);
}

var _aguid = require("aguid");
/**
 * npm aguid module, generate a deterministic v4 uuid from input, or a random one if no input is given. https://github.com/dwyl/aguid
 */
export function guid(/** if input is supplied, output is deterministic. */ input?: string): string {
    return _aguid(input);
}

/** fast hash a int32, not very great spread */
export function hash(input: number): number {
    //from http://stackoverflow.com/questions/9624963/java-simplest-integer-hash
    if (!(input <= INT32_MAX && input % 1 === 0)) { throw new ex.CorelibException("must supply integer"); }
    input ^= (input >>> 20) ^ (input >>> 12);
    return input ^ (input >>> 7) ^ (input >>> 4);
}
/**
 * ensure that the value specified is a number and is finite.
 * @param x
 */
export function isReal(x: number): boolean {
    if (x == null || !isFinite(x)) { return false; }
    return true;
}

export function randomFloat(min_inc = 0.0, max_exc = 1.0) {
    //implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max_exc - min_inc) + min_inc;
}
export function randomInt(min_inc = 0, max_exc = INT32_MAX) {
    //implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.floor(Math.random() * (max_exc - min_inc)) + min_inc;
}
export function randomBool(/** the probability that true will be returned.  default 0.5 (50%) */trueChance = 0.5): boolean {
    return Math.random() < trueChance;
    //return randomInt(0, 2) === 0; 
}

export function round(value: number,
	/** default = 0.  round(123.456,10)=>0;    round(123.456,2)=>100;   round(123.456,-2)=>123.46;   round(123.456,0)=>123;   round(123.456,-10)=>123.456;*/
	digitsOrNegativeForDecimals: number =0) {

	let mult = Math.pow(10, -digitsOrNegativeForDecimals);

	return Math.round(value * mult) / mult;
}


/** randomize order of elements in this array */
export function randomizeArray(myArray: any[]) {
    //from here http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
    var i = myArray.length, j, temp;
    if (i === 0) { return false; }
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = myArray[i];
        myArray[i] = myArray[j];
        myArray[j] = temp;
    }
}
/**
 *  ex: randomString(20, 'ABCDEFG'); // Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.
 * @param length
 * @param chars
 */
export function randomStringCrypto(length, chars) {
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
export function randomAsciiStringCrypto(length) {
	return randomStringCrypto(length,
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}
/**
 *  create a random number output as a string, with the specified number of digits.  
 * @param minDigits
 * @param maxDigits set to minDigits if not specified
 * @param radix 
 */
export function randomIntDigits(digits: number, radix = 10) {

    var output: string[] = [];

    for (var i = 0; i < digits; i++) {
        var num = randomInt(0, radix);
        output.push(num.toString(radix));
    }
    var toReturn = output.join("");
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
export function randomIntDigitsCrypto(digits: number, radix = 10) {

    var output: string[] = [];

    let hexBuffer = crypto.randomBytes(digits).toString("hex");

    for (var i = 0; i < digits; i++) {
        let hex = hexBuffer.substring(i * 2, (i + 1) * 2);
        let byte = parseInt(hex, undefined, 16);
        let num = byte % radix;

        output.push(num.toString(radix));
    }
    var toReturn = output.join("");
    return toReturn;
}
/**
 *  count number of digits in a number
 * @param value
 * @param countDecimals
 */
export function countDigits(value: number,/** default false, count only the whole digits */
	countDecimals = false) {
	//solution from http://stackoverflow.com/questions/14879691/get-number-of-digits-with-javascript
	if (countDecimals === true) {
		value = Number(String(value).replace(/[^0-9]/g, ''));
	}
	return Math.max(Math.floor(Math.log(Math.abs(value)) * Math.LOG10E ), 0) + 1;
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
export function clamp(value: number, min_inc: number, max_inc: number, clampType: ClampType): number {
    var range = max_inc - min_inc;
    var remainder: number;
    if (value < min_inc) {
        remainder = value - min_inc;
    } else if (value > max_inc) {
        remainder = value - max_inc;
    } else {
        remainder = 0;
    }
    if (remainder === 0) {
        if (clampType === ClampType.remainder) { return 0; }
        return value;
    }

    var modRemainder = remainder % range;

    switch (clampType) {
        case ClampType.clamp:
            if (remainder < 0) { return min_inc; }
            return max_inc;

        case ClampType.remainder:
            return remainder;

        case ClampType.loop:
            if (remainder < 0) { return max_inc - modRemainder; }
            return min_inc + modRemainder;

        case ClampType.bounce:
            var flipBounce = (Math.floor(Math.abs(remainder / range)) % 2) === 1;
            if ((remainder < 0 && !flipBounce) || (remainder > 0 && flipBounce)) { return min_inc + modRemainder; }
            return max_inc - modRemainder;

        default:
            throw new ex.CorelibException("unknown ClampType: " + ClampType);
    }
}

/** interpolate between values
base implementation works for numbers.  override .update() to extend functionality to other types */
export class Interpolater {
    public current;
    public startRate;
    private clampType: ClampType;
    constructor(public start, public min, public max, public rate: number, public isBounce: boolean, public isEnabled = true) {
        this.clampType = isBounce ? ClampType.bounce : ClampType.loop;
        this.current = start;
        this.startRate = rate;
    }
    public update(elapsedMs: number) {
        if (!this.isEnabled) { return this.current; }
        var delta = this.rate * elapsedMs / 1000;

        var newCurrent = this.current + delta;

        this.current = clamp(newCurrent, this.min, this.max, this.clampType);

        if (this.isBounce) {
            //if we do a bounce, flip our rate (this is buggy if we are going so fast to do multiple bounces in 1 update, but that"s acceptable for now)
            var remainder = clamp(newCurrent, this.min, this.max, ClampType.remainder);
            if (remainder !== 0) {
                this.rate = -this.rate;
            }
        }
        return this.current;
    }
}

/** truncate a float to int.   negative number safe, and fast performance */
export function toInt(value: number): number {
    //using bitwise operator, as per: http://stackoverflow.com/questions/596467/how-do-i-convert-a-float-number-to-a-whole-number-in-javascript
    return ~~value;
}
/**
 * a string with a seperator for every number digit group (more than 4 digits)
 * @param num
 */
export function toStringDigitGroupings (
	num:number,
	/** default comma */
	seperatorChar = ",",
	/** if true, decimals will have digits grouped with a space.  default=false */
	groupDecimalsWithSpace = false): string {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1' + seperatorChar);
    }
	if (groupDecimalsWithSpace === true) {
		if (str[1] && str[1].length >= 5) {
			str[1] = str[1].replace(/(\d{3})/g, '$1 ');
		}
	}
    return str.join('.');
}

/** parses the value into an integer. */
export function parseInt(toParse: any,/** invalid strings are returned as this (default=NaN) */invalidResult = NaN, radix = 10) {
    //logger.assert(typeof (toParse) === "string", "input is not a string");
    var result = global["parseInt"](toParse, radix);
    if (isNaN(result)) {
        return invalidResult;
    } else {
        return result;
    }
}
/** parses the value into a float. */
export function parseFloat(toParse: any,/** invalid strings are returned as this (default=NaN) */invalidResult = NaN, /** the default parseFloat implementation allows for trailing text.  specifying isStrict=TRUE makes only numbers + "Infinity" allowed to be parsed.   */isStrict = false) {

    var result: number;
    if (isStrict === true) {
        if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
            .test(toParse)) {
            result = Number(toParse);
        } else {
            result = NaN;
        }
    } else {
        result = global["parseFloat"](toParse);
    }

    if (isNaN(result)) {
        return invalidResult;
    } else {
        return result;
    }
}

export function parseBoolean(toParse: string | number, invalidResult = false, throwOnInvalid = false) {
    if (typeof toParse === "string") {
        let str = toParse.toLowerCase().trim();
        switch (str) {
            case "true":
                //case "yes":
                //case "1":
                return true;
			case "false":
                //case "no":
                //case "0":
                return false;
			default:
                if (throwOnInvalid === true) {
                    throw new ex.CorelibException("unable to parseBoolean on input value= " + toParse);
				}
                return invalidResult;
		}
	}
    if (typeof toParse === "number") {
        return toParse !== 0;
	}
    if (throwOnInvalid === true) {
		throw new ex.CorelibException("unable to parseBoolean on input value= " + toParse);
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