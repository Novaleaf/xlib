
//import * as _ from "lodash";

// import serialization = require( "./serialization" );

// import validation = require( "./validation" );
// export const scrub = validation.scrub;




import _exception = require( "./exception" );
/** shortcut to xlib.exception.Exception */
export const Exception = _exception.Exception;
/** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
 * useful for returning a stack at the current location.
 * also see ```.castErr()``` for another useful Error method.
 * 
 * shortcut to xlib.exception.Exception.wrapErr()
 */
export const wrapErr = _exception.Exception.wrapErr.bind( _exception.Exception );
/** convert a string to Error object, or return existing Error object. 
 * useful for ```try{}catch(ex){}``` statements
 * 
 * shortcut to xlib.exception.Exception.castErr()
*/
export const castErr = _exception.Exception.castErr.bind( _exception.Exception );

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
export import env = require( "./environment" );

/** shortcut to xlib.stringhelper */
export import str = require( "./stringhelper" );
/** shortcut to xlib.numhelper */
export import num = require( "./numhelper" );


/** shortcut to xlib.arrayhelper */
export import arr = require( "./arrayhelper" );

import { log } from "./diagnostics";
/** shortcut to xlib.diagnostics.log */
export { log };



import { jsonX } from "./serialization";
export { jsonX };