
import * as exception from "./exception"
import * as isoCrypto from "isomorphic-webcrypto"
import * as hex from "./hex"
import * as num from "./num"


export function randomFloat( min_inc = 0.0, max_exc = 1.0 ) {
	//implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	return Math.random() * ( max_exc - min_inc ) + min_inc
}
export function randomInt( min_inc = 0, max_exc = num.INT32_MAX ) {
	//implementation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	return Math.floor( Math.random() * ( max_exc - min_inc ) ) + min_inc
}
export function randomBool(/** the probability that true will be returned.  default 0.5 (50%) */trueChance = 0.5 ): boolean {
	return Math.random() < trueChance
	//return randomInt(0, 2) === 0;
}


/** randomize order of elements in this array */
export function randomizeArray( myArray: [] ) {
	//from here http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
	// tslint:disable-next-line:one-variable-per-declaration
	let i = myArray.length, j, temp
	if ( i === 0 ) { return }
	while ( ( --i ) > 0 ) {
		j = Math.floor( Math.random() * ( i + 1 ) )
		temp = myArray[ i ]
		myArray[ i ] = myArray[ j ]
		myArray[ j ] = temp
	}
}

export function randomBytes( length: number ) {
	const randomBytes = new Uint8Array( length )
	isoCrypto.getRandomValues( randomBytes )
	return randomBytes
}
/**
*  ex: randomString(20, 'ABCDEFG'); // Returns 'CCBAAGDGBBEGBDBECDCE' which is 20 characters length.
* @param length
* @param chars
*/
export function randomStringCrypto( length: number, chars: string ) {
	if ( chars == null ) {
		throw new exception.XlibException( "Argument 'chars' is undefined" )
	}

	const charsLength = chars.length
	if ( charsLength > 256 ) {
		throw new exception.XlibException( "Argument 'chars' should not have more than 256 characters"
			+ ", otherwise unpredictability will be broken" )
	}
	const bytes = randomBytes( length )
	//const randomBytes = crypto.randomBytes( length )
	const result = new Array( length )

	let cursor = 0
	for ( let i = 0; i < length; i++ ) {
		cursor += bytes[ i ]
		result[ i ] = chars[ cursor % charsLength ]
	}

	return result.join( "" )
}
/**
*  ex: randomAsciiString(20); // Returns 'rmRptK5niTSey7NlDk5y' which is 20 characters length.
* @param length
*/
export function randomAsciiStringCrypto( length: number ) {
	return randomStringCrypto( length,
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" )
}
/**
*  create a random number output as a string, with the specified number of digits.
* @param minDigits
* @param maxDigits set to minDigits if not specified
* @param radix
*/
export function randomIntDigits( digits: number, radix = 10 ) {

	const output: Array<string> = []

	for ( let i = 0; i < digits; i++ ) {
		const num = randomInt( 0, radix )
		output.push( num.toString( radix ) )
	}
	const toReturn = output.join( "" )
	return toReturn

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

	const output: Array<string> = []

	const hexBuffer = hex.from( randomBytes( digits ) )

	for ( let i = 0; i < digits; i++ ) {
		const hex = hexBuffer.substring( i * 2, ( i + 1 ) * 2 )
		const byte = num.parseInt( hex, undefined, 16 )
		const digit = byte % radix

		output.push( digit.toString( radix ) )
	}
	const toReturn = output.join( "" )
	return toReturn
}