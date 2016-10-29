"use strict";
//export import axios = require("axios");
/** the axios httpClient library:  https://github.com/mzabriskie/axios */
//export import axios = require("axios");
//import * as axios from "axios";
//export { axios };
/** definition of axios */
exports._axiosDTs = require("./internal/definitions/axios-d");
exports.axios = require("axios");
const promise = require("./promise");
var Promise = promise.bluebird;
const _ = require("lodash");
const logging = require("./logging");
let log = new logging.Logger(__filename);
///**
// * HTTP Basic auth details
// */
//export interface AxiosHttpBasicAuth {
//	username: string;
//	password: string;
//}
///**
// * Common axios XHR config interface
// * <T> - request body data type
// */
//export interface AxiosXHRConfigBase<T> {
//	/**
//	 * will be prepended to `url` unless `url` is absolute.
//	 * It can be convenient to set `baseURL` for an instance
//	 * of axios to pass relative URLs to methods of that instance.
//	 */
//	baseURL?: string;
//	/**
//	 * custom headers to be sent
//	 */
//	headers?: Object;
//	/**
//	 * URL parameters to be sent with the request
//	 */
//	params?: Object;
//	/**
//	 * optional function in charge of serializing `params`
//	 * (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
//	 */
//	paramsSerializer?: (params: Object) => string;
//	/**
//	 * specifies the number of milliseconds before the request times out.
//	 * If the request takes longer than `timeout`, the request will be aborted.
//	 */
//	timeout?: number;
//	/**
//	 * indicates whether or not cross-site Access-Control requests
//	 * should be made using credentials
//	 */
//	withCredentials?: boolean;
//	/**
//	 * indicates that HTTP Basic auth should be used, and supplies
//	 * credentials. This will set an `Authorization` header,
//	 * overwriting any existing `Authorization` custom headers you have
//	 * set using `headers`.
//	 */
//	auth?: AxiosHttpBasicAuth;
//	/**
//	 * indicates the type of data that the server will respond with
//	 * options are 'arraybuffer', 'blob', 'document', 'json', 'text'
//	 */
//	responseType?: string;
//	/**
//	 * name of the cookie to use as a value for xsrf token
//	 */
//	xsrfCookieName?: string;
//	/**
//	 * name of the http header that carries the xsrf token value
//	 */
//	xsrfHeaderName?: string;
//	/**
//	 * Change the request data before it is sent to the server.
//	 * This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
//	 * The last function in the array must return a string or an ArrayBuffer
//	 */
//	transformRequest?: (<U>(data: T) => U) | [<U>(data: T) => U];
//	/**
//	 * change the response data to be made before it is passed to then/catch
//	 */
//	transformResponse?: <U>(data: T) => U;
//}
///**
// * <T> - request body data type
// */
//export interface AxiosXHRConfig<T> extends AxiosXHRConfigBase<T> {
//	/**
//	 * server URL that will be used for the request, options are:
//	 * GET, PUT, POST, DELETE, CONNECT, HEAD, OPTIONS, TRACE, PATCH
//	 */
//	url: string;
//	/**
//	 * request method to be used when making the request
//	 */
//	method?: string;
//	/**
//	 * data to be sent as the request body
//	 * Only applicable for request methods 'PUT', 'POST', and 'PATCH'
//	 * When no `transformRequest` is set, must be a string, an ArrayBuffer or a hash
//	 */
//	data?: T;
//}
///**
// * <T> - expected response type,
// * <U> - request body data type
// */
//export interface AxiosXHR<T> {
//	/**
//	 * config that was provided to `axios` for the request
//	 */
//	config: AxiosXHRConfig<T>;
//	/**
//	 * Response that was provided by the server.
//	 */
//	response: {
//		/** payload that came with the response */
//		data: T;
//        /**
//         * HTTP status code from the server response
//         */
//		status: number;
//        /**
//         * HTTP status message from the server response
//         */
//		statusText: string;
//        /**
//         * headers that the server responded with
//         */
//		headers: Object;
//        /**
//         * config that was provided to `axios` for the request
//         */
//		config: AxiosXHRConfig<T>;
//	}
//}
/**
*  a helper for constructing reusable endpoint functions
*/
class EzEndpointFunction {
    constructor(origin, path, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions = { timeout: 60000, interval: 100, backoff: 2, max_interval: 5000 }, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions = { timeout: 60000 }, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept = (err) => {
            if (err.response.status <= 499) {
                //console.assert(false, "err");					
                return Promise.reject(err);
            }
            else {
                return Promise.resolve();
            }
        }) {
        this.origin = origin;
        this.path = path;
        this.retryOptions = retryOptions;
        this.requestOptions = requestOptions;
        this.preRetryErrorIntercept = preRetryErrorIntercept;
    }
    toJson() {
        return { origin: this.origin, path: this.path, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
    }
    post(submitPayload, 
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin = this.origin, customPath = this.path) {
        log.debug("EzEndpointFunction .post() called");
        let lastErrorResult = null;
        return promise.retry(() => {
            try {
                log.debug("EzEndpointFunction .post() in promise.retry block");
                let endpoint = customOrigin + customPath;
                //log.debug("EzEndpointFunction axios.post", { endpoint });
                let finalRequestOptions;
                if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
                    finalRequestOptions = this.requestOptions;
                }
                else {
                    finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
                }
                return exports.axios.post(endpoint, submitPayload, finalRequestOptions)
                    .then((result) => {
                    log.debug("EzEndpointFunction .post() got valid response");
                    return Promise.resolve(result);
                }, (err) => {
                    log.debug("EzEndpointFunction .post() got err");
                    //log.info(err);
                    if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "") {
                        //log.debug("EzEndpointFunction axios.post timeout.", { endpoint });
                        err.response.status = 524;
                        err.response.statusText = "A Timeout Occurred";
                        err.response.data = "Axios->EzEndpointFunction timeout.";
                    }
                    if (this.preRetryErrorIntercept != null) {
                        let interceptedErrorResult = this.preRetryErrorIntercept(err);
                        if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
                            throw log.error("EzEndpointFunction POST interceptResult() did not return a promise", { submitPayload, interceptedErrorResult });
                        }
                        if (interceptedErrorResult.isFulfilled() === false) {
                            throw log.error("EzEndpointFunction POST interceptResult() promise is not fulfilled", { submitPayload, interceptedErrorResult });
                        }
                        if (interceptedErrorResult.isRejected()) {
                            //rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
                            let stopError = new promise.retry.StopError("preRetryIntercept abort");
                            stopError["interceptResult"] = interceptedErrorResult;
                            return Promise.reject(stopError);
                        }
                        else {
                        }
                    }
                    lastErrorResult = err;
                    return Promise.reject(err);
                });
            }
            catch (errThrown) {
                log.debug("EzEndpointFunction .post() in root promise.retry block,  got errThrown", errThrown.toString());
                throw errThrown;
            }
        }, this.retryOptions)
            .catch((err) => {
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
    get(
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin = this.origin, customPath = this.path) {
        log.debug("EzEndpointFunction .get() called");
        return promise.retry(() => {
            let endpoint = customOrigin + customPath;
            //log.debug("EzEndpointFunction axios.get", { endpoint });
            //return axios.post<TRecievePayload>(endpoint, submitPayload, this.requestOptions) as any;
            let finalRequestOptions;
            if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
                finalRequestOptions = this.requestOptions;
            }
            else {
                finalRequestOptions = _.defaults({}, customRequestOptions, this.requestOptions);
            }
            return exports.axios.get(endpoint, finalRequestOptions)
                .then((result) => {
                return Promise.resolve(result);
            }, (err) => {
                //log.info(err);
                if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "") {
                    //log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
                    err.response.status = 524;
                    err.response.statusText = "A Timeout Occurred";
                    err.response.data = "Axios->EzEndpointFunction timeout.";
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
                        stopError["interceptResult"] = interceptedErrorResult;
                        return Promise.reject(stopError);
                    }
                    else {
                    }
                }
                return Promise.reject(err);
            });
        }, this.retryOptions).catch((err) => {
            if (err.interceptResult != null) {
                return err.interceptResult;
            }
            //og.error("failed ez call .get()", this.toJson(), err);
            return Promise.reject(err);
        });
    }
}
exports.EzEndpointFunction = EzEndpointFunction;
var _test;
(function (_test) {
    describe(__filename, () => {
        describe("axios", () => {
            const targetUrl = "https://phantomjscloud.com/examples/helpers/requestdata";
            const samplePostPayload1 = { hi: 1, bye: "two", inner: { three: 4 } };
            const sampleHeader1 = { head1: "val1" };
            describe("success", () => {
                it("basic e2e", () => {
                    return exports.axios.post(targetUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
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
            describe("fail", () => {
                const badUrl = "https://moo";
                let test = it("basic e2e", () => {
                    return exports.axios.post(badUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with invalid url", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        log.info("got error as expected", { err });
                        return Promise.resolve();
                    });
                });
                // set timeout increase (default=2000ms) https://mochajs.org/#timeouts
                test.timeout(5000);
                it("status 401 response", () => {
                    return exports.axios.post("https://phantomjscloud.com/examples/helpers/statusCode/401", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 401 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        log.info("got error as expected", { err });
                        return Promise.resolve();
                    });
                });
            });
        });
    });
})(_test || (_test = {}));
//# sourceMappingURL=net.js.map