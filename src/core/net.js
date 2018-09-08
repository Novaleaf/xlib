"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise = require("./promise");
var bb = promise.bluebird;
const _ = require("lodash");
const logging = require("./diagnostics/logging");
let log = new logging.Logger(__filename);
const jsHelper = require("./jshelper");
//import compression = require("./compression");
//export import axios = require("axios");
/** the axios httpClient library:  https://github.com/mzabriskie/axios */
//export import axios = require("axios");
//import * as axios from "axios";
//export { axios };
/** definition of axios */
exports._axiosDTs = require("../definitions/axios-d");
/**
 * a low-level, but promise based http(s) library.
 *
 * **IMPORTANT**: recomend you DO NOT use this directly, as it does not provide retry logic.
 * instead, use the ``EzEndpoint`` we offer instead.
 * If you do use axios directly, be aware that though it returns something that appears to be a promise, it is NOT BLUEBIRD COMPATABLE for error handling, and so you will want to wrap it in a 'new Promise((resolve,reject)=>{ axios.... })' block.
 */
exports.axios = require("axios");
function _axiosPost(...args) {
    return new bb((resolve, reject) => {
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
    preRetryErrorIntercept = (err) => __awaiter(this, void 0, void 0, function* () {
        if (err.response != null && err.response.status <= 499) {
            //console.assert(false, "err");					
            return bb.reject(err);
        }
        else {
            return bb.resolve();
        }
    })) {
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
    overrideRequestOptions = {}, 
    /**override defaults, pass undefined to skip */
    overrideRetryOptions = {}, 
    /**override defaults, pass undefined to skip */
    overrideEndpointOptions = {}) {
        log.debug(`EzEndpoint._doRequest() called`, { protocol });
        return bb.try(() => {
            //copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
            let finalEndpointOptions = _.defaultsDeep({}, overrideEndpointOptions, this.endpointOptions);
            let finalRequestOptions = _.defaultsDeep({}, overrideRequestOptions, this.requestOptions);
            let finalRetryOptions = _.defaultsDeep({}, overrideRetryOptions, this.retryOptions);
            if (finalEndpointOptions.origin == null || finalEndpointOptions.path == null) {
                throw log.error("can not make endpoint request.  missing required endpointOptions", { finalEndpointOptions });
            }
            let endpoint = finalEndpointOptions.origin + finalEndpointOptions.path;
            if (protocol === "get" && submitPayload != null) {
                throw log.error("EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { finalEndpointOptions, submitPayload });
            }
            // //compress payload, maybe.
            // return new Promise<TSubmitPayload>(( resolve, reject ) => {
            // 	if ( submitPayload == null || finalRequestOptions.ezGzipPostPayload !== true ) {
            // 		return resolve( submitPayload );
            // 	}
            // 	const buff = Buffer.from( JSON.stringify( submitPayload ) );
            // 	//compression.zlib.deflate( buff, ( err, result ) => {
            // 	compression.zlib.gzip( buff, ( err, result ) => {
            // 		if ( err != null ) {
            // 			return reject( err );
            // 		}
            // 		//set proper headers to inform of compressed payload
            // 		if ( finalRequestOptions.headers == null ) {
            // 			finalRequestOptions.headers = {};
            // 		}
            // 		let compressedStr = result.toString( "utf8" );
            // 		finalRequestOptions.headers[ "Content-Encoding" ] = "gzip";
            // 		//finalRequestOptions.headers[ "Transfer-Encoding" ] = "chunked";
            // 		finalRequestOptions.headers[ "Content-Length" ] = `${compressedStr.length}`;
            // 		//finalRequestOptions.headers[ "content-encoding" ] = "deflate";
            // 		//finalRequestOptions.headers[ "content-type" ] = "application/json; charset=utf-8";
            // 		//result.toString("utf8")
            // 		log.warn( "compressStr len = ", compressedStr.length );
            // 		return resolve( compressedStr as any );
            // 	} );
            // } )
            // 	.then(( submitPayload ) => {
            return bb.try(() => {
                let lastErrorResult = null;
                //************
                //retry loop
                return promise.retry(() => {
                    //try {
                    log.debug("EzEndpoint._doRequest() in promise.retry block");
                    return bb.try(() => {
                        /**
                         *  the actual HTTP request we send over the wire.
                         */
                        let axiosRequestPromise;
                        switch (protocol) {
                            case "post":
                                {
                                    //axios.post(endpoint,null,{})
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
                        return new bb((resolve, reject) => {
                            //wrap axios in a REAL promise call, as it's hacky promises really sucks and breaks Bluebird
                            axiosRequestPromise.then((axiosResponse) => { resolve(axiosResponse); })
                                .catch((axiosErr) => {
                                reject(axiosErr);
                            });
                        })
                            .then((result) => {
                            log.debug("EzEndpoint._doRequest() got valid response");
                            return bb.resolve(result);
                        }, (err) => {
                            log.debug(`EzEndpoint._doRequest() got err`, err.message, this.endpointOptions);
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
                                    return bb.reject(err);
                                }, (rejectedErr) => {
                                    //rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
                                    let stopError = new promise.retry.StopError("preRetryIntercept abort");
                                    stopError["interceptResult"] = bb.reject(rejectedErr);
                                    return bb.reject(stopError);
                                });
                            }
                            lastErrorResult = err;
                            return bb.reject(err);
                        });
                    });
                    //} catch (errThrown) {
                    //	log.debug("EzEndpoint._doRequest() in root promise.retry block,  got errThrown", errThrown.toString());
                    //	throw errThrown;
                    //}
                }, finalRetryOptions)
                    //***************  finished retry loop
                    .catch((err) => {
                    log.debug("EzEndpoint._doRequest()  retry catch");
                    if (err.interceptResult != null) {
                        return err.interceptResult;
                    }
                    return bb.reject(err);
                });
            });
        });
    }
    post(
    /** pass a payload to POST */
    submitPayload, 
    /**override defaults, pass undefined to skip */
    overrideRequestOptions, 
    /**override defaults, pass undefined to skip */
    overrideRetryOptions, 
    /**override defaults, pass undefined to skip */
    overrideEndpointOptions) {
        return this._doRequest("post", submitPayload, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
    }
    get(
    /**override defaults, pass undefined to skip */
    overrideRequestOptions, 
    /**override defaults, pass undefined to skip */
    overrideRetryOptions, 
    /**override defaults, pass undefined to skip */
    overrideEndpointOptions) {
        return this._doRequest("get", undefined, overrideRequestOptions, overrideRetryOptions, overrideEndpointOptions);
    }
}
exports.EzEndpoint = EzEndpoint;
//# sourceMappingURL=net.js.map