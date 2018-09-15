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

	} );


} );