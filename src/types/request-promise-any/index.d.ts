
/** Type definitions for proxy-chain
 * Definitions by: Jason Swearingen
 */
declare module "request-promise-any" {

	import * as bb from "bluebird";
	import * as request from "request";


	export type IOptions = {
		/** a boolean to set whether status codes other than 2xx should also reject the promise 		 * 
		*/
		simple?: boolean;
		/**  a boolean to set whether the promise should be resolved with the full response or just the response body
		 * 
		 * For our simple type definitions, we require this to be set to TRUE
		 */
		resolveWithFullResponse: true;
	} & request.Options;

	export default function rp( options: IOptions ): bb<request.Response>;
	//export { rp as default };

	/** if the request has options.simple=true and a non 2xxx code is returned, this Error type will be thrown */
	export class StatusCodeError extends Error {
		/** the non 2xx statusCode returned. */
		statusCode: number;
		/** the body of the response */
		error: string;
		options: IOptions;
		response: request.Response;
	}	/** if the request fails for technical reasons, this Error type will be thrown */
	export class RequestError extends Error {
		/** the root cause passed by the request library */
		cause: Error;
		error: Error;
		options: IOptions;
		response: request.Response;
	}


	// 	import * as http from "http";
	// 	export interface IServerOptions {
	// 		/**  Port where the server will listen. By default 8000.*/
	// 		port: number;

	// 		/** Enables verbose logging */
	// 		verbose?: true;
	// 		/**
	// 				// Custom function to authenticate proxy requests and provide the URL to chained upstream proxy.
	// 				// It must return an object (or promise resolving to the object) with the following form:
	// 				// { requestAuthentication: Boolean, upstreamProxyUrl: String }
	// 				// If the function is not defined or is null, the server runs in simple mode. (simple tunnel direct)
	// 				 */
	// 		prepareRequestFunction?: ( requestDetails: {
	// 			/** An instance of http.IncomingMessage class with information about the client request
	// 				//                  (which is either HTTP CONNECT for SSL protocol, or other HTTP request) */
	// 			request: http.IncomingMessage;
	// 			/** Username parsed from the Proxy-Authorization header. Might be empty string. */
	// 			username: string;
	// 			/** Password parsed from the Proxy-Authorization header. Might be empty string. */
	// 			password: string;
	// 			/** Hostname of the target server */
	// 			hostname: string;
	// 			/** Port of the target server */
	// 			port: number;
	// 			/** If true, this is a HTTP request, otherwise it's a HTTP CONNECT tunnel for SSL
	// 				//                  or other protocols */
	// 			isHttp: boolean;
	// 			/** Unique ID of the HTTP connection. It can be used to obtain traffic statistics. */
	// 			connectionId: number;
	// 		} ) => PromiseLike<IServerPrepareResult> | IServerPrepareResult;
	// 	}

	// 	export interface IServerPrepareResult {
	// 		/** pass ```TRUE``` to reject authentication attempt (username or passwords do not match).  
	// 		 * 
	// 		 * if you pass ```FALSE``` (the default) the request is allowed.  */
	// 		requestAuthentication?: boolean;
	// 		/** // Sets up an upstream HTTP proxy to which all the requests are forwarded.
	// 						// If null, the proxy works in direct mode, i.e. the connection is forwarded directly
	// 						// to the target server.
	// 						example: ```http://username:password@proxy.example.com:3128```
	// 						 */
	// 		upstreamProxyUrl?: string;

	// 		/**Custom responses allow you to override the response to a HTTP requests to the proxy, without contacting any target host. 
	// 		 * For example, this is useful if you want to provide a HTTP proxy-style interface to an external API or respond with some custom page to certain requests. 
	// 		 * Note that this feature is only available for HTTP connections. That's because HTTPS connections cannot be intercepted without access to the target host's private key.

	// To provide a custom response, the result of the prepareRequestFunction function must define the customResponseFunction property, 
	// which contains a function that generates the custom response. 
	// The function is passed no parameters and it must return an object (or a promise resolving to an object) with signature from [[ICustomResponse]] */
	// 		customResponseFunction?: () => PromiseLike<ICustomResponse> | ICustomResponse;
	// 	}

	// 	/** see [[prepareRequestFunction.customResponseFunction]] */
	// 	export interface ICustomResponse {
	// 		/** Optional HTTP status code of the response. By default it is 200. */
	// 		statusCode?: number;

	// 		/**Optional HTTP headers of the response */
	// 		headers?: Record<string, string>

	// 		/**Optional string with the body of the HTTP response */
	// 		body?: string,

	// 		/**Optional encoding of the body. If not provided, defaults to 'UTF-8' */
	// 		encoding?: string;
	// 	}

	// 	export class Server extends http.Server {
	// 		constructor( options: IServerOptions );

	// 		//listen( callback: () => void ): void;
	// 	}


}
