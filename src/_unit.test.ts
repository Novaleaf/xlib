global.__xlibInitArgs = {
	logLevel: "DEBUG"
};


import * as xlib from "./_index";
import _ = xlib.lodash;
import log = xlib.diagnostics.log;
import __ = xlib.lolo;


function it1( testFcn: () => void ) {
	const testName = xlib.reflection.getTypeName( testFcn );

	return it( testName, testFcn );
}


/** hack fix for mocha bug, unable to have a timeout for async tests */
function it2( testFcn: () => Promise<any> ) {
	const testName = xlib.reflection.getTypeName( testFcn );
	return it( testName, async function () {
		// tslint:disable-next-line: no-invalid-this
		const timeoutMs = this.timeout();
		// tslint:disable-next-line: no-invalid-this
		return xlib.promise.bluebird.resolve( testFcn.apply( this ) ).timeout( timeoutMs, new xlib.promise.bluebird.TimeoutError( `operation timed out.  Max of ${ timeoutMs }ms exceeded` ) );

	} );

}
// import * as os from "os";
// const loadAvg = ( os.loadavg[ 0 ] / os.cpus.length );

describe( __filename + " basic xlib unit tests", () => {

	// it1( function checkTsLint() {

	// 	log.throwIf( it1.length === 0 ); //expect tslint to complain about treating a function as an object.


	// 	// tslint:disable-next-line: one-variable-per-declaration
	// 	let x = 33, y = 0;
	// 	// tslint:disable-next-line: strict-boolean-expressions
	// 	if ( x ) { //x not bool, this should error
	// 		//derp
	// 		y = 88;
	// 	}
	// 	if ( y > 0 ) {
	// 		log.info( "This test verifies compile time syntax checks, and always passes at runtime." );
	// 	}


	// 	// tslint:disable-next-line: no-inferrable-types
	// 	const testStr: string = "meow";  //tslint complain

	// } );

	it1( function parameterReassignment() {

		//sanity check to verify assumptions regarding parameter property reassignment  (setting "public" on ctor parameters)

		class TestParameterReassignment {
			constructor( public options: { arg1: string; arg2: string; } ) {

				options = { ...options, arg1: "ctorSet" };
				this.options = options;


				log.throwIf( options.arg1 === "ctorSet" && this.options.arg1 === "ctorSet", "ctor did not set options.arg1 properly", { optionsThis: this.options, optionsPassed: options } );
				log.throwIf( options === this.options, "options references are not equal.", { optionsThis: this.options, optionsPassed: options } );

				log.throwIf( options.arg2 === "callerSet", "options did not get passed properly", { optionsThis: this.options, optionsPassed: options } );
				log.throwIf( this.options.arg2 === "callerSet", "this.options did not get passed properly", { optionsThis: this.options, optionsPassed: options } );

			}
		}

		let testObj = new TestParameterReassignment( { arg1: "callerSet", arg2: "callerSet" } );

	} );

	it1( function testThrowIfFunctionality() {

		let gotTooFar = false;
		try {
			log.throwIf( false, "should throw an error that will be caught by the test" );
			gotTooFar = true;
		} catch ( _err ) {

		}
		if ( gotTooFar === true ) {
			throw new Error( "got too far.  log.throwIf() is not working properly." );
		}
	} );

	it( "test assert functionality", function testAssertFunctionality() {

		let gotTooFar = false;
		try {
			log.assert( false, "should throw an error that will be caught by the test" );
			gotTooFar = true;
		} catch ( _err ) {

		}
		if ( gotTooFar === true ) {
			throw new Error( "got too far.  log.throwIf() is not working properly." );
		}
	} );

	it2( async function loggerBasicConsoleOutput() {

		const testLogger = xlib.diagnostics.log; //  new diagnostics.Logger( "test logging" );

		testLogger.trace( "traced" );
		testLogger.info( "infoed" );
		testLogger.warn( "warned" );
		testLogger.error( "errored" );
		//testLogger.assert( false, "asserted" );

	} );


	it1( function testReadXlibEnvironmentEnvLevel() {
		xlib.diagnostics.log.throwIf( xlib.environment.envLevel != null );
		//log.info( { envLevel: xlib.environment.envLevel } );
	} );


	it1( function testLogAutoTruncation() {
		log.info( "hi", { some: "data" } );

		let resultArgs = log.info( "this 1000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } );
		log.throwIf( resultArgs[ 4 ].length < 350 );
		resultArgs = log.warnFull( "this 1000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } );
		log.throwIf( resultArgs[ 4 ].length > 350 );
	} );

	it1( function logOverridesTest() {

		try {
			let result = log.info( "should show" );
			log.throwIf( result != null );
			log.overrideLogLevel( "ERROR" );
			result = log.trace( "should not show" );
			log.throwIf( result == null );
			result = log.debug( "should not show" );
			log.throwIf( result == null );
			result = log.info( "should not show" );
			log.throwIf( result == null );
			result = log.warn( "should not show" );
			log.throwIf( result == null );
			result = log.error( "should show" );
			log.throwIf( result != null );
		} finally {
			//reset loglevel
			log.overrideLogLevel( xlib.environment.logLevel );
		}
	} );

	it2( async function testingBasicNetRemoteHttpEndpointFunctionalityReadFromExampleCom() {


		const remoteEndpoint = new xlib.net.RemoteHttpEndpoint<void, string>( {
			endpoint: { origin: "http://example.com" },
			retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
		} );

		let response = await remoteEndpoint.get();

		log.throwIf( response.status === 200, "invalid status response", response );
		//log.info( `got response`, response );
		log.throwIf( response.data.indexOf( "Example Domain" ) >= 0, "Example Domain text not found" );

		//log.info( response );

	} );

	it1( function testingReflection() {

		const reflection = xlib.reflection;
		const Type = reflection.Type;
		class MyClass { x = 0; }
		log.throwIf( reflection.getType( MyClass ) === Type.classCtor );
		log.throwIf( reflection.getTypeName( MyClass ) === "MyClass" );
		let myInstance = new MyClass();
		log.throwIf( reflection.getType( myInstance ) === Type.object );
		log.throwIf( reflection.getTypeName( myInstance ) === "MyClass" );
		log.throwIf( reflection.getType( reflection.getType ) === Type.function );
		log.throwIf( reflection.getType( xlib ) === Type.object );
	} );

	it2( async function testingAutoscalerFunctionalityRequestFromPhantomjscloudCom() {


		/** POST request data you submit to the server
			*
			real request data can be more elaborate:  see ```IPageRequest``` in https://phantomjscloud.com/docs/http-api/
			*/
		type IPjscPostData = { url: string; renderType: "png" | "html" | "pdf" | "jpeg" | "plainText"; outputAsJson?: boolean; };
		/** response data you will get back from the server.
			*
		real response data is more elaborate:  see ```IUserResponse``` in https://phantomjscloud.com/docs/http-api/
		 */
		type IPjscUserResponse = { content: { name: string; data: string; encoding: string; }; };

		const apiKey = xlib.environment.getEnvironmentVariable( "phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address" );
		const options: xlib.net.IRemoteHttpEndpointOptions = {
			endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${ apiKey }/` },
			autoscalerOptions: { minParallel: 4, busyGrowDelayMs: 30000, growDelayMs: 5000, idleOrBusyDecreaseMs: 5000 },
		};


		const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint<IPjscPostData, IPjscUserResponse>( options );

		try {
			const httpResponse = await phantomJsCloudEndpoint.post( { url: "https://example.com", renderType: "plainText", outputAsJson: true } );
			log.throwIf( httpResponse.status === 200 );
			const userResponse = httpResponse.data;
			log.throwIf( userResponse.content.encoding === "utf8" );
			log.throwIf( userResponse.content.data.length > 0 );
			log.throwIf( userResponse.content.data.indexOf( "Example Domain" ) >= 0 );

		} catch ( _err ) {
			if ( xlib.reflection.getTypeName( _err ) === "AxiosError" ) {
				const axiosError = _err as xlib.net.axios.AxiosError;
			}
			log.throwIf( false, "request failed", _err );
		}

	} ).timeout( 5000 );

	it1( function testExceptions() { //causes debugBreak on thrown exceptions when running test

		class MyException extends xlib.diagnostics.Exception {
			public someVal = 22;
		}

		try {
			try {
				throw new MyException( "first" );
			} catch ( _err ) {
				throw new MyException( "second", { innerError: __.diag.toError( _err ) } );
			}
		} catch ( _err ) {
			//log.infoFull( "logging error object", _err );
			//log.infoFull( "logging error object as JSON", xlib.diagnostics.errorToJson( _err ) );

			log.throwIf( _err instanceof Error );
			log.throwIf( _err instanceof MyException );
			const err = xlib.diagnostics.toError( _err );
			log.throwIf( err === _err, "because _err was an instanceOf Error, we should have gotten the same object back, but now strongly typed" );
			log.throwIf( err.message === "second	innerException: first" ); //we include innerException message in the parent exception message
			log.throwIf( err.innerError != null && err.innerError.message === "first" );

			const errCast = _err as MyException;
			const asJson1 = errCast.toJson();
			const asJson2 = xlib.diagnostics.errorToJson<MyException>( _err as MyException );

			log.throwIf( asJson1.someVal === 22 );
			log.throwIf( asJson2.someVal === 22 );
			log.throwIf( _.isEqual( asJson2, asJson1 ), "json vals should be equal" );
			log.info( "testExceptions", asJson1 );
		}


	} );

	it1( function testUrlValidation() {

		let urlVal = new xlib.validation.UrlValidator( "http://www.example.com:881" );
		log.throwIf( urlVal.isValid === true, "basic url should be valid", urlVal );
		urlVal = new xlib.validation.UrlValidator( "data:text/html,<script>alert('hi');</script>" );
		log.throwIf( urlVal.isValid === true, "data url should be valid", urlVal );
		urlVal = new xlib.validation.UrlValidator( "http://localhost:881" );
		log.throwIf( urlVal.isValid === false, "local url should be invalid", urlVal );
		urlVal = new xlib.validation.UrlValidator( "http://localhost:881", { allowLocalhost: true } );
		log.throwIf( urlVal.isValid === true, "local url should be valid", urlVal );


	} );

	it1( function testLolo() {

		__.log.info( `the current time is ${ __.utc().toISO() }`, { isDebug: __.isDebug() } );

	} );

	it2( async function testStopwatch() {
		const stopwatch = new xlib.time.Stopwatch( "unit test" );
		__.log.throwIf( stopwatch.getElapsed().valueOf() === 0 );
		await xlib.promise.bluebird.delay( 200 );
		__.log.throwIf( stopwatch.getElapsed().valueOf() === 0 );
		stopwatch.start();
		await xlib.promise.bluebird.delay( 2000 );
		let elapsedMs = stopwatch.getElapsed().valueOf();
		__.log.throwIf( elapsedMs > 0 );
		stopwatch.stop();
		let elapsed = stopwatch.getElapsed();
		await xlib.promise.bluebird.delay( 200 );
		__.log.throwIf( elapsed.valueOf() === stopwatch.getElapsed().valueOf() );
		__.log.info( "stopwatch is", elapsed.valueOf() );
		__.log.throwIf( elapsed.valueOf() >= 2000 );
		__.log.throwIf( elapsed.valueOf() < 2100 );

		//restarting
		stopwatch.start();
		__.log.throwIf( __.num.aboutEqual( stopwatch.valueOf(), 0, 100 ) );
		__.log.throwIf( elapsedMs > stopwatch.valueOf() );
		__.log.throwIf( stopwatch.isPaused === false );
		await __.bb.delay( 10 );
		elapsedMs = stopwatch.valueOf();
		log.info( "restarted delay 10ms", stopwatch.toJson() );
		stopwatch.pause();
		log.info( "restarted aprox pause", stopwatch.toJson() );
		__.log.throwIf( stopwatch.isPaused );
		await __.bb.delay( 200 );
		log.info( "restarted delay 200ms", stopwatch.toJson() );

		log.throwIf( __.num.aboutEqual( stopwatch.valueOf(), elapsedMs, 0.1, 100 ) );


		elapsedMs = stopwatch.valueOf();
		log.throwIf( elapsedMs === stopwatch.valueOf() );
		stopwatch.unpause();
		log.info( "unpause", stopwatch.toJson() );

		__.log.throwIf( stopwatch.isPaused === false );
		await __.bb.delay( 1 );
		log.info( "delay 1", stopwatch.toJson() );
		stopwatch.stop();
		log.info( "stop", stopwatch.toJson() );
		log.throwIf( stopwatch.valueOf() > elapsedMs );

	} ).timeout( 3200 );


	it2( async function testPerfTimer() {


		/** needs to stay 5 otherwise the assert check at the bottom of the test needs to be changed */
		const loops = 5;
		const loopSleepMs = 3;
		const logIntervalMs: number = undefined;

		const perfTimer = new xlib.time.PerfTimer( { autoLogIntervalMs: logIntervalMs, autoLogLevel: xlib.environment.LogLevel.WARN } );

		const outsideWatch = perfTimer.start( "outside" );
		for ( let i = 0; i < loops; i++ ) {
			const mainLoopWatch = perfTimer.start( "mainLoop" );
			for ( let j = 0; j < loops; j++ ) {
				const innerA = perfTimer.start( "innerA" );
				for ( let k = 0; k < loops; k++ ) {
					const innerAA = perfTimer.start( "innerAA" );

					await __.bb.delay( loopSleepMs );
					innerAA.stop();
				}
				await __.bb.delay( loopSleepMs );
				innerA.stop();
			}
			for ( let j = 0; j < loops; j++ ) {
				const innerB = perfTimer.start( "innerB" );

				await __.bb.delay( loopSleepMs );
				innerB.stop();
			}
			await __.bb.delay( loopSleepMs );
			mainLoopWatch.stop();
		}
		outsideWatch.stop();
		const { logData, rawData } = await perfTimer.logNowAndClear();
		__.log.throwIf( Object.keys( logData ).length <= 5, "too many keys.  why?" );
		__.log.throwIf( Object.keys( logData ).length === 5 && logData[ "outside" ] != null, "perfTimer.logNowAndClear() should have been awaited, giving other fulfilled promises from stopwatch('outside') a chance to finalize and be reported" );
		__.log.throwIf( logData[ "outside" ].runs === 1 && logData[ "mainLoop" ].runs === 5 && logData[ "innerAA" ].runs === 125 && logData[ "innerA" ].runs === 25 && logData[ "innerB" ].runs === 25 );
		__.log.throwIf( rawData[ "mainLoop" ].raw.length === 5 );


	} );

	it1( function testQuartileCalculations() {


		const input = [ 500, 468, 454, 469 ];
		const quantiles = [ 0, 0.25, 0.5, 0.75, 1 ];
		const outputMathJs = xlib.numeric.mathjs.quantileSeq( input, quantiles, false ) as Array<number>;
		const inputDuration = input.map( ( val ) => xlib.time.luxon.Duration.fromMillis( val ) );
		const outputTime = xlib.time.quantile( inputDuration );
		__.log.info( "test quartile calculations mathjs", { input, quantiles, outputMathJs, outputTime } );
		__.log.throwIf( _.isEqual( outputMathJs, [ 454, 464.5, 468.5, 476.75, 500 ] ) );
		__.log.throwIf( _.isEqual( outputMathJs, outputTime ) );
		__.log.throwIf( xlib.numeric.mathjs.median( input ) === outputMathJs[ 2 ], "expect mean to equal 50% quantile value" );


		// 	const rejection = xlib.promise.bluebird.reject( "error string" );
		// 	__.log.throwIf( rejection.reason instanceof Error );
		// 	__.log.throwIf( ( rejection.reason() as Error ).message === "error string" );


	} );


	it2( async function autoscalerTest() {

		const chanceOfBusy = 0.01;
		const chanceOfFail = 0.01;
		const replyDelay = 30;
		const replyDelaySpread = 30;

		/** how often our backendWorker reports too busy */
		interface ITestAutoscaleOptions { chanceOfBusy: number; }
		class TestAutoScaleError extends xlib.diagnostics.Exception<{ shouldRejectBusy: boolean; }>{ }

		let testScaler = new xlib.threading.Autoscaler( { busyGrowDelayMs: 100, busyExtraPenalty: 4, idleOrBusyDecreaseMs: 30, growDelayMs: 5, minParallel: 4 },
			async ( _chanceOfBusy: number, _chanceOfFail: number, _replyDelay: number, _replyDelaySpread: number ) => {
				//this is the "backendWorker" that is being autoscaled
				let delay = _replyDelay + __.num.randomInt( 0, _replyDelaySpread );
				await __.bb.delay( _replyDelay );
				const isBusy = __.num.randomBool( _chanceOfBusy );
				if ( isBusy ) {
					return xlib.promise.bluebird.reject( new TestAutoScaleError( "backend busy", { data: { shouldRejectBusy: true } } ) );
				}
				const isFail = __.num.randomBool( _chanceOfFail );
				if ( isFail ) {
					return __.bb.reject( new TestAutoScaleError( "backend failure", { data: { shouldRejectBusy: false } } ) );
				}
				return xlib.promise.bluebird.resolve( "backend success" );
			},
			( ( err: TestAutoScaleError ) => {
				if ( err.data != null && err.data.shouldRejectBusy === true ) {
					return "TOO_BUSY";
				}

				return "FAIL";
			} ) );


		let awaitsArray: Array<Promise<string>> = [];
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


				const { toInspect } = await xlib.promise.awaitInspect( toInspectPromise ).timeout( ( replyDelay + replyDelaySpread ) + 300, "reply took too long, while this could be because of debugging overhead, should investigate" );
				__.log.throwIf( toInspect.isResolved() );
				if ( toInspect.isFulfilled() ) {
					__.log.throwIf( toInspect.value() === "backend success" );
				} else {
					const err = xlib.diagnostics.toError( toInspect.reason() );
					__.log.throwIf( err instanceof TestAutoScaleError );
					__.log.throwIf( err.message === "backend failure" );
				}
			}
		} finally {
			clearTimeout( handle );
		}


	} ).timeout( 10000 );  //end it()

} ); //end describe()

