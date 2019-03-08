import * as promise from "../promise";
import { IAutoscalerOptions } from "../threading";
import * as axios from "axios";
export declare type IRemoteHttpEndpointOptions = IRemoteHttpEndpointOverrideOptions & {
    /** by default, all HTTP requests are made as soon as they are requested.  pass autoscaler options if your endpoint supports autoscaling.
    *
    IMPORTANT NOTE:  The remote endpoint Needs to return either HTTP 429 or 503 errors to represent ```"BACKOFF"``` messages.  all other errors will be treated normally.*/
    autoscalerOptions?: IAutoscalerOptions;
};
export interface IRemoteHttpEndpointOverrideOptions {
    /** the endpoint URL you will connect to */
    endpoint?: {
        origin?: string;
        path?: string;
    };
    /** if you want to retry failed requests.   from: https://www.npmjs.com/package/bluebird-retry
        * Options are:
    interval initial wait time between attempts in milliseconds (default 1000)

backoff if specified, increase interval by this factor between attempts

max_interval if specified, maximum amount that interval can increase to

timeout total time to wait for the operation to succeed in milliseconds

max_tries maximum number of attempts to try the operation (default 5)

predicate to be used as bluebird's Filtered Catch. func will be retried only if the predicate expectation is met, it will otherwise fail immediately.

throw_original to throw the last thrown error instance rather then a timeout error.
        * default is no retries. */
    retryOptions?: promise.retry.Options;
    /** optional settings sent with the request.  from: https://www.npmjs.com/package/axios
        * @default {
                timeout: 60000,
                headers: {
                    "Accept-Encoding": "gzip, deflate"
                } */
    requestOptions?: axios.AxiosRequestConfig;
    /** allows procedural aborting of retries (if any).
            return  ```ABORT``` to ABORT RETRY (stop immediately with the error passed to reject())
            return ```RETRY``` to retry the request according to retryOptions
            DEFAULT: by default, if you don't specify your own ```preRetryErrorIntercept``` function, will insert a function that will retry error 500 and above (assuming ```retryOptions``` are set) */
    preRetryErrorIntercept?: ((
    /** note: network issues are converted into err.response so you don't need to parse them differently.*/
    err: axios.AxiosError) => Promise<"RETRY" | "ABORT">);
}
/**
*  define a remote http endpoint for reuse in your application
* includes retry logic and exponential backoff.
* also improves error handling, in that network issues are converted into "err.response" objects with ```err.response.status``` values as Axios doesn't handle these nicely.
    520: Unknown Error:  any otherwise unhandled network issues will be returned as this
    522: Connection Timed Out:  could not connect to the server
    523: Origin Is Unreachable, ex:  DNS record not found
    524: A Timeout Occurred, requestOptions.timeout excceeded so request was aborted
*/
export declare class RemoteHttpEndpoint<TSubmitPayload, TRecievePayload> {
    /** default options that will be applied to all requests.  may be overridden by each actual .post() or .get() call */
    defaultOptions: IRemoteHttpEndpointOptions;
    constructor(
    /** default options that will be applied to all requests.  may be overridden by each actual .post() or .get() call */
    defaultOptions?: IRemoteHttpEndpointOptions);
    _onTooBusy: ((endpoint: RemoteHttpEndpoint<TSubmitPayload, TRecievePayload>) => any)[];
    /** autoscaler created if the constructor is passed autoscaler options */
    private autoscaler;
    toJson(): {
        options: IRemoteHttpEndpointOptions;
        autoscaler: {
            pendingCalls: number;
            activeCalls: number;
            metrics: {
                maxActive: number;
                tooBusyWaitStart: Date;
                activeCount: number;
                lastGrow: Date;
                lastMax: Date;
                lastTooBusy: Date;
                lastDecay: Date;
            };
            options: IAutoscalerOptions;
        };
    };
    post(
    /** pass a payload to POST */
    submitPayload?: TSubmitPayload, 
    /**override any default options if desired */
    overrideOptions?: IRemoteHttpEndpointOverrideOptions): Promise<axios.AxiosResponse<TRecievePayload>>;
    get(
    /**override any default options if desired */
    overrideOptions?: IRemoteHttpEndpointOverrideOptions): Promise<axios.AxiosResponse<TRecievePayload>>;
    private _doRequest;
    private _doRequest_send;
}
//# sourceMappingURL=remote-http-endpoint.d.ts.map