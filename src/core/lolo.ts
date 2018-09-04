"use strict";

import * as _ from "lodash";
import _stringHelper = require( "./stringhelper" );
import _numHelper = require( "./numhelper" );
import _arrayHelper = require( "./arrayhelper" );
import _jsHelper = require( "./jshelper" );

import serialization = require( "./serialization" );
export var JSONX = serialization.JSONX;

import validation = require( "./validation" );
export const scrub = validation.scrub;



export var defaultIfNull = _jsHelper.defaultIfNull;

import _exception = require( "./exception" );
export const Exception = _exception.Exception;
/** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
 * useful for returning a stack at the current location.
 * also see ```.castErr()``` for another useful Error method.
 */
export const wrapErr = _exception.Exception.wrapErr;
/** convert a string to Error object, or return existing Error object. 
 * useful for ```try{}catch(ex){}``` statements
*/
export const castErr = _exception.Exception.castErr;

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
import { stringHelper } from "../xlib";
/**
 *  current envLevel (real or fake data) shortcut for ```environment.envLevel <= environment.EnvLevel.DEV```
 */
export const isDev = environment.envLevel <= environment.EnvLevel.DEV;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export const isTest = environment.testLevel === environment.TestLevel.FULL;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export const isTrace = environment.logLevel <= environment.LogLevel.TRACE;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export const isDebug = environment.logLevel <= environment.LogLevel.DEBUG;
/**
 *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
 */
export const isProd = environment.envLevel === environment.EnvLevel.PROD;

export const format = _numHelper.format;

//with the key+value for primitive properties, key+[Array:len] for arrays, and key+[typeName] for objects 
/** debug inspection helper. outputs JSON  */
export function inspect( obj: any,
    /** meaning only the key+values of the given object will be shown, no children.  @default 1*/ maxDepth = 1,
    /** maximum array elements you want to display for each array.  @default 20 */maxArrayElements = 20,
    /** when we reach maxDepth, the length we summarize the values to.  @default 100 */summarizeLength = 100,
) {
    maxDepth--;

    if ( maxDepth < 0 || _.isObject( obj ) === false ) {
        try {
            let value = obj;
            let str: string;

            if ( value === null ) {
                return "[NULL]";
            }
            if ( value === undefined ) {
                return "[UNDEFINED]";
            }
            if ( value.toString != null ) {
                str = "=" + stringHelper.summarize( value.toString(), summarizeLength );
            }
            //time to stop, output the value of obj
            if ( _.isArray( value ) ) {
                return `[ARRAY:${ value.length }]${ str }`;
            } else if ( _.isPlainObject( value ) ) {
                return `[POJO]${ str }`;
            } else if ( _.isObject( value ) ) {
                if ( value.constructor != null && value.constructor.name != null ) {
                    return `[${ value.constructor.name }]${ str }`;
                } else {
                    return `[${ typeof ( value ) }]${ str }`;
                }
            } else {
                //value is going to be a primitive
                if ( typeof ( value ) === "string" ) {
                    return stringHelper.summarize( value, summarizeLength );
                }
                return value;
            }
        } catch ( ex ) {
            return `*ERROR PARSING* ${ stringHelper.summarize( ex.message, summarizeLength ) }`;
        }
    }


    //not at max depth, so operate on object or array

    if ( _.isArray( obj ) === true ) {
        let toReturn = [];
        for ( let i = 0; i < obj.length && i < maxArrayElements; i++ ) {
            toReturn.push( inspect( obj[ i ], maxDepth, maxArrayElements, summarizeLength ) );
        }
        if ( obj.length > maxArrayElements ) {
            toReturn.push( `*maxArrayElements reached.  len=${ obj.length }*` );
        }
        return toReturn;
    } else {
        let toReturn: { [ key: string ]: any } = {};
        _.forIn( obj, ( value, key ) => {
            toReturn[ key ] = inspect( value, maxDepth );
            // try {
            //     toReturn[ key ] =
            //     if ( _.isArray( value ) ) {
            //         toReturn[ key ] = `[Array:${ value.length }]`;
            //     } else if ( _.isPlainObject( value ) ) {
            //         toReturn[ key ] = `[POJO]`;
            //     } else if ( _.isObject( value ) ) {
            //         if ( value.constructor != null && value.constructor.name != null ) {
            //             toReturn[ key ] = `[${ value.constructor.name }]`;
            //         } else {
            //             toReturn[ key ] = `[${ typeof ( value ) }]`;
            //         }
            //     } else {
            //         toReturn[ key ] = value;
            //     }
            // } catch ( ex ) {
            //     toReturn[ key ] = `*ERROR PARSING* ${ex.message}`;
            // }
        } );
        return toReturn;
    }
}
