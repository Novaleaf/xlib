/** allows internal xlib modules to hook the xlib.initialize() method */
import promise = require("./core/promise");
export declare function isInitializeStarted(): boolean;
export declare function initialize<TArgs>(args?: any): Promise<void>;
/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
export declare function onInitialize<TArgs>(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork?: promise.IocCallback<TArgs, void>): Promise<any>;
//# sourceMappingURL=init.d.ts.map