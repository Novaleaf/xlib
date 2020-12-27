
import * as security from "./security"
import * as exception from "./exception"

import * as uuid from "uuid"
export { uuid }


/** create a deterministic v4 guid by hashing string input.   If you want a random guid, use {@link uuid.v4() }
 * 
 * **Important** defaults to using SHA-256. Output guids won't match if hashAlgo is different."
 */
export async function deterministic( str: string, algoName: security.HASH_ALGO_NAMES = "SHA-256" ) {
	if ( !str || str.length < 1 ) { // no parameter supplied
		//return uuid.v4()          // return node-uuid v4() uuid
		throw new exception.XlibException( "blank/null input.  creating a deterministic guid requires an input string" )
	}
	else { // create a consistent (non-random!) UUID
		//const hash = crypto.createHash( "sha256" ).update( str.toString() ).digest( "hex" ).substring( 0, 36 )
		const hash = await security.hash( str, algoName )
		const chars = hash.substring( 0, 36 ).split( "" )
		chars[ 8 ] = "-"
		chars[ 13 ] = "-"
		chars[ 14 ] = "4"
		chars[ 18 ] = "-"
		chars[ 19 ] = "8"
		chars[ 23 ] = "-"
		const guid = chars.join( "" )
		return guid
	}
}

