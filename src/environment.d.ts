export declare enum PlatformType {
    None = 0,
    Browser = 1,
    NodeJs = 2,
    PhantomJs = 3,
    Unknown = 4,
}
/** info on the type of platform we are currently executing under */
export declare var platformType: PlatformType;
export declare enum OsName {
    unknown = 0,
    /** mac */
    darwin = 1,
    freebsd = 2,
    linux = 3,
    sunos = 4,
    /** windows (may be x64) */
    win32 = 5,
    unix = 6,
}
/** the name of the os we detect running.  uses user agent in browsers, process.platform in nodejs */
export declare var osName: OsName;
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
}
/** the logLevel of your environment.  used as the default when constructing a logging.Logger()
 * nodejs: set by running "node entrypoint.js logLevel=DEBUG" or by setting your systemenv var: logLevel=DEBUG
 * browser: set by adding "logLevel=DEBUG" in your querystring, add a cookie, or as a attribute of your html tag
  */
export declare var logLevel: LogLevel;
export declare var isDebugBreakEnabled: boolean;
/** the current environment.  prod or preprod.
nodejs: set by running 'node entrypoint.js envLevel=PROD' or by setting your systemenv var: envLevel=PROD
browser: set by adding 'envLevel=PROD' in your querystring, add a cookie, or as a attribute of your html tag*/
export declare enum EnvLevel {
    PREPROD = 10,
    PROD = 40,
}
/** the current environment.  prod or preprod.  use to determine what database, domain names used, etc.
nodejs: set by running 'node entrypoint.js envLevel=PROD' or by setting your systemenv var: envLevel=PROD
browser: set by adding 'envLevel=PROD' in your querystring, add a cookie, or as a attribute of your html tag*/
export declare var envLevel: EnvLevel;
/** if we are in test mode, meaning unit and scenario tests, etc.
nodejs: set by running 'node entrypoint.js isTest=TRUE' or by setting your systemenv var: isTest=TRUE
browser: set by adding 'isTest=TRUE' in your querystring, add a cookie, or as a attribute of your html tag*/
export declare var isTest: boolean;
/** if we are in dev mode, meaning high-frequency polling, extra state validation code, etc.
nodejs: set by running 'node entrypoint.js isTest=TRUE' or by setting your systemenv var: isTest=TRUE
browser: set by adding 'isTest=TRUE' in your querystring, add a cookie, or as a attribute of your html tag*/
export declare var isDev: boolean;
/** no op the input function if not running LogLevel <= DEBUG.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
export declare function _ifDebug(fcn: Function): any;
/** no op the input function if not running in test mode.
  * for uglify / closure-compiler dead-code optimization (minification)
  */
export declare function _ifTest(fcn: Function): any;
/** read an "environment variable".
nodejs / phantomjs: reads from commandline switches (prefered) or system environment variables.
browser:  reads from querystring (prefered), or cookie, or <html data-key> attribute (least prefered).
 */
export declare function getEnvironmentVariable(key: string): string | null;
export declare function getEnvironmentVariable(key: string, valueIfNullOrEmpty?: null): string | null;
export declare function getEnvironmentVariable(key: string, valueIfNullOrEmpty?: string): string;
