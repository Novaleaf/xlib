

export function copy<T>( array: Array<T>, startIndex: number = 0, endIndex?: number ): Array<T> {
	return Array.prototype.slice.call( array, startIndex, endIndex )
}
export function isArray( it: ANY ) {
	return Object.prototype.toString.call( it ) === "[object Array]"
}
/** append the elements from an array to the end of your targetArray */
export function append<T>( array: Array<T>, toAppend: Array<T> ) {
	// eslint-disable-next-line prefer-spread
	array.push.apply( array, toAppend )
}

/** remove the first occurance of the item */
export function removeFirst<T>( array: Array<T>, toRemove: T ): boolean {
	const index = array.indexOf( toRemove )
	if ( index < 0 ) {
		//throw new ex.CorelibException("not found to remove");
		return false
	}
	array.splice( index, 1 )
	return true
}

/** if exist, remove first occurance,  returns true if successful. */
export function tryRemoveFirst<T>( array: Array<T>, toRemove: T ): boolean {
	const index = array.indexOf( toRemove )
	if ( index < 0 ) { return false }
	array.splice( index, 1 )
	return true
}

/** check if value exists in the array */
export function contains<T>( array: Array<T>, toFind: T ): boolean {
	return array.indexOf( toFind ) >= 0
}

/** returns an array containing the removed elements */
export function removeAt<T>( array: Array<T>, index: number, count = 1 ): Array<T> {
	return array.splice( index, count )
}

/** removes all elements after the given length.  returns the removed items*/
export function removeAfter<T>( array: Array<T>, lengthToKeep: number ): Array<T> {
	return array.splice( lengthToKeep, array.length )
}

/**
 *  split an array into chunks according to maxChunkSize
 * @param array
 * @param maxChunkSize
 */
export function chunk<T>( array: Array<T>, maxChunkSize: number ): Array<Array<T>> {
	const toReturn: Array<Array<T>> = []
	for ( let i = 0; i < array.length; i += maxChunkSize ) {
		toReturn.push( array.slice( i, i + maxChunkSize ) )
	}
	return toReturn
}

/** if the array is longer than given size, truncates it.
	* modifies passed in array
 */
export function maxLen( array: Array<any>, maxLength: number ) {
	if ( array && array.length > maxLength ) {
		array.length = maxLength
	}
}
