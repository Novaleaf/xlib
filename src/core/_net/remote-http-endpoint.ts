import * as promise from "../promise";
import bb = promise.bluebird;
import * as _ from "lodash";
import * as __ from "../lolo";
import * as diagnostics from "../diagnostics";
const log = diagnostics.log; // new diagnostics.Logger( __filename );
log.overrideLogLevel( "WARN" );

import * as serialization from "../serialization";
import * as exception from "../exception";
import * as stringHelper from "../stringhelper";
import { Autoscaler, IAutoscalerOptions } from "../threading";
import jsHelper = require( "../jshelper" );

//import compression = require("./compression");

//export import axios = require("axios");
import * as axios from "axios";

export type IRemoteHttpEndpointOptions = IRemoteHttpEndpointOverrideOptions & {
	/** by default, all HTTP requests are made as soon as they are requested.  pass autoscaler options if your endpoint supports autoscaling.
	* 
	IMPORTANT NOTE:  The remote endpoint Needs to return either HTTP 429 or 503 errors to represent ```"BACKOFF"``` messages.  all other errors will be treated normally.*/
	autoscalerOptions?: IAutoscalerOptions
};

export interface IRemoteHttpEndpointOverrideOptions {

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
	retryOptions?: promise.retry.Options;
	/** optional settings sent with the request.  from: https://www.npmjs.com/package/axios
		* @default { 
				timeout: 60000, 
				headers: { 
					"Accept-Encoding": "gzip, deflate" 
				} */
	requestOptions?: axios.AxiosRequestConfig;

	/** allows procedural aborting of retries (if any).
			return  ```ABORT``` to ABORT RETRY (stop immediately with the error passed to reject())
			return ```RETRY``` to retry the request according to retryOptions
			DEFAULT: by default, if you don't specify your own ```preRetryErrorIntercept``` function, will insert a function that will retry error 500 and above (assuming ```retryOptions``` are set) */
	preRetryErrorIntercept?: ( (
		/** note: network issues are converted into err.response so you don't need to parse them differently.*/
		err: axios.AxiosError ) => Promise<"RETRY" | "ABORT"> );

}



/**
*  define a remote http endpoint for reuse in your application
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
	520: Unknown Error:  any otherwise unhandled network issues will be returned as this
	522: Connection Timed Out:  could not connect to the server
	523: Origin Is Unreachable, ex:  DNS record not found
	524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
export class RemoteHttpEndpoint<TSubmitPayload, TRecievePayload>{

	constructor(

		/** default options that will be applied to all requests.  may be overridden by each actual .post() or .get() call */
		public defaultOptions: IRemoteHttpEndpointOptions = {},

	) { //start .ctor()

		let defaults: IRemoteHttpEndpointOptions = {
			preRetryErrorIntercept: ( async ( err ) => {
				if ( err.response != null && err.response.status <= 499 ) {
					//console.assert(false, "err");					
					return "ABORT";
				}
				return "RETRY";
			} ),
			endpoint: { path: "" },
			retryOptions: {
				throw_original: true,
			},
			requestOptions: {
				timeout: 60000,
				headers: {
					/** by default allow server to send a compressed response */
					"Accept-Encoding": "gzip, deflate"
				},
			},
		};

		this.defaultOptions = _.defaultsDeep( {}, defaultOptions, defaults );

		if ( this.defaultOptions.autoscalerOptions != null ) {
			this.autoscaler = new Autoscaler(
				this.defaultOptions.autoscalerOptions,
				this._doRequest_send.bind( this ),
				( err: axios.AxiosError ) => {
					if ( err.response != null ) {
						switch ( err.response.status ) {
							case 503:
							case 429:
								return "TOO_BUSY";
						}
					}
					return "FAIL"
				} );
		}

	}//end .ctor()
	/** autoscaler created if the constructor is passed autoscaler options */
	private autoscaler: Autoscaler<
		//TWorkerFunc
		( finalOptions: IRemoteHttpEndpointOverrideOptions, endpoint: string, protocol: "get" | "post", submitPayload: TSubmitPayload ) => Promise<axios.AxiosResponse<TRecievePayload>>,
		//TResult
		axios.AxiosResponse<TRecievePayload>,
		// //TArgs
		// [ IEndpointOptions, string, "get" | "post", TSubmitPayload ],
		//TError
		axios.AxiosError>;

	public toJson() {
		return this.defaultOptions;
	}

	public post(
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override any default options if desired */
		overrideOptions?: IRemoteHttpEndpointOverrideOptions,
	) {
		return this._doRequest( "post", submitPayload, overrideOptions );
	}

	public get(
		/**override any default options if desired */
		overrideOptions?: IRemoteHttpEndpointOverrideOptions,
	) {
		return this._doRequest( "get", undefined, overrideOptions );
	}


	private async _doRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults */
		overrideOptions: IRemoteHttpEndpointOverrideOptions = {},
	): Promise<axios.AxiosResponse<TRecievePayload>> {

		log.debug( `EzEndpoint._doRequest() called`, { protocol } );

		//copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
		let finalOptions: IRemoteHttpEndpointOverrideOptions = _.defaultsDeep( {}, overrideOptions, this.defaultOptions );

		if ( finalOptions.endpoint.origin == null || finalOptions.endpoint.path == null ) {
			throw log.error( "can not make endpoint request.  missing required endpoint options.  need both origin and path specified.", { endpoint: finalOptions.endpoint } );
		}
		let endpoint = finalOptions.endpoint.origin + finalOptions.endpoint.path;

		if ( protocol === "get" && submitPayload != null ) {
			throw log.error( "EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { protocol, finalOptions, submitPayload } );
		}

		if ( this.autoscaler == null ) {
			return this._doRequest_send( finalOptions, endpoint, protocol, submitPayload );
		} else {
			return this.autoscaler.submitRequest( finalOptions, endpoint, protocol, submitPayload );
		}
	}



	private async _doRequest_send( finalOptions: IRemoteHttpEndpointOverrideOptions, endpoint: string, protocol: "get" | "post", submitPayload: TSubmitPayload ): Promise<axios.AxiosResponse<TRecievePayload>> {

		return bb.try( () => {

			let lastErrorResult: any = null;

			//************
			//retry loop
			return promise.retry<axios.AxiosResponse<TRecievePayload>>( () => {

				//try {

				log.debug( "EzEndpoint._doRequest() in promise.retry block" );


				return bb.try( () => {

					/**
						*  the actual HTTP request we send over the wire.
						*/
					let axiosRequestPromise: axios.AxiosPromise<TRecievePayload>;

					switch ( protocol ) {
						case "post":
							{
								//axios.post(endpoint,null,{})
								axiosRequestPromise = axios.default.post<TRecievePayload>( endpoint, submitPayload, finalOptions.requestOptions );
							}
							break;
						case "get":
							{
								axiosRequestPromise = axios.default.get<TRecievePayload>( endpoint, finalOptions.requestOptions );
							}
							break;

						default:
							{
								throw log.error( `EzEndpoint._doRequest() unknown protocol`, { protocol } );
							}


					}
					return new bb( ( resolve, reject ) => {
						//wrap axios in a REAL promise call, as it's hacky promises really sucks and breaks Bluebird
						axiosRequestPromise.then( ( axiosResponse ) => { resolve( axiosResponse ); } )
							.catch( ( axiosErr ) => {
								reject( axiosErr );
							} );
					} )
						.then( ( result ) => {
							log.debug( "EzEndpoint._doRequest() got valid response" );
							return bb.resolve( result );
						}, ( err: axios.AxiosError ) => {
							log.debug( `EzEndpoint._doRequest() got err`, err.message, finalOptions );


							if ( err.code != null ) {
								log.assert( err.response == null, "expect axios.response to be null on err.code value set" );
								switch ( err.code ) {
									case "ENOTFOUND":
										{
											err.response = {
												status: 523,
												statusText: `Origin is Unreachable: ${ err.code }, ${ err.message } `,
												config: err.config,
												data: undefined as any,
												headers: {},
											};
										}
										break;
									case "ECONNREFUSED":
										{
											err.response = {
												status: 522,
												statusText: `Connection Timed Out: ${ err.code }, ${ err.message } `,
												config: err.config,
												data: undefined as any,
												headers: {},
											};
										}
										break;
									default:
										{
											err.response = {
												status: 520,
												statusText: `Unknown Error: ${ err.code }, ${ err.message } `,
												config: err.config,
												data: undefined as any,
												headers: {},
											};
										}
										break;
								}
							}
							if ( err.response != null ) {
								if ( err.response.status === 0 && err.response.statusText === "" && err.response.data === "" as any ) {
									//log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
									err.response.status = 524;
									err.response.statusText = "A Timeout Occurred: Request Aborted, EzEndpoint.requestOptions.timeout exceeded";
									err.response.data = "Axios->EzEndpointFunction timeout." as any;
								}

							}


							if ( finalOptions.preRetryErrorIntercept != null ) {

								return finalOptions.preRetryErrorIntercept( err )
									.then( ( interceptDecision ) => {
										switch ( interceptDecision ) {
											case "RETRY":
												//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
												lastErrorResult = err;
												return bb.reject( err );
											case "ABORT":
												//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
												let stopError = new promise.retry.StopError( "preRetryIntercept abort" );
												( stopError as any )[ "interceptResult" ] = bb.reject( err );
												return bb.reject( stopError );
										}
									}, ( rejectedErr ) => {
										//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
										let stopError = new promise.retry.StopError( "preRetryIntercept abort" );
										( stopError as any )[ "interceptResult" ] = bb.reject( rejectedErr );
										return bb.reject( stopError );
									} );

							}
							lastErrorResult = err;
							return bb.reject( err );
						} );
				} );

				//} catch (errThrown) {
				//	log.debug("EzEndpoint._doRequest() in root promise.retry block,  got errThrown", errThrown.toString());
				//	throw errThrown;
				//}

			}, finalOptions.retryOptions )
				//***************  finished retry loop
				.catch( ( err: any ) => {
					log.debug( "EzEndpoint._doRequest()  retry catch" );
					if ( err.interceptResult != null ) {
						return err.interceptResult;
					}
					return bb.reject( err );
				} );

		} );
	}



}
