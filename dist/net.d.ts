/** the axios httpClient library:  https://github.com/mzabriskie/axios */
/** definition of axios */
export import _axiosDTs = require("./internal/definitions/axios-d");
/**
 * a low-level, but promise based http(s) library.
 *
 * **IMPORTANT**: recomend you DO NOT use this directly, as it does not provide retry logic.
 * instead, use the ``EzEndpoint`` we offer instead
 */
export declare let axios: _axiosDTs.AxiosStatic;
import * as promise from "./promise";
import Promise = promise.bluebird;
/**
*  a helper for constructing reusable endpoint functions
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
    520: Unknown Error:  any otherwise unhandled network issues will be returned as this
    522: Connection Timed Out:  could not connect to the server
    523: Origin Is Unreachable, ex:  DNS record not found
    524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
export declare class EzEndpoint<TSubmitPayload, TRecievePayload> {
    /** default endpoint (domain+path) to connect to.  this can be overridden in the actual .post() or .get() method call*/
    endpointOptions: {
        /** if you don't set this, you'll need to pass it to every call to .post() or .get() */
        origin?: string;
        /** if you don't set this, you'll need to pass it to every call to .post() or .get() */
        path?: string;
    };
    /** default is to retry for up to 20 seconds, using a graceful exponential backoff */
    retryOptions: promise._BluebirdRetryInternals.IOptions;
    /** default is to timeout (err 524) after 15 seconds*/
    requestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
    /** allows aborting retries (if any).
    return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
    return a Promise.resolve() to signal that the request should be retried.
    DEFAULT:  by default we will retry error 500 and above. */
    preRetryErrorIntercept: (
        /** note: network issues are converted into err.response so you don't need to parse them differently.*/
        err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => Promise<void>;
    constructor(
        /** default endpoint (domain+path) to connect to.  this can be overridden in the actual .post() or .get() method call*/
        endpointOptions: {
        /** if you don't set this, you'll need to pass it to every call to .post() or .get() */
        origin?: string;
        /** if you don't set this, you'll need to pass it to every call to .post() or .get() */
        path?: string;
    }, 
        /** default is to retry for up to 20 seconds, using a graceful exponential backoff */
        retryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /** default is to timeout (err 524) after 15 seconds*/
        requestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept?: (
        /** note: network issues are converted into err.response so you don't need to parse them differently.*/
        err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => Promise<void>);
    toJson(): {
        endpointOptions: {
            origin?: string | undefined;
            path?: string | undefined;
        };
        retryOptions: promise._BluebirdRetryInternals.IOptions;
        requestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
    };
    private _doRequest(protocol, 
        /** pass a payload to POST */
        submitPayload?, 
        /**override defaults, pass undefined to skip */
        overrideRequestOptions?, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions?, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions?);
    post(
        /** pass a payload to POST */
        submitPayload?: TSubmitPayload, 
        /**override defaults, pass undefined to skip */
        overrideRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions?: {
        origin?: string;
        path?: string;
    }): Promise<_axiosDTs.AxiosXHR<TRecievePayload>>;
    get(
        /**override defaults, pass undefined to skip */
        overrideRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, 
        /**override defaults, pass undefined to skip */
        overrideRetryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /**override defaults, pass undefined to skip */
        overrideEndpointOptions?: {
        origin?: string;
        path?: string;
    }): Promise<_axiosDTs.AxiosXHR<TRecievePayload>>;
}
