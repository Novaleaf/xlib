
import * as _ from "lodash";

// import serialization = require( "./serialization" );

// import validation = require( "./validation" );
// export const scrub = validation.scrub;



/** shortcut to xlib.diagnostics */
export import diag = require( "./diagnostics" );







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
export { isDev, isDebug } from "./environment";


//export * as tests from "./s"

/** shortcut to xlib.util.stringhelper */
export import str = require( "./_util/stringhelper" );
/** shortcut to xlib.util.numhelper */
export import num = require( "./_util/numhelper" );
/** shortcut to xlib.util.arrayhelper */
export import arr = require( "./_util/arrayhelper" );

import { log } from "./diagnostics";
/** shortcut to xlib.diagnostics.log */
export { log };



import { jsonX } from "./serialization";
export { jsonX };


import * as luxon from "luxon";
/** return time in utc.  this is the most common entrypoint into time usage via the ```luxon``` module.
	* @example
const start = __.utc();
//....do stuff...
const elapsed = start.until( __.utc() ).length( "millisecond" );
*/
export const utc = luxon.DateTime.utc;



import { bluebird } from "./promise";
// /** the ```bluebird``` library with some helpers injected , and rejection reasons restricted to Error*/
export const bb = bluebird;


// bb.
