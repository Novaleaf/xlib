/* eslint-disable no-bitwise */

import * as exception from "./exception"
import * as num from "./num"
//import numHelper = require( "./_util/numhelper" );
//import diag = require( "./diagnostics" );

/** a Map extended to allow keys to expire a given time after setting. */
export class ExpiresMap<K, V> extends Map<K, V>{

	/** tracks expirations */
	private _handleMap: Map<K, NodeJS.Timeout> = new Map();


	constructor(
		/** how long in Ms before an entity expires */
		public expireMs: Numeric,
		/** optionally allows pre-populating the map. these are still subject to expiration   */
		entries?: Iterable<[ K, V ]>
	) {
		super()
		if ( entries != null ) {
			for ( const [ key, val ] of entries ) {
				this.set( key, val )
			}
		}

	}

	public set( key: K, value: V, customExpireMs?: Numeric ): this {

		customExpireMs = customExpireMs || this.expireMs

		//remove existing handle, if any
		{
			const handle = this._handleMap.get( key )
			if ( handle != null ) {
				clearTimeout( handle )
			}
		}
		super.set( key, value )

		//set new handle
		{
			const handle = setTimeout( () => {


				clearTimeout( handle )
				this._handleMap.delete( key )
				this.delete( key )
			}, customExpireMs.valueOf() )
			this._handleMap.set( key, handle )
		}

		return this
	}

	public delete( key: K ) {
		//remove existing handle, if any
		{
			const handle = this._handleMap.get( key )
			if ( handle != null ) {
				clearTimeout( handle )
			}
			this._handleMap.delete( key )
		}
		return super.delete( key )
	}
}

/** up to 32 true/false values stored in 32bits (a bitmask) */
export class BitFlags {
	/** how many bytes can be stored by instances of this */
	public static MAXFLAGS = 32;
	//public static SIZEOF = 32;
	/** all flags set to true (ctor of numHelper.INT32_MAX) */
	public static ALL = new BitFlags( num.INT32_MAX );
	/** all flags set to false (ctor of 0) */
	public static NONE = new BitFlags( 0 );

	/** internal storage for our bitflags (just a number!) */
	public rawBuffer: number = 0;

	constructor( bitFlagsOrRawBuffer?: BitFlags | number ) {
		if ( bitFlagsOrRawBuffer == null ) {
			this.rawBuffer = 0
		} else if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			this.rawBuffer = rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			this.rawBuffer = flags.rawBuffer
		}
	}

	private static _assertIndexInRange( index: number ) {
		if ( index < BitFlags.MAXFLAGS && index >= 0 ) {
			return
		}
		throw new exception.XlibException( `index out of bounds.  You supplied ${ index } while expected range is 0 to ${ BitFlags.MAXFLAGS - 1 }` )

	}
	/** return the value of a certain flag */
	public getFlag( index: number ): boolean {
		BitFlags._assertIndexInRange( index )

		return ( ( this.rawBuffer & ( 0x01 << index ) ) !== 0 )
	}
	public static getFlag( rawBuffer: number, index: number ): boolean {
		BitFlags._assertIndexInRange( index )
		return ( ( rawBuffer & ( 0x01 << index ) ) !== 0 )
	}
	public setFlag( index: number, value: boolean ) {

		BitFlags._assertIndexInRange( index )

		if ( value ) {
			this.rawBuffer |= ( 0x01 ) << index
		} else {
			this.rawBuffer &= ( ~( 0x01 ) << index )
		}
	}
	public static setFlag( rawBuffer: number, index: number, value: boolean ) {

		BitFlags._assertIndexInRange( index )

		if ( value ) {
			rawBuffer |= ( 0x01 ) << index
		} else {
			rawBuffer &= ( ~( 0x01 ) << index )
		}
	}

	/** flips the value of the flag */
	public flipFlag( index: number ): void {
		BitFlags._assertIndexInRange( index )
		this.rawBuffer ^= ( ( 0x01 << index ) )
	}
	public static flipFlag( rawBuffer: number, index: number ): void {
		BitFlags._assertIndexInRange( index )
		rawBuffer ^= ( ( 0x01 << index ) )
	}

	/** reset everything to false */
	public clear(): void {
		this.rawBuffer = 0
	}

	/** sets any flags that are set in the input */
	public add( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			this.rawBuffer |= rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			this.rawBuffer |= flags.rawBuffer
		}
	}
	public static add( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			rawBuffer |= rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			rawBuffer |= flags.rawBuffer
		}
	}

	/** unsets any set flags that are set in the input */
	public subtract( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			this.rawBuffer &= ~rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			this.rawBuffer &= ~flags.rawBuffer
		}
	}

	/** unsets any set flags that are set in the input */
	public static subtract( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			rawBuffer &= ~rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			rawBuffer &= ~flags.rawBuffer
		}
	}


	/** flips the value of any flags set in the input */
	public flip( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			this.rawBuffer ^= rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			this.rawBuffer ^= flags.rawBuffer
		}
	}

	/** flips the value of any flags set in the input */
	public static flip( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			rawBuffer ^= rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			rawBuffer ^= flags.rawBuffer
		}
	}

	/** returns true if all the set flags in the input are also set in this. */
	public isAllOn( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return ( this.rawBuffer & rawBufferInput ) === rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			return ( this.rawBuffer & flags.rawBuffer ) === flags.rawBuffer
		}
	}


	/** returns true if all the set flags in the input are also set in this. */
	public static isAllOn( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return ( rawBuffer & rawBufferInput ) === rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			return ( rawBuffer & flags.rawBuffer ) === flags.rawBuffer
		}
	}

	/** returns true if any of the set flags in the input are set in this. */
	public isAnyOn( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return ( this.rawBuffer & rawBufferInput ) !== 0
		} else {
			const flags = bitFlagsOrRawBuffer
			return ( this.rawBuffer & flags.rawBuffer ) !== 0
		}
	}

	/** returns true if any of the set flags in the input are set in this. */
	public static isAnyOn( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return ( rawBuffer & rawBufferInput ) !== 0
		} else {
			const flags = bitFlagsOrRawBuffer
			return ( rawBuffer & flags.rawBuffer ) !== 0
		}
	}

	/** returns true if the set and unset flags exactly match */
	public equals( bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return this.rawBuffer === rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			return this.rawBuffer === flags.rawBuffer
		}
	}

	/** returns true if the set and unset flags exactly match */
	public static equals( rawBuffer: number, bitFlagsOrRawBuffer: BitFlags | number ) {
		if ( typeof ( bitFlagsOrRawBuffer ) === "number" ) {
			const rawBufferInput = bitFlagsOrRawBuffer
			return rawBuffer === rawBufferInput
		} else {
			const flags = bitFlagsOrRawBuffer
			return rawBuffer === flags.rawBuffer
		}
	}

	public getHashCode() {
		return this.rawBuffer
	}
}



/**
 *  enumerate over the key+items in a collection, removing each pair as they are enumerated.
 *  return a rejected promise from the callback to abort enumeration.  item is removed from collection immediatly prior to the callback being invoked, so if you wish it to remain in the collection you will need to manually re-add it.
 * @param collection
 * @param callback
 */
export async function forEachAndRemove<TItem>( collection: { [ key: string ]: TItem; }, callback: ( item: TItem, key: string ) => PromiseLike<ANY> ): Promise<void> {

	const keys = Object.keys( collection )
	let nextIndex = 0
	const toReturn = new Promise<void>( ( resolve, reject ) => {
		function _iterationWorker() {
			if ( nextIndex >= keys.length ) {
				resolve()
				return
			}
			const currentIndex = nextIndex
			nextIndex++
			const currentKey = keys[ currentIndex ]
			const currentItem = collection[ currentKey ]
			//remove value to be enumerated
			delete collection[ currentKey ]
			callback( currentItem, currentKey )
				.then( () => {
					_iterationWorker()
				}, ( err ) => {
					reject( err )
					return undefined
				} )
		}
		_iterationWorker()
	} )



	return toReturn
}
