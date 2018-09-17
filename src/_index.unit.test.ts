import xlib = require( "./_index" );

const log = xlib.diagnostics.log;


describe( __filename + " basic xlib unit tests", () => {

	// before( async () => {
	//     __xlibInit = {};
	//     await _initialize();
	// } );





	it( "logger basic console output", async () => {

		const testLogger = xlib.diagnostics.log; //  new diagnostics.Logger( "test logging" );

		testLogger.trace( "traced" );
		testLogger.info( "infoed" );
		testLogger.warn( "warned" );
		testLogger.error( "errored" );
		//testLogger.assert( false, "asserted" );

	} );

	// it( "should fail, test log.assert()", () => {
	// 				log.assert( false, "assert condition" );
	// } )


	it( "read env", () => {
		xlib.diagnostics.log.assert( xlib.environment.envLevel != null );
		log.info( { envLevel: xlib.environment.envLevel } );
	} );


	it( "logging demo", () => {
		const log = xlib.diagnostics.log;
		log.info( "hi", { some: "data" } );

		const __ = xlib.lolo;
		log.info( "this 1000 character string gets auto-truncated nicely via __.inspect()", __.inspect( { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } ) );

	} );

	it( "log overrides test", () => {

		log._overrideLogLevel( "ERROR" );
		log.trace( "should not show" );
		log.debug( "should not show" );
		log.info( "should not show" );
		log.warn( "should not show" );
		log.error( "should show" );
		//reset loglevel
		log._overrideLogLevel( xlib.environment.logLevel );
	} );

	it( "testing basic net.RemoteHttpEndpoint functionality: read from example.com", async () => {

		const remoteEndpoint = new xlib.net.RemoteHttpEndpoint<void, string>( {
			endpoint: { origin: "http://example.com" },
			retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
		} );

		let response = await remoteEndpoint.get();


		log.assert( response.status === 200, "invalid status response" );
		log.info( `got response`, xlib.lolo.inspect( response ) );
		log.assert( response.data.indexOf( "Example Domain" ) >= 0, "Example Domain text not found" )

		//log.info( response );

	} )

} );