

import * as _imports from "./_imports"
import * as diag from "./diagnostics"


/** a promise that resolves after an amount of time.   good for delaying execution
 */
export function delay( ms: number ): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		setTimeout( () => resolve(), ms )
	} )
}

/** options passes to the retry method
 * @see retry  */
export interface IRetryOptions {
	/**  return true to accept the result (or error).  if not provided, will return false when a promise failure occurs (retry will be attempted) */
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

	options = {
		//default implementation

		acceptResult: ( { isSuccess, err, result, promise } ) => { return isSuccess === true },
		//maxRetries: 1,
		minDelay: 0,
		maxDelay: Number.MAX_SAFE_INTEGER,
		expGrowDelay: 1.5,
		...options

	} //as Required<IRetryOptions>

	let attempts = 0
	let lastDelayMs = 0

	/** decide if should retry, and if should delay, does so */
	async function shouldRetry() {
		if ( attempts > options.maxRetries ) throw new RetryExceededError( `too many attempts.   maxRetries=${ options.maxRetries }  attempts=${ attempts }` )

		//calc delay amount
		let delayMs = Math.max( options.minDelay!, lastDelayMs )
		delayMs = Math.pow( delayMs, options.expGrowDelay! )
		delayMs *= ( 0.9 + ( Math.random() * 0.2 ) ) //randomize by 0.9 to 1.1
		//clamp
		delayMs = Math.max( options.minDelay!, delayMs )
		delayMs = Math.min( delayMs, options.maxDelay! )

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
			if ( options.acceptResult!( { isSuccess: true, result, promise } ) ) {
				return promise
			} else {
				//try again
				continue
			}
		} catch ( err ) {
			if ( options.acceptResult!( { isSuccess: false, err, promise } ) ) {
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



export interface IInspectablePromise<TResult> extends PromiseLike<TResult> {

	status(): IPromiseStatus<TResult>

}
interface IPromiseStatus<TResult> {
	isResolved: boolean;
	isSuccess?: boolean;
	result?: TResult;
	error?: Error;
}


/** adds a ```.status()``` property to your promise, allowing inspection of it's current state.   If the promise already has a ```status``` property, an XlibException is thrown. */
export function exposeStatus<TResult, TPromise extends PromiseLike<TResult>>( promise: TPromise ): ( TPromise & IInspectablePromise<TResult> ) {



	const toReturn = promise as TPromise & IInspectablePromise<TResult>

	if ( toReturn.status != null ) {
		throw new diag.exception.XlibException( `can not expose promise status because the given promise already has a .status property` );
	}

	const status: IPromiseStatus<TResult> = {
		isResolved: false
	}

	toReturn.then( ( result ) => {
		status.isResolved = true
		status.isSuccess = true
		status.result = result
		return result
	}, ( error ) => {
		status.isResolved = true
		status.isSuccess = false
		status.error = error
		return Promise.reject( error )
	} )

	toReturn.status = () => {
		return { ...status }
	}

	return toReturn

}


export interface IMutablePromise<TResult = void> extends IInspectablePromise<TResult> {
	resolve: ( result: TResult ) => void;
	reject: ( error: Error ) => void;
	// /** custom data for tracking state you might need, such as informing if the promise is being executed */
	// tags?: TTags;
}
/** create a promise who's resolve/reject occur from an outside system. 
 * @example
 * //for example, resolve the promise by calling 
 * let myProm = createMutablePromise();  
 * myProm.resolve();
 *  */
export function createMutablePromise<TResult = void>(): ( Promise<TResult> & IMutablePromise<TResult> ) {

	/** because normal promise resolve() may occur on the next tick, createMutablePromise needs to implement it's own status workflow to be instantly available. */
	const status: IPromiseStatus<TResult> = {
		isResolved: false
	}
	let _resolve: ( result: TResult ) => void = null as any;
	let _reject: ( reason: any ) => void = null as any;
	let toReturn = new Promise<TResult>( ( resolve, reject ) => {
		_resolve = async ( result ) => {
			status.isResolved = true
			status.isSuccess = true
			status.result = result
			return resolve( result )
		}
		_reject = ( reason ) => {
			status.isResolved = true
			status.isSuccess = false
			status.error = reason
			return reject( reason )
		}
	} ) as Promise<TResult> & IMutablePromise<TResult>

	toReturn.resolve = _resolve
	toReturn.reject = _reject
	toReturn.status = () => { return { ...status } }

	return toReturn;

}