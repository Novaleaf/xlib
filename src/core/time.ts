///// <reference path="../../typings/all.d.ts" />
// "use strict";

import * as promise from "./promise";

//import * as _luxon from "luxon";
/** Luxon is a library for working with dates and times in Javascript.
```
DateTime.local().setZone('America/New_York').minus({ weeks: 1 }).endOf('day').toISO();
```
Features
DateTime, Duration, and Interval types.
Immutable, chainable, unambiguous API.
Parsing and formatting for common and custom formats.
Native time zone and Intl support (no locale or tz files).

see https://www.npmjs.com/package/luxon  */
export import luxon = require( "luxon" );

/** allow creating ms durations from simple strings */
export import ms = require( "ms" );

import * as mathjs from "mathjs";


import * as _ from "lodash";
import * as diagnostics from "./diagnostics";


export class Stopwatch {

	constructor( public name?: string ) { }

	private startTime: number;
	private stopTime: number;

	/** if the stopwatch has not started, will return 0
	* if started but not yet stopped, will return duration from start
	* if stopped, returns duration between start and stop.
 *
 * if you want ```ms```, use [[valueOf]]
	 */
	public getElapsed() {
		return luxon.Duration.fromMillis( this.valueOf() );
	}

	/** same as [[getElapsed]], except outputs as number of ms.   provided for javascript comparison interface compatability */
	public valueOf(): number {
		let toReturn = this._pausedElapsed;
		if ( this._isPaused === true || this.startTime == null ) { //is paused or not started
			return toReturn;
		}
		if ( this.stopTime == null ) {
			const now = Date.now();
			toReturn += now - this.startTime;
		} else {
			toReturn += this.stopTime - this.startTime;
		}
		return toReturn;
	}

	private _isPaused = false;
	/** private storage of elapsed, used for pausing */
	private _pausedElapsed = 0;

	public toJson() {
		return { elapsedMs: this.valueOf(), isStarted: this.isStarted, isPaused: this.isPaused };
	}

	/** if the stopwatch is running but paused.  (calling [[stop]] makes a stopwatch to be considered unpaused) */
	public get isPaused() {
		return this._isPaused;
	}

	public get isStarted() {
		return this.startTime != null && this.stopTime == null;
	}

	/** pause the stopwatch.  if already paused, or stopped, does nothing. */
	public pause(): this {
		if ( this._isPaused === true || this.isStarted !== true ) {
			//only allow pause to do something if running and not already paused
			return this;
		}
		this._pausedElapsed = this.valueOf();
		this._isPaused = true;
		return this;
	}

	/** unpause the stopwatch.  if not paused (including if already stopped), does nothing */
	public unpause(): this {
		if ( this._isPaused !== true ) {
			return this;
		}
		this._isPaused = false;
		//reset the start time,
		this.startTime = Date.now();
		return this;
	}

	/** mostly for supprting the ```PerfTimer``` class.    allows notifying an external to do something when ```.stop()``` is called. */
	private _awaitStopCalled: promise.IExposedPromise<Stopwatch>;


	/** starts the current stopwatch.  calling multiple times does nothing, unless [[stop]] is called */
	public start(): promise.bluebird<Stopwatch> {
		if ( this.isStarted === true ) {
			//if already running, just return our stopPromise
			return this._awaitStopCalled;
		}
		//clear out all vars (start the stopwatch)
		this._pausedElapsed = 0;
		this._isPaused = false;
		this.startTime = Date.now();
		this.stopTime = null;
		this._awaitStopCalled = promise.CreateExposedPromise<Stopwatch>();

		return this._awaitStopCalled;
	}

	/** stops the stopwatch.  can only be used again by calling [[start]], but current value can be obtained
	 */
	public stop(): this {

		try {
			if ( this.isStarted === false ) {
				//only do work if started and not already stopped.
				return this;
			}
			//stop the stopwatch
			this.stopTime = Date.now();
			this._isPaused = false;
			return this;
		} finally {
			if ( this._awaitStopCalled != null ) {
				this._awaitStopCalled.fulfill( this );
			}
		}
	}

	/** resets a started stopwatch to zero (elapsed will be zero, but keeps running)
	 *
	 * if paused, does not unpause
	 *
	 * if stopped, does nothing
	 */
	public reset(): this {

		if ( this.isStarted === false ) {
			return this;
		}

		this._pausedElapsed = 0;
		this.startTime = Date.now();


		return this;
	}
}


/** inspect the spread of sampled time durations.  by default, gives IQR, ie the 0th, 1st, 2nd, 3rd, and 4th quartiles,
		* as per: https://www.dataz.io/display/Public/2013/03/20/Describing+Data%3A+Why+median+and+IQR+are+often+better+than+mean+and+standard+deviation
				and  https://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population
				@returns array of ms, each representing the requested quartile's rank choice*/
export function quantile( intervals: ( luxon.Interval | luxon.Duration | number | Stopwatch | { valueOf(): number; } )[],
	/** by default givez IQR, ie the sample at 0,25,50,75, and 100th percentiles,
		* @default  [ 0, 0.25, 0.5, 0.75, 1 ]
		*/
	_quantile = [ 0, 0.25, 0.5, 0.75, 1 ] ) {

	if ( intervals == null || intervals.length === 0 ) {
		//don't crash on empty imput.  just return NaN
		let toReturn = [];
		for ( let i = 0; i < _quantile.length; i++ ) {
			toReturn.push( NaN );
		}
		return toReturn;
	}


	let msArray: Array<number> = intervals.map( ( val ) => {
		if ( typeof val === "number" ) {
			return val;
		} else if ( val instanceof luxon.Interval ) {
			return val.toDuration( undefined ).valueOf();
		} else if ( val instanceof luxon.Duration ) {
			return val.valueOf();
		} else if ( val instanceof Stopwatch ) {
			return val.getElapsed().valueOf();
		} else if ( val.valueOf != null && typeof val.valueOf() === "number" ) {
			return val.valueOf();
		}
		return NaN;
	} );

	{
		let toReturn = mathjs.quantileSeq( msArray, _quantile, false ) as Array<number>;

		return toReturn;
	}

}


import * as environment from "./environment";

export class PerfTimer {

	/** exposed for programatic use.  If you want to control when to log perfTimes manually, please use ```.logNowAndClear()```  stores raw samples taken by the perf timer. */
	public _storage: { [ key: string ]: { runs: number; total: luxon.Duration; raw: Array<Stopwatch>; }; } = {};


	constructor( public options?: {/** though the perfTimer will auto log, it only does when .start() or .stop() is called (no async timers are used)*/ autoLogIntervalMs?: number; /** default to TRACE */ autoLogLevel?: environment.LogLevel; } ) {
		this.options = { autoLogLevel: environment.LogLevel.TRACE, ...options };
		this._lastAutoLog = luxon.DateTime.utc();
	}

	/** returns a Stopwatch that you must call .stop() on  */
	public start(/** allows multiple samples per key*/ key: string ): Stopwatch {
		this._tryAutoLog( 1 );
		let toReturn = new Stopwatch( key );
		let stopPromise = toReturn.start();

		stopPromise.then( ( stopped ) => {


			if ( this._storage[ key ] == null ) {
				this._storage[ key ] = { raw: [], runs: 0, total: luxon.Duration.fromMillis( 0 ) };
			}
			const samples = this._storage[ key ];
			let elapsed = stopped.getElapsed();
			samples.raw.push( stopped );
			samples.runs++;
			samples.total = samples.total.plus( elapsed );


			this._tryAutoLog( 1 );
		} );

		return toReturn;

	}
	/** manually clear out done perfTimes.  not needed if you turn autoLogging on (via .ctor options)
		* @returns the done data before it was cleared
	*/
	public clearDone() {
		let toReturn = this._storage;
		this._storage = {};
		return toReturn;
	}


	private _lastAutoLog: luxon.DateTime;
	private _tryAutoLog( callSiteLevelsUp: number ) {
		if ( this.options.autoLogIntervalMs == null ) {
			return Promise.resolve();
		}
		const now = luxon.DateTime.utc();
		if ( now.diff( this._lastAutoLog ) > luxon.Duration.fromMillis( this.options.autoLogIntervalMs ) ) {
			//time to log
			this._lastAutoLog = now;
			return this.logNowAndClear( callSiteLevelsUp + 1 );
		} else {
			return Promise.resolve();
		}

	}

	/** logs perf times to console and clears out the internal storage.
		* logging happens asynchronously to let fulfilled stopwatches a chance to finalize (to be logged to the perfTimer)
		* @returns data on the perf runs that were logged to console.
	 */
	public async logNowAndClear( callSiteLevelsUp = 0 ) {


		// ! need to wrap the actual logging in an async call so that any fulfilled promises (from stopwatch executions earlier in the callstack) can finalize themselves.
		// ! if we don't do this, then a call to the stopwatch.stop() further up in the code would not be logged.
		return promise.bluebird.delay( 0 ).then( () => {
			//const logData: { [ key: string ]: any } = {};// [ "PerfTimer AutoLog" ];
			const logData: { [ key: string ]: { runs: number; total: string; mean: string; iqr: Array<number>; }; } = {};
			_.forIn( this._storage, ( samples, key ) => {
				let runs = samples.runs;
				let total = samples.total.toFormat( "hh:mm:ss.SS" );
				let mean = luxon.Duration.fromMillis( samples.total.valueOf() / samples.runs ).toFormat( "hh:mm:ss.SS" );
				let iqr = quantile( samples.raw );
				//quartiles[ 2 ] = quartiles[ 2 ].toString() as any;
				logData[ key ] = { runs, total, mean, iqr };
				//logData.push( { key, runs, total, mean, iqr } );
			} );

			const callSite = diagnostics.computeStackTrace( callSiteLevelsUp + 1, 1 )[ 0 ];
			diagnostics.log._tryLog( this.options.autoLogLevel, [ "PerfTimer Logging", { logData } ], true, callSite );
			const rawData = this.clearDone();
			return { logData, rawData };
		} );
	}


}

