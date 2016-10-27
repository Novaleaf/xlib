/** the axios httpClient library:  https://github.com/mzabriskie/axios */
import _axiosCustomDefinitions = require("./internal/definitions/axios-d");
export declare let axios: _axiosCustomDefinitions.AxiosStatic;
import * as promise from "./promise";
import Promise = promise.bluebird;
/**
 * HTTP Basic auth details
 */
export interface AxiosHttpBasicAuth {
    username: string;
    password: string;
}
/**
 * Common axios XHR config interface
 * <T> - request body data type
 */
export interface AxiosXHRConfigBase<T> {
    /**
     * will be prepended to `url` unless `url` is absolute.
     * It can be convenient to set `baseURL` for an instance
     * of axios to pass relative URLs to methods of that instance.
     */
    baseURL?: string;
    /**
     * custom headers to be sent
     */
    headers?: Object;
    /**
     * URL parameters to be sent with the request
     */
    params?: Object;
    /**
     * optional function in charge of serializing `params`
     * (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
     */
    paramsSerializer?: (params: Object) => string;
    /**
     * specifies the number of milliseconds before the request times out.
     * If the request takes longer than `timeout`, the request will be aborted.
     */
    timeout?: number;
    /**
     * indicates whether or not cross-site Access-Control requests
     * should be made using credentials
     */
    withCredentials?: boolean;
    /**
     * indicates that HTTP Basic auth should be used, and supplies
     * credentials. This will set an `Authorization` header,
     * overwriting any existing `Authorization` custom headers you have
     * set using `headers`.
     */
    auth?: AxiosHttpBasicAuth;
    /**
     * indicates the type of data that the server will respond with
     * options are 'arraybuffer', 'blob', 'document', 'json', 'text'
     */
    responseType?: string;
    /**
     * name of the cookie to use as a value for xsrf token
     */
    xsrfCookieName?: string;
    /**
     * name of the http header that carries the xsrf token value
     */
    xsrfHeaderName?: string;
    /**
     * Change the request data before it is sent to the server.
     * This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
     * The last function in the array must return a string or an ArrayBuffer
     */
    transformRequest?: (<U>(data: T) => U) | [<U>(data: T) => U];
    /**
     * change the response data to be made before it is passed to then/catch
     */
    transformResponse?: <U>(data: T) => U;
}
/**
 * <T> - request body data type
 */
export interface AxiosXHRConfig<T> extends AxiosXHRConfigBase<T> {
    /**
     * server URL that will be used for the request, options are:
     * GET, PUT, POST, DELETE, CONNECT, HEAD, OPTIONS, TRACE, PATCH
     */
    url: string;
    /**
     * request method to be used when making the request
     */
    method?: string;
    /**
     * data to be sent as the request body
     * Only applicable for request methods 'PUT', 'POST', and 'PATCH'
     * When no `transformRequest` is set, must be a string, an ArrayBuffer or a hash
     */
    data?: T;
}
/**
 * <T> - expected response type,
 * <U> - request body data type
 */
export interface AxiosXHR<T> {
    /**
     * Response that was provided by the server
     */
    response: {
        /**
         * config that was provided to `axios` for the request
         */
        config: AxiosXHRConfig<T>;

        data: T;
        /**
         * headers that the server responded with
         */
        headers: Object;
        /**
         * HTTP status code from the server response
         */
        status: number;
        /**
         * HTTP status message from the server response
         */
        statusText: string;

        request: XMLHttpRequest;
    
    }
    /**
     * config that was provided to `axios` for the request
     */
    config: AxiosXHRConfig<T>;
}
/**
*  a helper for constructing reusable endpoint functions
*/
export declare class EzEndpointFunction<TSubmitPayload, TRecievePayload> {
    origin: string;
    path: string;
    /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
    retryOptions: promise._BluebirdRetryInternals.IOptions;
    /** default is to timeout (err 545) after 60 seconds*/
    requestOptions: AxiosXHRConfigBase<TRecievePayload>;
    /** allows aborting retries (if any).
    return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
    return a Promise.resolve() to signal that the request should be retried.
    NOTE:   error's of statusCode 545 are request timeouts
    DEFAULT:  by default we will retry error 500 and above. */
    preRetryErrorIntercept: (err: AxiosXHR<TRecievePayload>) => Promise<void>;
    constructor(origin?: string, path?: string, 
        /** default is to retry for up to 10 seconds, (no retries after 10 seconds) */
        retryOptions?: promise._BluebirdRetryInternals.IOptions, 
        /** default is to timeout (err 545) after 60 seconds*/
        requestOptions?: AxiosXHRConfigBase<TRecievePayload>, 
        /** allows aborting retries (if any).
        return a Promise.reject() to ABORT RETRY (stop immediately with the error passed to reject())
        return a Promise.resolve() to signal that the request should be retried.
        NOTE:   error's of statusCode 545 are request timeouts
        DEFAULT:  by default we will retry error 500 and above. */
        preRetryErrorIntercept?: (err: AxiosXHR<TRecievePayload>) => Promise<void>);
    toJson(): {
        origin: string | undefined;
        path: string | undefined;
        retryOptions: promise._BluebirdRetryInternals.IOptions;
        requestOptions: AxiosXHRConfigBase<TRecievePayload>;
    };
    post(submitPayload?: TSubmitPayload, 
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<AxiosXHR<TRecievePayload>>;
    get(
        /**setting a key overrides the key put in ctor.requestOptions. */ customRequestOptions?: AxiosXHRConfigBase<TRecievePayload>, customOrigin?: string | undefined, customPath?: string | undefined): Promise<AxiosXHR<TRecievePayload>>;
}
