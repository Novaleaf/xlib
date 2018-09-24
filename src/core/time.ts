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


import * as mathjs from "mathjs";


import * as _ from "lodash";
import * as diagnostics from "./diagnostics";


/** inspect the spread of sampled time durations.  by default, gives IQR, ie the 0th, 1st, 2nd, 3rd, and 4th quartiles, 
		* as per: https://www.dataz.io/display/Public/2013/03/20/Describing+Data%3A+Why+median+and+IQR+are+often+better+than+mean+and+standard+deviation 
				and  https://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population  
				@returns array of ms, each representing the requested quartile's rank choice*/
export function quantile( intervals: Array<luxon.Interval | luxon.Duration | number | Stopwatch | { valueOf(): number }>, /** by default givez IQR, ie the 0th, 1st, 2nd, 3rd, and 4th quartiles, 
	* @default  [ 0, 0.25, 0.5, 0.75, 1 ]
	*/
	quantile = [ 0, 0.25, 0.5, 0.75, 1 ] ) {

	// if ( intervals == null || intervals.length === 0 ) {
	// 	return [ undefined, undefined, undefined, undefined, undefined ];
	// }



	let msArray: number[] = intervals.map( ( val ) => {
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


	let toReturn = mathjs.quantileSeq( msArray, quantile, false ) as number[];

	return toReturn;

}






export class Stopwatch {

	constructor( public name?: string ) { }

	public startTime: luxon.DateTime;
	public stopTime: luxon.DateTime;

	/** if the stopwatch has not started, will return 0
		* if started but not yet stopped, will return duration from start
	* if stopped, returns duration between start and stop.
	 */
	public getElapsed() {
		if ( this.startTime == null ) {
			return luxon.Duration.fromMillis( 0 );
		}
		if ( this.stopTime == null ) {
			const now = luxon.DateTime.utc();
			const toReturn = now.diff( this.startTime );
			return toReturn;
		}
		return this.stopTime.diff( this.startTime );
	}

	public valueOf(): number {
		return this.getElapsed().valueOf();
	}

	/** mostly for supprting the ```PerfTimer``` class.    allows notifying an external to do something when ```.stop()``` is called. */
	private _awaitStopCalled: promise.IExposedPromise<Stopwatch>;


	/** starts the current stopwatch.  calling multiple times does nothing */
	public async start(): Promise<Stopwatch> {
		if ( this._awaitStopCalled != null ) {
			return this._awaitStopCalled;
		}
		this.startTime = luxon.DateTime.utc();
		this._awaitStopCalled = promise.CreateExposedPromise();
		return this._awaitStopCalled;
	}

	public stop(): this {

		try {
			if ( this.startTime == null ) {
				return this;
			}

			if ( this.stopTime == null ) {
				this.stopTime = luxon.DateTime.utc();
			}
			return this;
		} finally {
			if ( this._awaitStopCalled != null ) {
				this._awaitStopCalled.fulfill( this );
			}
		}
	}
}

import * as environment from "./environment";

export class PerfTimer {

	public done: { [ key: string ]: { runs: number, total: luxon.Duration, raw: Stopwatch[] } } = {};




	constructor( public options?: {/** though the perfTimer will auto log, it only does when .start() or .stop() is called (no async timers are used)*/ autoLogIntervalMs?: number; /** default to TRACE */ autoLogLevel?: environment.LogLevel } ) {
		this.options = { autoLogLevel: environment.LogLevel.TRACE, ...options };
		this._lastAutoLog = luxon.DateTime.utc();
	}

	/** returns a Stopwatch that you must call .stop() on  */
	public start(/** allows multiple samples per key*/ key: string ): Stopwatch {
		this._tryAutoLog( 1 );
		let toReturn = new Stopwatch( key );
		let stopPromise = toReturn.start();

		stopPromise.then( ( stopped ) => {


			if ( this.done[ key ] == null ) {
				this.done[ key ] = { raw: [], runs: 0, total: luxon.Duration.fromMillis( 0 ) };
			}
			const samples = this.done[ key ];
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
		let toReturn = this.done;
		this.done = {};
		return toReturn;
	}


	private _lastAutoLog: luxon.DateTime;
	private _tryAutoLog( callSiteLevelsUp: number ) {
		if ( this.options.autoLogIntervalMs == null ) {
			return;
		}
		const now = luxon.DateTime.utc();
		if ( now.diff( this._lastAutoLog ) > luxon.Duration.fromMillis( this.options.autoLogIntervalMs ) ) {
			//time to log
			this._lastAutoLog = now;
			this.logNowAndClear( callSiteLevelsUp + 1 );
		}

	}

	public logNowAndClear( callSiteLevelsUp = 0 ) {

		//const logData: { [ key: string ]: any } = {};// [ "PerfTimer AutoLog" ];
		const logData = [];
		_.forIn( this.done, ( samples, key ) => {
			let runs = samples.runs;
			let total = samples.total.toFormat( "hh:mm:ss.SS" );
			let avg = luxon.Duration.fromMillis( samples.total.valueOf() / samples.runs ).toFormat( "hh:mm:ss.SS" );
			let quantiles = quantile( samples.raw );
			//quartiles[ 2 ] = quartiles[ 2 ].toString() as any;
			//logData[ key ] = { total, avg, quartiles };
			logData.push( { key, runs, total, avg, quantiles } );
		} );

		const callSite = diagnostics.computeStackTrace( callSiteLevelsUp + 1, 1 )[ 0 ];
		diagnostics.log._tryLog( this.options.autoLogLevel, [ "PerfTimer Logging", { logData } ], true, callSite );
		return this.clearDone();
	}


}

