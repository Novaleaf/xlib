import _numHelper = require("./numhelper");
import _jsHelper = require("./jshelper");
import serialization = require("./serialization");
export declare var JSONX: serialization.JsonX;
import validation = require("./validation");
export declare const scrub: typeof validation.scrub;
export declare var defaultIfNull: typeof _jsHelper.defaultIfNull;
import _exception = require("./exception");
export declare const Exception: typeof _exception.Exception;
/** wrap an error with an Exception object.   original error will be contained in the "innerException" property.
 * useful for returning a stack at the current location.
 * also see ```.castErr()``` for another useful Error method.
 */
export declare const wrapErr: typeof _exception.Exception.wrapErr;
/** convert a string to Error object, or return existing Error object.
 * useful for ```try{}catch(ex){}``` statements
*/
export declare const castErr: typeof _exception.Exception.castErr;
export import moment = require("moment");
export declare function utcNow(): Date;
export declare function utcNowMoment(): moment.Moment;
export declare function utcNowTimestamp(): number;
/**
 * read method from the defaultCache object (xlib.cache.defaultCache.read).
 * for your own namespace, instantiate a new xlib.cache.Cache class instance instead.
 */
export declare const cache: <TValue>(key: string, fetchFunction: () => Promise<TValue>, options?: {
    fetchExpiresAmount?: number;
    fetchExpiresUnits?: moment.unitOfTime.DurationConstructor;
    awaitNewOnExpired?: boolean;
    awaitNewOnExpiredThreshhold?: moment.Duration;
    noClone?: boolean;
    shallowClone?: boolean;
    gcAfterMultipler?: number;
}) => Promise<TValue>;
import environment = require("./environment");
export import env = environment.env;
export declare const format: typeof _numHelper.format;
/** debug inspection helper. outputs JSON  */
export declare function inspect(obj: any, 
/** meaning only the key+values of the given object will be shown, no children.  @default 1*/ maxDepth?: number, 
/** maximum array elements you want to display for each array.  @default 20 */ maxArrayElements?: number, 
/** when we reach maxDepth, the length we summarize the values to.  @default 100 */ summarizeLength?: number): any;
//# sourceMappingURL=lolo.d.ts.map