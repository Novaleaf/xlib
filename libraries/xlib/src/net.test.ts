import * as xlib from "./_main"


import net = xlib.net;

// import chai from "chai"
// import chaiAsPromised from "chai-as-promised"
// chai.use( chaiAsPromised )
// import { expect } from "chai"


// console.log( "in net tests" )


describe( "xlib.net unit tests", () => {
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
	describe( "gaxios", () => {
		it( "basic network connectivity roundtrip", async () => {

			const reqProm = net.gaxios.request<string>( {
				url: "https://httpbin.org/base64/aGVsbG8gZnJvbSB0aGUgaW50ZXJuZXQ=",
			} )

			const resp = await reqProm
			const result = resp.data
			expect( result ).toEqual( "hello from the internet" )

		} )
	} )
} )