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
				//log.info( { msg: "retrying", tries } )
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
						//cause a retry
						return Promise.reject()
					}
					return Promise.resolve()
				} )
			} catch ( err ) {
				log.assert( xlib.reflection.getTypeName( err ) === promise.RetryStopError.name, { msg: `expected to get back typeof ${ promise.RetryStopError.name }`, err } )
				//log.info( err )
			}

			log.assert( tries === 10, { tries } )

		} )
		it( "throw RetryStopError causes abort", async () => {

			let tries = 0

			try {
				await promise.retry( { maxRetries: 9 }, () => {
					//log.info( { msg: "retrying", tries } )
					tries++
					if ( tries <= 5 ) {
						//cause a retry
						return Promise.reject()
					}
					return Promise.reject( new promise.RetryStopError( "custom abort" ) )
				} )
			} catch ( err ) {
				log.assert( xlib.reflection.getTypeName( err ) === promise.RetryStopError.name && err instanceof promise.RetryStopError && err.message === "custom abort", { msg: `expected to get back typeof ${ promise.RetryStopError.name }`, err } )
				//log.info( err )
			}

			log.assert( tries === 6, { tries } )

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
	describe( "xlib.promise.ReadWriteLock", () => {

		it( "basic success", async () => {


			const lock = new promise.ReadWriteLock()
			await lock.writeBegin()
			const tryRead = promise.exposeStatus( lock.readBegin() )
			await promise.delay( 100 )
			log.assert( tryRead.status().isPending === true, "should be pending read" )
			await lock.writeEnd()
			await tryRead
			await promise.delay( 100 )
			lock.readEnd()
			await promise.delay( 100 )
			await lock.writeBegin()
			await lock.writeEnd()


		} )


		it( "basic order of execution", async () => {


			const lock = new promise.ReadWriteLock<string>()

			const w1 = lock.writeBegin()
			const r2 = lock.readBegin()


			//log.info( { msg: "about to await w1", lock } )
			await w1
			//log.info( { msg: "about to await writeEnd(w1)", lock } )
			await lock.writeEnd( "w1" )
			//log.info( { msg: "about to await r2", lock } )

			const val2 = await r2
			log.assert( val2 === "w1", "should match" )
		} )

		it( "simple lock contention", async () => {


			const lock = new promise.ReadWriteLock<string>()

			//log.info( "m1" )
			log.assert( lock.tryWriteBegin().lockAquired === true, { msg: "basic write" } )  //w1
			await promise.delay( 100 )
			const r2 = promise.exposeStatus( lock.readBegin() ) //r2
			await promise.delay( 100 )
			log.assert( r2.status().isPending === true, { msg: "read should be blocked", r2 } )

			//log.info( "m1.1" )
			await promise.delay( 100 )
			//log.info( "m1.2" )
			log.assert( r2.status().isPending === true, { msg: "read should be blocked 2", r2 } )
			await lock.writeEnd( "w1" )
			await promise.delay( 100 )
			log.assert( r2.status().isPending === false && r2.status().result === "w1", { msg: "read should not be blocked 3", r2 } )

			await r2
			lock.readEnd() //r2

			//log.info( { msg: "m2", lock } )


			const w3 = promise.exposeStatus( lock.writeBegin() ) //w3
			const r4 = promise.exposeStatus( lock.readBegin() ) //r4

			//log.info( { msg: "m2.1", lock } )
			// log.assert( r4.status().isPending === true, { msg: "read should be blocked w3", r4 } )
			const w5 = promise.exposeStatus( lock.write( () => "w5 atomic" ) ) //w5 atomic
			const r6 = promise.exposeStatus( lock.readBegin() ) //r6
			// await promise.delay( 100 )
			// log.assert( w5.status().isPending === true, "w5 pending" )

			log.assert( w3.status().isPending === true, "w3 should be active but promise isn't resolved yet" )
			await promise.delay( 100 )
			log.assert( w3.status().isPending === false, "w3 should be active and promise resolved" )
			//log.info( "m3" )
			await w3
			await lock.writeEnd( "w3" )

			const val4 = await r4
			lock.readEnd() //end r4
			log.assert( val4 === "w3", "should have w3 val" )
			//log.info( { msg: "m3.1", lock, val4 } )
			await promise.delay( 100 )
			//log.info( { msg: "m3.2", lock, val4 } )
			//await w5
			//log.info( { msg: "m3.3", lock, val4 } )
			const val6 = await r6
			log.assert( val6 === "w5 atomic", "should have w5 val" )

			//log.info( "m4" )
			// log.assert( w3.status().isPending === false && r4.status().isPending === false && w5.status().isPending === true, "w2 ready  2" )
			// log.assert( r6.status().isPending === true, "r6 pending" )
			// await promise.delay( 100 )
			// //w5 should be finished now

			// log.info( "m5" )
			// await lock.writeEnd( "w3" )
			// log.assert( read.status().isPending === false && w5.status().isPending === false && read.status().result === "w3 atomic", "w3 done" )

			// log.info( "m6" )



			// throw new xlib.diagnostics.exception.XlibException( "boomtest" )



		} )


	} )

	describe( "xlib.promise.Autoscaler", () => {


		it( "basic autoscale test", async () => {

			const chanceOfBusy = 0.01
			const chanceOfFail = 0.01
			const replyDelay = 30
			const replyDelaySpread = 30

			/** how often our backendWorker reports too busy */
			interface ITestAutoscaleOptions { chanceOfBusy: number; }
			class TestAutoScaleError extends xlib.diagnostics.exception.XlibException {
				public shouldRejectBusy: boolean;
				constructor( message: string, options: xlib.diagnostics.exception.IExceptionOptions & { shouldRejectBusy: boolean; } ) {
					super( message, options )
					this.shouldRejectBusy = options.shouldRejectBusy
				}


			}

			const testScaler = new xlib.promise.Autoscaler( { busyGrowDelayMs: 100, busyExtraPenalty: 4, idleOrBusyDecreaseMs: 30, growDelayMs: 5, minParallel: 4 },
				async ( _chanceOfBusy: number, _chanceOfFail: number, _replyDelay: number, _replyDelaySpread: number ) => {
					//this is the "backendWorker" that is being autoscaled
					const delay = _replyDelay + xlib.util.numHelper.randomInt( 0, _replyDelaySpread )
					await xlib.promise.delay( _replyDelay )
					const isBusy = xlib.util.numHelper.randomBool( _chanceOfBusy )
					if ( isBusy ) {
						return Promise.reject( new TestAutoScaleError( "backend busy", { shouldRejectBusy: true } ) )
					}
					const isFail = xlib.util.numHelper.randomBool( _chanceOfFail )
					if ( isFail ) {
						return Promise.reject( new TestAutoScaleError( "backend failure", { shouldRejectBusy: false } ) )
					}
					return Promise.resolve( "backend success" )
				},
				( ( err ) => {
					if ( err instanceof TestAutoScaleError && err.shouldRejectBusy === true ) {
						return "TOO_BUSY"
					}

					return "FAIL"
				} ) )


			const awaitsArray: Array<Promise<string>> = []
			for ( let i = 0; i < 1000; i++ ) {
				const toAwait = testScaler.submitRequest( chanceOfBusy, chanceOfFail, replyDelay, replyDelaySpread )
				toAwait.catch( () => Promise.resolve() )//mark this promise as being "handled"
				awaitsArray.push( toAwait )

			}

			const handle = setInterval( () => {
				log.info( testScaler.toJson(), "while testing autoscaler, log it's internal state every 1000ms" )
			}, 100 )

			try {
				//wait for all

				// await xlib.promise.bluebird.each( awaitsArray, ( toInspect ) => {


				//  } );
				for ( const toInspectPromise of awaitsArray ) {
					// 	try {
					// 		const result = await awaitsArray[ i ];
					// 		__.log.throwIf( result === "backend success" );
					// 	} catch ( _err ) {
					// 		const err = xlib.diagnostics.toError( _err );
					// 		__.log.throwIf( err instanceof TestAutoScaleError );
					// 		__.log.throwIf( err.message === "backend failure" );
					// 	}


					//const { toInspect } = await xlib.promise.exposeStatus( toInspectPromise ).timeout( ( replyDelay + replyDelaySpread ) + 5000, "reply took too long, while this could be because of debugging overhead, should investigate" )


					const timeoutPromise = xlib.promise.timeout( ( replyDelay + replyDelaySpread ) + 5000, toInspectPromise, "reply took too long, while this could be because of debugging overhead, should investigate" )
					try {
						const result = await timeoutPromise
						xlib.diagnostics.throwCheck( result === "backend success" )
					} catch ( err ) {
						if ( err instanceof promise.TimeoutRejectError ) throw err
						xlib.diagnostics.throwCheck( err instanceof TestAutoScaleError && err.message === "backend failure" )
					}

					// const toInspect = await promise.exposeStatus( timeoutPromise )
					// const status = 

					// __.log.throwCheck( toInspect.isResolved() )
					// if ( toInspect.isFulfilled() ) {
					// 	__.log.throwCheck( toInspect.value() === "backend success" )
					// } else {
					// 	const err = xlib.diagnostics.exception.toError( toInspect.reason() )
					// 	xlib.diagnostics.throwCheck( err instanceof TestAutoScaleError )
					// 	xlib.diagnostics.throwCheck( err.message === "backend failure" )
					// }
				}
			} finally {
				clearTimeout( handle )
			}


		}, 10000 )  //end it()



	} )


} )