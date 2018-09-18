"use strict";

import * as _ from "lodash";
import _stringHelper = require( "./stringhelper" );
import _numHelper = require( "./numhelper" );
import _arrayHelper = require( "./arrayhelper" );
import _jsHelper = require( "./jshelper" );

import serialization = require( "./serialization" );

import validation = require( "./validation" );
export const scrub = validation.scrub;



export var defaultIfNull = _jsHelper.defaultIfNull;

import _exception = require( "./exception" );
export const Exception = _exception.Exception;
/** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
 * useful for returning a stack at the current location.
 * also see ```.castErr()``` for another useful Error method.
 */
export const wrapErr = _exception.Exception.wrapErr.bind( _exception.Exception );
/** convert a string to Error object, or return existing Error object. 
 * useful for ```try{}catch(ex){}``` statements
*/
export const castErr = _exception.Exception.castErr.bind( _exception.Exception );

export import moment = require( "moment" );

export function utcNow(): Date {
    return moment.utc().toDate();
}
export function utcNowMoment() {
    return moment.utc();
}

export function utcNowTimestamp(): number {
    return moment.utc().toDate().getTime();
}
import _cache = require( "./cache" );
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export const cache = _cache.defaultCache.read.bind( _cache.defaultCache ) as typeof _cache.defaultCache.read;


///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;

import environment = require( "./environment" );
import stringHelper = require( "./stringhelper" );


import { log } from "./diagnostics";
export { log };

// public get value() : string {
//     return 
// }

export import env = environment.env;
// {

//     /**
//      *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
//      */
//     get isDev() { return environment.envLevel <= environment.EnvLevel.DEV; },

//     /**
//      *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
//      */
//     get isTest() { return environment.testLevel === environment.TestLevel.FULL; },
//     /**
//      *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
//      */
//     get isTrace() { return environment.logLevel <= environment.LogLevel.TRACE; },
//     /**
//      *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
//      */
//     get isDebug() { return environment.logLevel <= environment.LogLevel.DEBUG; },
//     /**
//      *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
//      */
//     get isProd() { return environment.envLevel === environment.EnvLevel.PROD; },

// }



//export function defaultsDeep()

/** helper for formatting numbers sanely */
export const format = _numHelper.format;

import { jsonX } from "./serialization";
export { jsonX };