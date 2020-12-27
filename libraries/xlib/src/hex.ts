import * as ex from "./exception"

function fromUint8Array( uint8Array: Uint8Array ) {
	const view = new DataView( uint8Array.buffer )
	const bl = view.byteLength, largeLength = bl - ( bl % 4 )
	let hesStr = "", d = 0
	for ( ; d < largeLength; d += 4 ) {
		hesStr += ( "00000000" + view.getUint32( d ).toString( 16 ) ).slice( -8 )
	}
	for ( ; d < bl; d++ ) {
		const c = view.getUint8( d ).toString( 16 )
		hesStr += c.length < 2 ? "0" + c : c
	}
	return hesStr
}

export function toUint8Array( hexStr: string ) {
	if ( hexStr.length % 2 ) throw new ex.XlibException( "invalid hex:" + hexStr )
	const sl = hexStr.length, largeLength = sl - ( sl % 8 )
	const uint8Array = new Uint8Array( sl / 2 )
	const view = new DataView( uint8Array.buffer )
	let s = 0
	for ( ; s < largeLength; s += 8 ) {
		view.setUint32( s / 8, parseInt( hexStr.substr( s, 8 ), 16 ) )
	}
	for ( ; s < sl; s += 2 ) {
		view.setUint8( s / 2, parseInt( hexStr.substr( s, 2 ), 16 ) )
	}
	return uint8Array
}

function fromBuffer( buffer: ArrayLike<number> | ArrayBufferLike ) {
	return fromUint8Array( new Uint8Array( buffer ) )
}

export function toBuffer( hexStr: string ) {
	return toUint8Array( hexStr ).buffer
}

export function from( arrayOrBuffer: Uint8Array | ArrayLike<number> | ArrayBufferLike ) {
	if ( arrayOrBuffer instanceof Uint8Array ) {
		return fromUint8Array( arrayOrBuffer )
	}
	return fromBuffer( arrayOrBuffer )
}


export default {
	from,
	//fromUint8Array,
	toUint8Array,
	//fromBuffer,
	toBuffer
}