"use strict";


//export import axios = require("axios");

/** the axios httpClient library:  https://github.com/mzabriskie/axios */
//export import axios = require("axios");
//import * as axios from "axios";
//export { axios };

/** definition of axios */
export import _axiosDTs = require("./internal/definitions/axios-d");

/**
 * a low-level, but promise based http(s) library.
 *
 * **IMPORTANT**: recomend you DO NOT use this directly, as it does not provide retry logic.
 * instead, use the ``EzEndpoint`` we offer instead
 */
export let axios: _axiosDTs.AxiosStatic = require("axios");


import * as promise from "./promise";
import Promise = promise.bluebird;
import * as _ from "lodash";

import * as logging from "./logging";
let log = new logging.Logger(__filename);

import * as serialization from "./serialization";
import * as exception from "./exception";
import * as stringHelper from "./stringhelper";



/**
*  a helper for constructing reusable endpoint functions
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
	520: Unknown Error:  any otherwise unhandled network issues will be returned as this
	522: Connection Timed Out:  could not connect to the server
	523: Origin Is Unreachable, ex:  DNS record not found
	524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
export class EzEndpoint<TSubmitPayload, TRecievePayload>{

	constructor(
		/** default endpoint (domain+path) to connect to.  this can be overridden in the actual .post() or .get() method call*/
		public endpointOptions: {
			/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
			origin?: string,
			/** if you don't set this, you'll need to pass it to every call to .post() or .get() */
			path?: string,
		},
		/** default is to retry for up to 20 seconds, using a graceful exponential backoff */
		public retryOptions: promise._BluebirdRetryInternals.IOptions = { timeout: 20000, interval: 100, backoff: 2, max_interval: 5000 },
		/** default is to timeout (err 524) after 15 seconds*/
		public requestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload> = { timeout: 15000 },
		/** allows aborting retries (if any).
		return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
		return a Promise.resolve() to signal that the request should be retried.        
		DEFAULT:  by default we will retry error 500 and above. */
		public preRetryErrorIntercept: (
			/** note: network issues are converted into err.response so you don't need to parse them differently.*/
			err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => Promise<void> = (err) => {
				if (err.response != null && err.response.status <= 499) {
					//console.assert(false, "err");					
					return Promise.reject(err);
				} else {
					return Promise.resolve();
				}
			}
	) {

	}

	public toJson() {
		return { endpointOptions: this.endpointOptions, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
	}

	private _doRequest(
		protocol: "get" | "post",
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults, pass undefined to skip */
		overrideRequestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload> = this.requestOptions,
		/**override defaults, pass undefined to skip */
		overrideRetryOptions: promise._BluebirdRetryInternals.IOptions = this.retryOptions,
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions: {
			origin?: string,
			path?: string,
		} = this.endpointOptions
	): Promise<_axiosDTs.AxiosXHR<TRecievePayload>> {

		log.debug(`EzEndpoint._doRequest() called`, { protocol });

		return Promise.try(() => {

			//copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
			let finalEndpointOptions = _.defaults({}, overrideEndpointOptions, this.endpointOptions);
			let finalRequestOptions = _.defaults({}, overrideRequestOptions, this.requestOptions);
			let finalRetryOptions = _.defaults({}, overrideRetryOptions, this.retryOptions);


			if (finalEndpointOptions.origin == null || finalEndpointOptions.path == null) {
				throw log.error("can not make endpoint request.  missing required endpointOptions", { finalEndpointOptions });
			}
			if (protocol === "get" && submitPayload != null) {
				throw log.error("EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { finalEndpointOptions, submitPayload });
			}

			let endpoint = overrideEndpointOptions.origin + overrideEndpointOptions.path;

			let lastErrorResult: any = null;

			//************
			//retry loop
			return promise.retry<_axiosDTs.AxiosXHR<TRecievePayload>>(() => {

				//try {

				log.debug("EzEndpoint._doRequest() in promise.retry block");


				return Promise.try(() => {

					/**
					 *  the actual HTTP request we send over the wire.
					 */
					let axiosRequestPromise: _axiosDTs.IPromise<_axiosDTs.AxiosXHR<TRecievePayload>>;

					switch (protocol) {
						case "post":
							{
								axiosRequestPromise = axios.post<TRecievePayload>(endpoint, submitPayload, finalRequestOptions);
							}
							break;
						case "get":
							{
								axiosRequestPromise = axios.get<TRecievePayload>(endpoint, finalRequestOptions);
							}
							break;

						default:
							{
								throw log.error(`EzEndpoint._doRequest() unknown protocol`, { protocol });
							}


					}
					return axiosRequestPromise
						.then((result) => {
							log.debug("EzEndpoint._doRequest() got valid response");
							return Promise.resolve(result);
						}, (err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => {
							log.debug("EzEndpoint._doRequest() got err");


							if (err.code != null) {
								log.assert(err.response == null, "expect axios.response to be null on err.code value set");
								switch (err.code) {
									case "ENOTFOUND":
										{
											err.response = {
												status: 523,
												statusText: `Origin is Unreachable: ${err.code}, ${err.message} `,
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
												statusText: `Connection Timed Out: ${err.code}, ${err.message} `,
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
												statusText: `Unknown Error: ${err.code}, ${err.message} `,
												config: err.config,
												data: undefined as any,
												headers: {},
											};
										}
										break;
								}
							}
							if (err.response != null) {
								if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "" as any) {
									//log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
									err.response.status = 524;
									err.response.statusText = "A Timeout Occurred: Request Aborted, EzEndpoint.requestOptions.timeout exceeded";
									err.response.data = "Axios->EzEndpointFunction timeout." as any;
								}

							}


							if (this.preRetryErrorIntercept != null) {

								return this.preRetryErrorIntercept(err)
									.then(() => {
										//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
										lastErrorResult = err;
										return Promise.reject(err);

									}, (rejectedErr) => {
										//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
										let stopError = new promise.retry.StopError("preRetryIntercept abort");
										(stopError as any)["interceptResult"] = Promise.reject(rejectedErr);
										return Promise.reject(stopError);
									});

							}
							lastErrorResult = err;
							return Promise.reject(err);
						});
				});

				//} catch (errThrown) {
				//	log.debug("EzEndpoint._doRequest() in root promise.retry block,  got errThrown", errThrown.toString());
				//	throw errThrown;
				//}

			}, finalRetryOptions)
				//***************  finished retry loop
				.catch((err: any) => {
					log.debug("EzEndpoint._doRequest()  retry catch");
					if (err.interceptResult != null) {
						return err.interceptResult;
					}
					return Promise.reject(err);
				});

		});

	}

	public post(
		/** pass a payload to POST */
		submitPayload?: TSubmitPayload,
		/**override defaults, pass undefined to skip */
		overrideRequestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload> = this.requestOptions,
		/**override defaults, pass undefined to skip */
		overrideRetryOptions: promise._BluebirdRetryInternals.IOptions = this.retryOptions,
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions: {
			origin?: string,
			path?: string,
		} = this.endpointOptions
	) {
		return this._doRequest("post", submitPayload, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
	}

	public get(
		/**override defaults, pass undefined to skip */
		overrideRequestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload> = this.requestOptions,
		/**override defaults, pass undefined to skip */
		overrideRetryOptions: promise._BluebirdRetryInternals.IOptions = this.retryOptions,
		/**override defaults, pass undefined to skip */
		overrideEndpointOptions: {
			origin?: string,
			path?: string,
		} = this.endpointOptions
	) {
		return this._doRequest("get", undefined, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
	}

	///////********************************
	/////// old implementation of post/get  methods here, can delete one verified new one works
	//////public post(
	//////	submitPayload?: TSubmitPayload,
	//////	/**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>,
	//////	customOrigin: string | undefined = this.origin,
	//////	customPath: string | undefined = this.path
	//////): Promise<_axiosDTs.AxiosXHR<TRecievePayload>> {
	//////	log.debug("EzEndpointFunction .post() called");
	//////	let lastErrorResult: any = null;
	//////	return promise.retry<_axiosDTs.AxiosXHR<TRecievePayload>>(() => {

	//////		try {

	//////			log.debug("EzEndpointFunction .post() in promise.retry block");
	//////			let endpoint = customOrigin + customPath;
	//////			//log.debug("EzEndpointFunction axios.post", { endpoint });


	//////			let finalRequestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
	//////			if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
	//////				finalRequestOptions = this.requestOptions;
	//////			} else {
	//////				finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
	//////			}

	//////			return (axios.post<TRecievePayload>(endpoint, submitPayload, finalRequestOptions
	//////			) as any as Promise<_axiosDTs.AxiosXHR<TRecievePayload>>)
	//////				.then((result) => {
	//////					log.debug("EzEndpointFunction .post() got valid response");
	//////					return Promise.resolve(result);
	//////				}, (err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => {
	//////					log.debug("EzEndpointFunction .post() got err");
	//////					//log.info(err);
	//////					if (err.response != null) {
	//////						if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "" as any) {
	//////							//log.debug("EzEndpointFunction axios.post timeout.", { endpoint });
	//////							err.response.status = 524;
	//////							err.response.statusText = "A Timeout Occurred";
	//////							err.response.data = "Axios->EzEndpointFunction timeout." as any;
	//////						}
	//////					}
	//////					if (this.preRetryErrorIntercept != null) {

	//////						return this.preRetryErrorIntercept(err)
	//////							.then(() => {
	//////								//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
	//////								lastErrorResult = err;
	//////								return Promise.reject(err);

	//////							}, (rejectedErr) => {
	//////								//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
	//////								let stopError = new promise.retry.StopError("preRetryIntercept abort");
	//////								(stopError as any)["interceptResult"] = Promise.reject(rejectedErr);
	//////								return Promise.reject(stopError);
	//////							});


	//////						//let interceptedErrorResult = this.preRetryErrorIntercept(err);

	//////						//if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
	//////						//	throw log.error("EzEndpointFunction POST interceptResult() did not return a promise", { submitPayload, interceptedErrorResult });
	//////						//}
	//////						//if (interceptedErrorResult.isResolved() === false) {
	//////						//	throw log.error("EzEndpointFunction POST interceptResult() promise is not resolved (fulfilled or rejected)", { submitPayload, interceptedErrorResult });
	//////						//}
	//////						//if (interceptedErrorResult.isRejected()) {
	//////						//	//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
	//////						//	let stopError = new promise.retry.StopError("preRetryIntercept abort");
	//////						//	(stopError as any)["interceptResult"] = interceptedErrorResult;
	//////						//	return Promise.reject(stopError);
	//////						//} else {
	//////						//	//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
	//////						//}
	//////					}
	//////					lastErrorResult = err;
	//////					return Promise.reject(err);
	//////				});

	//////		} catch (errThrown) {
	//////			log.debug("EzEndpointFunction .post() in root promise.retry block,  got errThrown", errThrown.toString());
	//////			throw errThrown;
	//////		}

	//////	}, this.retryOptions)
	//////		.catch((err: any) => {
	//////			log.debug("EzEndpointFunction .post()  retry catch");
	//////			if (err.interceptResult != null) {
	//////				return err.interceptResult;
	//////			}

	//////			//let payloadStr = submitPayload == null ? "" : serialization.JSONX.inspectStringify(submitPayload);
	//////			//let payloadStrSummarized = stringHelper.summarize(payloadStr, 2000);
	//////			//log.error("failed ez call .post()", this.toJson(), err, lastErrorResult, payloadStr.length, payloadStrSummarized);
	//////			return Promise.reject(err);
	//////		});
	//////}
	//////public get(
	//////	/**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>,
	//////	customOrigin: string | undefined = this.origin,
	//////	customPath: string | undefined = this.path
	//////): Promise<_axiosDTs.AxiosXHR<TRecievePayload>> {
	//////	log.debug("EzEndpointFunction .get() called");
	//////	let lastErrorResult: any = null;

	//////	return promise.retry<_axiosDTs.AxiosXHR<TRecievePayload>>(() => {
	//////		let endpoint = customOrigin + customPath;
	//////		//log.debug("EzEndpointFunction axios.get", { endpoint });
	//////		//return axios.post<TRecievePayload>(endpoint, submitPayload, this.requestOptions) as any;

	//////		let finalRequestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
	//////		if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
	//////			finalRequestOptions = this.requestOptions;
	//////		} else {
	//////			finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
	//////		}

	//////		return (axios.get<TRecievePayload>(endpoint, finalRequestOptions) as any as Promise<_axiosDTs.AxiosXHR<TRecievePayload>>)
	//////			.then((result) => {
	//////				return Promise.resolve(result);
	//////			}, (err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => {
	//////				if (err.code != null) {
	//////					log.assert(err.response == null, "expect axios.response to be null on err.code value set");
	//////					switch (err.code) {
	//////						case "ENOTFOUND":
	//////							{
	//////								err.response = {
	//////									status: 523,
	//////									statusText: `Origin is Unreachable: ${err.code}, ${err.message} `,
	//////									config: err.config,
	//////									data: undefined as any,
	//////									headers: {},
	//////								};
	//////							}
	//////							break;
	//////						default:
	//////							{
	//////								err.response = {
	//////									status: 520,
	//////									statusText: `Unknown Error: ${err.code}, ${err.message} `,
	//////									config: err.config,
	//////									data: undefined as any,
	//////									headers: {},
	//////								};
	//////							}
	//////							break;
	//////					}
	//////				}



	//////				//log.info(err);
	//////				if (err.response != null) {
	//////					if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "" as any) {
	//////						//log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
	//////						err.response.status = 524;
	//////						err.response.statusText = "A Timeout Occurred";
	//////						err.response.data = "Axios->EzEndpointFunction timeout." as any;
	//////					}
	//////				}
	//////				if (this.preRetryErrorIntercept != null) {
	//////					return this.preRetryErrorIntercept(err)
	//////						.then(() => {
	//////							//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
	//////							lastErrorResult = err;
	//////							return Promise.reject(err);

	//////						}, (rejectedErr) => {
	//////							//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
	//////							let stopError = new promise.retry.StopError("preRetryIntercept abort");
	//////							(stopError as any)["interceptResult"] = Promise.reject(rejectedErr);
	//////							return Promise.reject(stopError);
	//////						});


	//////					//let interceptedErrorResult = this.preRetryErrorIntercept(err);

	//////					//if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
	//////					//	throw log.error("EzEndpointFunction POST interceptResult() did not return a promise", { submitPayload, interceptedErrorResult });
	//////					//}
	//////					//if (interceptedErrorResult.isResolved() === false) {
	//////					//	throw log.error("EzEndpointFunction POST interceptResult() promise is not resolved (fulfilled or rejected)", { submitPayload, interceptedErrorResult });
	//////					//}
	//////					//if (interceptedErrorResult.isRejected()) {
	//////					//	//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
	//////					//	let stopError = new promise.retry.StopError("preRetryIntercept abort");
	//////					//	(stopError as any)["interceptResult"] = interceptedErrorResult;
	//////					//	return Promise.reject(stopError);
	//////					//} else {
	//////					//	//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
	//////					//}
	//////				}
	//////				return Promise.reject(err);
	//////			});
	//////	}, this.retryOptions).catch((err: any) => {
	//////		if (err.interceptResult != null) {
	//////			return err.interceptResult;
	//////		}
	//////		//og.error("failed ez call .get()", this.toJson(), err);
	//////		return Promise.reject(err);
	//////	});
	//////}

}


module _test {

	describe(__filename, () => {

		describe("axios", () => {

			const targetUrl = "https://phantomjscloud.com/examples/helpers/requestdata";
			const samplePostPayload1 = { hi: 1, bye: "two", inner: { three: 4 } };
			const sampleHeader1 = { head1: "val1" };
			describe("success cases", () => {

				it("basic e2e", () => {


					return axios.post(targetUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
						.then((axiosResponse) => {
							log.assert(axiosResponse.config != null, "missing property", { axiosResponse });
							log.assert(axiosResponse.data != null, "missing property", { axiosResponse });
							log.assert(axiosResponse.headers != null, "missing property", { axiosResponse });
							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
							log.assert(axiosResponse.statusText != null, "missing property", { axiosResponse });

							log.assert(axiosResponse.status === 200, "status code wrong", { axiosResponse });

							return Promise.resolve();
						});
				});
			});

			describe("fail cases", () => {



				const badUrl = "https://moo";

				let test: any = it("invlid url", () => {
					return axios.post(badUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
						.then((axiosResponse) => {
							throw log.error("should have failed with invalid url", { badUrl, axiosResponse });
						})
						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

							//log.info("got error as expected", { err });

							return Promise.resolve();

						});
				});
				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
				test.timeout(5000);


				it("status 401 response", () => {
					return axios.post("https://phantomjscloud.com/examples/helpers/statusCode/401", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
						.then((axiosResponse) => {
							throw log.error("should have failed with 401 error", { badUrl, axiosResponse });
						})
						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

							if (err.response == null) {
								throw log.error("response should be defined", { err });
							}
							log.assert(err.response.status === 401, "wrong status code.", { err });

							return Promise.resolve();

						});
				});

				it("status 500 response", () => {
					return axios.post("https://phantomjscloud.com/examples/helpers/statusCode/500", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
						.then((axiosResponse) => {
							throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
						})
						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {

							if (err.response == null) {
								throw log.error("response should be defined", { err });
							}
							log.assert(err.response.status === 500, "wrong status code.", { err });

							return Promise.resolve();

						});
				});


				//it("network timeout", () => {
				//	return axios.post("https://localhost:827", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
				//		.then((axiosResponse) => {
				//			throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
				//		})
				//		.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {


				//			if (err.response == null) {
				//				throw log.error("response should be defined", { err });
				//			}
				//			log.assert(err.response.status === 500, "wrong status code.", { err });

				//			return Promise.resolve();

				//		});
				//});
			});
		});

	});

}