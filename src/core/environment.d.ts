export declare type IInitArgs = {
    disableEnvAutoRead?: boolean;
    logLevel?: LogLevel;
    envLevel?: EnvLevel;
    testLevel?: TestLevel;
    suppressStartupMessage?: boolean;
};
export declare enum PlatformType {
    None = 0,
    Browser = 1,
    NodeJs = 2,
    PhantomJs = 3,
    Unknown = 4
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
    unix = 6
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
    FATAL = 60
}
/** the logLevel of your environment.  used as the default when constructing a logging.Logger()
 * nodejs: set by running "node entrypoint.js logLevel=DEBUG" or by setting your systemenv var: logLevel=DEBUG
 * browser: set by adding "logLevel=DEBUG" in your querystring, add a cookie, or as a attribute of your html tag
  */
export declare var logLevel: LogLevel;
export declare enum EnvLevel {
    DEV = 10,
    PROD = 40
}
export declare var envLevel: EnvLevel;
export declare enum TestLevel {
    NONE = 0,
    FULL = 40
}
export declare var testLevel: TestLevel;
export declare const env: {
    /**
        *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
        */
    readonly isDev: boolean;
    /**
        *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
        */
    readonly isTest: boolean;
    /**
        *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
        */
    readonly isTrace: boolean;
    /**
        *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
        */
    readonly isDebug: boolean;
    /**
        *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
        */
    readonly isProd: boolean;
};
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
export declare function getEnvironmentVariable(key: string, valueIfNullOrEmpty?: string): string;
/** reads in various environmental and process details and make it easily usable by devs */
export declare function initialize(args: IInitArgs): void;
//# sourceMappingURL=environment.d.ts.map