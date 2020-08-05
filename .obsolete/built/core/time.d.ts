import * as promise from "./promise";
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
export import luxon = require("luxon");
/** allow creating ms durations from simple strings */
export import ms = require("ms");
export declare class Stopwatch {
    name?: string;
    constructor(name?: string);
    private startTime;
    private stopTime;
    /** if the stopwatch has not started, will return 0
    * if started but not yet stopped, will return duration from start
    * if stopped, returns duration between start and stop.
 *
 * if you want ```ms```, use [[valueOf]]
     */
    getElapsed(): luxon.Duration;
    /** same as [[getElapsed]], except outputs as number of ms.   provided for javascript comparison interface compatability */
    valueOf(): number;
    private _isPaused;
    /** private storage of elapsed, used for pausing */
    private _pausedElapsed;
    toJson(): {
        elapsedMs: number;
        isStarted: boolean;
        isPaused: boolean;
    };
    /** if the stopwatch is running but paused.  (calling [[stop]] makes a stopwatch to be considered unpaused) */
    readonly isPaused: boolean;
    readonly isStarted: boolean;
    /** pause the stopwatch.  if already paused, or stopped, does nothing. */
    pause(): this;
    /** unpause the stopwatch.  if not paused (including if already stopped), does nothing */
    unpause(): this;
    /** mostly for supprting the ```PerfTimer``` class.    allows notifying an external to do something when ```.stop()``` is called. */
    private _awaitStopCalled;
    /** starts the current stopwatch.  calling multiple times does nothing, unless [[stop]] is called */
    start(): promise.bluebird<Stopwatch>;
    /** stops the stopwatch.  can only be used again by calling [[start]], but current value can be obtained
     */
    stop(): this;
    /** resets a started stopwatch to zero (elapsed will be zero, but keeps running)
     *
     * if paused, does not unpause
     *
     * if stopped, does nothing
     */
    reset(): this;
}
/** inspect the spread of sampled time durations.  by default, gives IQR, ie the 0th, 1st, 2nd, 3rd, and 4th quartiles,
        * as per: https://www.dataz.io/display/Public/2013/03/20/Describing+Data%3A+Why+median+and+IQR+are+often+better+than+mean+and+standard+deviation
                and  https://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population
                @returns array of ms, each representing the requested quartile's rank choice*/
export declare function quantile(intervals: (luxon.Interval | luxon.Duration | number | Stopwatch | {
    valueOf(): number;
})[], 
/** by default givez IQR, ie the sample at 0,25,50,75, and 100th percentiles,
    * @default  [ 0, 0.25, 0.5, 0.75, 1 ]
    */
_quantile?: number[]): number[];
import * as environment from "./environment";
export declare class PerfTimer {
    options?: {
        autoLogIntervalMs?: number; /** default to TRACE */
        autoLogLevel?: environment.LogLevel;
    };
    /** exposed for programatic use.  If you want to control when to log perfTimes manually, please use ```.logNowAndClear()```  stores raw samples taken by the perf timer. */
    _storage: {
        [key: string]: {
            runs: number;
            total: luxon.Duration;
            raw: Array<Stopwatch>;
        };
    };
    constructor(options?: {
        autoLogIntervalMs?: number; /** default to TRACE */
        autoLogLevel?: environment.LogLevel;
    });
    /** returns a Stopwatch that you must call .stop() on  */
    start(/** allows multiple samples per key*/ key: string): Stopwatch;
    /** manually clear out done perfTimes.  not needed if you turn autoLogging on (via .ctor options)
        * @returns the done data before it was cleared
    */
    clearDone(): {
        [key: string]: {
            runs: number;
            total: luxon.Duration;
            raw: Stopwatch[];
        };
    };
    private _lastAutoLog;
    private _tryAutoLog;
    /** logs perf times to console and clears out the internal storage.
        * logging happens asynchronously to let fulfilled stopwatches a chance to finalize (to be logged to the perfTimer)
        * @returns data on the perf runs that were logged to console.
     */
    logNowAndClear(callSiteLevelsUp?: number): Promise<{
        logData: {
            [key: string]: {
                runs: number;
                total: string;
                mean: string;
                iqr: number[];
            };
        };
        rawData: {
            [key: string]: {
                runs: number;
                total: luxon.Duration;
                raw: Stopwatch[];
            };
        };
    }>;
}
//# sourceMappingURL=time.d.ts.map