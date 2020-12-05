import * as xlib from "./_main"


import promise = xlib.promise
const log = new xlib.diagnostics.Logger( __filename )



describe( __filename, () => {


	describe( "xlib.promise.delay()", () => {
		it( "basic success", async () => {

			let start = Date.now()
			await promise.delay( 200 )
			let end = Date.now()
			log.assert( end - start >= 200, `elapsed expected to be >= 200.  got ${ end } - ${ start } = ${ end - start }` )
			log.assert( end - start <= 300, `elapsed expected to be <= 300.  got ${ end } - ${ start } = ${ end - start }` )

		} )

	} )
	describe( "xlib.promise.retry()", () => {
		it( "basic success", async () => {

			await promise.retry( { maxRetries: 1 }, () => {
				return Promise.resolve()
			} )

		} )

		it( "retry till success ", async () => {

			let tries = 0

			await promise.retry( { maxRetries: 10 }, () => {
				//log.info( { msg: "retrying", tries } )
				tries++;
				if ( tries <= 10 ) {
					return Promise.reject()
				}
				return Promise.resolve()
			} )
			log.assert( tries === 11, { tries } )

		} )

		it( "make sure too many retries will fail", async () => {

			let tries = 0

			try {
				await promise.retry( { maxRetries: 9 }, () => {
					//log.info( { msg: "retrying", tries } )
					tries++;
					if ( tries <= 10 ) {
						return Promise.reject()
					}
					return Promise.resolve()
				} )
			} catch ( err ) {
				log.assert( xlib.reflection.getTypeName( err ) === promise.RetryExceededError.name, { msg: `expected to get back typeof ${ promise.RetryExceededError.name }`, err } )
				//log.info( err )
			}

			log.assert( tries === 10, { tries } )

		} )

	} )

} )