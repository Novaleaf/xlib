import * as init from "../_internal/init";
export declare enum PlatformType {
    None = 0,
    Browser = 1,
    NodeJs = 2,
    PhantomJs = 3,
    Unknown = 4
}
/** info on the type of platform we are currently executing under */
export declare let platformType: PlatformType;
export declare enum OsName {
    unknown = 0,
    /** mac */
    darwin = 1,
    freebsd = 2,
    linux = 3,
    sunos = 4,
    /** windows (may be x64) */
    win32 = 5,
    unix = 6
}
/** the name of the os we detect running.  uses user agent in browsers, process.platform in nodejs */
export declare let osName: OsName;
/** returns the current global object.
        depending on platform, this is:
        window (browser, phantomjs);
        GLOBAL (nodejs) */
export declare function getGlobal(): any;
export declare enum LogLevel {
    TRACE = 10,
    DEBUG = 20,
    INFO = 30,
    WARN = 40,
    ERROR = 50,
    FATAL = 60,
    ASSERT = 70
}
/** the logLevel of your environment.  used as the default when constructing a logging.Logger()
 * nodejs: set by running "node entrypoint.js logLevel=DEBUG" or by setting your systemenv var: logLevel=DEBUG
 * browser: set by adding "logLevel=DEBUG" in your querystring, add a cookie, or as a attribute of your html tag
  */
export declare let logLevel: LogLevel;
export declare enum EnvLevel {
    DEV = 10,
    TEST = 20,
    UAT = 30,
    PROD = 40
}
export declare let envLevel: EnvLevel;
/**  use to control systems complexity / footprint (dev time workflow vs test+prod time workflows).   true if env is DEV  shortcut for  ```envLevel === EnvLevel.DEV```*/
export declare function isDev(): boolean;
/** use to control output verbosity */
export declare function isDebug(): boolean;
/** read an "environment variable".
nodejs / phantomjs: reads from commandline switches (prefered) or system environment variables.
browser:  reads from querystring (prefered), or cookie, or <html data-key> attribute (least prefered).
 */
export declare function getEnvironmentVariable(key: string, /** by default, when the envVar doesn't exist we'll return undefined*/ valueIfNullOrEmpty?: string): string;
/** reads in various environmental and process details and make it easily usable by devs */
export declare function initialize(args?: init.IInitArgs): void;
//# sourceMappingURL=environment.d.ts.map