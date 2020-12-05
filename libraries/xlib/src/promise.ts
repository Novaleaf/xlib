

import * as _imports from "./_imports"
import * as diag from "./diagnostics"


/** a promise that resolves after an amount of time.   good for delaying execution
 */
export function delay( ms: number ): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		setTimeout( () => resolve(), ms )
	} )
}


export interface IRetryOptions {
	/**  return true to accept the result (or error).  if not provided, will return false when an error is raised (retry will be attempted) */
	//acceptResult?: <TResult, TPromise extends PromiseLike<TResult>>( details: { err?: Error, result?: TResult, promise: TPromise } ) => boolean;
	acceptResult?: <TResult, TPromise extends PromiseLike<TResult>>( details: { isSuccess: boolean, err?: Error, result?: TResult, promise: TPromise } ) => boolean; //( details:{ result: TResult } ) => boolean;
	maxRetries: number;
	minDelay?: number;
	maxDelay?: number;



	expGrowDelay?: number;
}

/** error that is thrown by the [[retry]] method if number of retries is exceeded */
export class RetryExceededError<TResult> extends diag.exception.XlibException {
	// constructor( message: string, result: { err?: Error, value?: TResult }, innerError?: Error ) {
	// 	super( message, { details: { result }, innerError } );
	// }
}
/**
 * retries a failed promise untill success or exit condition occurs
 * @param options 
 * @param fn 
 */
export async function retry<TResult, TPromise extends PromiseLike<TResult>>( options: IRetryOptions, fn: () => TPromise ): Promise<TResult> {

	const requiredOptions = {
		//default implementation

		acceptResult: ( { isSuccess, err, result, promise } ) => { return isSuccess === true },
		//maxRetries: 1,
		minDelay: 0,
		maxDelay: Number.MAX_SAFE_INTEGER,
		expGrowDelay: 1.5,
		...options

	} as Required<IRetryOptions>

	let attempts = 0
	let lastDelayMs = 0

	/** decide if should retry, and if should delay, does so */
	async function shouldRetry() {
		if ( attempts > requiredOptions.maxRetries ) throw new RetryExceededError( `too many attempts.   maxRetries=${ requiredOptions.maxRetries }  attempts=${ attempts }` )

		//calc delay amount
		let delayMs = Math.max( requiredOptions.minDelay, lastDelayMs )
		delayMs = Math.pow( delayMs, requiredOptions.expGrowDelay )
		delayMs *= ( 0.9 + ( Math.random() * 0.2 ) ) //randomize by 0.9 to 1.1
		//clamp
		delayMs = Math.max( requiredOptions.minDelay, delayMs )
		delayMs = Math.min( delayMs, requiredOptions.maxDelay )

		//do the delay
		await delay( delayMs )
		// eslint-disable-next-line require-atomic-updates
		lastDelayMs = delayMs


	}

	//retry loop
	while ( true ) {

		await shouldRetry()
		//let shouldContinue = 
		// if ( !shouldContinue ) {
		// 	break;
		// }
		attempts++


		const promise = fn()
		try {
			const result = await promise
			if ( requiredOptions.acceptResult( { isSuccess: true, result, promise } ) ) {
				return promise
			} else {
				//try again
				continue
			}
		} catch ( err ) {
			if ( requiredOptions.acceptResult( { isSuccess: false, err, promise } ) ) {
				return promise
			} else {
				//try again
				continue
			}
		}


	}
	//too many attempts
	throw new diag.exception.XlibException( "should not get here" )


}