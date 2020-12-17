import * as xlib from "./_main"


import net = xlib.net;

// import chai from "chai"
// import chaiAsPromised from "chai-as-promised"
// chai.use( chaiAsPromised )
// import { expect } from "chai"


// console.log( "in net tests" )

import pino from "pino"
const logger = pino()

logger.info( "info from pino NET" )

describe( __filename, () => {
	// describe( "ky", () => {
	// 	it( "basic network connectivity roundtrip", async () => {
	// 		const resp = await net.ky.get( "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=" )

	// 		const result = await resp.text()
	// 		// //net.ky.get( "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=" ).text
	// 		// const reader = await resp.body?.getReader().read()
	// 		// if ( reader == null ) {
	// 		// 	throw new Error( "reader null" );
	// 		// }
	// 		// const result = new TextDecoder( "utf-8" ).decode( reader.value )
	// 		expect( result ).toEqual( "hello from the internet" )
	// 	} )
	// } )


	describe( "xlib.net.gaxios", () => {
		it( "basic network connectivity roundtrip", async () => {

			const reqProm = net.gaxios.request<string>( {
				url: "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=",
			} )

			const resp = await reqProm
			const result = resp.data
			if ( result !== "hello from the internet" ) {
				// eslint-disable-next-line no-restricted-globals
				throw Error( "did not match" )
			}
			//expect( result ).toEqual(  )

		} )
	} )

	
	describe( "xlib.net.RemoteHttpEndpoint", () => {
		it( "basic network connectivity roundtrip", async () => {

			const reqProm = net.gaxios.request<string>( {
				url: "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=",
			} )

			const resp = await reqProm
			const result = resp.data
			if ( result !== "hello from the internet" ) {
				// eslint-disable-next-line no-restricted-globals
				throw Error( "did not match" )
			}
			//expect( result ).toEqual(  )

		} )
	} )

} )