

import * as _imports from "./_imports"
import * as diag from "./diagnostics"
import * as _ from "lodash"

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

	/** if errors occur and all retries are unsuccessful, we default by throwing a {@link RetryExceededError}.  set to true to throw first error returned instead. */
	throw_original?: boolean;
}

/** error that is thrown by the [[retry]] method if number of retries is exceeded.  You may also manually reject with this to abort execution of the retry() logic */
export class RetryStopError<TResult> extends diag.exception.XlibException {
	// constructor( message: string, result: { err?: Error, value?: TResult }, innerError?: Error ) {
	// 	super( message, { details: { result }, innerError } );
	// }
}
/**
 * retries a failed promise untill success or exit condition occurs.
 * to abort early, throw or reject with an { @link xlib.promise.RetryStopError }
 * @param options 
 * @param fn 
 */
export async function retry<TResult>( options: IRetryOptions, fn: () => PromiseLike<TResult> ): Promise<TResult> {

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
	/** used if the options.throw_original is set to true */
	let firstRejectedResult: ANY

	/** decide if should retry, and if should delay, does so */
	async function shouldRetry() {
		if ( attempts > options.maxRetries ) {
			if ( options.throw_original === true ) {
				return Promise.reject( firstRejectedResult )
			}
			return Promise.reject( new RetryStopError( `too many attempts.   maxRetries=${ options.maxRetries }  attempts=${ attempts }` ) )
		}

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
				firstRejectedResult = firstRejectedResult ?? result
				continue
			}
		} catch ( err ) {
			if ( err instanceof RetryStopError ) {
				//if caller rejects with a stopError, abort
				return Promise.reject( err )
			}
			if ( options.acceptResult!( { isSuccess: false, err, promise } ) ) {
				return promise
			} else {
				//try again
				firstRejectedResult = firstRejectedResult ?? err
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
export function exposeStatus<TResult>( promise: PromiseLike<TResult> ): IInspectablePromise<TResult> {



	const toReturn = promise as IInspectablePromise<TResult>

	if ( toReturn.status != null ) {
		throw new diag.exception.XlibException( "can not expose promise status because the given promise already has a .status property" )
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
	let _resolve: ( result: TResult ) => void = null as ANY
	let _reject: ( reason: Error ) => void = null as ANY
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


/** @deprecated use [[ReadWriteLock]] instead  */
export type AsyncReaderWriterLock = ReadWriteLock


/** Synchronization construct.  Allows for exclusive writes and parallel reads.  requests are processed in a FIFO order.
 * 
 * Usage notes:  
 * - You should hold a lock for as little time as possible to avoid blocking other users.
 * - Be sure to call .[[readEnd]] or .[[writeEnd]] to avoid deadlocks
 * @example
 * const lock = new ReadWriteLock("start")
 * try{
 * 	const initialValue = lock.writeBegin()
 * 	console.log("initialValue==='start'",initialValue==="start")
 * }finally{
 * 	lock.writeEnd("finish")
 * }
 * 
 */
export class ReadWriteLock<TValue = void>{

	/** multiple reads can occur at the same time */
	private _currentReads: Array<IMutablePromise> = []

	/** requests are processed FIFO.  pending requests are stored here. */
	private _pendingTransactions: Array<{ promise: IMutablePromise, isRead: boolean }> = []

	/** if the lock sychronizes data, it can be stored here */
	private _value: TValue
	private _currentWrite?: IMutablePromise
	/**
	 * 
	 * @param value optional data to synchronize access to
	 */
	constructor( value?: TValue ) {
		this._value = value!
	}


	private _tryProcessNext() {

		if ( this._currentWrite?.status().isPending === true ) return
		if ( this._currentReads.length > 0 && this._pendingTransactions[ 0 ]?.isRead === false ) return

		const nextTrans = this._pendingTransactions.shift()
		void nextTrans?.promise.then( () => { this._tryProcessNext() } )
		nextTrans?.promise.resolve()


	}


	public async read<TReturn>( readFcn: ( value: TValue ) => void | PromiseLike<void> ): Promise<void> {
		// return Promise.resolve<TReturn>(
		// 	this.readBegin().then( ( val ) => {
		// 	return readFcn( val )
		// } )
		// ).finally( () => { this.readEnd() } )


		const val = await this.readBegin()
		const toReturn = await readFcn( val )
		return this.readEnd()
		//return toReturn


	}
	public async write( writeFcn: ( value: TValue ) => ( TValue | PromiseLike<TValue> ) ): Promise<void> {
		//console.log( "write:start" )
		const val = await this.writeBegin()
		//console.log( "write:writeBegin()->", val )
		const newVal = await writeFcn( val )
		//console.log( "write:writeFcn()->", newVal )
		return this.writeEnd( newVal )
	}

	public tryReadBegin(): ( { lockAquired: false } | { lockAquired: true; value: TValue } ) {

		if ( this._currentWrite != null || this._pendingTransactions.length > 0 ) {
			return { lockAquired: false }
		}
		this._currentReads.push( createMutablePromise() )
		return { lockAquired: true, value: this._value }
	}

	public async readBegin(): Promise<TValue> {

		const fastTry = this.tryReadBegin()
		if ( fastTry.lockAquired === true ) {
			return fastTry.value
		}

		try {
			//enquue our read in a FIFO order
			//if ( this._pendingTransactions.length > 0 ) {
			const readTransaction = createMutablePromise()
			const toReturn = new Promise<TValue>( ( resolve, reject ) => {
				void readTransaction.then( () => {
					diag.throwCheck( this._currentWrite == null, "race, current write should not be possible while start reading" )
					this._currentReads.push( createMutablePromise() )
					resolve( this._value )
				} )
			} )
			this._pendingTransactions.push( { promise: readTransaction, isRead: true } )
			return toReturn
			//}
		} finally {
			this._tryProcessNext()
		}


		// diag.throwCheck( this._currentWrite == null, "race, current write should not be possible while start reading" )

		// this._currentReads.push( createMutablePromise() )
		// return this._value
	}

	public readEnd() {
		diag.throwCheck( this._currentReads.length > 0, "out of current reads, over decremented?" )
		diag.throwCheck( this._currentWrite == null, "race, current write should not be possible while reading" )
		this._currentReads.pop()!.resolve()
		this._tryProcessNext()
	}

	public tryWriteBegin(): ( { lockAquired: false } | { lockAquired: true; value: TValue } ) {

		if ( this._currentReads.length > 0 || this._currentWrite != null || this._pendingTransactions.length > 0 ) {
			return { lockAquired: false }
		}
		this._currentWrite = createMutablePromise()
		return { lockAquired: true, value: this._value }
	}

	public async writeBegin(): Promise<TValue> {

		const fastTry = this.tryWriteBegin()
		if ( fastTry.lockAquired === true ) {
			return fastTry.value
		}

		try {
			const writeTransaction = createMutablePromise()
			const toReturn = new Promise<TValue>( ( resolve, reject ) => {
				void writeTransaction.then( () => {
					diag.throwCheck( this._currentReads.length === 0, "should be no reads" )
					diag.throwCheck( this._currentWrite == null, "should be no other writes" )
					this._currentWrite = createMutablePromise()
					resolve( this._value )
				} )
			} )
			this._pendingTransactions.push( { promise: writeTransaction, isRead: false } )
			return toReturn
		} finally {
			this._tryProcessNext()
		}

	}

	public async writeEnd( value: TValue | PromiseLike<TValue> ) {
		try {
			diag.throwCheck( this._currentWrite != null, "race, current write should be set" )
			diag.throwCheck( this._currentReads.length === 0, "should be no reads" )
			this._value = await Promise.resolve( value )
			const curWrite = this._currentWrite!
			this._currentWrite = undefined
			curWrite.resolve()
		} finally {
			this._tryProcessNext()
		}
	}




}



export interface IAutoscalerOptions {
	/** minimum parallel requests (maxActive) you allow, regardless of how long the autoscaler has been idle.  should be 1 or more.
	*/
	minParallel: number;
	/** optional.  set a max to number of parallel requests (maxActive) no matter how active the calls
		* @default undefined (no limit)
	*/
	maxParallel?: number;
	/** if we get a "TOO_BUSY" rejection (from the ```failureListener```), how long we should wait before trying to expand our maxActive again. */
	busyGrowDelayMs: number;
	/** when we are at max parallel and still able to successfully submit requests (not getting "TOO_BUSY" errors), how long to delay before increasing our maxActive by 1. */
	growDelayMs: number;
	/** when we are under our max parallel, how long before our max should decrease by 1 .   Also, when we are consistently getting "TOO_BUSY" rejections, we will decrease our maxActive by 1 this often.  pass null to never decay (not recomended).*/
	idleOrBusyDecreaseMs: number;
	/** optional.  when we first get a "TOO_BUSY" rejection, we will reduce maxActive by this amount.  interval to check if we should penalize resets after ```busyWaitMs```
		 * Note: when too busy, we also reduce maxActive via the ```decayDelayMs``` parameter every so often (as set by decayDelayMs)..   set to 0 to have no penalty except that set by decayDelayMs
		* @default 1
	 */
	busyExtraPenalty?: number;


	// /** while there is pending work, how often to wakeup and see if we can submit more.  should be less than half of grow/decay delayMs
	//  * @default 1/10th of the minimum of  grow/decay delayMs
	//  */
	// heartbeatMs?: number,
}

export class Autoscaler<TResult, TWorkerFunc extends ( ...args: any[] ) => PromiseLike<TResult>>{


	private _metrics: {
		/** the max number of active parallel requests we currently allow.   increases and decreases based on the growDelayMs and decayDelayMs */
		maxActive: number;
		/** time in which we decided to stop growing (based on options.busyWaitMs ) */
		tooBusyWaitStart: Date;
		/** the current number of parallel requests active in our backendWorker */
		activeCount: number;
		/** the last time we grew our maxActive count  */
		lastGrow: Date;
		/** the last time we were at our maxActive count */
		lastMax: Date;
		/** the last time we got a "TOO_BUSY" rejection from the backendWorker.  note that this could happen while in a options.busyWaitMs interval, if the backend is sufficently overwhelmed */
		lastTooBusy: Date;
		/** the last time we decayed our maxActive */
		lastDecay: Date;
	};

	private pendingCalls: Array<{ args: Array<any>; requesterPromise: IMutablePromise; }> = [];

	private activeCalls: Array<{ args: Array<any>; requesterPromise: IMutablePromise; activeMonitorPromise: Promise<any>; }> = [];


	/** submit a request to the backend worker.
	 *
	 * **Important note**: to avoid "unhandled promise rejections" you need to make sure the returned Promise has a catch() applied to it.
	 * **NOT** just store the promise in an array to inspect later.  This is because if the request fails, the returned promise gets rejected, and if the Promise internal logic doesn't see a .catch() it will show the global "unhandled rejected promse" soft error message.
	 */
	public submitRequest: TWorkerFunc =
		//a worker with generic input/return args, cast to our specific worker function's sig
		( async ( ...args: Array<any> ): Promise<any> => {
			const requesterPromise = createMutablePromise()
			this.pendingCalls.push( { args, requesterPromise } )
			this._tryCallBackend()
			return requesterPromise
		} ) as ANY;


	private _lastTryCallTime = new Date();
	constructor(
		private options: IAutoscalerOptions,
		private backendWorker: TWorkerFunc,
		/** will be used to intercept failures (promise rejections) from the ```backendWorker``` function.  should return "FAIL" if it's a normal failure (to be returned to the caller) or "TOO_BUSY" if the request should be retried  */
		private failureListener: ( ( err: Error ) => "FAIL" | "TOO_BUSY" ),
	) {

		//apply defaults
		this.options = {
			busyExtraPenalty: 1,
			//heartbeatMs: Math.min( options.growDelayMs, options.idleOrBusyDecreaseMs ) / 10,
			...options
		}

		diag.throwCheck( this.options.minParallel >= 1, "minParallel needs to be 1 or more" )

		this._metrics = { activeCount: 0, tooBusyWaitStart: new Date( 0 ), lastGrow: new Date( 0 ), lastMax: new Date( 0 ), maxActive: options.minParallel, lastDecay: new Date( 0 ), lastTooBusy: new Date( 0 ) }


	}



	public toJson() {
		return { pendingCalls: this.pendingCalls.length, activeCalls: this.activeCalls.length, metrics: this._metrics, options: this.options }
	}

	private _tryCallBackend() {
		const now = new Date()
		try {
			while ( true ) {

				// ! /////////////  do housekeeping ///////////////////

				//check if we have to abort for various reasons
				if ( this.pendingCalls.length === 0 ) {
					//nothing to do
					return
				}
				if ( this._metrics.activeCount >= this._metrics.maxActive ) {
					//make note that we are at our limit of requests
					this._metrics.lastMax = now
				}
				if ( this.options.maxParallel != null && this._metrics.activeCount >= this.options.maxParallel ) {
					//at our hard limit of parallel requests
					return
				}
				if ( this._metrics.activeCount >= this._metrics.maxActive //we are at our max...
					&& ( this._metrics.lastGrow.getTime() + this.options.growDelayMs < now.getTime() ) //we haven't grew recently...
					&& ( this._metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < now.getTime() ) //we are not in a options.busyWaitMs interval (haven't recieved a "TOO_BUSY" rejection recently...)
				) {
					//time to grow
					this._metrics.maxActive++
					this._metrics.lastGrow = now
				}
				const lastTryMsAgo = now.getTime() - this._lastTryCallTime.getTime()
				if ( this.options.idleOrBusyDecreaseMs != null && this._metrics.lastDecay.getTime() + ( this.options.idleOrBusyDecreaseMs + lastTryMsAgo ) < now.getTime() ) {
					//havent decayed recently
					if (
						( this._metrics.lastMax.getTime() + ( this.options.idleOrBusyDecreaseMs + lastTryMsAgo ) < now.getTime() ) //havent been at max recently
						|| ( this._metrics.lastTooBusy.getTime() + this.options.idleOrBusyDecreaseMs > now.getTime() ) //OR we have gotten "TOO_BUSY" rejections since our last decay, so backoff
					) {
						//time to reduce our maxActive
						const reduceCount = 1 + Math.round( ( now.getTime() - this._metrics.lastMax.getTime() ) / this.options.idleOrBusyDecreaseMs )//accumulating decays in case the autoScaler has been idle
						diag.throwCheck( reduceCount >= 0, "active workers is <0.  should always be >=0" )
						this._metrics.maxActive = Math.max( this.options.minParallel, this._metrics.maxActive - reduceCount )
						//pretend we are at max, to properly delay growing.
						this._metrics.lastMax = now
						this._metrics.lastDecay = now
					}

				}

				if ( this._metrics.activeCount >= this._metrics.maxActive ) {
					//we are at our maxActive, wait for a free slot
					return
				}

				// ! ////////// Done with housekeeping and didn't early abort.   time to call the backend  /////////////////

				diag.throwCheck( this.pendingCalls.length > 0, "race condition, expected pendingCalls length to be 1 or more" )
				const { args, requesterPromise } = this.pendingCalls.shift()!
				const activeMonitorPromise = Promise.resolve( ( this.backendWorker as ANY )( ...args ) )
					.then( ( result ) => {
						requesterPromise.resolve( result )
					}, ( err ) => {
						//failure, see what to do about it
						const verdict = this.failureListener( err )
						switch ( verdict ) {
							case "TOO_BUSY":
								{
									const tooBusyNow = new Date()
									this._metrics.lastTooBusy = tooBusyNow
									//apply special backoffPenaltyCount options, if they exist
									if ( this.options.busyExtraPenalty != null && this._metrics.tooBusyWaitStart.getTime() + this.options.busyGrowDelayMs < tooBusyNow.getTime() ) {
										//this is a "fresh" backoff.
										//we have exceeded backend capacity and been notified with a "TOO_BUSY" failure.  reduce our maxParallel according to the options.backoffPenaltyCount
										this._metrics.maxActive = Math.max( this.options.minParallel, this._metrics.maxActive - this.options.busyExtraPenalty )

										//set our "fresh" tooBusy time
										this._metrics.tooBusyWaitStart = tooBusyNow
									}
									//put request in front to try again
									this.pendingCalls.unshift( { args, requesterPromise } )
								}
								break
							case "FAIL":
								requesterPromise.reject( err )
								break
							default:
								throw new diag.exception.XlibException( `Autoscaler error.  failureListener() return value unexpected ("${ verdict }").  must return "TOO_BUSY" or "FAIL".  ` )
						}
						return Promise.resolve()
					} )
					.finally( () => {
						//remove this from actives array
						this._metrics.activeCount--
						_.remove( this.activeCalls, ( activeCall ) => activeCall.requesterPromise === requesterPromise )
						//try another pass
						this._tryCallBackend()
					} )

				this._metrics.activeCount++
				this.activeCalls.push( { args, requesterPromise, activeMonitorPromise } )
			}

		} catch ( _err ) {
			//throw _err
			throw new diag.exception.XlibException( "Austoscaler error.  backend error occured.", { innerError: _err } )
			//log.error( _err );
		} finally {
			this._lastTryCallTime = now
			if ( this.pendingCalls.length > 0 && this._metrics.activeCount >= this._metrics.maxActive ) {
				//we have pending work, try again at minimum our next potential grow interval
				clearTimeout( this._heartbeatHandle ) //only 1 pending callback, regardless of how many calls there were
				this._heartbeatHandle = setTimeout( () => { this._tryCallBackend() }, this.options.growDelayMs )
			}
		}
	}
	private _heartbeatHandle: any;


}