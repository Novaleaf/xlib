/** allows internal xlib modules to hook the xlib.initialize() method */
import promise = require("./core/promise");
import * as environment from './core/environment';
export declare type IInitArgs = {
    disableEnvAutoRead?: boolean;
    logLevel?: environment.LogLevel;
    envLevel?: environment.EnvLevel;
    testLevel?: environment.TestLevel;
    suppressStartupMessage?: boolean;
};
export declare function isInitializeStarted(): boolean;
export declare function initialize(args?: IInitArgs): Promise<void>;
/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
export declare function onInitialize(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork?: promise.IocCallback<IInitArgs, void>): Promise<IInitArgs>;
//# sourceMappingURL=init.d.ts.map