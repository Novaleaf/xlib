global.__xlibInitArgs = {
	logLevel: "DEBUG"
};


import xlib = require( "./_index" );
import _ = xlib.lodash;



describe( __filename + " basic xlib unit tests", () => {





	it( "logger basic console output", async () => {

		const testLogger = xlib.diagnostics.log; //  new diagnostics.Logger( "test logging" );

		testLogger.trace( "traced" );
		testLogger.info( "infoed" );
		testLogger.warn( "warned" );
		testLogger.error( "errored" );
		//testLogger.assert( false, "asserted" );

	} );



	it( "test read xlib.environment.envLevel", () => {
		const log = xlib.diagnostics.log;
		xlib.diagnostics.log.assert( xlib.environment.envLevel != null );
		//log.info( { envLevel: xlib.environment.envLevel } );
	} );


	it( "test log auto-truncation", () => {
		const log = xlib.diagnostics.log;
		log.info( "hi", { some: "data" } );

		let resultArgs = log.info( "this 1000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } );
		log.assert( resultArgs[ 4 ].length < 350 );
		resultArgs = log.warnFull( "this 1000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } );
		log.assert( resultArgs[ 4 ].length > 350 );
	} );

	it( "log overrides test", () => {
		const log = xlib.diagnostics.log;
		try {
			let result = log.info( "should show" );
			log.assert( result != null );
			log.overrideLogLevel( "ERROR" );
			result = log.trace( "should not show" );
			log.assert( result == null );
			result = log.debug( "should not show" );
			log.assert( result == null );
			result = log.info( "should not show" );
			log.assert( result == null );
			result = log.warn( "should not show" );
			log.assert( result == null );
			result = log.error( "should show" );
			log.assert( result != null );
		} finally {
			//reset loglevel
			log.overrideLogLevel( xlib.environment.logLevel );
		}
	} );

	it( "testing basic net.RemoteHttpEndpoint functionality: read from example.com", async () => {

		const log = xlib.diagnostics.log;
		const remoteEndpoint = new xlib.net.RemoteHttpEndpoint<void, string>( {
			endpoint: { origin: "http://example.com" },
			retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
		} );

		let response = await remoteEndpoint.get();

		log.assert( response.status === 200, "invalid status response", response );
		//log.info( `got response`, response );
		log.assert( response.data.indexOf( "Example Domain" ) >= 0, "Example Domain text not found" );

		//log.info( response );

	} );

	it( "testing reflection", () => {
		const log = xlib.diagnostics.log;
		const reflection = xlib.reflection;
		const Type = reflection.Type;
		class MyClass { x = 0; };
		log.assert( reflection.getType( MyClass ) === Type.classCtor );
		log.assert( reflection.getTypeName( MyClass ) === "MyClass" );
		let myInstance = new MyClass();
		log.assert( reflection.getType( myInstance ) === Type.object );
		log.assert( reflection.getTypeName( myInstance ) === "MyClass" );
		log.assert( reflection.getType( reflection.getType ) === Type.function );
		log.assert( reflection.getType( xlib ) === Type.object );
	} );

	it( "testing autoscaler functionality: request from phantomjscloud.com", async () => {

		const log = xlib.diagnostics.log;

		/** POST request data you submit to the server
			* 
			real request data can be more elaborate:  see ```IPageRequest``` in https://phantomjscloud.com/docs/http-api/
			*/
		type IPjscPostData = { url: string, renderType: "png" | "html" | "pdf" | "jpeg" | "plainText", outputAsJson?: boolean };
		/** response data you will get back from the server.
			* 
		real response data is more elaborate:  see ```IUserResponse``` in https://phantomjscloud.com/docs/http-api/
		 */
		type IPjscUserResponse = { content: { name: string, data: string, encoding: string } };

		const apiKey = xlib.environment.getEnvironmentVariable( "phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address" );
		const options: xlib.net.IRemoteHttpEndpointOptions = {
			endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${ apiKey }/` },
			autoscalerOptions: { minParallel: 4, busyGrowDelayMs: 30000, growDelayMs: 5000, idleOrBusyDecreaseMs: 5000 },
		};


		const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint<IPjscPostData, IPjscUserResponse>( options );

		try {
			const httpResponse = await phantomJsCloudEndpoint.post( { url: "https://example.com", renderType: "plainText", outputAsJson: true } );
			log.assert( httpResponse.status === 200 );
			const userResponse = httpResponse.data;
			log.assert( userResponse.content.encoding === "utf8" );
			log.assert( userResponse.content.data.length > 0 );
			log.assert( userResponse.content.data.indexOf( "Example Domain" ) >= 0 );

		} catch ( _err ) {
			if ( xlib.reflection.getTypeName( _err ) === "AxiosError" ) {
				const axiosError: xlib.net.axios.AxiosError = _err;
			}
			log.assert( false, "request failed", _err );
		}

	} );

	it( "test exceptions: DISABLED (causes debugBreak on thrown exceptions when running test)", () => {
		const log = xlib.diagnostics.log;
		class MyException extends xlib.diagnostics.Exception { };

		try {
			try {
				throw new MyException( "first" );
			} catch ( _err ) {
				throw new MyException( "second", { innerError: _err } );
			}
		} catch ( _err ) {
			//log.infoFull( "logging error object", _err );
			//log.infoFull( "logging error object as JSON", xlib.diagnostics.errorToJson( _err ) );

			log.assert( _err instanceof Error );
			log.assert( _err instanceof MyException );
			const err = xlib.diagnostics.toError( _err );
			log.assert( err === _err, "because _err was an instanceOf Error, we should have gotten the same object back, but now strongly typed" );
			log.assert( err.message === "second	innerException: first" ); //we include innerException message in the parent exception message
			log.assert( err.innerError.message === "first" );



		}



	} );

	it( "test lolo", () => {

		const __ = xlib.lolo;
		__.log.info( `the current time is ${ __.utc().toISO() }`, { isDebug: __.isDebug() } )

	} );

	it( "test stopwatch", async () => {
		const __ = xlib.lolo;
		const stopwatch = new xlib.time.Stopwatch( "unit test" );
		__.log.assert( stopwatch.getElapsed().valueOf() === 0 )
		await xlib.promise.bluebird.delay( 200 );
		__.log.assert( stopwatch.getElapsed().valueOf() === 0 )
		stopwatch.start();
		await xlib.promise.bluebird.delay( 2000 );
		let elapsedMs = stopwatch.getElapsed().valueOf()
		__.log.assert( elapsedMs > 0 );
		stopwatch.stop();
		let elapsed = stopwatch.getElapsed();
		await xlib.promise.bluebird.delay( 200 );
		__.log.assert( elapsed.valueOf() === stopwatch.getElapsed().valueOf() );
		__.log.info( "stopwatch is", elapsed.valueOf() );
		__.log.assert( elapsed.valueOf() >= 2000 );
		__.log.assert( elapsed.valueOf() < 2100 );

	} );

	it( " test perf timer", async () => {

		const __ = xlib.lolo;

		/** needs to stay 5 otherwise the assert check at the bottom of the test needs to be changed */
		const loops = 5;
		const loopSleepMs = 3;
		const logIntervalMs = undefined;

		const perfTimer = new xlib.time.PerfTimer( { autoLogIntervalMs: logIntervalMs, autoLogLevel: xlib.environment.LogLevel.WARN } );

		const outsideWatch = perfTimer.start( "outside" );
		for ( let i = 0; i < loops; i++ ) {
			const mainLoopWatch = perfTimer.start( "mainLoop" );
			for ( let i = 0; i < loops; i++ ) {
				const innerA = perfTimer.start( "innerA" );
				for ( let i = 0; i < loops; i++ ) {
					const innerAA = perfTimer.start( "innerAA" );

					await __.bb.delay( loopSleepMs );
					innerAA.stop();
				}
				await __.bb.delay( loopSleepMs );
				innerA.stop();
			}
			for ( let i = 0; i < loops; i++ ) {
				const innerB = perfTimer.start( "innerB" );

				await __.bb.delay( loopSleepMs );
				innerB.stop();
			}
			await __.bb.delay( loopSleepMs );
			mainLoopWatch.stop();
		}
		outsideWatch.stop();
		const { logData, rawData } = await perfTimer.logNowAndClear();
		__.log.assert( Object.keys( logData ).length <= 5, "too many keys.  why?" );
		__.log.assert( Object.keys( logData ).length === 5 && logData[ "outside" ] != null, "perfTimer.logNowAndClear() should have been awaited, giving other fulfilled promises from stopwatch('outside') a chance to finalize and be reported" );
		__.log.assert( logData[ "outside" ].runs === 1 && logData[ "mainLoop" ].runs === 5 && logData[ "innerAA" ].runs === 125 && logData[ "innerA" ].runs === 25 && logData[ "innerB" ].runs === 25 );
		__.log.assert( rawData[ "mainLoop" ].raw.length === 5 );



	} );

	it( "test quartile calculations", () => {


		const __ = xlib.lolo;

		const input = [ 500, 468, 454, 469 ];
		const quantiles = [ 0, 0.25, 0.5, 0.75, 1 ];
		const outputMathJs = xlib.numeric.mathjs.quantileSeq( input, quantiles, false ) as number[];
		const inputDuration = input.map( ( val ) => xlib.time.luxon.Duration.fromMillis( val ) );
		const outputTime = xlib.time.quantile( inputDuration );
		__.log.info( "test quartile calculations mathjs", { input, quantiles, outputMathJs, outputTime } );
		__.log.assert( _.isEqual( outputMathJs, [ 454, 464.5, 468.5, 476.75, 500 ] ) );
		__.log.assert( _.isEqual( outputMathJs, outputTime ) );
		__.log.assert( xlib.numeric.mathjs.median( input ) === outputMathJs[ 2 ], "expect mean to equal 50% quantile value" );



		// 	const rejection = xlib.promise.bluebird.reject( "error string" );
		// 	__.log.assert( rejection.reason instanceof Error );
		// 	__.log.assert( ( rejection.reason() as Error ).message === "error string" );


	} );


	it( "autoscaler test", async () => {

		const __ = xlib.lolo;
		const chanceOfBusy = 0.01;
		const chanceOfFail = 0.01;
		const replyDelay = 30;
		const replyDelaySpread = 30;

		/** how often our backendWorker reports too busy */
		interface ITestAutoscaleOptions { chanceOfBusy: number };
		class TestAutoScaleError extends xlib.diagnostics.Exception<{ shouldRejectBusy: boolean }>{ }

		let testScaler = new xlib.threading.Autoscaler( { busyGrowDelayMs: 100, busyExtraPenalty: 4, idleOrBusyDecreaseMs: 30, growDelayMs: 5, minParallel: 4 },
			async ( chanceOfBusy: number, chanceOfFail: number, replyDelay: number, replyDelaySpread: number ) => {
				//this is the "backendWorker" that is being autoscaled
				let delay = replyDelay + __.num.randomInt( 0, replyDelaySpread );
				await __.bb.delay( replyDelay );
				const isBusy = __.num.randomBool( chanceOfBusy );
				if ( isBusy ) {
					return xlib.promise.bluebird.reject( new TestAutoScaleError( "backend busy", { data: { shouldRejectBusy: true } } ) );
				}
				const isFail = __.num.randomBool( chanceOfFail );
				if ( isFail ) {
					return __.bb.reject( new TestAutoScaleError( "backend failure", { data: { shouldRejectBusy: false } } ) );
				}
				return xlib.promise.bluebird.resolve( "backend success" );
			},
			( ( err: TestAutoScaleError ) => {
				if ( err.data.shouldRejectBusy === true ) {
					return "TOO_BUSY";
				}
				return "FAIL"
			} ) );


		let awaitsArray: Promise<string>[] = [];
		for ( let i = 0; i < 1000; i++ ) {
			const toAwait = testScaler.submitRequest( chanceOfBusy, chanceOfFail, replyDelay, replyDelaySpread );
			toAwait.catch( () => Promise.resolve() );//mark this promise as being "handled"
			awaitsArray.push( toAwait );

		}

		let handle = setInterval( () => {
			__.log.info( "while testing autoscaler, log it's internal state every 1000ms", testScaler.toJson() );
		}, 1000 );

		try {
			//wait for all
			for ( const i in awaitsArray ) {
				// 	try {
				// 		const result = await awaitsArray[ i ];
				// 		__.log.assert( result === "backend success" );
				// 	} catch ( _err ) {
				// 		const err = xlib.diagnostics.toError( _err );
				// 		__.log.assert( err instanceof TestAutoScaleError );
				// 		__.log.assert( err.message === "backend failure" );
				// 	}


				const { toInspect } = await xlib.promise.awaitInspect( awaitsArray[ i ] ).timeout( ( replyDelay + replyDelaySpread ) + 100, "reply took too long, while this could be because of debugging overhead, should investigate" );
				__.log.assert( toInspect.isResolved() );
				if ( toInspect.isFulfilled() ) {
					__.log.assert( toInspect.value() === "backend success" );
				} else {
					const err = xlib.diagnostics.toError( toInspect.reason() );
					__.log.assert( err instanceof TestAutoScaleError );
					__.log.assert( err.message === "backend failure" );
				}
			}
		} finally {
			clearTimeout( handle );
		}



	} );  //end it()

} ); //end describe()


