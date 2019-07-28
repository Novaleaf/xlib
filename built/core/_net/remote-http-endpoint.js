"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
//import Bluebird from "bluebird";
const promise = tslib_1.__importStar(require("../promise"));
const bb = require("bluebird");
const _ = tslib_1.__importStar(require("lodash"));
const diagnostics = tslib_1.__importStar(require("../diagnostics"));
const log = diagnostics.log; // new diagnostics.Logger( __filename );
log.overrideLogLevel("WARN");
const threading_1 = require("../threading");
//import compression = require("./compression");
//export import axios = require("axios");
const axios = tslib_1.__importStar(require("axios"));
/**
*  define a remote http endpoint for reuse in your application
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
    520: Unknown Error:  any otherwise unhandled network issues will be returned as this
    522: Connection Timed Out:  could not connect to the server
    523: Origin Is Unreachable, ex:  DNS record not found
    524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
class RemoteHttpEndpoint {
    constructor(
    /** default options that will be applied to all requests.  may be overridden by each actual .post() or .get() call */
    defaultOptions = {}) {
        this.defaultOptions = defaultOptions;
        this._onTooBusy = [];
        let defaults = {
            preRetryErrorIntercept: (async (err) => {
                if (err.response != null && err.response.status <= 499) {
                    //console.assert(false, "err");
                    return "ABORT";
                }
                return "RETRY";
            }),
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
        this.defaultOptions = _.defaultsDeep({}, defaultOptions, defaults);
        if (this.defaultOptions.autoscalerOptions != null) {
            this.autoscaler = new threading_1.Autoscaler(this.defaultOptions.autoscalerOptions, this._doRequest_send.bind(this), (err) => {
                if (err.response != null) {
                    switch (err.response.status) {
                        case 503:
                        case 429:
                            //notify listeners
                            if (this._onTooBusy.length > 0) {
                                this._onTooBusy.forEach((fcn) => { fcn(this); });
                            }
                            return "TOO_BUSY";
                    }
                }
                return "FAIL";
            });
        }
    } //end .ctor()
    toJson() {
        return { options: this.defaultOptions, autoscaler: this.autoscaler != null ? this.autoscaler.toJson() : undefined };
    }
    post(
    /** pass a payload to POST */
    submitPayload, 
    /**override any default options if desired */
    overrideOptions) {
        return this._doRequest("post", submitPayload, overrideOptions);
    }
    get(
    /**override any default options if desired */
    overrideOptions) {
        return this._doRequest("get", undefined, overrideOptions);
    }
    async _doRequest(protocol, 
    /** pass a payload to POST */
    submitPayload, 
    /**override defaults */
    overrideOptions = {}) {
        log.debug(`EzEndpoint._doRequest() called`, { protocol });
        //copy parameters from our overrides, in an additive manner, allowing for example, customizing the origin while keeping the default path.
        let finalOptions = _.defaultsDeep({}, overrideOptions, this.defaultOptions);
        if (finalOptions.endpoint.origin == null || finalOptions.endpoint.path == null) {
            throw log.error("can not make endpoint request.  missing required endpoint options.  need both origin and path specified.", { endpoint: finalOptions.endpoint });
        }
        let endpoint = finalOptions.endpoint.origin + finalOptions.endpoint.path;
        if (protocol === "get" && submitPayload != null) {
            throw log.error("EzEndpoint._doRequest() submit payload was passed to a GET request, this is not supported by Axios and most endpoints", { protocol, finalOptions, submitPayload });
        }
        if (this.autoscaler == null) {
            return this._doRequest_send(finalOptions, endpoint, protocol, submitPayload);
        }
        else {
            return this.autoscaler.submitRequest(finalOptions, endpoint, protocol, submitPayload);
        }
    }
    async _doRequest_send(finalOptions, endpoint, protocol, submitPayload) {
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
                    let axiosRequestPromise; // axios.AxiosPromise<TRecievePayload>;
                    switch (protocol) {
                        case "post":
                            {
                                //axios.post(endpoint,null,{})
                                //console.warn( "axios post", endpoint, submitPayload, finalOptions.requestOptions );
                                axiosRequestPromise = bb.resolve(axios.default.post(endpoint, submitPayload, finalOptions.requestOptions));
                            }
                            break;
                        case "get":
                            {
                                axiosRequestPromise = bb.resolve(axios.default.get(endpoint, finalOptions.requestOptions));
                            }
                            break;
                        default:
                            {
                                throw log.error(`EzEndpoint._doRequest() unknown protocol`, { protocol });
                            }
                    }
                    return new promise.bluebird((resolve, reject) => {
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
                        log.debug(`EzEndpoint._doRequest() got err`, err.message, finalOptions);
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
                        if (finalOptions.preRetryErrorIntercept != null) {
                            return finalOptions.preRetryErrorIntercept(err)
                                .then((interceptDecision) => {
                                switch (interceptDecision) {
                                    case "RETRY":
                                        //do nothing special, ie the error gets returned back and axios retry functionality tries to kick in.
                                        lastErrorResult = err;
                                        return bb.reject(err);
                                    case "ABORT":
                                        //rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
                                        let stopError = new promise.retry.StopError("preRetryIntercept abort");
                                        stopError["interceptResult"] = bb.reject(err);
                                        return bb.reject(stopError);
                                }
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
            }, finalOptions.retryOptions)
                //***************  finished retry loop
                .catch((err) => {
                log.debug("EzEndpoint._doRequest()  retry catch");
                if (err.interceptResult != null) {
                    return err.interceptResult;
                }
                return bb.reject(err);
            });
        });
    }
}
exports.RemoteHttpEndpoint = RemoteHttpEndpoint;
//# sourceMappingURL=remote-http-endpoint.js.map