

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

	/** default 100 */
	maxJitter?: number;

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
		maxDelay: 100,
		expGrowDelay: 1.5,
		maxJitter: 100,
		...options

	} //as Required<IRetryOptions>
	///
	let attempts = 0
	let lastDelayMs = 0

	/** decide if should retry, and if should delay, does so */
	async function shouldRetry() {
		if ( attempts > options.maxRetries ) throw new RetryExceededError( `too many attempts.   maxRetries=${ options.maxRetries }  attempts=${ attempts }` )

		//calc delay amount
		let delayMs = Math.max( options.minDelay!, lastDelayMs )
		delayMs = Math.pow( delayMs, options.expGrowDelay! )
		//clamp within min/max		
		delayMs = Math.max( options.minDelay!, delayMs )
		delayMs = Math.min( delayMs, options.maxDelay! )

		//apply jitter 
		const jitter = Math.floor( ( options.maxJitter! * ( Math.random() - 0.5 ) ) * 2 )
		delayMs += jitter

		//clamp again
		delayMs = Math.max( options.minDelay!, delayMs )
		delayMs = Math.min( delayMs, options.maxDelay! )

		delayMs = Math.floor( delayMs )
		//do the delay
		//console.log( `${ attempts } about to delay: ${ delayMs }, ${ JSON.stringify( { ...options, jitter } ) }` )
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
	/** true is the promise is not fulfilled or rejected */
	isPending: boolean;
	/** true = promise fullfilled successfully.   
	 * false = promise rejected
	 * undefined = promise is still pending
	 */
	isSuccess?: boolean;
	result?: TResult;
	error?: Error;
}


/** adds a ```.status()``` property to your existing promise, allowing inspection of it's current state.   If the promise already has a ```status``` property, an XlibException is thrown. */
export function exposeStatus<TResult, TPromise extends PromiseLike<TResult>>( promise: TPromise ): ( TPromise & IInspectablePromise<TResult> ) {



	const toReturn = promise as TPromise & IInspectablePromise<TResult>

	if ( toReturn.status != null ) {
		throw new diag.exception.XlibException( `can not expose promise status because the given promise already has a .status property` );
	}

	const status: IPromiseStatus<TResult> = {
		isPending: true
	}

	toReturn.then( ( result ) => {
		status.isPending = false
		status.isSuccess = true
		status.result = result
		return result
	}, ( error ) => {
		status.isPending = false
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
		isPending: true
	}
	let _resolve: ( result: TResult ) => void = null as any;
	let _reject: ( reason: any ) => void = null as any;
	const toReturn = new Promise<TResult>( ( resolve, reject ) => {
		_resolve = async ( result ) => {
			status.isPending = false
			status.isSuccess = true
			status.result = result
			return resolve( result )
		}
		_reject = ( reason ) => {
			status.isPending = false
			status.isSuccess = false
			status.error = reason
			return reject( reason )
		}
	} ) as Promise<TResult> & IMutablePromise<TResult>

	toReturn.resolve = _resolve
	toReturn.reject = _reject
	toReturn.status = () => { return { ...status } }

	return toReturn

}
/** @deprecated use [[createMutablePromise]] instead */
export const CreateExposedPromise = createMutablePromise

/**  @deprecated use [[IMutablePromise]] instead */
export type IExposedPromise = IMutablePromise


/** an async+promise capable, readerwriter lock.
 *
 * allows multiple readers (non-exclusive read lock) and single-writers (exclusive write lock)
 *
 * additionally, allows storage of a value that is atomically written (a helper shortcut for common use: using this value is not required)
 *
 * when a race occurs, writes take precidence
 */
export class AsyncReaderWriterLock<TValue = void> {


	private _writeCounter = 0
	private _currentReads: Array<IMutablePromise> = [];
	private _pendingReadCount = 0;

	private _pendingWrites: Array<{ promise: IMutablePromise; writeId: number; }> = [];

	private _currentWrite: { promise: IMutablePromise; writeId: number; } | undefined;

	private _value: TValue | undefined;

	constructor( options?: { /** set to true to set the initial state to blocking (a single write already in progress)*/ writeInProgress: boolean; } ) {
		options = { writeInProgress: false, ...options };

		if ( options.writeInProgress === true ) {
			this.tryWriteBegin()
		}
	}
	public toJson() {
		return {
			currentWrite: this._currentWrite != null ? this._currentWrite.tags : null,
			pendingWrites: this._pendingWrites.length,
			currentReads: this._currentReads.length,
			pendingReads: this._pendingReadCount,
			value: this._value != null ? "yes" : "no",
		}
	}
	// /** if no writes are waiting, will quickly return. otherwise will do a normal blocking wait
	//  *
	//  * returns the
	// */
	// public pulseRead() {
	//     if ( this.currentWrite != null ) {
	//         throw new Error( "AsyncReaderWriterLock: you are attempting to read the value while a write is occuring.  call .readBegin() first" );
	//     }
	//     return this._value;// as Readonly<TValue>;
	// }

	/** returns true if a write is pending (in progress or queued). if false, you can read without being blocked. */
	public isWritePending() {
		return this._pendingWrites.length > 0
	}


	/** begin a read lock.   the returned promise resolves once the lock is aquired
	 *
	 * many simulatanious read locks are allowed, and be sure to call [[readEnd]] for each call of [[readBegin]]
	 */
	public async readBegin(): Promise<TValue | undefined> {
		//let readToken =

		if ( this._pendingWrites.length > 0 ) {
			//this.pendingReads.push(promise.CreateExposedPromise());
			this._pendingReadCount++;
			while ( this._pendingWrites.length > 0 ) {
				await Promise.all( this._pendingWrites );
			}
			this._pendingReadCount--;
		}
		diag.assert( this._pendingWrites.length === 0, "expect writeQueue to be zero length" )
		diag.assert( this._currentWrite == null, "race, current write should not be possible while start reading" )
		this._currentReads.push( createMutablePromise() )

		return this._value
	}

	/** release your read lock */
	public readEnd() {
		diag.assert( this._currentReads.length > 0, "out of current reads, over decremented?" );
		diag.assert( this._currentWrite == null, "race, current write should not be possible while reading" );
		const readToken = this._currentReads.pop()
		if ( readToken != null ) {
			readToken.resolve()
		}
	}

	/** returns true, if able to instantly obtain a write lock, false if any reads or writes are in progress */
	public tryWriteBegin(): boolean {
		if ( this._pendingWrites.length > 0 || this._currentReads.length > 0 ) {
			return false
		}

		//do sync writeBegin
		diag.assert( this._currentWrite == null, "race, current write should not be possible while start writing (tryWriteBegin)" );
		const writeId = this._writeCounter++;
		const thisWrite = { promise: createMutablePromise(), writeId }
		this._pendingWrites.push( thisWrite )
		this._currentWrite = thisWrite
		diag.assert( this._currentWrite === this._pendingWrites[ 0 ], "current write should be at head of queue.  (tryWriteBegin)" );

		return true
	}

	/** take a write lock.   returned promise resolves once your lock is aquired. */
	public async writeBegin() {
		const writeId = this._writeCounter++;
		const thisWrite = { promise: createMutablePromise(), writeId }
		this._pendingWrites.push( thisWrite );
		//wait until it's this write's turn
		while ( this._pendingWrites[ 0 ].writeId !== writeId ) {
			await this._pendingWrites[ 0 ]
		}
		//wait while there are still active reads
		while ( this._currentReads.length > 0 ) {
			await Promise.all( this._currentReads )
		}
		//now on the item
		diag.assert( this._currentWrite == null, "race, current write should not be possible while start writing" );
		this._currentWrite = thisWrite;
		diag.assert( this._currentWrite === this._pendingWrites[ 0 ], "current write should be at head of queue.  (writeBegin)" );
	}

	/** finish the write lock, allowing writing of the stored [[value]] when doing so */
	public async writeEnd(
		/**write the data [[value]], or if a promise is passed, an exclusive write lock will be held until it exits*/
		valueOrWritePromise: TValue | PromiseLike<TValue> ) {



		try {

			// //log.assertIf( thisWrite._tags.writeId === writeId, "writeId mismatch" );
			// // tslint:disable-next-line: no-unbound-method
			// if ( valueOrWritePromise instanceof bb || ( _.isObject( valueOrWritePromise ) && _.isFunction( ( valueOrWritePromise as any as bb<any> ).then ) ) ) {
			// 	this._value = await bb.resolve( valueOrWritePromise );
			// } else {
			// 	this._value = valueOrWritePromise as any;
			// }
			this._value = await Promise.resolve( valueOrWritePromise )
		} finally {
			diag.assert( this._currentWrite != null, "race, current write should be set" );
			diag.assert( this._currentWrite === this._pendingWrites[ 0 ], "current write should be at head of queue.  (writeEnd)" );
			const thisWrite = this._pendingWrites.shift()
			this._currentWrite = undefined
			thisWrite?.promise.resolve()
		}

	}

	/** hold a non-exclusive read lock for the duration of the promise. */
	public async read(/** until this promise returns, a non-exclusive read lock will be held*/ readFcn?: ( value?: TValue ) => ( PromiseLike<ANY> | ANY ) ) {

		if ( readFcn == null && this._currentWrite == null ) {
			//high performance scenario where we just return the value without doing awaits
			return this._value
		}
		await this.readBegin()

		try {
			if ( readFcn != null ) {

				//await Promise.resolve( this._value ).then( readFcn );
				await Promise.resolve( readFcn( this._value ) )
			}
			return this._value
		} finally {
			this.readEnd()
		}
	}
	/** hold an exclusive write lock for the duration of the promise. */
	public async write(/**write the data, or if a promise is passed, an exclusive write lock will be held until it exits*/ valueOrWritePromise: TValue | PromiseLike<TValue> ) {

		let toWrite: TValue
		await this.writeBegin()
		return this.writeEnd( valueOrWritePromise )


	}


}



export class Autoscaler<TResult, TWorkerFcn extends () => PromiseLike<TResult>>{



}