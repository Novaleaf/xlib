/** the axios httpClient library:  https://github.com/mzabriskie/axios */
export import axios = require("axios");
import promise = require("./promise");
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
    /** allows aborting retries (if any).  return null to continue retry normally,  return any non-null to abort retries and return the result you are returning.
    NOTE:   error's of statusCode 545 are request timeouts
    DEFAULT:  by default we will retry error 500 and above. */
    preRetryIntercept: (err: Axios.AxiosXHR<TRecievePayload>) => Promise<TRecievePayload>;
    constructor(origin?: string, path?: string, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, 
        /** allows aborting retries (if any).  return null to continue retry normally,  return any non-null to abort retries and return the result you are returning.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryIntercept?: (err: Axios.AxiosXHR<TRecievePayload>) => Promise<TRecievePayload>);
    toJson(): {
        origin: string;
        path: string;
        retryOptions: promise._BluebirdRetryInternals.IOptions;
        requestOptions: Axios.AxiosXHRConfigBase<TRecievePayload>;
    };
    post(submitPayload?: TSubmitPayload, /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string, customPath?: string): Promise<Axios.AxiosXHR<TRecievePayload>>;
    get(/**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: Axios.AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string, customPath?: string): Promise<Axios.AxiosXHR<TRecievePayload>>;
}
