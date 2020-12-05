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


	describe( "xlib.promise.exposeStatus()", () => {
		it( "basic success", async () => {

			let promiseDelay100 = promise.delay( 50 )
			let statusEnabled = promise.exposeStatus( promiseDelay100 )
			let status = statusEnabled.status()
			log.assert( status.isResolved === false && status.error == null && status.isSuccess == null && status.result == null, { status } )
			await promise.delay( 50 )
			let newStatus = statusEnabled.status()
			log.assert( newStatus.isResolved === true && newStatus.error == null && newStatus.isSuccess === true && newStatus.result == null, { newStatus } )
		} )

		it( "basic fail", async () => {

			let promiseDelayFail = new Promise( ( resolve, reject ) => { setTimeout( () => { reject() }, 50 ) } )
			let statusEnabled = promise.exposeStatus( promiseDelayFail )
			let status = statusEnabled.status()
			log.assert( status.isResolved === false && status.error == null && status.isSuccess == null && status.result == null, { status } )
			await promise.delay( 60 )
			let newStatus = statusEnabled.status()
			log.assert( newStatus.isResolved === true && newStatus.error == null && newStatus.isSuccess === false && newStatus.result == null, { newStatus } )
		} )

	} )

	describe( "xlib.promise.createMutablePromise()", () => {

		it( "basic success", async () => {

			let mutablePromise = promise.createMutablePromise<string>()
			let status = mutablePromise.status()
			log.assert( status.isResolved === false && status.error == null && status.isSuccess == null && status.result == null, { status } )
			mutablePromise.resolve( "OK" )
			let newStatus = mutablePromise.status()
			log.assert( newStatus.isResolved === true && newStatus.error == null && newStatus.isSuccess == true && newStatus.result == "OK", { newStatus } )
		} )
		it( "basic fail", async () => {

			let mutablePromise = promise.createMutablePromise<string>()
			let status = mutablePromise.status()
			log.assert( status.isResolved === false && status.error == null && status.isSuccess == null && status.result == null, { status } )
			mutablePromise.reject( new Error( "boom" ) )
			let newStatus = mutablePromise.status()
			log.assert( newStatus.isResolved === true && newStatus.error != null && newStatus.isSuccess == false && newStatus.result == null && newStatus.error.message === "boom", { newStatus } )
		} )
	} )

} )