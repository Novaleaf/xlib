/// <reference types="axios" />
/// <reference types="bluebird" />
/** the axios httpClient library:  https://github.com/mzabriskie/axios */
import * as axios from "axios";
export { axios };
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
    requestOptions: Axios.AxiosXHRConfigBase<TRecievePayload>;
    /** allows aborting retries (if any).
    return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
    return a Promise.resolve() to signal that the request should be retried.
    NOTE:   error's of statusCode 545 are request timeouts
    DEFAULT:  by default we will retry error 500 and above. */
    preRetryErrorIntercept: (err: Axios.AxiosXHR<TRecievePayload>) => Promise<void>;
    constructor(origin?: string, path?: string, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept?: (err: Axios.AxiosXHR<TRecievePayload>) => Promise<void>);
    toJson(): {
        origin: string | undefined;
        path: string | undefined;
        retryOptions: promise._BluebirdRetryInternals.IOptions;
        requestOptions: Axios.AxiosXHRConfigBase<TRecievePayload>;
    };
    post(submitPayload?: TSubmitPayload, 
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<Axios.AxiosXHR<TRecievePayload>>;
    get(
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<Axios.AxiosXHR<TRecievePayload>>;
}
