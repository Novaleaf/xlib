import * as xlib from "./_main"


const log = new xlib.diagnostics.Logger( __filename )

describe( __filename, () => {

	it( "consts basic", async () => {

		log.assert( xlib.num.INT_MAX === Number.MAX_SAFE_INTEGER, "INT_MAX off" )
		log.assert( xlib.num.INT_MIN === Number.MIN_SAFE_INTEGER, "INT_MIN off" )

	} )



} )

