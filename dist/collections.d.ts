/// <reference types="bluebird" />
import moment = require("moment");
import Promise = require("bluebird");
/** up to 32 true/false values stored in 32bits (a bitmask) */
export declare class BitFlags {
    /** how many bytes can be stored by instances of this */
    static MAXFLAGS: number;
    /** all flags set to true (ctor of numHelper.INT32_MAX) */
    static ALL: BitFlags;
    /** all flags set to false (ctor of 0) */
    static NONE: BitFlags;
    /** internal storage for our bitflags (just a number!) */
    rawBuffer: number;
    constructor(initialValue: BitFlags);
    constructor(initialValue: number);
    private static assertIndexInRange(index);
    /** return the value of a certain flag */
    getFlag(index: number): boolean;
    static getFlag(rawBuffer: number, index: number): boolean;
    setFlag(index: number, value: boolean): void;
    static setFlag(rawBuffer: number, index: number, value: boolean): void;
    /** flips the value of the flag */
    flipFlag(index: number): void;
    static flipFlag(rawBuffer: number, index: number): void;
    /** reset everything to false */
    clear(): void;
    /** sets any flags that are set in the input */
    add(flags: BitFlags): void;
    add(rawBuffer: number): void;
    static add(rawBuffer: number, flags: BitFlags): void;
    static add(rawBuffer: number, rawBufferOther: number): void;
    /** unsets any set flags that are set in the input */
    subtract(flags: BitFlags): void;
    subtract(rawBuffer: number): void;
    /** unsets any set flags that are set in the input */
    static subtract(rawBuffer: number, flags: BitFlags): void;
    static subtract(rawBuffer: number, rawBufferOther: number): void;
    /** flips the value of any flags set in the input */
    flip(flags: BitFlags): void;
    flip(rawBuffer: number): void;
    /** flips the value of any flags set in the input */
    static flip(rawBuffer: number, flags: BitFlags): void;
    static flip(rawBuffer: number, rawBufferOther: number): void;
    /** returns true if all the set flags in the input are also set in this. */
    isAllOn(flags: BitFlags): boolean;
    isAllOn(rawBuffer: number): boolean;
    /** returns true if all the set flags in the input are also set in this. */
    static isAllOn(rawBuffer: number, flags: BitFlags): boolean;
    static isAllOn(rawBuffer: number, rawBufferOther: number): boolean;
    /** returns true if any of the set flags in the input are set in this. */
    isAnyOn(flags: BitFlags): boolean;
    isAnyOn(rawBuffer: number): boolean;
    /** returns true if any of the set flags in the input are set in this. */
    static isAnyOn(rawBuffer: number, flags: BitFlags): boolean;
    static isAnyOn(rawBuffer: number, rawBufferOther: number): boolean;
    /** returns true if the set and unset flags exactly match */
    equals(flags: BitFlags): boolean;
    equals(rawBuffer: number): boolean;
    /** returns true if the set and unset flags exactly match */
    static equals(rawBuffer: number, flags: BitFlags): boolean;
    static equals(rawBuffer: number, rawBufferOther: number): boolean;
    getHashCode(): number;
}
/**
 *  a dictionary that deletes items when they expire
 */
export declare class ExpiresDictionary<TValue> {
    autoTryCleanupInterval: moment.Duration;
    defaultLifetime: moment.Duration;
    private _storage;
    private _nextInspectIndex;
    private _inspectKeys;
    /** estimates the non-expired items contained (this is an upper-bound).   increased by setting (new items created), decreased by garbage cleanup. */
    _allocatedItemSlots: number;
    constructor(autoTryCleanupInterval: moment.Duration, defaultLifetime: moment.Duration);
    private _tryCleanupOne();
    get(key: string): TValue | undefined;
    get(key: string, defaultIfUndefined: TValue): TValue;
    set(key: string, value: TValue, customLifetime?: moment.Duration): void;
    delete(key: string): void;
}
/**
 *  enumerate over the key+items in a collection, removing each pair as they are enumerated. *
 */
export declare function ezForEachAndRemove<TItem>(
    /** a javascript object with enumerable properties */
    collection: {
    [key: string]: TItem;
}, 
    /** return a rejected promise from the callback to abort enumeration.  item is removed from collection immediatly prior to the callback being invoked, so if you wish it to remain in the collection you will need to manually re-add it.*/
    callback: (item: TItem, key: string) => Promise<any>): Promise<void>;
