"use strict";
exports.axios = require("axios");
var promise = require("./promise");
var Promise = promise.bluebird;
var _ = require("lodash");
var logging = require("./logging");
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
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept) {
        if (retryOptions === void 0) { retryOptions = { timeout: 60000, interval: 100, backoff: 2, max_interval: 5000 }; }
        if (requestOptions === void 0) { requestOptions = { timeout: 60000 }; }
        if (preRetryErrorIntercept === void 0) { preRetryErrorIntercept = function (err) {
            if (err.status <= 499) {
                //console.assert(false, "err");					
                return Promise.reject(err);
            }
            else {
                return Promise.resolve();
            }
        }; }
        this.origin = origin;
        this.path = path;
        this.retryOptions = retryOptions;
        this.requestOptions = requestOptions;
        this.preRetryErrorIntercept = preRetryErrorIntercept;
    }
    EzEndpointFunction.prototype.toJson = function () {
        return { origin: this.origin, path: this.path, retryOptions: this.retryOptions, requestOptions: this.requestOptions };
    };
    EzEndpointFunction.prototype.post = function (submitPayload, 
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin, customPath) {
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
                    if (_this.preRetryErrorIntercept != null) {
                        var interceptedErrorResult = _this.preRetryErrorIntercept(err);
                        if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
                            throw log.error("EzEndpointFunction POST interceptResult() did not return a promise", { submitPayload: submitPayload, interceptedErrorResult: interceptedErrorResult });
                        }
                        if (interceptedErrorResult.isFulfilled() === false) {
                            throw log.error("EzEndpointFunction POST interceptResult() promise is not fulfilled", { submitPayload: submitPayload, interceptedErrorResult: interceptedErrorResult });
                        }
                        if (interceptedErrorResult.isRejected()) {
                            //rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
                            var stopError = new promise.retry.StopError("preRetryIntercept abort");
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
    EzEndpointFunction.prototype.get = function (
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions, customOrigin, customPath) {
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
                if (_this.preRetryErrorIntercept != null) {
                    var interceptedErrorResult = _this.preRetryErrorIntercept(err);
                    if (interceptedErrorResult == null || interceptedErrorResult.isRejected == null) {
                        throw log.error("EzEndpointFunction GET interceptResult() did not return a promise", { interceptedErrorResult: interceptedErrorResult });
                    }
                    if (interceptedErrorResult.isFulfilled() === false) {
                        throw log.error("EzEndpointFunction GET interceptResult() promise is not fulfilled", { interceptedErrorResult: interceptedErrorResult });
                    }
                    if (interceptedErrorResult.isRejected()) {
                        //rejected the error retry.  construct a "stopError" to abort axios retry functionality and return it.
                        var stopError = new promise.retry.StopError("preRetryIntercept abort");
                        stopError["interceptResult"] = interceptedErrorResult;
                        return Promise.reject(stopError);
                    }
                    else {
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