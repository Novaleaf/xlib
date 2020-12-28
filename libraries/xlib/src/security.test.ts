import * as xlib from "./_main"

import security = xlib.sec

const log = new xlib.diag.Logger( __filename )

describe( __filename, () => {

	describe( "xlib.security.hash", () => {
		it( "basic use", async () => {

			const text = "An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth."
			const hash = await security.hash( text )
			//log.info( `hash is ${ hash }` )
			log.assert( hash === "c572bc20b38868fa4b980d9ce982e8ac03bac33f2ac2e889fed25b75ffda0b976b00feae3e51eca478a8dc39b88439cd2bc564bcb41cc8e6552f7d682b84f177", `hash doesn't match expected.  got ${ hash }` )

		} )
	} )


} )

