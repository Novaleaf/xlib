import * as promise from "../promise";
import bb = promise.bluebird;
import * as _ from "lodash";
import * as __ from "../lolo";
import * as diagnostics from "../diagnostics";
const log = diagnostics.log; // new diagnostics.Logger( __filename );
log._overrideLogLevel( "WARN" );

import * as serialization from "../serialization";
import * as exception from "../exception";
import * as stringHelper from "../stringhelper";

import jsHelper = require( "../jshelper" );

//import compression = require("./compression");

//export import axios = require("axios");
import * as axios from "axios";


export interface IEndpointOptions {

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
			return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
			return a Promise.resolve() to signal that the request should be retried.        
			DEFAULT: by default, if you don't specify your own ```preRetryErrorIntercept``` function, will insert a function that will retry error 500 and above (assuming ```retryOptions``` are set) */
	preRetryErrorIntercept?: ( (
		/** note: network issues are converted into err.response so you don't need to parse them differently.*/
		err: axios.AxiosError ) => Promise<void> );

	/** by default, all HTTP requests are made as soon as they are requested.  pass autoscaler options if your endpoint supports autoscaling.  (the endpoint Needs to return either HTTP 429 or 503 errors) */
	autoscalerOptions?: IAutoscalerOptions
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
		public defaultOptions: IEndpointOptions = {},
	) { //start .ctor()

		let defaults: IEndpointOptions = {
			preRetryErrorIntercept: ( async ( err ) => {
				if ( err.response != null && err.response.status <= 499 ) {
					//console.assert(false, "err");					
					return bb.reject( err );
				} else {
					return bb.resolve();
				}
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
	}//end .ctor()

	public toJson() {
		return this.defaultOptions;
	}

	private async _doRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults */
		overrideOptions: IEndpointOptions = {},
	): Promise<axios.AxiosResponse<TRecievePayload>> {

		log.debug( `EzEndpoint._doRequest() called`, { protocol } );

		//copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
		let finalOptions: IEndpointOptions = _.defaultsDeep( {}, overrideOptions, this.defaultOptions );

		if ( finalOptions.endpoint.origin == null || finalOptions.endpoint.path == null ) {
			throw log.error( "can not make endpoint request.  missing required endpoint options.  need both origin and path specified.", { endpoint: finalOptions.endpoint } );
		}
		let endpoint = finalOptions.endpoint.origin + finalOptions.endpoint.path;

		if ( protocol === "get" && submitPayload != null ) {
			throw log.error( "EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { protocol, finalOptions, submitPayload } );
		}

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
									.then( () => {
										//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
										lastErrorResult = err;
										return bb.reject( err );

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

	public post(
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override any default options if desired */
		overrideOptions?: IEndpointOptions,
	) {
		return this._doRequest( "post", submitPayload, overrideOptions );
	}

	public get(
		/**override any default options if desired */
		overrideOptions?: IEndpointOptions,
	) {
		return this._doRequest( "get", undefined, overrideOptions );
	}


	private async _autoscaleRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults */
		overrideOptions: IEndpointOptions = {},
	): Promise<axios.AxiosResponse<TRecievePayload>> {





		return undefined;

	}

}


export interface IAutoscalerOptions {
	/** minimum parallel requests you allow, regardless of how long the autoscaler has been idle.  should be 1 or more. */
	minParallel: number,
	/** optional.  set a max to number of parallel requests no matter how active the calls */
	maxParallel?: number,
	/** if we get a "BACKOFF" rejection (from the ```failureListener```), how long we should wait before trying to expand again. */
	backoffDelayMs: number,
	/** when we are at max parallel and still able to successfully submit requests (not getting "BACKOFF" errors), how long to delay before increasing our parallel count by 1. */
	growDelayMs: number,
	/** when we are under our max parallel, how long before our max should decrease by 1 */
	decayDelayMs_DONE: number,
	/** optional.  if set and we get a backoff rejection, we will reduce maxActive by this amount */
	backoffPenaltyCount?: number,
};


/** a generic autoscaler.  the only requirement is that the target ```backendWorker``` function  return a promise, 
	* and you specify a ```failureListener``` function that can tell the difference between a failure and a need for backing off.*/
export class Autoscaler<TWorkerFunc extends ( args: TArgs ) => Promise<TResult>, TResult, TArgs, TError extends Error>{

	constructor(
		private backendWorker: TWorkerFunc,
		/** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "BACKOFF" if the request should be retried  */
		private failureListener: ( ( err: TError ) => "FAIL" | "BACKOFF" ),
		private options: IAutoscalerOptions,
	) {


		if ( this.options.minParallel < 1 ) {
			throw new Error( "minParallel needs to be 1 or more" );
		}

		this.metrics = { activeCount: 0, lastBackoff: new Date( 0 ), lastGrow: new Date( 0 ), lastMax: new Date( 0 ), maxActive: 0 };



	}

	private metrics: {
		maxActive: number,
		lastBackoff: Date,
		activeCount: number,
		/** the last time we grew our maxActive count  */
		lastGrow: Date,
		/** the last time we were at our maxActive count */
		lastMax: Date,
	};

	private pendingCalls: { args: TArgs, requesterPromise: promise.IExposedPromise<TResult> }[] = [];

	private activeCalls: { args: TArgs, requesterPromise: promise.IExposedPromise<TResult>, activeMonitorPromise: bb<any> }[] = [];

	public toJson() {
		return { pendingCalls: this.pendingCalls.length, activeCalls: this.activeCalls.length, metrics: this.metrics, options: this.options };
	}

	public async call( args: TArgs ): Promise<TResult> {
		const requesterPromise = promise.CreateExposedPromise<TResult>();
		this.pendingCalls.push( { args, requesterPromise } );
		this._tryCallBackend();
		return requesterPromise;
	}

	private _tryCallBackend() {
		while ( true ) {

			// ! /////////////  do housekeeping ///////////////////

			//check if we have to abort for various reasons
			if ( this.pendingCalls.length === 0 ) {
				//nothing to do
				return;
			}
			if ( this.metrics.activeCount >= this.metrics.maxActive ) {
				//make note that we are at our limit of requests
				this.metrics.lastMax = new Date();
			}
			if ( this.options.maxParallel != null && this.metrics.activeCount >= this.options.maxParallel ) {
				//at our hard limit of parallel requests
				return;
			}
			if ( this.metrics.activeCount >= this.metrics.maxActive //we are at our max...
				&& ( this.metrics.lastGrow.getTime() + this.options.growDelayMs < Date.now() ) //we haven't grew recently...
				&& ( this.metrics.lastBackoff.getTime() + this.options.backoffDelayMs < Date.now() ) //we haven't recieved a "BACKOFF" rejection recently...
			) {
				//time to grow
				this.metrics.maxActive++;
				this.metrics.lastGrow = new Date();
			}
			if ( this.options.decayDelayMs_DONE != null && this.metrics.activeCount < this.metrics.maxActive && this.metrics.lastMax.getTime() + this.options.decayDelayMs_DONE < Date.now() ) {
				//time to reduce our maxActive
				const reduceCount = Math.round( ( Date.now() - this.metrics.lastMax.getTime() ) / this.options.decayDelayMs_DONE );//accumulating decays in case the autoScaler has been idle
				log.assert( reduceCount >= 0 );
				this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - reduceCount );
				//pretend we are at max, to properly delay decaying.
				this.metrics.lastMax = new Date();
			}

			if ( this.metrics.activeCount >= this.metrics.maxActive ) {
				//we are at our maxActive, wait for a free slot
				return;
			}

			// ! ////////// Done with housekeeping and didn't early abort.   time to call the backend  /////////////////

			const { args, requesterPromise } = this.pendingCalls.shift();
			const activeMonitorPromise = bb.resolve( this.backendWorker( args ) )
				.then( ( result ) => {
					requesterPromise.fulfill( result );
				}, ( _err ) => {
					//failure, see what to do about it
					let verdict = this.failureListener( _err );
					switch ( verdict ) {
						case "FAIL":
							requesterPromise.reject( _err );
							break;
						case "BACKOFF":
							//apply special backoffPenaltyCount options, if they exist
							if ( this.options.backoffPenaltyCount != null && this.metrics.lastBackoff.getTime() + this.options.backoffDelayMs < Date.now() ) {
								//this is a "fresh" backoff.
								//we have exceeded backend capacity and been notified with a "BACKOFF" failure.  reduce our maxParallel according to the options.backoffPenaltyCount
								this.metrics.maxActive = Math.max( this.options.minParallel, this.metrics.maxActive - this.options.backoffPenaltyCount );
							}
							//set our backoff time
							this.metrics.lastBackoff = new Date();
							//put request in front to try again
							this.pendingCalls.unshift( { args, requesterPromise } );
							break;
					}
				} )
				.finally( () => {
					//remove this from actives array
					this.metrics.activeCount--;
					_.remove( this.activeCalls, ( activeCall ) => activeCall.requesterPromise === requesterPromise );
					//try another pass
					this._tryCallBackend();
				} );

			this.metrics.activeCount++;
			this.activeCalls.push( { args, requesterPromise, activeMonitorPromise } );
		}

	}



}