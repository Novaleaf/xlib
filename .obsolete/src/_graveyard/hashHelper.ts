import * as num from "../core/numeric";
import * as diag from "../core/diagnostics"

export module hashHelper {
	"use strict";
	//var hashPrefix = randomInt().toString(36);
	var hashSuffixCounter = 0;
	var hashPrefix = Date.now().toString( 36 );
	/** returns a string that is unique for this application instance.
	NOT RANDOM!  Also this is not unique across multiple application instances unless they were started up at different times*/
	export function createUniqueCodeInternal(): string {
		hashSuffixCounter = hashSuffixCounter % num.numHelper.INT_MAX;
		return hashPrefix + ( ( hashSuffixCounter++ ) ).toString( 36 );
	}

	/** internal helper. if no hashcode, null is returned */
	export function getHashCode( item: any ): string | null {
		if ( item.__noenum_novaleaf_corelib_collections_hashCode != null ) { return item.__noenum_novaleaf_corelib_collections_hashCode; }
		if ( item.hashCode != null ) {
			return item.hashCode.toString();
		}
		if ( item.getHashCode != null ) {
			return item.getHashCode().toString();
		}
		var type = typeof ( item );
		if ( type === "string" ) { return item; }
		if ( type === "number" ) { return item.toString(); }
		return null;
	}

	/** SNIPPET TAKEN FROM JSHELPER: disallow enumeration of a property
	return true if successful false otherwise (such as if platform doesn't support it)*/
	function disablePropertyEnumeration( obj: any, propertyName: string ): boolean {
		try {
			if ( Object.defineProperty != null ) {
				Object.defineProperty( obj, propertyName, { enumerable: false } );
				return true;
			} else {
				return false;
			}
		} catch ( ex ) {
			//could not set for some reason
			return false;
		}
	}

	/** if hashCode exists, returns it.  otherwise will create one */
	export function tryCreateHashCode( item: any ): string {
		//return existing hashcode, if any
		var hashCode = getHashCode( item );
		if ( hashCode != null ) { return hashCode; }
		//need to create
		if ( item.hashCode != null ) {
			//if object has a hashcode already defined.... use it
			item.__noenum_novaleaf_corelib_collections_hashCode = item.hashCode;
			if ( typeof ( item.__noenum_novaleaf_corelib_collections_hashCode ) === "number" ) {
				item.__noenum_novaleaf_corelib_collections_hashCode = item.__noenum_novaleaf_corelib_collections_hashCode.toString();
			}
			if ( typeof ( item.__noenum_novaleaf_corelib_collections_hashCode ) !== "string" ) {
				throw new diag.XlibException( "hash error:  your value.hashCode property did not return a string" );
			}
		} else if ( item.getHashCode != null ) {
			//if object has a hashcode already defined.... use it
			item.__noenum_novaleaf_corelib_collections_hashCode = item.getHashCode();
			if ( typeof ( item.__noenum_novaleaf_corelib_collections_hashCode ) === "number" ) {
				item.__noenum_novaleaf_corelib_collections_hashCode = item.__noenum_novaleaf_corelib_collections_hashCode.toString();
			}
			if ( typeof ( item.__noenum_novaleaf_corelib_collections_hashCode ) !== "string" ) {
				throw new diag.XlibException( "hash error:  your value.getHashCode() method did not return a string" );
			}
		} else {
			//define our own
			item.__noenum_novaleaf_corelib_collections_hashCode = createUniqueCodeInternal();
		}


		//define our injected hashcode as non-enumerable, doesn't work on ie<9
		disablePropertyEnumeration( item, "__noenum_novaleaf_corelib_collections_hashCode" );
		//return new hashcode
		return item.__noenum_novaleaf_corelib_collections_hashCode;
	}
}

export interface IHashCode {
	getHashCode(): string;
}
