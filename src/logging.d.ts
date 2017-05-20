import * as ex from "./exception";
import * as environment from "./environment";
/** console logger logs to screen as simple text...*/
export declare class Logger {
    /** IMPORTANT: almost always, you should pass ```__filename``` as the name.    \n\n Effective naming is important. it is used as a Key to selectively enable/disable/adjust the log levels via the logging.Logger.adjustLogLevels() static method */
    name: string;
    /** (optional) the verbosity of this log object.   defaults to the environment.logLevel */
    logLevel: environment.LogLevel;
    constructor(
        /** IMPORTANT: almost always, you should pass ```__filename``` as the name.    \n\n Effective naming is important. it is used as a Key to selectively enable/disable/adjust the log levels via the logging.Logger.adjustLogLevels() static method */
        name: string, 
        /** (optional) the verbosity of this log object.   defaults to the environment.logLevel */
        logLevel?: environment.LogLevel, 
        /** (optional) additional options */
        options?: {
        /** if false (the default), will trim off the prefix of the name that matches the logging.js director location.  (useful to reduce verbosity, as usually your name will be ```__filename```) */
        doNotTrimName?: boolean;
    });
    /** converts objects to strings, leaves primitive types intact */
    private _normalizeArgs(args);
    private _log(targetLogLevel, args);
    private _doLog(targetLogLevel, args);
    /**
     *  highest verbosity
     * @param args
     */
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    /**
     *  log as an error, and returns an exception you can throw.
    ex:  throw log.error("something bad");
     * @param args
     */
    error(...args: any[]): ex.Exception;
    /**
     * useful for doing simple checks at production time.  if the condition fails, will log the error and then throw.
     * @param testCondition
     * @param args
     */
    errorAndThrowIfFalse(testCondition: boolean, ...args: any[]): void;
    fatal(...args: any[]): void;
    /**
     *  for dev-time and testing,   not for catching production issues as this can be no-opted during minification.  if you want to test in a production environment, use .errorAndThrowIf()
     * @param testCondition
     * @param args
     */
    assert(testCondition: boolean, ...args: any[]): void;
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    todo(format?: string, ...params: any[]): never;
    deprecated(message?: string): void;
    /** note to redo this before shipping (any time not in envLevel===PROD mode).   when in prod mode, an error is thrown */
    refactor(message?: string): void;
}
