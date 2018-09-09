import ex = require("../exception");
import environment = require("../environment");
export declare type IInitArgs = {
    logLevelOverrides?: {
        namePattern: RegExp;
        newLogLevel: environment.LogLevel;
    }[];
};
/** @hidden */
export declare function initialize(args: IInitArgs): void;
/** console logger logs to screen as simple text.  This is a temporary replacement of the bunyan logger, which causes visual studio to crash when debugging. (mysterious reason, not reproducable in a "clean" project) */
export declare class Logger {
    name: string;
    logLevel?: environment.LogLevel;
    /** @hidden */
    static initialize(): void;
    /** override the loglevel for specific, focused debugging.   */
    static overrideLogLevel(namePattern: RegExp, newLogLevel: environment.LogLevel): void;
    /** helper for applying env.logLevelOverrides */
    private static __overridenStorageHelper_parseEnv;
    /** storage of  env.logLevelOverrides  for filtering log requests .  set by the .initialize() static method */
    protected static _overriddenStorage: IInitArgs;
    constructor(name: string, logLevel?: environment.LogLevel);
    /** converts objects to strings, leaves primitive types intact */
    private _normalizeArgs;
    /**
     *  returns arguments formatted for console.log use
     * @param targetLogLevel
     * @param args
     */
    private _log;
    private _doLog;
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    /** for now, same as log.error().   later will notify via email. */
    hackAttempt(...args: any[]): void;
    static errorHistory: any[];
    error(...args: any[]): ex.Exception;
    fatal(...args: any[]): void;
    assert(testCondition: boolean, ...args: any[]): void;
    /** use to mark code that needs to be finished before it can be run.   asserts when hit. */
    todo(...args: any[]): void;
    /** notes to do something later. */
    todo_later(...args: any[]): void;
    deprecated(message?: string): void;
    /** note to redo this before shipping (any time not in #DEBUG mode) */
    refactor(...args: any[]): void;
}
export declare function logPromiseUnhandledRejections(logger?: Logger): void;
//# sourceMappingURL=logging.d.ts.map