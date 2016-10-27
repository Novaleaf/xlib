"use strict";


//export import axios = require("axios");

/** the axios httpClient library:  https://github.com/mzabriskie/axios */
//export import axios = require("axios");
//import * as axios from "axios";
//export { axios };
import _axiosCustomDefinitions = require("./internal/definitions/axios-d");
export let axios: _axiosCustomDefinitions.AxiosStatic = require("axios");


import * as promise from "./promise";
import Promise = promise.bluebird;
import * as _ from "lodash";

import * as logging from "./logging";
let log = new logging.Logger(__filename);

import * as serialization from "./serialization";
import * as exception from "./exception";
import * as stringHelper from "./stringhelper";



/**
 * HTTP Basic auth details
 */
export interface AxiosHttpBasicAuth {
	username: string;
	password: string;
}
	/**
	 * Common axios XHR config interface
	 * <T> - request body data type
	 */
export	interface AxiosXHRConfigBase<T> {
	/**
	 * will be prepended to `url` unless `url` is absolute.
	 * It can be convenient to set `baseURL` for an instance
	 * of axios to pass relative URLs to methods of that instance.
	 */
	baseURL?: string;

	/**
	 * custom headers to be sent
	 */
	headers?: Object;

	/**
	 * URL parameters to be sent with the request
	 */
	params?: Object;

	/**
	 * optional function in charge of serializing `params`
	 * (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
	 */
	paramsSerializer?: (params: Object) => string;

	/**
	 * specifies the number of milliseconds before the request times out.
	 * If the request takes longer than `timeout`, the request will be aborted.
	 */
	timeout?: number;

	/**
	 * indicates whether or not cross-site Access-Control requests
	 * should be made using credentials
	 */
	withCredentials?: boolean;

	/**
	 * indicates that HTTP Basic auth should be used, and supplies
	 * credentials. This will set an `Authorization` header,
	 * overwriting any existing `Authorization` custom headers you have
	 * set using `headers`.
	 */
	auth?: AxiosHttpBasicAuth;

	/**
	 * indicates the type of data that the server will respond with
	 * options are 'arraybuffer', 'blob', 'document', 'json', 'text'
	 */
	responseType?: string;

	/**
	 * name of the cookie to use as a value for xsrf token
	 */
	xsrfCookieName?: string;

	/**
	 * name of the http header that carries the xsrf token value
	 */
	xsrfHeaderName?: string;

	/**
	 * Change the request data before it is sent to the server.
	 * This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
	 * The last function in the array must return a string or an ArrayBuffer
	 */
	transformRequest?: (<U>(data: T) => U) | [<U>(data: T) => U];

	/**
	 * change the response data to be made before it is passed to then/catch
	 */
	transformResponse?: <U>(data: T) => U;
}
/**
 * <T> - request body data type
 */
export interface AxiosXHRConfig<T> extends AxiosXHRConfigBase<T> {
	/**
	 * server URL that will be used for the request, options are:
	 * GET, PUT, POST, DELETE, CONNECT, HEAD, OPTIONS, TRACE, PATCH
	 */
	url: string;

	/**
	 * request method to be used when making the request
	 */
	method?: string;

	/**
	 * data to be sent as the request body
	 * Only applicable for request methods 'PUT', 'POST', and 'PATCH'
	 * When no `transformRequest` is set, must be a string, an ArrayBuffer or a hash
	 */
	data?: T;
}
/**
 * <T> - expected response type,
 * <U> - request body data type
 */
export interface AxiosXHR<T> {

	/**
	 * config that was provided to `axios` for the request
	 */
    config: AxiosXHRConfig<T>;
	/**
	 * Response that was provided by the server
	 */
    response: {
        /** payload that came with the response */
        data: T;

        /**
         * HTTP status code from the server response
         */
        status: number;

        /**
         * HTTP status message from the server response
         */
        statusText: string;

        /**
         * headers that the server responded with
         */
        headers: Object;

        /**
         * config that was provided to `axios` for the request
         */
        config: AxiosXHRConfig<T>;
    }
}
/**
*  a helper for constructing reusable endpoint functions
*/
export class EzEndpointFunction<TSubmitPayload, TRecievePayload>{

	constructor(
		public origin?: string,
		public path?: string,
		/** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
		public retryOptions: promise._BluebirdRetryInternals.IOptions = { timeout: 60000, interval: 100, backoff: 2, max_interval: 5000 },
		/** default is to timeout (err 545) after 60 seconds*/
		public requestOptions: AxiosXHRConfigBase<TRecievePayload> = { timeout: 60000 },
		/** allows aborting retries (if any).
		return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
		return a Promise.resolve() to signal that the request should be retried.        
		NOTE:   error's of statusCode 545 are request timeouts
		DEFAULT:  by default we will retry error 500 and above. */
		public preRetryErrorIntercept: (err: AxiosXHR<TRecievePayload>) => Promise<void> = (err) => {
			if (err.status <= 499) {
				//console.assert(false, "err");					
				return Promise.reject(err);
			} else {
				return Promise.resolve();
			}
		}
	) {

	}

	public toJson() {
		return { origin: this.origin, path: this.path, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
	}

	public post(
		submitPayload?: TSubmitPayload,
		/**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: AxiosXHRConfigBase<TRecievePayload>,
		customOrigin: string|undefined  = this.origin,
		customPath: string | undefined = this.path
	): Promise<AxiosXHR<TRecievePayload>> {
		log.debug("EzEndpointFunction .post() called");
		let lastErrorResult: any = null;
		return promise.retry<AxiosXHR<TRecievePayload>>(() => {
			
			try {

				log.debug("EzEndpointFunction .post() in promise.retry block");
				let endpoint = customOrigin + customPath;
				//log.debug("EzEndpointFunction axios.post", { endpoint });


				let finalRequestOptions: AxiosXHRConfigBase<TRecievePayload>;
				if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
					finalRequestOptions = this.requestOptions;
				} else {
					finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
				}

				return (axios.post<TRecievePayload>(endpoint, submitPayload, finalRequestOptions
				) as any as Promise<AxiosXHR<TRecievePayload>>)
					.then((result) => {
						log.debug("EzEndpointFunction .post() got valid response");
						return Promise.resolve(result);
					}, (err: AxiosXHR<TRecievePayload>) => {
						log.debug("EzEndpointFunction .post() got err");
						//log.info(err);
						if (err.status === 0 && err.statusText === "" && err.data === "" as any) {
							//log.debug("EzEndpointFunction axios.post timeout.", { endpoint });
							err.status = 524;
							err.statusText = "A Timeout Occurred";
							err.data = "Axios->EzEndpointFunction timeout." as any;
						}
						if (this.preRetryErrorIntercept != null) {
							let interceptedErrorResult = this.preRetryErrorIntercept(err);
							if (interceptedErrorResult==null || interceptedErrorResult.isRejected == null) {
								throw log.error("EzEndpointFunction POST interceptResult() did not return a promise", {submitPayload, interceptedErrorResult});
							}
							if (interceptedErrorResult.isFulfilled() === false) {
								throw log.error("EzEndpointFunction POST interceptResult() promise is not fulfilled", { submitPayload, interceptedErrorResult });
							}
							if (interceptedErrorResult.isRejected()) {
								//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
								let stopError = new promise.retry.StopError("preRetryIntercept abort");
								(stopError as any)["interceptResult"] = interceptedErrorResult;
								return Promise.reject(stopError);
							} else {
								//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
							}
						}
						lastErrorResult = err;
						return Promise.reject(err);
					});

			} catch (errThrown) {
				log.debug("EzEndpointFunction .post() in root promise.retry block,  got errThrown", errThrown.toString());
				throw errThrown;
			}

		}, this.retryOptions)			
			.catch((err: any) => {
				log.debug("EzEndpointFunction .post()  retry catch");
				if (err.interceptResult != null) {
					return err.interceptResult;
				}

				//let payloadStr = submitPayload == null ? "" : serialization.JSONX.inspectStringify(submitPayload);
				//let payloadStrSummarized = stringHelper.summarize(payloadStr, 2000);
				//log.error("failed ez call .post()", this.toJson(), err, lastErrorResult, payloadStr.length, payloadStrSummarized);
				return Promise.reject(err);
			});
	}
	public get(
		/**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: AxiosXHRConfigBase<TRecievePayload>,
		customOrigin: string|undefined = this.origin,
		customPath: string | undefined = this.path
	): Promise<AxiosXHR<TRecievePayload>> {
		log.debug("EzEndpointFunction .get() called");
		return promise.retry<AxiosXHR<TRecievePayload>>(() => {
			let endpoint = customOrigin + customPath;
			//log.debug("EzEndpointFunction axios.get", { endpoint });
			//return axios.post<TRecievePayload>(endpoint, submitPayload, this.requestOptions) as any;

			let finalRequestOptions: AxiosXHRConfigBase<TRecievePayload>;
			if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
				finalRequestOptions = this.requestOptions;
			} else {
				finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
			}

			return (axios.get<TRecievePayload>(endpoint, finalRequestOptions) as any as Promise<AxiosXHR<TRecievePayload>>)
				.then((result) => {
					return Promise.resolve(result);
				}, (err: AxiosXHR<TRecievePayload>) => {
					//log.info(err);
					if (err.status === 0 && err.statusText === "" && err.data === "" as any) {
						//log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
						err.status = 524;
						err.statusText = "A Timeout Occurred";
						err.data = "Axios->EzEndpointFunction timeout." as any;
					}
					if (this.preRetryErrorIntercept != null) {
						let interceptedErrorResult = this.preRetryErrorIntercept(err);
						if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
							throw log.error("EzEndpointFunction GET interceptResult() did not return a promise", { interceptedErrorResult });
						}
						if (interceptedErrorResult.isFulfilled() === false) {
							throw log.error("EzEndpointFunction GET interceptResult() promise is not fulfilled", { interceptedErrorResult });
						}
						if (interceptedErrorResult.isRejected()) {
							//rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
							let stopError = new promise.retry.StopError("preRetryIntercept abort");
							(stopError as any)["interceptResult"] = interceptedErrorResult;
							return Promise.reject(stopError);
						} else {
							//do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
						}
					}
					return Promise.reject(err);
				});
		}, this.retryOptions).catch((err: any) => {
			if (err.interceptResult != null) {
				return err.interceptResult;
			}
			//og.error("failed ez call .get()", this.toJson(), err);
			return Promise.reject(err);
		});
	}

}
