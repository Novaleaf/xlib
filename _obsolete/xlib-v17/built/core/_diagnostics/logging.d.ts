import { LogLevel } from "../environment";
interface ILogLevelOverride {
    callSiteMatch: RegExp;
    minLevel: LogLevel;
}
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
export declare class Logger {
    constructor();
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
    protected static _overrides: Array<ILogLevelOverride>;
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
    static errorHistory: Array<any>;
    /** log a message, output will not be auto-truncated to decrease verbosity */
    traceFull(...args: Array<any>): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    debugFull(...args: Array<any>): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    infoFull(...args: Array<any>): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    warnFull(...args: Array<any>): string[];
    /** log a message, output will not be auto-truncated to decrease verbosity */
    errorFull(...args: Array<any>): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    trace(...args: Array<any>): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    debug(...args: Array<any>): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    info(...args: Array<any>): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    warn(...args: Array<any>): string[];
    /** log a message, output will be auto truncated in a smart way to decrease verbosity */
    error(...args: Array<any>): string[];
    /** log a fatal error that is about to crash your application.   the output of this is never truncated.  (it's always full verbosity) */
    fatal(...args: Array<any>): string[];
    /** for now, same as log.errorFull().   later will notify via email. */
    hackAttempt(...args: Array<any>): string[];
    /** log an Error and then throw an Exception */
    throw(...args: Array<any>): never;
    /** if the testCondition evaluates to false, log an Error and then throw an Exception  */
    throwCheck(testCondition: boolean, ...args: Array<any>): void;
    /** if ```testCondition``` succeeds, nothing happens.
     * Otherwise, if running in ```environment.EnvLevel=PROD``` an assert will be raised (no code interuption).
     * If running in a non ```PROD``` environment, a code-interupting ```LogThrowException``` will then be thrown.
     *
     *
     * If you want an exception to always be thrown, use ```throwIf()``` instead.
     *  */
    assert(testCondition: boolean, ...args: Array<any>): void;
    /**
     *  allows procedural calls to logging.
        *
        * @returns array of strings representing all logged values.  array element 0 is time, element 1 is callsite, element 2 is logLevel.  passed args are in element 3 onwards.  ```undefined``` is returned if not logged (such as if minLogLevel is greater than requested)
     */
    _tryLog(requestedLogLevel: LogLevel, args: Array<any>, fullOutput: boolean, 
    /** if not set, the function **two levels up*** is marked as the callsite.
    if that's not what you want, you can create your callsite, example showing 3 levels up: ```callSite = diagnostics.computeStackTrace( 3, 1 )[ 0 ];``` */
    callSite?: string): Array<string> | undefined;
    private _doLog;
}
export {};
//# sourceMappingURL=logging.d.ts.map