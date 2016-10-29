/** the axios httpClient library:  https://github.com/mzabriskie/axios */
/** definition of axios */
export import _axiosDTs = require("./internal/definitions/axios-d");
export declare let axios: _axiosDTs.AxiosStatic;
import * as promise from "./promise";
import Promise = promise.bluebird;
/**
*  a helper for constructing reusable endpoint functions
*/
export declare class EzEndpointFunction<TSubmitPayload, TRecievePayload> {
    origin: string;
    path: string;
    /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
    retryOptions: promise._BluebirdRetryInternals.IOptions;
    /** default is to timeout (err 545) after 60 seconds*/
    requestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
    /** allows aborting retries (if any).
    return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
    return a Promise.resolve() to signal that the request should be retried.
    NOTE:   error's of statusCode 545 are request timeouts
    DEFAULT:  by default we will retry error 500 and above. */
    preRetryErrorIntercept: (err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => Promise<void>;
    constructor(origin?: string, path?: string, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept?: (err: _axiosDTs.AxiosErrorResponse<TRecievePayload>) => Promise<void>);
    toJson(): {
        origin: string | undefined;
        path: string | undefined;
        retryOptions: promise._BluebirdRetryInternals.IOptions;
        requestOptions: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>;
    };
    post(submitPayload?: TSubmitPayload, 
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<_axiosDTs.AxiosXHR<TRecievePayload>>;
    get(
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: _axiosDTs.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<_axiosDTs.AxiosXHR<TRecievePayload>>;
}
