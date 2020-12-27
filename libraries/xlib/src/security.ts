
import * as crypto from "isomorphic-webcrypto"
export { crypto }

import * as hex from "./hex"


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

/** supported hash algo names. */
export type HASH_ALGO_NAMES = "SHA-256" | "SHA-384" | "SHA-512"