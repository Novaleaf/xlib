"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// import serialization = require( "./serialization" );
// import validation = require( "./validation" );
// export const scrub = validation.scrub;
/** shortcut to xlib.diagnostics */
exports.diag = require("./diagnostics");
//export import moment = require( "moment" );
// export function utcNow(): Date {
//     return moment.utc().toDate();
// }
// export function utcNowMoment() {
//     return moment.utc();
// }
// export function utcNowTimestamp(): number {
//     return moment.utc().toDate().getTime();
// }
// import _cache = require( "../_obsolete/cache" );
// /**
//  * read method from the defaultCache object (xlib.cache.defaultCache.read).
//  * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
//  */
// export const cache = _cache.defaultCache;//.read.bind( _cache.defaultCache ) as typeof _cache.defaultCache.read;
///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;
/** shortcut to xlib.environment */
var environment_1 = require("./environment");
exports.isDev = environment_1.isDev;
exports.isDebug = environment_1.isDebug;
//export * as tests from "./s"
/** shortcut to xlib.util.stringhelper */
exports.str = require("./_util/stringhelper");
/** shortcut to xlib.util.numhelper */
exports.num = require("./_util/numhelper");
/** shortcut to xlib.util.arrayhelper */
exports.arr = require("./_util/arrayhelper");
const diagnostics_1 = require("./diagnostics");
exports.log = diagnostics_1.log;
const serialization_1 = require("./serialization");
exports.jsonX = serialization_1.jsonX;
const luxon = tslib_1.__importStar(require("luxon"));
/** Time: return time in utc.  pass no arguments to get the current time.
    *
    * Shortcut to ```xlib.time.luxon.DateTime.utc()```
    * @example
const start = __.utc();
//....do stuff...
const elapsed = start.until( __.utc() ).length( "millisecond" );
*/
// tslint:disable-next-line: no-unbound-method
exports.utc = luxon.DateTime.utc;
/** Time:  create a duration object.
    *
    * Shortcut to ```xlib.time.Duration.fromObject()```
    * @example
    const oneHundredMs = __.duration( { milliseconds: 100 } );
  */
// tslint:disable-next-line: no-unbound-method
exports.duration = luxon.Duration.fromObject;
const promise_1 = require("./promise");
/** the ```bluebird``` library with some helpers injected , and rejection reasons restricted to Error
    *
    * shortcut to ```xlib.promise.bluebird```
    * @example
    const results = await __.bb.resolve(someObject.someAsyncFcn()).timeout(1000,"waited too long");
*/
exports.bb = promise_1.bluebird;
/** shortcut to the ```xlib.diagnostics.Exception``` class,
 * @example
 * throw new __.Ex("reason");
 *  */
exports.Ex = exports.diag.Exception;
// bb.
//# sourceMappingURL=lolo.js.map