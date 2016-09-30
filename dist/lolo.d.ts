/// <reference types="bluebird" />
import * as numHelper from "./numhelper";
import * as _jsHelper from "./jshelper";
import * as serialization from "./serialization";
export declare var JSONX: serialization.JsonX;
import * as validation from "./validation";
export declare var scrub: typeof validation.scrub;
import * as Promise from "bluebird";
export declare var defaultIfNull: typeof _jsHelper.defaultIfNull;
import * as _exception from "./exception";
export declare var Exception: typeof _exception.Exception;
import * as moment from "moment";
export { moment };
export declare function utcNow(): Date;
export declare function utcNowMoment(): moment.Moment;
export declare function utcNowTimestamp(): number;
import * as _cache from "./cache";
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export declare var cache: <TValue>(key: string, fetchFunction: () => Promise<TValue>, options?: _cache.ICacheOptions | undefined) => Promise<TValue>;
/**
 *   shortcut for ```environment.isDev```
 */
export declare var isDevCodeEnabled: boolean;
/**
 *  current testLevel (if tests are enabled or not) shortcut for ```environment.envLevel >= environment.EnvLevel.FULL```
 */
export declare var isTestCodeEnabled: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.TRACE```
 */
export declare var isLogTrace: boolean;
/**
 *  current logLevel (details of debug info displayed) shortcut for ```environment.logLevel <= environment.LogLevel.DEBUG```
 */
export declare var isLogDebug: boolean;
export declare var formatNum: typeof numHelper.format;
export import apply = _jsHelper.apply;
export interface _ILodashCollectionEnumerator {
    <TValue>(array: TValue[], enumerator: (value: TValue, index: number, collection: TValue[]) => false | void): TValue[];
    <TValue>(collection: {
        [key: string]: TValue;
    }, enumerator: (value: TValue, key: string, collection: {
        [key: string]: TValue;
    }) => false | void): {
        [key: string]: TValue;
    };
    <TValue, TCollection>(collection: TCollection, enumerator: (value: TValue, key: string, collection: TCollection) => false | void): TCollection;
}
export interface _ILodashObjectEnumerator {
    <TValue, TObject>(object: TObject, enumerator: (value: TValue, key: string, object: TObject) => false | void): TObject;
}
/** fixes lodash.d.ts type signature problems */
export declare let forEach: _ILodashCollectionEnumerator;
export declare let forEachRight: _ILodashCollectionEnumerator;
export declare let forIn: _ILodashObjectEnumerator;
export declare let forInRight: _ILodashObjectEnumerator;
export declare let forOwn: _ILodashObjectEnumerator;
export declare let forOwnRight: _ILodashObjectEnumerator;
