"use strict";


import * as promise from "./promise";
import bb = promise.bluebird;
import * as _ from "lodash";

import * as diagnostics from "./diagnostics";
const log = diagnostics.log; // new diagnostics.Logger( __filename );
log._overrideLogLevel( "WARN" );

import * as serialization from "./serialization";
import * as exception from "./exception";
import * as stringHelper from "./stringhelper";

import jsHelper = require( "./jshelper" );

//import compression = require("./compression");

//export import axios = require("axios");
import * as axios from "axios";
export { axios };

// /** the axios httpClient library:  https://github.com/mzabriskie/axios */
// //export import axios = require("axios");
// //import * as axios from "axios";
// //export { axios };

// /** definition of axios */
// export import _axiosDTs = require( "../definitions/axios-d" );

// /**
//  * a low-level, but promise based http(s) library.
//  *
//  * **IMPORTANT**: recomend you DO NOT use this directly, as it does not provide retry logic.
//  * instead, use the ``EzEndpoint`` we offer instead.
//  * If you do use axios directly, be aware that though it returns something that appears to be a promise, it is NOT BLUEBIRD COMPATABLE for error handling, and so you will want to wrap it in a 'new Promise((resolve,reject)=>{ axios.... })' block.
//  */
// export let axios: _axiosDTs.AxiosStatic = require( "axios" );


// function _axiosPost( ...args: any[] ) {

// 	return new bb( ( resolve, reject ) => {
// 		jsHelper.apply( axios.post, axios, args )
// 			.then( ( response ) => {
// 				resolve( response );
// 			} )
// 			.catch( ( err ) => {
// 				reject( err );
// 			} );
// 	} );

// }
// /**
//  *  wrapper over axios.post() so that it conforms to Bluebird Promise specifications
//  */
// export const axiosPost: typeof axios.post = _axiosPost as any;

export interface IHttpEndpointConfig {

	/** the endpoint URL you will connect to */
	endpoint?: {
		/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
		origin?: string;
		/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
		path?: string;
	};
	/** if you want to retry failed requests.
		* default is no retries. */
	retryOptions?: promise.retry.Options;
	/** optional settings sent with the request.
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
		err: axios.AxiosError ) => Promise<void> )
}


// // export type IEzEndpointRequestOptions<TRecievePayload> =  _axiosDTs.AxiosXHRConfigBase<TRecievePayload> & {
// // 	/** set to true and EzEndpoint will gzip compress the payload of POST requests.  in doing so we set the 'Content-Encoding' and 'Content-Length' headers properly for you.  */
// // 	//ezGzipPostPayload?: boolean;
// // };

export interface IEzEndpoint_EndpointOptions {
	/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
	origin?: string,
	/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
	path?: string,
}
/**
*  a helper for constructing reusable endpoint functions
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
	520: Unknown Error:  any otherwise unhandled network issues will be returned as this
	522: Connection Timed Out:  could not connect to the server
	523: Origin Is Unreachable, ex:  DNS record not found
	524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
export class HttpEndpoint<TSubmitPayload, TRecievePayload>{

	constructor(


		/** default endpoint (domain+path) to connect to.  this can be overridden in the actual .post() or .get() method call*/
		public endpointOptions: IEzEndpoint_EndpointOptions,
		/** default is no retries. */
		public retryOptions: promise.retry.Options = {},//_BluebirdRetryInternals.IOptions = {},
		/** default is:  { 
			timeout: 60000, 
			headers: { 
				"Accept-Encoding": "gzip, deflate" 
			} */
		public requestOptions: axios.AxiosRequestConfig = {},
		/** allows aborting retries (if any).
		return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
		return a Promise.resolve() to signal that the request should be retried.        
		DEFAULT:  by default we will retry error 500 and above. */
		public preRetryErrorIntercept?: ( (
			/** note: network issues are converted into err.response so you don't need to parse them differently.*/
			err: axios.AxiosError ) => Promise<void> )
	) { //start .ctor()

		if ( preRetryErrorIntercept == null ) {
			preRetryErrorIntercept = async ( err ) => {
				if ( err.response != null && err.response.status <= 499 ) {
					//console.assert(false, "err");					
					return bb.reject( err );
				} else {
					return bb.resolve();
				}
			};
		}
		this.requestOptions = _.defaultsDeep( {}, requestOptions, {
			timeout: 60000,
			headers: {
				/** by default allow server to send a compressed response */
				"Accept-Encoding": "gzip, deflate"
			},
		} );




		//const defaultRetryOptions: promise.retry.Options = { timeout: 20000, interval: 100, backoff: 2, max_interval: 5000 };
		// const defaultRequestOptions: IEzEndpointRequestOptions<TRecievePayload> = {
		// 	timeout: 15000,
		// 	headers: {
		// 		/** by default allow server to send a compressed response */
		// 		"Accept-Encoding": "gzip, deflate"
		// 	}
		// };
		// this.retryOptions = { ...defaultRetryOptions, ...retryOptions };
		// this.requestOptions = { ...defaultRequestOptions, ...requestOptions };
		// this.requestOptions = _.defaultsDeep( {}, requestOptions, defaultRequestOptions );
		// this.retryOptions = _.defaultsDeep( {}, retryOptions, defaultRetryOptions );

	}//end .ctor()

	public toJson() {
		return { endpointOptions: this.endpointOptions, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
	}

	private async _doRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults, pass undefined to skip */
		overrideRequestOptions: axios.AxiosRequestConfig = {},
		/**override defaults, pass undefined to skip */
		overrideRetryOptions: promise.retry.Options = {},
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions: IEzEndpoint_EndpointOptions = {}
	): Promise<axios.AxiosResponse<TRecievePayload>> {

		log.debug( `EzEndpoint._doRequest() called`, { protocol } );


		//copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
		let finalEndpointOptions: IEzEndpoint_EndpointOptions = _.defaultsDeep( {}, overrideEndpointOptions, this.endpointOptions );
		let finalRequestOptions: axios.AxiosRequestConfig = _.defaultsDeep( {}, overrideRequestOptions, this.requestOptions );
		let finalRetryOptions: promise.retry.Options = _.defaultsDeep( {}, overrideRetryOptions, this.retryOptions );

		if ( finalEndpointOptions.origin == null || finalEndpointOptions.path == null ) {
			throw log.error( "can not make endpoint request.  missing required endpointOptions", { finalEndpointOptions } );
		}
		let endpoint = finalEndpointOptions.origin + finalEndpointOptions.path;

		if ( protocol === "get" && submitPayload != null ) {
			throw log.error( "EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { finalEndpointOptions, submitPayload } );
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
								axiosRequestPromise = axios.default.post<TRecievePayload>( endpoint, submitPayload, finalRequestOptions );
							}
							break;
						case "get":
							{
								axiosRequestPromise = axios.default.get<TRecievePayload>( endpoint, finalRequestOptions );
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
							log.debug( `EzEndpoint._doRequest() got err`, err.message, this.endpointOptions );


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


							if ( this.preRetryErrorIntercept != null ) {

								return this.preRetryErrorIntercept( err )
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

			}, finalRetryOptions )
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
		/**override defaults, pass undefined to skip */
		overrideRequestOptions?: axios.AxiosRequestConfig,
		/**override defaults, pass undefined to skip */
		overrideRetryOptions?: promise.retry.Options,
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions?: IEzEndpoint_EndpointOptions
	) {
		return this._doRequest( "post", submitPayload, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions );
	}

	public get(
		/**override defaults, pass undefined to skip */
		overrideRequestOptions?: axios.AxiosRequestConfig,
		/**override defaults, pass undefined to skip */
		overrideRetryOptions?: promise.retry.Options,
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions?: IEzEndpoint_EndpointOptions
	) {
		return this._doRequest( "get", undefined, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions );
	}


}


//module _test {

//	describe(__filename, () => {

//		describe("EzEndpoint", () => {

//			describe("success cases", () => {

//				let test: any = it("basic ezEndpoint, roundtrip phantomjscloud", () => {

//					const testEzEndpoint = new EzEndpoint<any, any>({ origin: "http://phantomjscloud.com", path: "/api/browser/v2/a-demo-key-with-low-quota-per-ip-address/" }, { timeout: 3000, interval: 100, backoff: 3 }, {}, );

//					const targetUrl = "https://example.com";
//					const requestPayload = {
//						pages: [
//							{
//								url: targetUrl,
//								renderType: "html",
//								outputAsJson: true,
//							}
//						],

//					};

//					return testEzEndpoint.post(requestPayload)
//						.then((response) => {
//							log.assert(response.status === 200, "should get success response", { response });
//							log.assert(targetUrl === response.data.pageResponses[0].pageRequest.url, "response contents should contain a value of response.data.pageResponses[0].pageRequest.url that matchest targetUrl", { targetUrl, gotTargetUrl: response.data.pageResponses[0].pageRequest.url, response });
//						}, (err) => {
//							const axiosErr = err as _axiosDTs.AxiosErrorResponse<void>;
//							throw log.error("did not expect an axiosErr", { err });
//						});
//				});

//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);

//			});

//			describe("fail cases", () => {


//				let test: any = it("basic retry, 429 error", () => {

//					const testEzEndpoint = new EzEndpoint<void, void>({ origin: "http://phantomjscloud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {}, );

//					return testEzEndpoint.post()
//						.then((response) => {
//							throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
//						}, (err) => {
//							const axiosErr = err as _axiosDTs.AxiosErrorResponse<void>;
//							if (axiosErr.response != null) {
//								log.assert(axiosErr.response.status === 429, "should have failed with 429 response", { axiosErr });
//							} else {
//								throw log.error("expected a axiosErr but didn't get one", { err })
//							}
//						});
//				})
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);

//				test = it("invalid domain", () => {

//					const testEzEndpoint = new EzEndpoint<void, void>({ origin: "http://asdfasdfasdfasetasgoud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {}, );

//					return testEzEndpoint.post()
//						.then((response) => {
//							throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
//						}, (err) => {
//							//TODO: describe EzEndpoint fail error type, and add error definitions to bluebird
//							// // // // 	export interface AxiosErrorResponse<T> extends Error {

//							// // // // 	/** inherited from the Error object*/
//							// // // // 	name: "Error";
//							// // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
//							// // // // 	message: string;
//							// // // // 	/**
//							// // // // 	 * config that was provided to `axios` for the request
//							// // // // 	 */
//							// // // // 	config: AxiosXHRConfig<T>;

//							// // // // 	/** The server response.  ```undefined``` if no response from server (such as invalid url or network timeout */
//							// // // // 	response?: AxiosXHR<T>;

//							// // // // 	/** example ```ETIMEDOUT```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	code?: string;

//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // failure?:{
//							// // // // 	name:string;

//							// // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
//							// // // // 	message: string;

//							// // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	code: string;
//							// // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	errno: string;

//							// // // // 	/** example ```getaddrinfo```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	syscall: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	hostname: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	host: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	port: number;
//							// // // // };
//						});
//				})
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);
//			});
//		});

//		describe("axios", () => {

//			const targetUrl = "http://phantomjscloud.com/examples/helpers/requestdata";
//			const samplePostPayload1 = { hi: 1, bye: "two", inner: { three: 4 } };
//			const sampleHeader1 = { head1: "val1" };
//			describe("success cases", () => {

//				it("basic e2e", () => {


//					return axios.post(targetUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							log.assert(axiosResponse.config != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.data != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.headers != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.statusText != null, "missing property", { axiosResponse });

//							log.assert(axiosResponse.status === 200, "status code wrong", { axiosResponse });

//							return Promise.resolve();
//						});
//				});
//			});

//			describe("fail cases", () => {

//				it("basic fail e2e", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/400", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 400 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}


//							log.assert(err.config != null, "missing property config", { err });
//							log.assert(err.message != null, "missing property message", { err });
//							log.assert(err.name != null, "missing property name", { err });
//							log.assert(err.response != null, "missing property response", { err });
//							log.assert(err.stack != null, "missing property stack", { err });

//							log.assert(err.response.config != null, "missing property response.config", { err });
//							log.assert(err.response.data != null, "missing property response.data", { err });
//							log.assert(err.response.headers != null, "missing property response.headers", { err });
//							log.assert(err.response.status != null, "missing property response.status ", { err });
//							log.assert(err.response.statusText != null, "missing property response.statusText", { err });

//							log.assert(err.response.status === 400, "wrong status code.", { err });

//							return Promise.resolve();

//						});
//				});


//				const badUrl = "http://moo";

//				let test: any = it("invlid url", () => {
//					return axios.post(badUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with invalid url", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							//log.info("got error as expected", { err });

//							return Promise.resolve();

//						});
//				});
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);


//				it("status 401 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/401", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 401 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 401, "wrong status code.", { err });

//							return Promise.resolve();

//						});
//				});

//				it("status 429 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/429", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 429 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 429, "wrong status code.", { err });

//							return Promise.resolve();

//						});
//				});

//				it("status 500 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/500", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 500, "wrong status code.", { err });

//							return Promise.resolve();

//						});
//				});
//				it("status 503 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/503", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 503 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 503, "wrong status code.", { err });

//							return Promise.resolve();

//						});
//				});


//				//it("network timeout", () => {
//				//	return axios.post("https://localhost:827", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//				//		.then((axiosResponse) => {
//				//			throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
//				//		})
//				//		.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {


//				//			if (err.response == null) {
//				//				throw log.error("response should be defined", { err });
//				//			}
//				//			log.assert(err.response.status === 500, "wrong status code.", { err });

//				//			return Promise.resolve();

//				//		});
//				//});
//			});
//		});

//	});

//}
