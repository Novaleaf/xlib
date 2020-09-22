interface IEnum<T> {
	[ key: string ]: T | string;
	[ nu: number ]: string;
}

/**
 * @remarks
 * 
 * @param enumClass 
 * @param key 
 * @param param2 
 */
export function parseEnum<TEnum extends IEnum<T>, T>( enumClass: TEnum, key: ( keyof TEnum ) | string | number | undefined, { caseSensitive = false } = {} ): TEnum[ keyof TEnum ] | undefined {
	//definition hint (return type) from :https://github.com/Microsoft/TypeScript/issues/18869#issuecomment-333339975
	//IEnum details from: https://github.com/microsoft/TypeScript/issues/30611#issuecomment-479087883

	if ( key == null ) return undefined
	const result = enumClass[ key ]
	if ( typeof result === "number" ) {
		//numbers are only ever values, so just return that
		return result
	}
	if ( typeof key === "number" || !isNaN( Number.parseInt( key as never ) ) ) {
		//ensure this is a proper value found in the enum, then return the value itself
		if ( result != null ) return key as never
		//if numeric key doesn't match, can stop here
		return undefined
	}

	//need to itterate all keys trying to find a match	
	if ( caseSensitive === true ) {
		for ( const k in enumClass ) {
			if ( k.toString() === key ) return enumClass[ k ] as never
		}
	} else {
		const keyInsensitive = key.toString().toLowerCase()
		for ( const k in enumClass ) {
			if ( k.toString().toLowerCase() === keyInsensitive ) {
				if ( typeof k === "number" ) return k
				return enumClass[ k ] as never
			}
		}
	}

	return undefined


}
