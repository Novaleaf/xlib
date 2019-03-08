/** shortcut to xlib.diagnostics */
export import diag = require("./diagnostics");
/** shortcut to xlib.environment */
export { isDev, isDebug } from "./environment";
/** shortcut to xlib.util.stringhelper */
export import str = require("./_util/stringhelper");
/** shortcut to xlib.util.numhelper */
export import num = require("./_util/numhelper");
/** shortcut to xlib.util.arrayhelper */
export import arr = require("./_util/arrayhelper");
import { log } from "./diagnostics";
/** shortcut to xlib.diagnostics.log */
export { log };
import { jsonX } from "./serialization";
export { jsonX };
import * as luxon from "luxon";
/** Time: return time in utc.  pass no arguments to get the current time.
    *
    * Shortcut to ```xlib.time.luxon.DateTime.utc()```
    * @example
const start = __.utc();
//....do stuff...
const elapsed = start.until( __.utc() ).length( "millisecond" );
*/
export declare const utc: typeof luxon.DateTime.utc;
/** Time:  create a duration object.
    *
    * Shortcut to ```xlib.time.Duration.fromObject()```
    * @example
    const oneHundredMs = __.duration( { milliseconds: 100 } );
  */
export declare const duration: typeof luxon.Duration.fromObject;
import { bluebird } from "./promise";
/** the ```bluebird``` library with some helpers injected , and rejection reasons restricted to Error
    *
    * shortcut to ```xlib.promise.bluebird```
    * @example
    const results = await __.bb.resolve(someObject.someAsyncFcn()).timeout(1000,"waited too long");
*/
export declare const bb: typeof bluebird;
//# sourceMappingURL=lolo.d.ts.map