/// <reference types="node" />
import _ = require("lodash");
/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
export import validator = require("validator");
import logging = require("./diagnostics/logging");
import { URL } from "url";
export declare class UrlValidator {
    options?: {
        /** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
        allowLocalhost?: boolean;
        /** default false to avoid reading the local file system */
        allowFileProtocol?: boolean;
        /** default false to avoid obsolete protocol */
        allowGopherProtocol?: boolean;
        /** default false to mitigate network scans.  setting to true allows local subnet ip's. */
        allowPrivateIp?: boolean;
        /** default false, allow domain name using non-printable ascii characters */
        allowUnicodeDomain?: boolean;
    };
    isValid: boolean;
    errorMessage: string;
    url: URL;
    constructor(input: string | URL, options?: {
        /** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
        allowLocalhost?: boolean;
        /** default false to avoid reading the local file system */
        allowFileProtocol?: boolean;
        /** default false to avoid obsolete protocol */
        allowGopherProtocol?: boolean;
        /** default false to mitigate network scans.  setting to true allows local subnet ip's. */
        allowPrivateIp?: boolean;
        /** default false, allow domain name using non-printable ascii characters */
        allowUnicodeDomain?: boolean;
    });
}
export declare class Scrub<T> {
    isValid: boolean;
    valid: {};
    invalid: {};
    errorMessages: string[];
    constructor(inputs: {}, clone?: boolean, deepClone?: boolean, /** fail message if the inputs are not an object */ errorMessage?: string, printInvalidValues?: boolean);
    /** if this.invalid contains anything, will set .isValid=false*/
    private _maintainValidState;
    /** reject a value, and adds to errorMessages list if your errorMessage is supplied*/
    private _reject;
    /** make sure you invoke _maintainValidState() when done with all your accepts*/
    private _accept;
    /** constructs an errorMessage with values, pushes it onto our errorMessages array, then returns the constructed value.*/
    private _appendErrorMessage;
    /** allows you to fix up failed validations. */
    fix(/** returning a non-undefined value will result in fixing the key.  returning null is not undefined! */ func: (value: T, key: string, self: Scrub<T>) => T): void;
    /** loop through all this.valid values, return false to fail validation. this will move the key/value to this.invalid */
    forEach(action: (value: any, key: string) => boolean | void): void;
    /** if invalid, will assert*/
    failAssert(
    /** if null, the default validation.logger will be used */
    logger?: logging.Logger, 
    /** if null, a generica failure string will be generated, outputting all messages found in this.errorMessages */
    format?: string, ...params: any[]): void;
    /** perform an action when a scrub failure is detected.  if isValid, nothing will be triggered.   */
    failAction<TActionReturn>(action?: () => TActionReturn): TActionReturn;
    /** if a scrub failure is detected, will throw an exception. */
    failThrow(exceptionMessage?: any): void;
    private _enumerationHelper;
    /**
     * allows custom / flexible validation of all values.
     * @param validationFunction
     * @param errorMessage
     * @param printInvalidValues
     */
    is(/** return true if valid */ validationFunction: (value: T, key: string) => boolean, errorMessage?: string, printInvalidValues?: boolean): Scrub<T>;
    /**
     *  Inputs must be string (not null or empty) or number (not NaN).
     * @param errorMessage
     * @param printInvalidValues
     */
    isReal(errorMessage?: string, printInvalidValues?: boolean): Scrub<T>;
    isUUID(errorMessage?: string, printInvalidValues?: boolean): Scrub<T>;
    isString(errorMessage?: string, printInvalidValues?: boolean): Scrub<string>;
    isNumber(errorMessage?: string, printInvalidValues?: boolean): Scrub<number>;
    isType<U>(typeName: string, errorMessage?: string, printInvalidValues?: boolean): Scrub<U>;
    /** ensure that this object being scrubbed has all the properties found in a template, and the same type.  only works for first-order children right now*/
    isTemplatePopulated(template: {}, errorMessage?: string, printInvalidValues?: boolean): Scrub<T>;
    getValid<U>(key: any, valueIfInvalid?: U): T | U;
}
export declare function scrub(values: _.Dictionary<any> | {}, clone?: boolean, deepClone?: boolean): Scrub<any>;
//# sourceMappingURL=validation.d.ts.map