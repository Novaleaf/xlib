﻿"use strict";


//export import axios = require("axios");

/** the axios httpClient library:  https://github.com/mzabriskie/axios */
export import axios = require("axios");

import promise = require("./promise");

import logging = require("./diagnostics/logging");
let log = new logging.Logger(__filename);

import serialization = require("./serialization");
import exception = require("./exception");
import stringHelper = require("./stringhelper");
/**
 *  a helper for constructing reusable endpoint functions
 */
export class EzEndpointFunction<TSubmitPayload, TRecievePayload>{

	constructor(
		public urlRoot: string,
		public path: string,
		/** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
		public retryOptions: promise._BluebirdRetryInternals.IOptions = { timeout: 10000, interval: 100, backoff: 2 },
		/** default is to timeout (err 545) after 60 seconds*/
		public requestOptions: Axios.AxiosXHRConfigBase<TRecievePayload> = { timeout:60000},
		/** allows aborting retries (if any).  return null to continue retry normally,  return any non-null to abort retries and return the result you are returning.
		NOTE:   error's of statusCode 545 are request timeouts
		DEFAULT:  by default we will retry error 500 and above. */
		public preRetryIntercept: (err: Axios.AxiosXHR<TRecievePayload>) => Promise<TRecievePayload> = (err) => {
			if (err.status <= 499) {
				//console.assert(false, "err");
				return Promise.reject(new exception.HttpStatusCodeException(`xlib.net.EzEndpointFunction.preRetryIntercept() failed. endpoint="${urlRoot}${path}" statusCode=${err.status} statusText="${err.statusText}"`, new Error(serialization.JSONX.inspectStringify(err.data)), err.status));
			} else {
				return null;
			}
		}
	) {

	}

	public toJson() {
		return { urlRoot: this.urlRoot, path: this.path, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
	}

	public post(submitPayload?: TSubmitPayload, /**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>): Promise<Axios.AxiosXHR<TRecievePayload>> {

		let lastErrorResult = null;
		return promise.retry<Axios.AxiosXHR<TRecievePayload>>(() => {
			let endpoint = this.urlRoot + this.path
			log.debug("EzEndpointFunction axios.post", { endpoint });


			let finalRequestOptions: Axios.AxiosXHRConfigBase<TRecievePayload>;
			if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
				finalRequestOptions = this.requestOptions;
			} else {
				finalRequestOptions = _.defaults({}, customRequestOptions,this.requestOptions);
			}

			return (axios.post<TRecievePayload>(endpoint, submitPayload, finalRequestOptions
			) as any as Promise<Axios.AxiosXHR<TRecievePayload>>)
				.then((result) => {
					return Promise.resolve(result);
				}, (err: Axios.AxiosXHR<TRecievePayload>) => {
					//log.info(err);
					if (err.status === 0 && err.statusText === "" && err.data === "" as any) {
						log.debug("EzEndpointFunction axios.post timeout.", { endpoint });
						err.status = 524;
						err.statusText = "A Timeout Occurred";
						err.data = "Axios->EzEndpointFunction timeout." as any;
					}
					if (this.preRetryIntercept != null) {
						let interceptResult = this.preRetryIntercept(err);
						if (interceptResult != null) {
							let stopError = new promise.retry.StopError("preRetryIntercept abort");
							stopError["interceptResult"] = interceptResult;
							return Promise.reject(stopError);
						}
					}
					lastErrorResult = err;
					return Promise.reject(err);
				});
		}, this.retryOptions)
			.catch((err) => {
				if (err.interceptResult != null) {
					return err.interceptResult;
				}

				let payloadStr = submitPayload == null ? "" : serialization.JSONX.inspectStringify(submitPayload);
				let payloadStrSummarized = stringHelper.summarize(payloadStr, 2000);
				log.error("failed ez call .post()", this.toJson(), err, lastErrorResult, payloadStr.length, payloadStrSummarized);
				return Promise.reject(err);
			});
	}
	public get(/**setting a key overrides the key put in ctor.requestOptions. */customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>): Promise<Axios.AxiosXHR<TRecievePayload>> {
		return promise.retry<Axios.AxiosXHR<TRecievePayload>>(() => {
			let endpoint = this.urlRoot + this.path
			log.debug("EzEndpointFunction axios.get", { endpoint });
			//return axios.post<TRecievePayload>(endpoint, submitPayload, this.requestOptions) as any;

			let finalRequestOptions: Axios.AxiosXHRConfigBase<TRecievePayload>;
			if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
				finalRequestOptions = this.requestOptions;
			} else {
				finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
			}

			return (axios.get<TRecievePayload>(endpoint, finalRequestOptions) as any as Promise<Axios.AxiosXHR<TRecievePayload>>)
				.then((result) => {
					return Promise.resolve(result);
				}, (err: Axios.AxiosXHR<TRecievePayload>) => {
					//log.info(err);
					if (err.status === 0 && err.statusText === "" && err.data === "" as any) {
						log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
						err.status = 524;
						err.statusText = "A Timeout Occurred";
						err.data = "Axios->EzEndpointFunction timeout." as any;
					}
					if (this.preRetryIntercept != null) {
						let interceptResult = this.preRetryIntercept(err);
						if (interceptResult != null) {
							let stopError = new promise.retry.StopError("preRetryIntercept abort");
							stopError["interceptResult"] = interceptResult;
							return Promise.reject(stopError);
						}
					}
					return Promise.reject(err);
				});
		}, this.retryOptions).catch((err) => {
			if (err.interceptResult != null) {
				return err.interceptResult;
			}
			log.error("failed ez call .get()", this.toJson(), err);
			return Promise.reject(err);
		});
	}

}
