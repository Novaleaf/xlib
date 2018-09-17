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
	// 	log.assert( false, "assert condition", xlib.lolo );
	// 	let x = 0;
	// 	log.assert( x === x );


	// } )


	it( "read env", () => {
		xlib.diagnostics.log.assert( xlib.environment.envLevel != null );
		log.info( { envLevel: xlib.environment.envLevel } );
	} );


	it( "logging demo", () => {
		const log = xlib.diagnostics.log;
		log.info( "hi", { some: "data" } );

		const __ = xlib.lolo;
		log.info( "this 1000 character string gets auto-truncated nicely and automatically.   to output everything, use log.infoFull", { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } );

	} );

	it( "log overrides test", () => {
		try {
			let result = log.info( "should show" );
			log.assert( result != null );
			log._overrideLogLevel( "ERROR" );
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
			log._overrideLogLevel( xlib.environment.logLevel );
		}
	} );

	it( "testing basic net.RemoteHttpEndpoint functionality: read from example.com", async () => {

		const __ = xlib.lolo;
		const remoteEndpoint = new xlib.net.RemoteHttpEndpoint<void, string>( {
			endpoint: { origin: "http://example.com" },
			retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
		} );

		let response = await remoteEndpoint.get();


		log.assert( response.status === 200, "invalid status response", response );
		log.info( `got response`, response );
		log.assert( response.data.indexOf( "Example Domain" ) >= 0, "Example Domain text not found" );

		//log.info( response );

	} );

	// it( "testing autoscaler functionality: request from phantomjscloud.com", async () => {

	// 	const __ = xlib.lolo;

	// 	/** POST request data you submit to the server
	// 		* 
	// 		real request data can be more elaborate:  see ```IPageRequest``` in https://phantomjscloud.com/docs/http-api/
	// 		*/
	// 	type IPjscPostData = { url: string, renderType: "png" | "html" | "pdf" | "jpeg" };
	// 	/** response data you will get back from the server.
	// 		* 
	// 	real response data is more elaborate:  see ```IUserResponse``` in https://phantomjscloud.com/docs/http-api/
	// 	 */
	// 	type IPjscUserResponse = { content: { name: string, data: string, encoding: string } };

	// 	const options: xlib.net.IRemoteHttpEndpointOptions = {
	// 		endpoint: { origin: "https://phantomjscloud.com", path: "/api/browser/v2/a-demo-key-with-low-quota-per-ip-address/" },
	// 		autoscalerOptions: {minParallel:4, backoffDelayMs:30000,growDelayMs:5000, decayDelayMs:5000},
	// 	};
	// 	const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint<IPjscPostData, IPjscUserResponse>( options );

	// 	try {
	// 		const httpResponse = await phantomJsCloudEndpoint.post( { url: "https://example.com", renderType: "pdf" } );
	// 	} catch ( _err ) {
	// 		if ( xlib.reflection.getTypeName( _err ) === "AxiosError" ) {
	// 			const axiosError: xlib.net.axios.AxiosError = _err;
	// 			__.log.error("request failed", __.inspect())
	// 		}
	// 	}

	// } );

} );