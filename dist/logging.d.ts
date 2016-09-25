import ex = require("./exception");
import environment = require("./environment");
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
export declare class Logger {
    name: string;
    logLevel: environment.LogLevel;
    constructor(name: string, logLevel?: environment.LogLevel);
    /** converts objects to strings, leaves primitive types intact */
    private _normalizeArgs(args);
    private _log(targetLogLevel, args);
    private _doLog(targetLogLevel, args);
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
    fatal(...args: any[]): void;
    assert(testCondition: boolean, ...args: any[]): void;
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    todo(format?: string, ...params: any[]): void;
    deprecated(message?: string): void;
    /** note to redo this before shipping (any time not in #DEBUG mode) */
    refactor(message?: string): void;
}