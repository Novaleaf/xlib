"use strict";
//export import axios = require("axios");
/** the axios httpClient library:  https://github.com/mzabriskie/axios */
exports.axios = require("axios");
var promise = require("./promise");
var Promise = promise.bluebird;
var _ = require("lodash");
var logging = require("./diagnostics/logging");
var log = new logging.Logger(__filename);
/**
*  a helper for constructing reusable endpoint functions
*/
var EzEndpointFunction = (function () {
    function EzEndpointFunction(origin, path, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions, 
        /** allows aborting retries (if any).  return null to continue retry normally,  return any non-null to abort retries and return the result you are returning.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryIntercept) {
        if (retryOptions === void 0) { retryOptions = { timeout: 60000, interval: 100, backoff: 2, max_interval: 5000 }; }
        if (requestOptions === void 0) { requestOptions = { timeout: 60000 }; }
        if (preRetryIntercept === void 0) { preRetryIntercept = function (err) {
            if (err.status <= 499) {
                //console.assert(false, "err");					
                return Promise.reject(err);
            }
            else {
                return null;
            }
        }; }
        this.origin = origin;
        this.path = path;
        this.retryOptions = retryOptions;
        this.requestOptions = requestOptions;
        this.preRetryIntercept = preRetryIntercept;
    }
    EzEndpointFunction.prototype.toJson = function () {
        return { origin: this.origin, path: this.path, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
    };
    EzEndpointFunction.prototype.post = function (submitPayload, /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin, customPath) {
        var _this = this;
        if (customOrigin === void 0) { customOrigin = this.origin; }
        if (customPath === void 0) { customPath = this.path; }
        log.debug("EzEndpointFunction .post() called");
        var lastErrorResult = null;
        return promise.retry(function () {
            try {
                log.debug("EzEndpointFunction .post() in promise.retry block");
                var endpoint = customOrigin + customPath;
                //log.debug("EzEndpointFunction axios.post", { endpoint });
                var finalRequestOptions = void 0;
                if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
                    finalRequestOptions = _this.requestOptions;
                }
                else {
                    finalRequestOptions = _.defaults({}, customRequestOptions, _this.requestOptions);
                }
                return exports.axios.post(endpoint, submitPayload, finalRequestOptions)
                    .then(function (result) {
                    log.debug("EzEndpointFunction .post() got valid response");
                    return Promise.resolve(result);
                }, function (err) {
                    log.debug("EzEndpointFunction .post() got err");
                    //log.info(err);
                    if (err.status === 0 && err.statusText === "" && err.data === "") {
                        //log.debug("EzEndpointFunction axios.post timeout.", { endpoint });
                        err.status = 524;
                        err.statusText = "A Timeout Occurred";
                        err.data = "Axios->EzEndpointFunction timeout.";
                    }
                    if (_this.preRetryIntercept != null) {
                        var interceptResult = _this.preRetryIntercept(err);
                        if (interceptResult != null) {
                            var stopError = new promise.retry.StopError("preRetryIntercept abort");
                            stopError["interceptResult"] = interceptResult;
                            return Promise.reject(stopError);
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
            .catch(function (err) {
            log.debug("EzEndpointFunction .post()  retry catch");
            if (err.interceptResult != null) {
                return err.interceptResult;
            }
            //let payloadStr = submitPayload == null ? "" : serialization.JSONX.inspectStringify(submitPayload);
            //let payloadStrSummarized = stringHelper.summarize(payloadStr, 2000);
            //log.error("failed ez call .post()", this.toJson(), err, lastErrorResult, payloadStr.length, payloadStrSummarized);
            return Promise.reject(err);
        });
    };
    EzEndpointFunction.prototype.get = function (/**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin, customPath) {
        var _this = this;
        if (customOrigin === void 0) { customOrigin = this.origin; }
        if (customPath === void 0) { customPath = this.path; }
        log.debug("EzEndpointFunction .get() called");
        return promise.retry(function () {
            var endpoint = customOrigin + customPath;
            //log.debug("EzEndpointFunction axios.get", { endpoint });
            //return axios.post<TRecievePayload>(endpoint, submitPayload, this.requestOptions) as any;
            var finalRequestOptions;
            if (customRequestOptions == null || Object.keys(customRequestOptions).length === 0) {
                finalRequestOptions = _this.requestOptions;
            }
            else {
                finalRequestOptions = _.defaults({}, customRequestOptions, _this.requestOptions);
            }
            return exports.axios.get(endpoint, finalRequestOptions)
                .then(function (result) {
                return Promise.resolve(result);
            }, function (err) {
                //log.info(err);
                if (err.status === 0 && err.statusText === "" && err.data === "") {
                    //log.debug("EzEndpointFunction axios.get timeout.", { endpoint });
                    err.status = 524;
                    err.statusText = "A Timeout Occurred";
                    err.data = "Axios->EzEndpointFunction timeout.";
                }
                if (_this.preRetryIntercept != null) {
                    var interceptResult = _this.preRetryIntercept(err);
                    if (interceptResult != null) {
                        var stopError = new promise.retry.StopError("preRetryIntercept abort");
                        stopError["interceptResult"] = interceptResult;
                        return Promise.reject(stopError);
                    }
                }
                return Promise.reject(err);
            });
        }, this.retryOptions).catch(function (err) {
            if (err.interceptResult != null) {
                return err.interceptResult;
            }
            //og.error("failed ez call .get()", this.toJson(), err);
            return Promise.reject(err);
        });
    };
    return EzEndpointFunction;
}());
exports.EzEndpointFunction = EzEndpointFunction;
//# sourceMappingURL=net.js.map