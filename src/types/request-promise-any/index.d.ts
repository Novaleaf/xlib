
/** Type definitions 
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


}


// declare module "request-promise-any/errors" {
// 	import * as request from "request";
// 	import * as requestPromiseAny from "request-promise-any";
// 	/** if the request has options.simple=true and a non 2xxx code is returned, this Error type will be thrown */
// 	export class StatusCodeError extends Error {
// 		/** the non 2xx statusCode returned. */
// 		statusCode: number;
// 		/** the body of the response */
// 		error: string;
// 		options: requestPromiseAny.IOptions;
// 		response: request.Response;
// 	}	/** if the request fails for technical reasons, this Error type will be thrown */
// 	export class RequestError extends Error {
// 		/** the root cause passed by the request library */
// 		cause: Error;
// 		error: Error;
// 		options: requestPromiseAny.IOptions;
// 		response: request.Response;
// 	}

// }
