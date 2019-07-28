/** allows internal xlib modules to hook the xlib.initialize() method */
import * as promise from "../core/promise";
export declare type IInitArgs = {
    /** if true, disables overriding settings from the commandline, envVars, or querystring */
    disableEnvAutoRead?: boolean;
    logLevel?: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "ASSERT";
    envLevel?: "DEV" | "TEST" | "UAT" | "PROD";
    logLevelOverrides?: Array<{
        callSiteMatch: RegExp;
        minLevel: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "ASSERT";
    }>;
    /** set to true to not log startup initialization details */
    silentInit?: boolean;
};
export declare function isInitializeStarted(): boolean;
/** resolves when xlib is fully initialized */
export declare const finishedPromise: promise.IExposedPromise<IInitArgs>;
export declare function initialize(args?: IInitArgs): Promise<void>;
/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
export declare function onInitialize(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork?: promise.IocCallback<IInitArgs, void>): Promise<IInitArgs>;
//# sourceMappingURL=init.d.ts.map