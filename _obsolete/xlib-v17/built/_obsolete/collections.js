"use strict";
// tslint:disable: no-bitwise no-dynamic-delete
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
//import arrayHelper = require("./arrayhelper");
const numHelper = tslib_1.__importStar(require("../core/_util/numhelper"));
const diagnostics = tslib_1.__importStar(require("../core/diagnostics"));
//import runtime = require("./runtime");
//import diagnostics = require("./diagnostics");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
//import * as moment from "moment";
const luxon = tslib_1.__importStar(require("luxon"));
/** up to 32 true/false values stored in 32bits (a bitmask) */
class BitFlags {
    constructor(bitFlagsOrRawBuffer) {
        /** internal storage for our bitflags (just a number!) */
        this.rawBuffer = 0;
        if (bitFlagsOrRawBuffer == null) {
            this.rawBuffer = 0;
        }
        else if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer = rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            this.rawBuffer = flags.rawBuffer;
        }
    }
    static assertIndexInRange(index) {
        if (index < BitFlags.MAXFLAGS && index >= 0) {
            return;
        }
        throw new diagnostics.XlibException(`index out of bounds.  You supplied ${index} while expected range is 0 to ${BitFlags.MAXFLAGS - 1}`);
    }
    /** return the value of a certain flag */
    getFlag(index) {
        BitFlags.assertIndexInRange(index);
        return ((this.rawBuffer & (0x01 << index)) !== 0);
    }
    static getFlag(rawBuffer, index) {
        BitFlags.assertIndexInRange(index);
        return ((rawBuffer & (0x01 << index)) !== 0);
    }
    setFlag(index, value) {
        BitFlags.assertIndexInRange(index);
        if (value) {
            this.rawBuffer |= (0x01) << index;
        }
        else {
            this.rawBuffer &= (~(0x01) << index);
        }
    }
    static setFlag(rawBuffer, index, value) {
        BitFlags.assertIndexInRange(index);
        if (value) {
            rawBuffer |= (0x01) << index;
        }
        else {
            rawBuffer &= (~(0x01) << index);
        }
    }
    /** flips the value of the flag */
    flipFlag(index) {
        BitFlags.assertIndexInRange(index);
        this.rawBuffer ^= ((0x01 << index));
    }
    static flipFlag(rawBuffer, index) {
        BitFlags.assertIndexInRange(index);
        rawBuffer ^= ((0x01 << index));
    }
    /** reset everything to false */
    clear() {
        this.rawBuffer = 0;
    }
    /** sets any flags that are set in the input */
    add(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer |= rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            this.rawBuffer |= flags.rawBuffer;
        }
    }
    static add(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer |= rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            rawBuffer |= flags.rawBuffer;
        }
    }
    /** unsets any set flags that are set in the input */
    subtract(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~flags.rawBuffer;
        }
    }
    /** unsets any set flags that are set in the input */
    static subtract(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer &= ~rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            rawBuffer &= ~flags.rawBuffer;
        }
    }
    /** flips the value of any flags set in the input */
    flip(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer ^= rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            this.rawBuffer ^= flags.rawBuffer;
        }
    }
    /** flips the value of any flags set in the input */
    static flip(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer ^= rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            rawBuffer ^= flags.rawBuffer;
        }
    }
    /** returns true if all the set flags in the input are also set in this. */
    isAllOn(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    }
    /** returns true if all the set flags in the input are also set in this. */
    static isAllOn(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    }
    /** returns true if any of the set flags in the input are set in this. */
    isAnyOn(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) !== 0;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) !== 0;
        }
    }
    /** returns true if any of the set flags in the input are set in this. */
    static isAnyOn(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) !== 0;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) !== 0;
        }
    }
    /** returns true if the set and unset flags exactly match */
    equals(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return this.rawBuffer === rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return this.rawBuffer === flags.rawBuffer;
        }
    }
    /** returns true if the set and unset flags exactly match */
    static equals(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            let rawBufferInput = bitFlagsOrRawBuffer;
            return rawBuffer === rawBufferInput;
        }
        else {
            let flags = bitFlagsOrRawBuffer;
            return rawBuffer === flags.rawBuffer;
        }
    }
    getHashCode() {
        return this.rawBuffer;
    }
}
/** how many bytes can be stored by instances of this */
BitFlags.MAXFLAGS = 32;
//public static SIZEOF = 32;
/** all flags set to true (ctor of numHelper.INT32_MAX) */
BitFlags.ALL = new BitFlags(numHelper.INT32_MAX);
/** all flags set to false (ctor of 0) */
BitFlags.NONE = new BitFlags(0);
exports.BitFlags = BitFlags;
/**
 *  a dictionary that deletes items when they expire
 */
class ExpiresDictionary {
    constructor(autoTryCleanupInterval, defaultLifetime) {
        this.autoTryCleanupInterval = autoTryCleanupInterval;
        this.defaultLifetime = defaultLifetime;
        this._storage = {};
        this._nextInspectIndex = 0;
        this._inspectKeys = [];
        /** estimates the non-expired items contained (this is an upper-bound).   increased by setting (new items created), decreased by garbage cleanup. */
        this._allocatedItemSlots = 0;
        setInterval(() => {
            this._tryCleanupOne();
        }, this.autoTryCleanupInterval.as("millisecond"));
    }
    _tryCleanupOne() {
        if (this._nextInspectIndex >= this._inspectKeys.length) {
            //past end, re-aquire
            this._nextInspectIndex = 0;
            this._inspectKeys = Object.keys(this._storage);
        }
        if (this._inspectKeys.length < 1) {
            return; //nothing to do;
        }
        //try to clean up (dispose) an item that's too old
        let currentIndex = this._nextInspectIndex;
        this._nextInspectIndex++;
        let key = this._inspectKeys[currentIndex];
        let item = this._storage[key];
        if (item != null && item.expires < luxon.DateTime.utc()) {
            //console.log("ExpiresDictionary auto.cleanup", key);
            delete this._storage[key];
            this._allocatedItemSlots--;
            //if we expire one, try again
            setTimeout(this._tryCleanupOne.bind(this));
        }
        else if (item == null) {
            //item already deleted, lets try again
            setTimeout(this._tryCleanupOne.bind(this));
            this._allocatedItemSlots--;
        }
    }
    get(key, defaultIfUndefined) {
        let item = this._storage[key];
        if (item === undefined) {
            return defaultIfUndefined;
        }
        if (item.expires < luxon.DateTime.utc()) {
            //console.log("ExpiresDictionary get.cleanup", key);
            delete this._storage[key];
            this._allocatedItemSlots--;
            return defaultIfUndefined;
        }
        return item.value;
    }
    set(key, value, customLifetime = this.defaultLifetime) {
        if (this._storage[key] === undefined) {
            this._allocatedItemSlots++;
        }
        this._storage[key] = { value: value, expires: luxon.DateTime.utc().plus(customLifetime) };
    }
    delete(key) {
        delete this._storage[key];
    }
}
exports.ExpiresDictionary = ExpiresDictionary;
/**
 *  enumerate over the key+items in a collection, removing each pair as they are enumerated.
 *  return a rejected promise from the callback to abort enumeration.  item is removed from collection immediatly prior to the callback being invoked, so if you wish it to remain in the collection you will need to manually re-add it.
 * @param collection
 * @param callback
 */
function ezForEachAndRemove(collection, callback) {
    let keys = Object.keys(collection);
    let nextIndex = 0;
    let toReturn = new bluebird_1.default((resolve, reject) => {
        function _iterationWorker() {
            if (nextIndex >= keys.length) {
                resolve();
                return;
            }
            let currentIndex = nextIndex;
            nextIndex++;
            let currentKey = keys[currentIndex];
            let currentItem = collection[currentKey];
            //remove value to be enumerated
            delete collection[currentKey];
            callback(currentItem, currentKey)
                .then(() => {
                _iterationWorker();
            }, (err) => {
                reject(err);
                return undefined;
            });
        }
        _iterationWorker();
    });
    return toReturn;
}
exports.ezForEachAndRemove = ezForEachAndRemove;
///** simple interface to allow casting of simple javascript object collection's values to specific types. 
//== example usage ==
//var myStuff:ICollection<number>={};
//myStuff["first"]=11;
//var first = myStuff["first"]; //'first' variable is of type number;	
//myStuff["second"]="some string, not number"; //compile-time type error*/
//export interface ICollection<TValue> {
//	[key: string]: TValue;
//	[key: number]: TValue;
//}
//var _errorEnumerationTooComplex = "only able to remove the currently enumerated index, and only if you set the allowRemoveCurrent=true";
///** includes helpers for list style operations, and unlike javascript arrays, allows iteration over null values */
//export class List<T> extends base.ClassBase {
//	/** internally we use an array to store our items (this list is a helpful wrapper over the array)
//	you can use this directly if you'd like, but hopefully don't need to*/
//	public _storage: T[] = [];
//	constructor(
//		/** if you'd like to populate this from another collection, that can be:
//		an array
//		another List,
//		a Set
//		any object implementing .toArray(); (return a new array object!)
//		 */
//		copyFrom?: any,
//		/** optional parameter.   by default we use === to determine equality.  eg: A===B.   you can specify your own comparer here. */
//		private _defaultComparer?: (first: T, second: T) => boolean) {
//		super();
//		if (copyFrom) {
//			this.addCollection(copyFrom);
//		}
//	}
//	public _disposing() {
//		this.clear();
//		super._disposing();
//	}
//	/** number of items this list contains.   same as 'length' */
//	public getCount() {
//		return this._storage.length;
//	}
//	public clear() {
//		var tmp = this._storage;
//		this._storage = [];
//		tmp.length = 0;
//	}
//	/** copy the elements to a new array */
//	public toArray(start= 0, end: number= this._storage.length): T[] {
//		return this._storage.slice(start, end);
//	}
//	public indexOf(value: T, startIndex= 0) {
//		if (this._defaultComparer == null) {
//			return this._storage.indexOf(value, startIndex);
//		} else {
//			for (var i = startIndex; i < this._storage.length; i++) {
//				if (this._defaultComparer(this._storage[i], value)) {
//					return i;
//				}
//			}
//			return -1;
//		}
//	}
//	public lastIndexOf(value: T, startBackwardIndex= -1) {
//		if (this._defaultComparer == null) {
//			return this._storage.lastIndexOf(value, startBackwardIndex);
//		} else {
//			startBackwardIndex = startBackwardIndex ? startBackwardIndex : this._storage.length;
//			for (var i = startBackwardIndex; i >= 0; i--) {
//				if (this._defaultComparer(this._storage[i], value)) {
//					return i;
//				}
//			}
//			return -1;
//		}
//	}
//	public valueAt(index: number) {
//		return this._storage[index];
//	}
//	public addCollection(collection: List<T>, insertAt?: number);
//	public addCollection(collection: Set<T>, insertAt?: number);
//	public addCollection(collection: T[], insertAt?: number);
//	public addCollection(collection: any, insertAt?: number) {
//		var addArray;
//		if (collection.toArray != null) {
//			addArray = collection.toArray();
//		} else if (collection.getEnumerable != null) {
//			addArray = [];
//			var enumerable = collection.getEnumerable();
//			for (var ii in enumerable) {
//				if (enumerable.hasOwnProperty(ii)) {
//					addArray.push(enumerable[ii]);
//				}
//			}
//		} else {
//			//we expect this to be an array
//			addArray = collection;
//		}
//		if (insertAt == null) {
//			insertAt = this.getCount();
//		}
//		__.jsHelper.apply(this._storage.splice, this._storage, addArray, insertAt, 0);
//	}
//	public add(...values: T[]) {
//		this._storage.push.apply(this._storage, values);
//	}
//	public addAt(index, ...values: T[]) {
//		__.jsHelper.apply(this._storage.splice, this._storage, values, index, 0);
//	}
//	/** returns an array containing the removed elements */
//	public removeAt(index, count= 1): T[] {
//		try {
//			return this._storage.splice(index, count);
//		} finally {
//		}
//	}
//	/** removes first instance of the value(s) passed in */
//	public removeArray(values: T[]) {
//		__.forEach(values, (value) => {
//			var index = this.indexOf(value);
//			if (index < 0) {
//				throw new Error("value not found to remove");
//			}
//			var removed = this.removeAt(index);
//		});
//	}
//	/** removes first instance of the value(s) passed in */
//	public remove(...values: T[]) {
//		this.removeArray(values);
//	}
//	public removeLast(...values: T[]) {
//		__.forEach(values, (value) => {
//			var index = this.lastIndexOf(value);
//			if (index < 0) {
//				throw new Error("value not found to remove");
//			}
//			var removed = this.removeAt(index);
//		});
//	}
//	public removeAll(...values: T[]): number {
//		var removeCount = 0;
//		__.forEach(values, (value) => {
//			while (true) {
//				var index = this.indexOf(value);
//				if (index < 0) {
//					break;
//				}
//				this.removeAt(index);
//				removeCount++;
//			}
//		});
//		return removeCount;
//	}
//	/** loop through all elements in the list, including null values.
//		returns TRUE if the enumeration was stopped early (see enumerator callback for details) */
//	public forEach(
//		/** a delegate to do your logic per item in the list.
//		if you want to abort looping, return TRUE from this callback. */
//		enumerator: (
//		/** null values are not discarded (unlike most foreach methods do!) */
//		value: T,
//		/** this is the index in the list.  when the for-each was invoked  */
//		index: number, collection: T[]) => boolean,
//		/* if true, a copy of the collection is made and enumerated.
//this is useful if you wish to add/remove from the original collection while enumerating */
//		enumerateCopy = false): boolean {
//		return __.forEach(this._storage, enumerator, enumerateCopy);
//	}
//	public forEachReverse(
//		/** a delegate to do your logic per item in the list.
//		if you want to abort looping, return TRUE from this callback. */
//		enumerator: (
//		/** null values are not discarded (unlike most foreach methods do!) */
//		value: T,
//		/** this is the index in the list.  when the for-each was invoked  */
//		index: number, collection: T[]) => boolean,
//		/* if true, a copy of the collection is made and enumerated.
//this is useful if you wish to add/remove from the original collection while enumerating */
//		enumerateCopy = false): boolean {
//		return __.forEachReverse(this._storage, enumerator, enumerateCopy);
//	}
//	/** returns the internal object used for value storage.  you can enumerate this (for-each)
//	-- example --
//	var enumerable = mySet.getEnumerable();
//	for(var keyCode in enumerable){ console.log(enumerable[keyCode]); }*/
//	public getEnumerable() { return this._storage; }
//	public toString() {
//		return __.format("count={0};  values=[{1}]", this.getCount(), this._storage.join(","));
//	}
//}
///** high performance set, use like a hashset
//== implementation notice (READ THIS if using for anything other than strings and numbers!) ==
//if you store strings or numbers, we use those directly as unique keys.
//FOR OBJECTS:  if you have a .hashCode property or .getHashCode() method on your object,
//we'll use that as our internal key.   (be sure those values DO NOT change after being added to the Set!)
//if you don't have one of those two, we will need to modify your object a little bit:
//we will create string property named: ".__noenum_novaleaf_corelib_collections_hashCode" to store a key we generate.
//*/
//export class Set<T> {
//	private _count = 0;
//	private _storage = {};
//	/** how many items are stored in this set */
//	public getCount() { return this._count; }
//	/** returns the internal object used for value storage.  you can enumerate this (for-each)
//	-- example --
//	var enumerable = mySet.getEnumerable();
//	for(var keyCode in enumerable){ console.log(enumerable[keyCode]); }*/
//	public getEnumerable() { return this._storage; }
//	constructor(
//		/** another Set, array, or value collection you wish to shallow-copy into this new set instance */
//		valueCollection?: any) {
//		if (valueCollection != null) {
//			this.tryAddCollection(valueCollection);
//		}
//	}
//	/** another Set, array, or value collection you wish to shallow-copy into this set instance
//	returns false if there were any dupes */
//	public tryAddCollection(valueCollection: List<T>): boolean;
//	public tryAddCollection(valueCollection: Set<T>): boolean;
//	public tryAddCollection(valueCollection: T[]): boolean;
//	public tryAddCollection(valueCollection: any): boolean {
//		var toReturn = true;
//		if (valueCollection.getEnumerable != null) {
//			var enumerable = valueCollection.getEnumerable();
//			for (var keyCode in enumerable) {
//				if (enumerable.hasOwnProperty(keyCode)) {
//					var value = enumerable[keyCode];
//					var result = this.tryAdd(value);
//					if (!result) { toReturn = false; }
//				}
//			}
//		} else if (valueCollection.toArray != null) {
//			var array = valueCollection.toArray();
//			for (var i = 0; i < array.length; i++) {
//				var result = this.tryAdd(array[i]);
//				if (!result) { toReturn = false; }
//			}
//		} else if (__.arrayHelper.isArray(valueCollection)) {
//			for (var i = 0; i < valueCollection.length; i++) {
//				var result = this.tryAdd(valueCollection[i]);
//				if (!result) { toReturn = false; }
//			}
//		} else {
//			for (var key in valueCollection) {
//				if (valueCollection.hasOwnProperty(key)) {
//					var result = this.tryAdd(valueCollection[key]);
//					if (!result) { toReturn = false; }
//				}
//			}
//		}
//		return toReturn;
//	}
//	public clear() {
//		this._storage = {};
//		this._count = 0;
//	}
//	/** copy the elements to a new array */
//	public toArray(): T[] {
//		var toReturn = [];
//		var enumerable = this.getEnumerable();
//		for (var keyCode in enumerable) {
//			if (enumerable.hasOwnProperty(keyCode)) {
//				toReturn.push(enumerable[keyCode]);
//			}
//		}
//		return toReturn;
//	}
//	public contains(item: T): boolean {
//		var hashCode = hashHelper.getHashCode(item);
//		if (hashCode == null) {
//			return false;
//		}
//		return this._storage[hashCode] != null;
//	}
//	/** add the value to the set.  */
//	public tryAdd(item: T): boolean {
//		var hashCode = hashHelper.tryCreateHashCode(item);
//		if (this._storage[hashCode] != null) {
//			logger.assert(hashHelper.getHashCode(this._storage[hashCode]) === hashCode, "hashCode\'s not the same, why?");
//			return false;
//		}
//		this._storage[hashCode] = item;
//		this._count++;
//		return true;
//	}
//	public tryRemove(item: T): boolean {
//		var hashCode = hashHelper.getHashCode(item);
//		if (hashCode == null) {
//			return false;
//		}
//		if (this._storage[hashCode] == null) {
//			return false;
//		}
//		logger.assert(hashHelper.getHashCode(this._storage[hashCode]) === hashCode, "hashCode\'s not the same, why?");
//		delete (this._storage[hashCode]);
//		this._count--;
//		return true;
//	}
//}
///** supports enumerating keys with null values.  to not enumerate a key, call .tryRemove(key) 
//*/
//export class IterationDictionary<TKey, TValue>{
//	private _storage: ICollection<{ key: TKey; value: TValue }> = {};
//	private _indexes = new List<string>();
//	private _count = 0;
//	/** token used to find the last spot in the iteration */
//	public _currentIndex: number = -1;
//	public contains(key: TKey) {
//		var keyCode = hashHelper.tryCreateHashCode(key);
//		return this._storage[keyCode] !== undefined;
//	}
//	public getCount() {
//		return this._count;
//	}
//	public clear() {
//		this._storage = {};
//		this._indexes.clear();
//		this._count = 0;
//		this._currentIndex = -1;
//	}
//	public addOrReplace(key: TKey, value?: TValue): void {
//		var keyCode = hashHelper.tryCreateHashCode(key);
//		if (this._storage[keyCode] !== undefined) {
//			//this is an add
//			this._indexes.add(keyCode);
//			this._count++;
//		}
//		this._storage[keyCode] = { key: key, value: value };
//	}
//	public tryAdd(key: TKey, value?: TValue): boolean {
//		var keyCode = hashHelper.tryCreateHashCode(key);
//		if (this._storage[keyCode] !== undefined) {
//			return false;
//		}
//		this.addOrReplace(key, value);
//		//this._indexes.add(keyCode);
//		//this._storage[keyCode] = { key: key, value: value };
//		//this._count++;
//		return true;
//	}
//	public tryRemove(key: TKey): boolean {
//		var keyCode = hashHelper.tryCreateHashCode(key);
//		if (this._storage[keyCode] == undefined) {
//			return false;
//		}
//		//remove from storage
//		delete this._storage[keyCode];
//		this._count--;
//		//remove from our index
//		var index = this._indexes.indexOf(keyCode);
//		this._indexes.removeAt(index);
//		//move back our iterationIndex if beyond this item
//		if (this._currentIndex > index) {
//			this._currentIndex--;
//		}
//		return true;
//	}
//	/** returns a tuple: { key: TKey; value: TValue; isSuccess: boolean; } */
//	public tryGet(key: TKey): { key: TKey; value: TValue; isSuccess: boolean; } {
//		var toReturn = { isSuccess: false, value: null, key: key };
//		var keyCode = hashHelper.tryCreateHashCode(key);
//		if (this._storage[keyCode] == undefined) {
//			return toReturn;
//		}
//		toReturn.isSuccess = true;
//		toReturn.value = this._storage[keyCode].value;
//		logger.assert(toReturn.key === this._storage[keyCode].key, "why keys mismatch?");
//		return toReturn;
//	}
//	/** resets iteration to -1.  need to call .moveNext() once to move to the first. */
//	public resetIteration() {
//		this._currentIndex = -1;
//	}
//	/** returns the current key/value/index (json object), or null if count===0 or current index exceeds count*/
//	public getCurrent(): { key: TKey; value: TValue; index: number } {
//		if (this._currentIndex < 0 || this._currentIndex >= this._count) {
//			return null;
//		}
//		//var thisIndex = (this._lastIteratedIndex + 1)%this._count;
//		var pair = this._storage[this._indexes.valueAt(this._currentIndex)];
//		pair["index"] = this._currentIndex;
//		return <any>pair;
//	}
//	public getAtIndex(index: number) {
//		return this._storage[this._indexes.valueAt(index)];
//	}
//	/** returns false if can not move to a new index (if count is 0 or at the end).   true otherwise */
//	public moveNext(autoLoop= false): boolean {
//		this._currentIndex++;
//		if (this._currentIndex >= this._count) {
//			if (autoLoop) {
//				this._currentIndex = 0;
//			} else {
//				this._currentIndex--;
//				return false;
//			}
//		}
//		return true;
//	}
//}
//export class Dictionary<TKey, TValue>{
//	public _keys: Set<TKey> = new Set<TKey>();
//	private _storage = {};
//	public getCount() { return this._keys.getCount(); }
//	/** returns an enumerable object.   how to use example:
//		var enumerable = myDictionary.getEnumerable();
//		for(var keyCode in enumerable){ var pair = enumerable[keyCode];  var value=pair.value;  var key=pair.key; } */
//	public getEnumerable() { return this._storage; }
//	public clear() { this._keys.clear(); this._storage = {}; }
//	public toArray(): { key: TKey; value: TValue }[] {
//		var toReturn = [];
//		var enumerable = this.getEnumerable();
//		for (var keyCode in enumerable) {
//			if (enumerable.hasOwnProperty(keyCode)) {
//				var pair = enumerable[keyCode];
//				toReturn.push(pair);
//			}
//		}
//		return toReturn;
//	}
//	/** returns all keys in a new array */
//	public getKeys(): TKey[] {
//		return this._keys.toArray();
//	}
//	/** returns all values in a new array */
//	public getValues(): TValue[] {
//		var toReturn: TValue[] = [];
//		var enumerable = this.getEnumerable();
//		for (var keyCode in enumerable) {
//			if (enumerable.hasOwnProperty(keyCode)) {
//				var pair = enumerable[keyCode];
//				toReturn.push(pair.value);
//			}
//		}
//		return toReturn;
//	}
//	constructor(
//		/** another Dictionary or key-value collection you wish to shallow-copy into this new dictionary instance */
//		keyValueCollection?: any) {
//		if (keyValueCollection != null) {
//			var result = this.tryAddCollection(keyValueCollection);
//			logger.assert(result, "dupe keys?");
//		}
//	}
//	public tryAddCollection(
//		/** another Dictionary or key-value collection you wish to shallow-copy into this new dictionary instance
//		returns FALSE if any dupes were detected (those are not overwritten) */
//		keyValueCollection: any): boolean {
//		var toReturn = true;
//		if (keyValueCollection.getEnumerable != null) {
//			var enumerable = keyValueCollection.getEnumerable();
//			for (var keyCode in enumerable) {
//				if (enumerable.hasOwnProperty(keyCode)) {
//					var pair = enumerable[keyCode];
//					var result = this.tryAdd(pair.key, pair.value);
//					if (!result) { toReturn = false; }
//				}
//			}
//		} else {
//			for (var key in keyValueCollection) {
//				if (keyValueCollection.hasOwnProperty(key)) {
//					var result = this.tryAdd(key, keyValueCollection[key]);
//					if (!result) { toReturn = false; }
//				}
//			}
//		}
//		return toReturn;
//	}
//	public addKeys(keys: TKey[]) {
//		for (var i = 0; i < keys.length; i++) {
//			this.add(keys[i]);
//		}
//	}
//	public add(key: TKey, value?: TValue) {
//		var result = this.tryAdd(key, value);
//		if (!result) {
//			throw new Error(__.format("could not add to dictionary.  duplicate key: {0}", key));
//		}
//	}
//	public remove(key: TKey) {
//		var result = this.tryRemove(key);
//		if (!result) {
//			throw new Error(__.format("could not remove from dictionary.  key: \"{0}\"  not found", key));
//		}
//	}
//	public replace(key: TKey, value?: TValue) {
//		var result = this.tryReplace(key, value);
//		if (!result) {
//			throw new Error(__.format("could not replace in  dictionary.  key not found: {0}", key));
//		}
//	}
//	public get(key): TValue {
//		var result = this.tryGet(key);
//		if (!result.isSuccess) {
//			throw new Error(__.format("could not get from dictionary.  key not found: {0}", key));
//		}
//		return result.value;
//	}
//	public tryAdd(key: TKey, value?: TValue): boolean {
//		if (!this._keys.tryAdd(key)) { return false; }
//		var keyCode = hashHelper.getHashCode(key);
//		logger.assert(keyCode != null, "we added to set so should be ok");
//		this._storage[keyCode] = { key: key, value: value };
//		return true;
//	}
//	public tryRemove(key: TKey): boolean {
//		if (!this._keys.tryRemove(key)) { return false; }
//		var keyCode = hashHelper.getHashCode(key);
//		logger.assert(keyCode != null, "we removed from set so should be ok");
//		delete (this._storage[keyCode]);
//		return true;
//	}
//	/** returns a tuple: { key: TKey; value: TValue; isSuccess: boolean; } */
//	public tryGet(key: TKey): { key: TKey; value: TValue; isSuccess: boolean; } {
//		var toReturn = { isSuccess: false, value: null, key: key };
//		if (!this._keys.contains(key)) { return toReturn; }
//		var keyCode = hashHelper.getHashCode(key);
//		toReturn.isSuccess = true;
//		toReturn.value = this._storage[keyCode].value;
//		logger.assert(toReturn.key === this._storage[keyCode].key, "why keys mismatch?");
//		return toReturn;
//	}
//	/** add or replace existing value.  returns TRUE if add occurs, false if replacement occurs */
//	public addOrReplace(key: TKey, value?: TValue): boolean {
//		var toReturn = true;
//		if (!this._keys.tryAdd(key)) { toReturn = false; }
//		var keyCode = hashHelper.getHashCode(key);
//		logger.assert(keyCode != null, "we are replacing value so should be ok");
//		this._storage[keyCode] = { key: key, value: value };
//		return toReturn;
//	}
//	/** only insert if replacing an existing key.   returns TRUE if success */
//	public tryReplace(key: TKey, value?: TValue): boolean {
//		if (!this._keys.contains(key)) { return false; }
//		var keyCode = hashHelper.getHashCode(key);
//		this._storage[keyCode] = { key: key, value: value };
//		return true;
//	}
//}
////#region disabled unit tests due to ts 0.9.1 bug //BUGBUG
///* jshint -W071 */
///** internal unit tests for these collections */
//class UnitTests {
//	public execListTests() {
//		var List = collections.List;
//		var myList = new List<string>();
//		myList.add("one");
//		myList.add("two");
//		myList.add("three");
//		myList.add("one", "six", "seven");
//		myList.addAt(4, "four", "five");
//		myList.add("one");
//		//console.log(myList.toString());
//		myList.removeLast("one");
//		myList.removeLast("one");
//		var subArray = myList.toArray(1);
//		var expectedArray = ["two", "three", "four", "five", "six", "seven"];
//		for (var i = 0; i < expectedArray.length; i++) {
//			logger.assert(subArray[i] === expectedArray[i], "expect \"{0}\" ===\"{1}\"", subArray[i], expectedArray[i]);
//		}
//	}
//	public execSetTests() {
//		var obj1 = { hashCode: 123, value: "obj1" };
//		var obj1_dupe = { getHashCode: () => "123", value: "obj1_dupe" };
//		var obj2 = { value: "obj2" };
//		var obj2_notdupe = { value: "obj2" };
//		var mySet = new Set();
//		logger.assert(mySet.getCount() === 0, "count mismatch");
//		var result = mySet.tryAdd(obj1);
//		logger.assert(result, "should add ok");
//		logger.assert(mySet.getCount() === 1, "count mismatch");
//		result = mySet.tryAdd(obj1);
//		logger.assert(!result, "should not be able to add");
//		result = mySet.tryAdd(obj1_dupe);
//		logger.assert(!result, "should not be able to add");
//		result = mySet.tryAdd(obj2);
//		logger.assert(result, "should add ok");
//		result = mySet.tryAdd(obj2);
//		logger.assert(!result, "should not be able to add");
//		result = mySet.tryAdd(obj2_notdupe);
//		logger.assert(result, "should add ok");
//		result = mySet.tryAdd(obj2_notdupe);
//		logger.assert(!result, "should not be able to add");
//		result = mySet.tryAdd(obj1);
//		logger.assert(!result, "should not be able to add");
//		logger.assert(mySet.getCount() === 3, "count mismatch");
//		result = mySet.tryRemove(obj1_dupe);
//		logger.assert(result, "should remove ok");
//		logger.assert(mySet.getCount() === 2, "count mismatch");
//		result = mySet.tryAdd(obj1_dupe);
//		logger.assert(result, "should add ok");
//		result = mySet.tryAdd(obj1_dupe);
//		logger.assert(!result, "should not be able to add");
//		logger.assert(!mySet.tryAdd("123"), "should not be able to add");
//		logger.assert(!mySet.tryAdd(123), "should not be able to add");
//		logger.assert(mySet.getCount() === 3, "count mismatch");
//		//logger.writeDebug("ITERATIONDICTIONARY TESTS ");
//		//var tst = new IterationDictionary<string, number>();
//		//result = tst.tryAdd("one", 1);
//		//console.log(result);
//		//result = tst.tryAdd("one", 1);
//		//console.log(!result);
//		//result = tst.tryAdd("two", 2);
//		//console.log(result);
//		//result = tst.tryAdd("three", 3);
//		//console.log(result);
//		//console.log("trying enumare 1,2,3,1");
//		//console.log("iteration index = " + tst._currentIndex);
//		//console.log(tst.moveNext());
//		//console.log("just movedNext: iteration index = " + tst._currentIndex);	
//		//console.log("expect 1");
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log(tst.moveNext());
//		//console.log("just movedNext: iteration index = " + tst._currentIndex);	
//		//console.log("expect 2");
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log(tst.moveNext());
//		//console.log("just movedNext: iteration index = " + tst._currentIndex);	
//		//console.log("expect 3");
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log(tst.moveNext(true));
//		//console.log("just movedNext: iteration index = " + tst._currentIndex);
//		//console.log("expect 1");
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("about to remove two.  iteration index = " + tst._currentIndex);		
//		//result = tst.tryRemove("two");
//		//console.log(result);
//		//result = tst.tryRemove("two");
//		//console.log(!result);
//		//console.log("removed two.   iteration index = " + tst._currentIndex);		
//		//console.log("expect 1");
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("=============   moving to next (expect 3)");
//		//console.log(tst.moveNext());
//		//console.log("just movedNext: iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("about to remove three.  iteration index = " + tst._currentIndex);	
//		//result = tst.tryRemove("three");
//		//console.log(result);
//		//result = tst.tryRemove("three");
//		//console.log(!result);
//		//tst.moveNext(true);
//		//console.log("==================== expect 1 (the only left).  count = " + tst.getCount());
//		//console.log("iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("==================== adding 2, 3");
//		//result = tst.tryAdd("one", 1);
//		//console.log(!result);
//		//result = tst.tryAdd("two", 2);
//		//console.log(result);
//		//result = tst.tryAdd("three", 3);
//		//console.log(result);
//		//console.log(" --------------- trying get current.  expect 1.   .  count = " + tst.getCount());
//		//console.log("iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("iteration index = " + tst._currentIndex);
//		//console.log(tst.moveNext());
//		//console.log("expect 2.  just movedNext: iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log(tst.moveNext());
//		//console.log("expect 3.  just movedNext: iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//tst.resetIteration();
//		//console.log(tst.moveNext());
//		//console.log("expect 1.  just movedNext: iteration index = " + tst._currentIndex);
//		//console.log(tst.getCurrent().key);
//		//console.log(tst.getCurrent().value);
//		//console.log("about to remove two.  iteration index = " + tst._currentIndex);	
//		//result = tst.tryRemove("two");
//		//console.log(result);
//		//result = tst.tryRemove("two");
//		//console.log(!result);	
//	}
//}
////only run if in test mode
//if (logger._TEST_MODE) {
//	var start = Date.now();
//	var unitTests = new UnitTests();
//	unitTests.execListTests();
//	unitTests.execSetTests();
//	var elapsed = Date.now() - start;
//	logger.writeTrace("UnitTests", "finished executing corelib.collection unit tests.  duration={0}ms", elapsed);
//	//debugger;
//}
///* jshint +W071 */
////#endregion unit tests
//# sourceMappingURL=collections.js.map