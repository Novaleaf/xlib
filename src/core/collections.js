"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringHelper = require("./stringhelper");
//import arrayHelper = require("./arrayhelper");
const numHelper = require("./numhelper");
const ex = require("./exception");
//import runtime = require("./runtime");
//import diagnostics = require("./diagnostics");
const bb = require("bluebird");
const moment = require("moment");
/** up to 32 true/false values stored in 32bits (a bitmask) */
class BitFlags {
    constructor(bitFlagsOrRawBuffer) {
        /** internal storage for our bitflags (just a number!) */
        this.rawBuffer = 0;
        if (bitFlagsOrRawBuffer == null) {
            this.rawBuffer = 0;
        }
        else if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer = rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer = flags.rawBuffer;
        }
    }
    static assertIndexInRange(index) {
        if (index < BitFlags.MAXFLAGS && index >= 0) {
            return;
        }
        throw new ex.CorelibException(stringHelper.format("index out of bounds.  You supplied %s while expected range is 0 to %i", index, BitFlags.MAXFLAGS - 1));
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
    add(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer |= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer |= flags.rawBuffer;
        }
    }
    static add(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer |= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer |= flags.rawBuffer;
        }
    }
    subtract(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~flags.rawBuffer;
        }
    }
    static subtract(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer &= ~rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer &= ~flags.rawBuffer;
        }
    }
    flip(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer ^= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer ^= flags.rawBuffer;
        }
    }
    static flip(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer ^= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer ^= flags.rawBuffer;
        }
    }
    isAllOn(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    }
    static isAllOn(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    }
    isAnyOn(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) !== 0;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) !== 0;
        }
    }
    static isAnyOn(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) !== 0;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) !== 0;
        }
    }
    equals(bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return this.rawBuffer === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return this.rawBuffer === flags.rawBuffer;
        }
    }
    static equals(rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return rawBuffer === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
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
        }, this.autoTryCleanupInterval.asMilliseconds());
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
        if (item != null && item.expires < moment()) {
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
        if (item.expires < moment()) {
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
        this._storage[key] = { value: value, expires: moment().add(customLifetime) };
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
    let toReturn = new bb((resolve, reject) => {
        function _iterationWorker() {
            if (nextIndex >= keys.length) {
                return resolve();
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
                return reject(err);
            });
        }
        _iterationWorker();
    });
    return toReturn;
}
exports.ezForEachAndRemove = ezForEachAndRemove;
//# sourceMappingURL=collections.js.map