/** 
 * @packageDocumentation
 * utilize http consistently across browser and node
 */

//import * as _imports from "./_imports"
// // eslint-disable-next-line @rushstack/typedef-var
// export const _gaxios = _imports.gaxios

//const _gaxios2 = _imports.gaxios


import { gaxios } from "./_imports"
export { gaxios }




// const func = async () => {
// 	return gaxios.request( { url: "" } )
// }



// /** access to 3rd party libraries selected for use by `xlib` */
// export namespace _internal {



// 	/**
// 	 * Seems the best isomorphic candidates are `gaxios` and `ky`.  No bugs found in `gaxios` so that's the choice.
// 	 * <!-- -->
// 	 * 
// 	 * right now, `ky` has a bug where ReadableStreams do not work in NodeJs.
// 	 * For example, you can not call `body.GetReader()`.
// 	 * A bug has been filed and accepted in the `ky` project for this, but if
// 	 * we need an alternatie project, can consider:
// 	 * - https://www.npmjs.com/package/isomorphic-unfetch
// 	 * - https://github.com/lquixada/cross-fetch
// 	 * - https://github.com/googleapis/gaxios
// 	 * - https://github.com/sindresorhus/ky
// 	 * 
// 	 * ideas from this thread:  https://github.com/request/request/issues/3142
// 	 */
// 	export const _README = null


// 	/** see {@link _imports.gaxios} ok */
// 	export const gaxios = _gaxios

// 	/** # TITLE
// 	 * 
// 	 * becakse, see
// 	 * 
// 	 * - this is working?
// 	 * @summary
// 	 *   - ***shmaybe***
// 	 * 
// 	 * @remarks
// 	 becakse, see

// 	 - this is working?

// 		 - ***shmaybe***
// 		*/
// 	export const gaxios2 = _gaxios2


// }




//import Bluebird from "bluebird";
import * as promise from "./promise"
import * as _ from "lodash"
import * as exception from "./exception"
import * as diagnostics from "./diagnostics"
const log = new diagnostics.Logger( __filename )

export type IRemoteHttpEndpointOptions<TRecievePayload = ANY> = IRemoteHttpEndpointOverrideOptions<TRecievePayload> & {
	/** by default, all HTTP requests are made as soon as they are requested.  pass autoscaler options if your endpoint supports autoscaling.
	*
	IMPORTANT NOTE:  The remote endpoint Needs to return either HTTP 429 or 503 errors to represent ```"BACKOFF"``` messages.  all other errors will be treated normally.*/
	autoscalerOptions?: promise.IAutoscalerOptions;
};

export interface IRemoteHttpEndpointOverrideOptions<TRecievePayload = ANY> {

	/** the endpoint URL you will connect to */
	endpoint?: {
		origin?: string;
		path?: string;
	};
	/** if you want to retry failed requests.   from: https://www.npmjs.com/package/bluebird-retry
		* Options are:
	interval initial wait time between attempts in milliseconds (default 1000)

backoff if specified, increase interval by this factor between attempts

max_interval if specified, maximum amount that interval can increase to

timeout total time to wait for the operation to succeed in milliseconds

max_tries maximum number of attempts to try the operation (default 5)

predicate to be used as bluebird's Filtered Catch. func will be retried only if the predicate expectation is met, it will otherwise fail immediately.

throw_original to throw the last thrown error instance rather then a timeout error.
		* default is no retries. */
	retryOptions?: promise.IRetryOptions
	/** optional settings sent with the request.  from: https://www.npmjs.com/package/gaxios
	*/
	requestOptions?: gaxios.GaxiosOptions

	/** inspect the response from the server and decide what to do:
			return  ```ABORT``` to ABORT RETRY (stop immediately with the error passed to reject())
			return ```RETRY``` to retry the request according to retryOptions
			return ```OK``` to stop and succeed with the current server response.
			DEFAULT: by default, if you don't specify your own ```responseInspector``` function, will insert a function that will retry error 500 and above (assuming ```retryOptions``` are set) */
	responseInspector?: (
		/** note: network issues are converted into err.response so you don't need to parse them differently.*/
		result: IGaxiosResult ) => PromiseLike<"RETRY" | "ABORT" | "OK">

}

export interface IGaxiosResult { err?: gaxios.GaxiosError; response?: gaxios.GaxiosResponse }


// 	520: Unknown Error:  any otherwise unhandled network issues will be returned as this
// 	522: Connection Timed Out:  could not connect to the server
// 	523: Origin Is Unreachable, ex:  DNS record not found
// 	524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
/**
*  define a remote http endpoint for reuse in your application
* includes retry logic and exponential backoff.
*/
export class RemoteHttpEndpoint<TSubmitPayload, TRecievePayload>{

	/** autoscaler created if the constructor is passed autoscaler options */
	private _autoscaler?: promise.Autoscaler<
		//TWorkerFunc
		gaxios.GaxiosResponse<TRecievePayload>,
		( finalOptions: IRemoteHttpEndpointOverrideOptions<TRecievePayload>, endpoint: string, protocol: "get" | "post", submitPayload: TSubmitPayload ) => Promise<gaxios.GaxiosResponse<TRecievePayload>>
	//TError
	//	gaxios.GaxiosError
	>;

	private _gaxios: gaxios.Gaxios

	constructor(

		/** default options that will be applied to all requests.  may be overridden by each actual .post() or .get() call */
		public defaultOptions: IRemoteHttpEndpointOptions<TRecievePayload> = {},

	) { //start .ctor()


		const defaults: Partial<IRemoteHttpEndpointOptions<TRecievePayload>> = {
			// preRetryErrorIntercept: ( async ( err: gaxios.GaxiosError<ANY> ) => {
			// 	if ( err.response != null && err.response.status <= 499 ) {
			// 		//console.assert(false, "err");
			// 		return "ABORT"
			// 	}
			// 	return "RETRY"
			// } ),
			// endpoint: { path: "" },
			// retryOptions: {
			// 	throw_original: true,
			// },

			// requestOptions: {
			// 	timeout: 60000,
			// 	headers: {
			// 		/** by default allow server to send a compressed response */
			// 		"Accept-Encoding": "gzip, deflate"
			// 	} as ANY,
			// },
			// responseInspector: ( result ) => {
			// 	if ( result.)

			//  },
			responseInspector: async ( result ) => {
				if ( result.err !== null ) return "RETRY"
				if ( result.response!.status > 499 ) return "RETRY"
				return "OK"
			}
		}

		this.defaultOptions = _.defaultsDeep( {}, defaultOptions, defaults )


		if ( this.defaultOptions.autoscalerOptions != null ) {
			this._autoscaler = new promise.Autoscaler(
				this.defaultOptions.autoscalerOptions,
				this._doRequest_send.bind( this ),
				( err ) => {
					if ( err instanceof gaxios.GaxiosError ) {
						switch ( err?.response?.status ) {
							case 503:
							case 429:
								//notify listeners
								if ( this._onTooBusy.length > 0 ) {
									this._onTooBusy.forEach( ( fcn ) => { fcn( this ) } )
								}
								return "TOO_BUSY"
						}
					}
					return "FAIL"
				} )
		}

		this._gaxios = new gaxios.Gaxios( this.defaultOptions.requestOptions )


	}//end .ctor()


	public _onTooBusy: Array<( endpoint: RemoteHttpEndpoint<TSubmitPayload, TRecievePayload> ) => any> = [];



	public toJson() {

		return { options: this.defaultOptions, autoscaler: this._autoscaler?.toJson() }

	}

	public post(
		/** pass a payload to POST */
		submitPayload: TSubmitPayload,
		/**override any default options if desired */
		overrideOptions?: IRemoteHttpEndpointOverrideOptions,
	) {
		return this._doRequest( "post", submitPayload, overrideOptions )
	}

	public get(
		/** pass a payload to POST */
		//submitPayload: TSubmitPayload,
		/**override any default options if desired */
		overrideOptions?: IRemoteHttpEndpointOverrideOptions,
	) {
		return this._doRequest( "get", undefined as ANY, overrideOptions )
	}


	private async _doRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload: TSubmitPayload,
		/**override defaults */
		overrideOptions: IRemoteHttpEndpointOverrideOptions = {},
	): Promise<gaxios.GaxiosResponse<TRecievePayload>> {


		log.debug( { protocol }, "EzEndpoint._doRequest() called" )

		//copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
		const finalOptions: IRemoteHttpEndpointOverrideOptions = _.defaultsDeep( {}, overrideOptions, this.defaultOptions )


		if ( finalOptions.endpoint!.origin == null || finalOptions.endpoint!.path == null ) {
			//log.error( { endpoint: finalOptions.endpoint }, "can not make endpoint request.  missing required endpoint options.  need both origin and path specified." )
			throw new exception.XlibException( "can not make endpoint request.  missing required endpoint options.  need both origin and path specified.", { details: { endpoint: finalOptions.endpoint } } )
		}


		const endpoint = finalOptions.endpoint!.origin + finalOptions.endpoint!.path

		// if ( protocol === "get" && submitPayload != null ) {
		// 	//throw log.error( { protocol, finalOptions, submitPayload }, "EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints" )
		// 	throw new diag.exception.XlibException( "EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { details: { protocol, finalOptions, submitPayload } } )
		// }

		if ( this._autoscaler == null ) {
			return this._doRequest_send( finalOptions, endpoint, protocol, submitPayload )
		} else {
			return this._autoscaler.submitRequest( finalOptions, endpoint, protocol, submitPayload )
		}
	}


	private async _doRequest_send( finalOptions: IRemoteHttpEndpointOverrideOptions, endpoint: string, protocol: "get" | "post", submitPayload: TSubmitPayload ): Promise<gaxios.GaxiosResponse<TRecievePayload>> {

		const requestOptions: gaxios.GaxiosOptions = {
			...finalOptions.requestOptions,
			url: endpoint,
			method: protocol.toUpperCase() as ANY,
			body: submitPayload
		}

		const result = await promise.retry( finalOptions.retryOptions!, async () => {
			log.debug( "EzEndpoint._doRequest() in promise.retry block" )

			const result: IGaxiosResult = await this._gaxios.request<TRecievePayload>( requestOptions )
				.then( ( response ) => {
					return { response }
				}, ( err ) => {
					return { err }
				} )
			log.debug( "EzEndpoint._doRequest() got valid response" )




			if ( finalOptions.responseInspector != null ) {
				const decision = await finalOptions.responseInspector( result )
				switch ( decision ) {
					case "RETRY":
						return Promise.reject( result )
					case "OK":
						return Promise.resolve( result )
					case "ABORT":
						return Promise.reject( new promise.RetryStopError("ABORT by responseInspector()" ) )
				}
			}
			return result

		} )
		if ( result.err != null ) {
			return Promise.reject( result.err )
		}
		return Promise.resolve( result.response! )
	}


}
