"use strict";
/** http client library: https://github.com/hapijs/wreck
part of the hapi ecosystem */
exports.Wreck = require("wreck");
/**
 * promise wrapper over Wreck library
 */
var HttpClientUtilities = (function () {
    function HttpClientUtilities(defaultOptions, defaultWreck) {
        this.defaultOptions = defaultOptions;
        if (defaultWreck == null) {
            defaultWreck = exports.Wreck;
        }
        if (defaultOptions != null) {
            this.__wreck = defaultWreck.defaults(defaultOptions);
        }
        else {
            this.__wreck = defaultWreck.defaults({});
        }
    }
    HttpClientUtilities.prototype.defaults = function (options) {
        return new HttpClientUtilities(options, this.__wreck);
    };
    HttpClientUtilities.prototype.request = function (/** "GET"|"POST" | "PUT" | "DELETE" */ method, uri, options) {
        var _this = this;
        try {
            var clientRequest;
            var toReturn = new Promise(function (resolve, reject) {
                clientRequest = _this.__wreck.request(method, uri, options, function (err, response) {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        resolve(response);
                    }
                });
            });
            toReturn.clientRequest = clientRequest;
            return toReturn;
        }
        catch (err) {
            console.log("HttpClientUtilities.request.err", err);
            return Promise.reject(err);
        }
    };
    HttpClientUtilities.prototype.read = function (response, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.__wreck.read(response, options, function (err, payload) {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve(payload);
                }
            });
        });
    };
    /**
     * send and receive an object via POST
     * this is a wrapper over .request() and .read() for fast "basic scenario" use.
     * @param uri
     * @param sendPayload
     */
    HttpClientUtilities.prototype.ezPostRoundtrip = function (uri, sendPayload) {
        var _this = this;
        return this.request("POST", uri, { payload: JSON.stringify(sendPayload) }).then(function (incommingMessage) {
            return _this.read(incommingMessage, { json: true });
        });
    };
    return HttpClientUtilities;
})();
exports.HttpClientUtilities = HttpClientUtilities;
exports.httpClientUtilities = new HttpClientUtilities();
//# sourceMappingURL=httpclient.js.map