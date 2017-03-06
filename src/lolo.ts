"use strict";

import * as stringHelper from "./stringhelper";
import * as numHelper from "./numhelper";
import * as arrayHelper from "./arrayhelper";
import * as _jsHelper from "./jshelper";

import * as serialization from "./serialization";
export var JSONX = serialization.JSONX;
//export { serialization.JSONX as JSONX };

import * as validation from "./validation";
export var scrub = validation.scrub;

import * as Promise from "bluebird";

export var defaultIfNull = _jsHelper.defaultIfNull;
//export { _jsHelper.defaultIfNull as defaultIfNull };
export import defaultIfThrow = _jsHelper.defaultIfThrow;
import * as _exception from "./exception";
export var Exception = _exception.Exception;
//export { _exception.Exception as Exception };

import * as moment from "moment";
export { moment };

import * as _ from "lodash";

export function utcNow(): Date {
    return moment.utc().toDate();
}
export function utcNowMoment() {
    return moment.utc();
}

export function utcNowTimestamp(): number {
    return moment.utc().toDate().getTime();
}
//import _cache = require("./cache");
import * as _cache from "./cache";

/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export var cache = _cache.defaultCache.read.bind( _cache.defaultCache ) as typeof _cache.defaultCache.read;
//export { _cache.defaultCache.read.bind(_cache.defaultCache) as cache};

///**
// * converts db escaped user input into html escaped user input (for ui presentation)
// */
//export var htmlEscape = _stringHelper.htmlEscapeEscapedUserInput;
///**
// *  converts db escaped user input into sanitized html (includes whitelisted markeup) for ui formatting
// */
//export var htmlSanitize = _stringHelper.htmlSanitizeEscapedUserInput;

import * as environment from "./environment";
/**
 *   shortcut for ```environment.isDev```
 */
export var isDevCodeEnabled = environment.isDev;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export var isTestCodeEnabled = environment.isTest;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export var isLogTrace = environment.logLevel <= environment.LogLevel.TRACE;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export var isLogDebug = environment.logLevel <= environment.LogLevel.DEBUG;
///**
// *  current envLevel (real or fake data)  shortcut for ```environment.envLevel === environment.EnvLevel.PROD```
// */
//export var isProd = environment.envLevel === environment.EnvLevel.PROD;

export var formatNum = numHelper.format;

//export var apply = _jsHelper.apply;

export import apply = _jsHelper.apply;


// export interface _IEnumerationFunction<TEnumeratorReturn, TReturn> {
//     <TCollection, TKey extends keyof TCollection>( collection: TCollection, enumerator: ( value: TCollection[TKey], key: TKey, collection: TCollection) => TEnumeratorReturn ): TReturn;
// }

export interface _ILodashArrayEnumerator {
    <TValue>( array: TValue[], enumerator: ( value: TValue, index: number, collection: TValue[] ) => boolean | void ): TValue[];
    //<TCollection, TKey extends keyof TCollection>( collection: TCollection, enumerator: ( value: TCollection[ TKey ], key: TKey, collection: TCollection ) => false | void ): TCollection;
    //<TValue>( collection: { [ id: number ]: TValue }, enumerator: ( value: TValue, id: number, collection: { [ id: number ]: TValue }) => false | void ): { [ id: number ]: TValue };
    //<TValue>( collection: { [ key: string ]: TValue }, enumerator: ( value: TValue, key: string, collection: { [ key: string ]: TValue }) => false | void ): { [ key: string ]: TValue };

    //<TValue, TCollection>( collection: TCollection, enumerator: ( value: TValue, key: string, collection: TCollection ) => false | void ): TCollection;
}


export interface _ILodashCollectionEnumerator {
    <TValue>( array: TValue[], enumerator: ( value: TValue, index: number, collection: TValue[] ) => false | void ): TValue[];
    <TCollection, TKey extends keyof TCollection>( collection: TCollection, enumerator: ( value: TCollection[ TKey ], key: TKey, collection: TCollection ) => false | void ): TCollection;
    //<TValue>( collection: { [ id: number ]: TValue }, enumerator: ( value: TValue, id: number, collection: { [ id: number ]: TValue }) => false | void ): { [ id: number ]: TValue };
    //<TValue>( collection: { [ key: string ]: TValue }, enumerator: ( value: TValue, key: string, collection: { [ key: string ]: TValue }) => false | void ): { [ key: string ]: TValue };

    //<TValue, TCollection>( collection: TCollection, enumerator: ( value: TValue, key: string, collection: TCollection ) => false | void ): TCollection;
}
export interface _ILodashObjectEnumerator {
    <TValue, TObject>( object: TObject, enumerator: ( value: TValue, key: string, object: TObject ) => false | void ): TObject;
}
/** same as lodash, we just fix lodash.d.ts type signature problems */

export let forEachArray: _ILodashArrayEnumerator = _.forEach as any;
export let forEach: _ILodashCollectionEnumerator = _.forEach as any;
export let forEachRight: _ILodashCollectionEnumerator = _.forEachRight as any;
export let forIn: _ILodashObjectEnumerator = _.forIn as any;
export let forInRight: _ILodashObjectEnumerator = _.forInRight as any;
export let forOwn: _ILodashObjectEnumerator = _.forOwn as any;
export let forOwnRight: _ILodashObjectEnumerator = _.forOwnRight as any;

/** filter out items where false is returned */
export const filter: _ILodashCollectionEnumerator = _.filter;

/** convert an object collection into an array, using a filter.   return false to reject the element */

export function filterValues<TCollection, TKey extends keyof TCollection>( collection: TCollection, enumerator: ( value: TCollection[ TKey ], key: TKey, collection: TCollection ) => boolean ): TCollection[ TKey ][] {
    // export function filterValues<TValue>( collection: { [ id: number ]: TValue }, enumerator: ( value: TValue, id: number, collection: { [ id: number ]: TValue }) => boolean ): TValue[];
    // export function filterValues<TValue>( collection: { [ key: string ]: TValue }, enumerator: ( value: TValue, key: string, collection: { [ key: string ]: TValue }) => boolean ): TValue[];
    // export function filterValues<TValue>( collection: any, enumerator: ( value: TValue, key: string | number, collection: any ) => boolean ): TValue[] {
    let toReturn: TCollection[ TKey ][] = [];
    forEach( collection, ( val, idOrKey : TKey ) => {
        if ( enumerator( val as any, idOrKey, collection ) !== false ) {
            toReturn.push( val as any );
        }
    });

    return toReturn;
}


//export let defaults:<T>()=>T = _.def

/** bind a function to an object, preserving it's input parameters */
export function bind<TFcn extends Function>( fcn: TFcn, thisArg: any ): TFcn {
    return fcn.bind( thisArg ) as TFcn;
}