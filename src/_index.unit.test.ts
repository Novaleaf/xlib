import xlib = require( "./_index" );



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
		const log = xlib.diagnostics.log;
		xlib.diagnostics.log.assert( xlib.environment.envLevel != null );
		log.info( { envLevel: xlib.environment.envLevel } );
	} );


	it( "logging demo", () => {
		const log = xlib.diagnostics.log;
		log.info( "hi", { some: "data" } );

		log.info( "this 10000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey( 10000, 10 ) } );
		log.warnFull( "this 10000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey( 10000, 10 ) } );
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
		type IPjscPostData = { url: string, renderType: "png" | "html" | "pdf" | "jpeg", outputAsJson?: boolean };
		/** response data you will get back from the server.
			* 
		real response data is more elaborate:  see ```IUserResponse``` in https://phantomjscloud.com/docs/http-api/
		 */
		type IPjscUserResponse = { content: { name: string, data: string, encoding: string } };

		const apiKey = xlib.environment.getEnvironmentVariable( "phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address" );
		const options: xlib.net.IRemoteHttpEndpointOptions = {
			endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${ apiKey }/` },
			autoscalerOptions: { minParallel: 4, backoffDelayMs: 30000, growDelayMs: 5000, decayDelayMs: 5000 },
		};


		const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint<IPjscPostData, IPjscUserResponse>( options );

		try {
			const httpResponse = await phantomJsCloudEndpoint.post( { url: "https://example.com", renderType: "pdf", outputAsJson: true } );
			log.assert( httpResponse.status === 200 );
			const userResponse = httpResponse.data;
			log.assert( userResponse.content.encoding === "base64" );
			log.assert( userResponse.content.data.length > 0 );

		} catch ( _err ) {
			if ( xlib.reflection.getTypeName( _err ) === "AxiosError" ) {
				const axiosError: xlib.net.axios.AxiosError = _err;
			}
			log.assert( false, "request failed", _err );
		}

	} );

} );