import { LogLevel } from "../environment";
interface ILogLevelOverride {
    callSiteMatch: RegExp;
    minLevel: LogLevel;
}
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
export declare class Logger {
    /** override the loglevel for specific, focused debugging.     */
    static overrideLogLevel(
    /** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
* if ommitted, will match the caller's fileName  */
    callSiteMatch: RegExp, 
    /** the minimum logLevel you want to be emitted.
        *
        * ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
        * For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
        This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
     */
    minLevel: LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL"): void;
    /** storage of  env.logLevelOverrides  for filtering log requests .  added to  by the .initialize() static method and log._overrideLogLevel() method */
    protected static _overrides: ILogLevelOverride[];
    /** invoke this to set a global override for the minimum log level for a given callsite.*/
    overrideLogLevel(
    /** the minimum logLevel you want to be emitted.
        *
        * ***Important note***:  you can only make the minLevel stricter than the current environment.logLevel.
        * For example, if the environment.logLevel is currently ```ERROR``` then a call to ```log.debug("hi")``` will never display.
        This is because, for performance reasons,  at module initialization time we no-op all logging methods beneath the environment.logLevel
     */
    minLevel: LogLevel | "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL", 
    /** a RegExp that matches a part of the log callSite.  (the part of the console message in Magenta color)
        * if ommitted, will match the caller's fileName  */
    callSiteMatch?: string | RegExp): void;
    static errorHistoryMaxLength: number;
    /** storage of errors encountered, for diagnostics reporting */
    static errorHistory: any[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    traceFull(...args: any[]): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    debugFull(...args: any[]): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    infoFull(...args: any[]): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    warnFull(...args: any[]): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    errorFull(...args: any[]): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    trace(...args: any[]): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    debug(...args: any[]): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    info(...args: any[]): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    warn(...args: any[]): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    error(...args: any[]): string[];
    /** log a fatal error that is about to crash your application.   the output of this is never truncated.  (it's always full verbosity) */
    fatal(...args: any[]): string[];
    /** for now, same as log.errorFull().   later will notify via email. */
    hackAttempt(...args: any[]): string[];
    /** log a bug that's going to trigger a debug.assert.   the output of this is never truncated.  (it's always full verbosity) */
    assert(testCondition: boolean, ...args: any[]): void;
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    todo(...args: any[]): void;
    /** notes to do something later. */
    todo_later(...args: any[]): void;
    deprecated(message?: string): void;
    /** note to redo this before shipping (any time not in #DEBUG mode) */
    refactor(...args: any[]): void;
    /**
     *  allows procedural calls to logging.
        *
        * @returns array of strings representing all logged values.  array element 0 is time, element 1 is callsite, element 2 is logLevel.  passed args are in element 3 onwards.  ```undefined``` is returned if not logged (such as if minLogLevel is greater than requested)
     */
    _tryLog(requestedLogLevel: LogLevel, args: any[], fullOutput: boolean, 
    /** if not set, the function **two levels up*** is marked as the callsite.
    if that's not what you want, you can create your callsite, example showing 3 levels up: ```callSite = diagnostics.computeStackTrace( 3, 1 )[ 0 ];``` */
    callSite?: string): string[] | undefined;
    private _doLog;
}
export {};
//# sourceMappingURL=logging.d.ts.map