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


import * as ss from "simple-statistics";
import * as _ from "lodash";
import * as diagnostics from "./diagnostics";


// /** a high-quality date-time library: http://momentjs.com/ Also includes the moment-timezone extension*/
// export import moment = require("moment-timezone");

// export function getDateFromIsoString(isoDateTimeString: string) {
// 	if (isoDateTimeString == null) {
// 		return null;
// 	}
// 	return isoDateTimeString.substring(0, isoDateTimeString.lastIndexOf("T"));
// }
//export class DateTime {

//	protected _instance: xlib.time.luxon.DateTime;

//	/** To get the current date and time, just call moment() with no parameters.  This is essentially the same as calling moment(new Date()). */
//	constructor();

//	constructor(date: number);
//	constructor(date: number[]);
//	/** When creating a moment from a string, we first check if the string matches known ISO 8601 formats, then fall back to new Date(string) if a known format is not found.

//var day = moment("1995-12-25");
//Warning: Browser support for parsing strings is inconsistent. Because there is no specification on which formats should be supported, what works in some browsers will not work in other browsers.

//For consistent results parsing anything other than ISO 8601 strings, you should use String + Format.

//Supported ISO 8601 strings

//An ISO 8601 string requires a date part.

//2013-02-08  # A calendar date part
//2013-W06-5  # A week date part
//2013-039    # An ordinal date part
//A time part can also be included, separated from the date part by a space or a uppercase T.

//2013-02-08T09            # An hour time part separated by a T
//2013-02-08 09            # An hour time part separated by a space
//2013-02-08 09:30         # An hour and minute time part
//2013-02-08 09:30:26      # An hour, minute, and second time part
//2013-02-08 09:30:26.123  # An hour, minute, second, and millisecond time part
//2013-02-08 24:00:00.000  # hour 24, minute, second, millisecond equal 0 means next day at midnight
//Any of the date parts can have a time part.

//2013-02-08 09  # A calendar date part and hour time part
//2013-W06-5 09  # A week date part and hour time part
//2013-039 09    # An ordinal date part and hour time part
//If a time part is included, an offset from UTC can also be included as +-HH:mm, +-HHmm, or Z.

//2013-02-08 09+07:00            # +-HH:mm
//2013-02-08 09-0100             # +-HHmm
//2013-02-08 09Z                 # Z
//2013-02-08 09:30:26.123+07:00  # +-HH:mm
//Note: Automatic cross browser ISO-8601 support was added in version 1.5.0. Support for the week and ordinal formats was added in version 2.3.0.

//If a string does not match any of the above formats and is not able to be parsed with Date.parse, moment#isValid will return false.

//moment("not a real date").isValid(); // false */
//	constructor(date: string);
//	/** If you know the format of an input string, you can use that to parse a moment.

//moment("12-25-1995", "MM-DD-YYYY");
//The parser ignores non-alphanumeric characters, so both of the following will return the same thing.

//moment("12-25-1995", "MM-DD-YYYY");
//moment("12\25\1995", "MM-DD-YYYY");
//The parsing tokens are similar to the formatting tokens used in moment#format. 
//	*/
//	constructor(date: string, format?: string, strict?: boolean);
//	constructor(date: string, format?: string, language?: string, strict?: boolean);
//	/** If you don't know the exact format of an input string, but know it could be one of many, you can use an array of formats.

//This is the same as String + Format, only it will try to match the input to multiple formats.

//moment("12-25-1995", ["MM-DD-YYYY", "YYYY-MM-DD"]); */
//	constructor(date: string, formats: string[], strict?: boolean);
//	constructor(date: string, formats: string[], language?: string, strict?: boolean);
//	constructor(date: string, specialFormat: () => void, strict?: boolean);
//	constructor(date: string, specialFormat: () => void, language?: string, strict?: boolean);
//	constructor(date: string, formatsIncludingSpecial: any[], strict?: boolean);
//	constructor(date: string, formatsIncludingSpecial: any[], language?: string, strict?: boolean);
//	constructor(date: Date);
//	constructor(date: xlib.time.luxon.DateTime);
//	constructor(date: Object);
//	constructor(...args: any[]) {

//		this._instance = _moment.apply(_moment, args);

//	}

//}

//export class TimeZone {
//	constructor(public value: string) {

//	}
//	public toString() {
//		return this.value;
//	}

//	public static America_Los_Angeles = new TimeZone("America/Los_Angeles");
//}

//export enum tz{
//	"America/Los_Angeles",
//	oops,
//}









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




	constructor( public options?: { autoLogIntervalMs?: number; /** default to TRACE */ autoLogLevel?: environment.LogLevel } ) {
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
			let raw = samples.raw.map( ( sw ) => sw.getElapsed().valueOf() );
			let quartiles = ss.quantile( raw, [ 0.05, 0.25, 0.5, 0.75, 0.95 ] );
			//quartiles[ 2 ] = quartiles[ 2 ].toString() as any;
			//logData[ key ] = { total, avg, quartiles };
			logData.push( { key, runs, total, avg, quartiles } );
		} );

		const callSite = diagnostics.computeStackTrace( callSiteLevelsUp + 1, 1 )[ 0 ];
		diagnostics.log._tryLog( this.options.autoLogLevel, [ "PerfTimer Logging", { logData } ], true, callSite );
		this.clearDone();

	}


}


