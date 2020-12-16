import * as xlib from "./_main"


import promise = xlib.promise
const log = new xlib.diagnostics.Logger( __filename )



describe( __filename, () => {


	describe( "xlib.promise.delay()", () => {
		it( "basic success", async () => {

			const start = Date.now()
			await promise.delay( 201 )
			const end = Date.now()
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
				log.info( { msg: "retrying", tries } )
				tries++
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
					tries++
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


	describe( "xlib.promise.exposeStatus()", () => {
		it( "basic success", async () => {

			const promiseDelay100 = promise.delay( 50 )
			const statusEnabled = promise.exposeStatus( promiseDelay100 )
			const status = statusEnabled.status()
			log.assert( status.isPending === true && status.error == null && status.isSuccess == null && status.result == null, { status } )
			await promise.delay( 50 )
			const newStatus = statusEnabled.status()
			log.assert( newStatus.isPending === false && newStatus.error == null && newStatus.isSuccess === true && newStatus.result == null, { newStatus } )
		} )

		it( "basic fail", async () => {

			const promiseDelayFail = new Promise( ( resolve, reject ) => { setTimeout( () => { reject() }, 50 ) } )
			const statusEnabled = promise.exposeStatus( promiseDelayFail )
			const status = statusEnabled.status()
			log.assert( status.isPending === true && status.error == null && status.isSuccess == null && status.result == null, { status } )
			await promise.delay( 60 )
			const newStatus = statusEnabled.status()
			log.assert( newStatus.isPending === false && newStatus.error == null && newStatus.isSuccess === false && newStatus.result == null, { newStatus } )
		} )

	} )

	describe( "xlib.promise.createMutablePromise()", () => {

		it( "basic success", async () => {

			const mutablePromise = promise.createMutablePromise<string>()
			const status = mutablePromise.status()
			log.assert( status.isPending === true && status.error == null && status.isSuccess == null && status.result == null, { status } )
			mutablePromise.resolve( "OK" )
			const newStatus = mutablePromise.status()
			log.assert( newStatus.isPending === false && newStatus.error == null && newStatus.isSuccess === true && newStatus.result === "OK", { newStatus } )
		} )
		it( "basic fail", async () => {

			const mutablePromise = promise.createMutablePromise<string>()
			const status = mutablePromise.status()
			log.assert( status.isPending === true && status.error == null && status.isSuccess == null && status.result == null, { status } )
			// eslint-disable-next-line no-restricted-globals
			mutablePromise.reject( new Error( "boom" ) )
			const newStatus = mutablePromise.status()
			log.assert( newStatus.isPending === false && newStatus.error != null && newStatus.isSuccess === false && newStatus.result == null && newStatus.error.message === "boom", { newStatus } )
		} )
	} )

} )