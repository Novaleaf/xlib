"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promise = require("./promise");
var Promise = promise.bluebird;
const _ = require("lodash");
const logging = require("./logging");
let log = new logging.Logger(__filename);
const jsHelper = require("./jshelper");
//export import axios = require("axios");
/** the axios httpClient library:  https://github.com/mzabriskie/axios */
//export import axios = require("axios");
//import * as axios from "axios";
//export { axios };
/** definition of axios */
exports._axiosDTs = require("./internal/definitions/axios-d");
/**
 * a low-level, but promise based http(s) library.
 *
 * **IMPORTANT**: recomend you DO NOT use this directly, as it does not provide retry logic.
 * instead, use the ``EzEndpoint`` we offer instead.
 * If you do use axios directly, be aware that though it returns something that appears to be a promise, it is NOT BLUEBIRD COMPATABLE for error handling, and so you will want to wrap it in a 'new Promise((resolve,reject)=>{ axios.... })' block.
 */
exports.axios = require("axios");
function _axiosPost(...args) {
    return new Promise((resolve, reject) => {
        jsHelper.apply(exports.axios.post, exports.axios, args)
            .then((response) => {
            resolve(response);
        })
            .catch((err) => {
            reject(err);
        });
    });
}
/**
 *  wrapper over axios.post() so that it conforms to Bluebird Promise specifications
 */
exports.axiosPost = _axiosPost;
/**
*  a helper for constructing reusable endpoint functions
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
    520: Unknown Error:  any otherwise unhandled network issues will be returned as this
    522: Connection Timed Out:  could not connect to the server
    523: Origin Is Unreachable, ex:  DNS record not found
    524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
class EzEndpoint {
    constructor(
        /** default endpoint (domain+path) to connect to.  this can be overridden in the actual .post() or .get() method call*/
        endpointOptions, 
        /** default is to retry for up to 20 seconds, using a graceful exponential backoff */
        retryOptions = {}, 
        /** default is:  {
            timeout: 15000,
            headers: {
                "Accept-Encoding": "gzip, deflate"
            } */
        requestOptions = {}, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept = (err) => {
            if (err.response != null && err.response.status <= 499) {
                //console.assert(false, "err");					
                return Promise.reject(err);
            }
            else {
                return Promise.resolve();
            }
        }) {
        this.endpointOptions = endpointOptions;
        this.retryOptions = retryOptions;
        this.requestOptions = requestOptions;
        this.preRetryErrorIntercept = preRetryErrorIntercept;
        const defaultRetryOptions = { timeout: 20000, interval: 100, backoff: 2, max_interval: 5000 };
        const defaultRequestOptions = {
            timeout: 15000,
            headers: {
                /** by default allow server to send a compressed response */
                "Accept-Encoding": "gzip, deflate"
            }
        };
        // this.retryOptions = { ...defaultRetryOptions, ...retryOptions };
        // this.requestOptions = { ...defaultRequestOptions, ...requestOptions };
        this.requestOptions = _.defaultsDeep({}, requestOptions, defaultRequestOptions);
        this.retryOptions = _.defaultsDeep({}, retryOptions, defaultRetryOptions);
    }
    toJson() {
        return { endpointOptions: this.endpointOptions, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
    }
    _doRequest(protocol, 
        /** pass a payload to POST */
        submitPayload, 
        /**override defaults, pass undefined to skip */
        overrideRequestOptions = this.requestOptions, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions = this.retryOptions, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions = this.endpointOptions) {
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
            let endpoint = finalEndpointOptions.origin + finalEndpointOptions.path;
            let lastErrorResult = null;
            //************
            //retry loop
            return promise.retry(() => {
                //try {
                log.debug("EzEndpoint._doRequest() in promise.retry block");
                return Promise.try(() => {
                    /**
                     *  the actual HTTP request we send over the wire.
                     */
                    let axiosRequestPromise;
                    switch (protocol) {
                        case "post":
                            {
                                axiosRequestPromise = exports.axios.post(endpoint, submitPayload, finalRequestOptions);
                            }
                            break;
                        case "get":
                            {
                                axiosRequestPromise = exports.axios.get(endpoint, finalRequestOptions);
                            }
                            break;
                        default:
                            {
                                throw log.error(`EzEndpoint._doRequest() unknown protocol`, { protocol });
                            }
                    }
                    return new Promise((resolve, reject) => {
                        //wrap axios in a REAL promise call, as it's hacky promises really sucks and breaks Bluebird
                        axiosRequestPromise.then((axiosResponse) => { resolve(axiosResponse); })
                            .catch((axiosErr) => {
                            reject(axiosErr);
                        });
                    })
                        .then((result) => {
                        log.debug("EzEndpoint._doRequest() got valid response");
                        return Promise.resolve(result);
                    }, (err) => {
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
                                            data: undefined,
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
                                            data: undefined,
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
                                            data: undefined,
                                            headers: {},
                                        };
                                    }
                                    break;
                            }
                        }
                        if (err.response != null) {
                            if (err.response.status === 0 && err.response.statusText === "" && err.response.data === "") {
                                //log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
                                err.response.status = 524;
                                err.response.statusText = "A Timeout Occurred: Request Aborted, EzEndpoint.requestOptions.timeout exceeded";
                                err.response.data = "Axios->EzEndpointFunction timeout.";
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
                                stopError["interceptResult"] = Promise.reject(rejectedErr);
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
                .catch((err) => {
                log.debug("EzEndpoint._doRequest()  retry catch");
                if (err.interceptResult != null) {
                    return err.interceptResult;
                }
                return Promise.reject(err);
            });
        });
    }
    post(
        /** pass a payload to POST */
        submitPayload, 
        /**override defaults, pass undefined to skip */
        overrideRequestOptions = this.requestOptions, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions = this.retryOptions, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions = this.endpointOptions) {
        return this._doRequest("post", submitPayload, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
    }
    get(
        /**override defaults, pass undefined to skip */
        overrideRequestOptions = this.requestOptions, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions = this.retryOptions, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions = this.endpointOptions) {
        return this._doRequest("get", undefined, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
    }
}
exports.EzEndpoint = EzEndpoint;
var _test;
(function (_test) {
    describe(__filename, () => {
        describe("EzEndpoint", () => {
            describe("success cases", () => {
                let test = it("basic ezEndpoint, roundtrip phantomjscloud", () => {
                    const testEzEndpoint = new EzEndpoint({ origin: "http://phantomjscloud.com", path: "/api/browser/v2/a-demo-key-with-low-quota-per-ip-address/" }, { timeout: 3000, interval: 100, backoff: 3 }, {});
                    const targetUrl = "https://example.com";
                    const requestPayload = {
                        pages: [
                            {
                                url: targetUrl,
                                renderType: "html",
                                outputAsJson: true,
                            }
                        ],
                    };
                    return testEzEndpoint.post(requestPayload)
                        .then((response) => {
                        log.assert(response.status === 200, "should get success response", { response });
                        log.assert(targetUrl === response.data.pageResponses[0].pageRequest.url, "response contents should contain a value of response.data.pageResponses[0].pageRequest.url that matchest targetUrl", { targetUrl, gotTargetUrl: response.data.pageResponses[0].pageRequest.url, response });
                    }, (err) => {
                        const axiosErr = err;
                        throw log.error("did not expect an axiosErr", { err });
                    });
                });
                // set timeout increase (default=2000ms) https://mochajs.org/#timeouts
                test.timeout(5000);
            });
            describe("fail cases", () => {
                let test = it("basic retry, 429 error", () => {
                    const testEzEndpoint = new EzEndpoint({ origin: "http://phantomjscloud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {});
                    return testEzEndpoint.post()
                        .then((response) => {
                        throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
                    }, (err) => {
                        const axiosErr = err;
                        if (axiosErr.response != null) {
                            log.assert(axiosErr.response.status === 429, "should have failed with 429 response", { axiosErr });
                        }
                        else {
                            throw log.error("expected a axiosErr but didn't get one", { err });
                        }
                    });
                });
                // set timeout increase (default=2000ms) https://mochajs.org/#timeouts
                test.timeout(5000);
                test = it("invalid domain", () => {
                    const testEzEndpoint = new EzEndpoint({ origin: "http://asdfasdfasdfasetasgoud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {});
                    return testEzEndpoint.post()
                        .then((response) => {
                        throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
                    }, (err) => {
                        //TODO: describe EzEndpoint fail error type, and add error definitions to bluebird
                        // // // // 	export interface AxiosErrorResponse<T> extends Error {
                        // // // // 	/** inherited from the Error object*/
                        // // // // 	name: "Error";
                        // // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
                        // // // // 	message: string;
                        // // // // 	/**
                        // // // // 	 * config that was provided to `axios` for the request
                        // // // // 	 */
                        // // // // 	config: AxiosXHRConfig<T>;
                        // // // // 	/** The server response.  ```undefined``` if no response from server (such as invalid url or network timeout */
                        // // // // 	response?: AxiosXHR<T>;
                        // // // // 	/** example ```ETIMEDOUT```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	code?: string;
                        // // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // failure?:{
                        // // // // 	name:string;
                        // // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
                        // // // // 	message: string;
                        // // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	code: string;
                        // // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	errno: string;
                        // // // // 	/** example ```getaddrinfo```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	syscall: string;
                        // // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	hostname: string;
                        // // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	host: string;
                        // // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
                        // // // // 	port: number;
                        // // // // };
                    });
                });
                // set timeout increase (default=2000ms) https://mochajs.org/#timeouts
                test.timeout(5000);
            });
        });
        describe("axios", () => {
            const targetUrl = "http://phantomjscloud.com/examples/helpers/requestdata";
            const samplePostPayload1 = { hi: 1, bye: "two", inner: { three: 4 } };
            const sampleHeader1 = { head1: "val1" };
            describe("success cases", () => {
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
            describe("fail cases", () => {
                it("basic fail e2e", () => {
                    return exports.axios.post("http://phantomjscloud.com/examples/helpers/statusCode/400", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 400 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        if (err.response == null) {
                            throw log.error("response should be defined", { err });
                        }
                        log.assert(err.config != null, "missing property config", { err });
                        log.assert(err.message != null, "missing property message", { err });
                        log.assert(err.name != null, "missing property name", { err });
                        log.assert(err.response != null, "missing property response", { err });
                        log.assert(err.stack != null, "missing property stack", { err });
                        log.assert(err.response.config != null, "missing property response.config", { err });
                        log.assert(err.response.data != null, "missing property response.data", { err });
                        log.assert(err.response.headers != null, "missing property response.headers", { err });
                        log.assert(err.response.status != null, "missing property response.status ", { err });
                        log.assert(err.response.statusText != null, "missing property response.statusText", { err });
                        log.assert(err.response.status === 400, "wrong status code.", { err });
                        return Promise.resolve();
                    });
                });
                const badUrl = "http://moo";
                let test = it("invlid url", () => {
                    return exports.axios.post(badUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with invalid url", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        //log.info("got error as expected", { err });
                        return Promise.resolve();
                    });
                });
                // set timeout increase (default=2000ms) https://mochajs.org/#timeouts
                test.timeout(5000);
                it("status 401 response", () => {
                    return exports.axios.post("http://phantomjscloud.com/examples/helpers/statusCode/401", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 401 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        if (err.response == null) {
                            throw log.error("response should be defined", { err });
                        }
                        log.assert(err.response.status === 401, "wrong status code.", { err });
                        return Promise.resolve();
                    });
                });
                it("status 429 response", () => {
                    return exports.axios.post("http://phantomjscloud.com/examples/helpers/statusCode/429", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 429 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        if (err.response == null) {
                            throw log.error("response should be defined", { err });
                        }
                        log.assert(err.response.status === 429, "wrong status code.", { err });
                        return Promise.resolve();
                    });
                });
                it("status 500 response", () => {
                    return exports.axios.post("http://phantomjscloud.com/examples/helpers/statusCode/500", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        if (err.response == null) {
                            throw log.error("response should be defined", { err });
                        }
                        log.assert(err.response.status === 500, "wrong status code.", { err });
                        return Promise.resolve();
                    });
                });
                it("status 503 response", () => {
                    return exports.axios.post("http://phantomjscloud.com/examples/helpers/statusCode/503", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
                        .then((axiosResponse) => {
                        throw log.error("should have failed with 503 error", { badUrl, axiosResponse });
                    })
                        .catch((err) => {
                        if (err.response == null) {
                            throw log.error("response should be defined", { err });
                        }
                        log.assert(err.response.status === 503, "wrong status code.", { err });
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
})(_test || (_test = {}));
//# sourceMappingURL=net.js.map