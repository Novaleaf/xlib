"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stringHelper = require("./stringhelper");
//import * as arrayHelper from "./arrayhelper";
var numHelper = require("./numhelper");
var ex = require("./exception");
//import runtime = require("./runtime");
//import diagnostics = require("./diagnostics");
//import datetime = require("./datetime");
var moment = require("moment");
//import * as promise from "./promise";
var Promise = require("bluebird");
/** up to 32 true/false values stored in 32bits (a bitmask) */
var BitFlags = (function () {
    function BitFlags(bitFlagsOrRawBuffer) {
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
    BitFlags.assertIndexInRange = function (index) {
        if (index < BitFlags.MAXFLAGS && index >= 0) {
            return;
        }
        throw new ex.CorelibException(stringHelper.format("index out of bounds.  You supplied %s while expected range is 0 to %i", index, BitFlags.MAXFLAGS - 1));
    };
    /** return the value of a certain flag */
    BitFlags.prototype.getFlag = function (index) {
        BitFlags.assertIndexInRange(index);
        return ((this.rawBuffer & (0x01 << index)) !== 0);
    };
    BitFlags.getFlag = function (rawBuffer, index) {
        BitFlags.assertIndexInRange(index);
        return ((rawBuffer & (0x01 << index)) !== 0);
    };
    BitFlags.prototype.setFlag = function (index, value) {
        BitFlags.assertIndexInRange(index);
        if (value) {
            this.rawBuffer |= (0x01) << index;
        }
        else {
            this.rawBuffer &= (~(0x01) << index);
        }
    };
    BitFlags.setFlag = function (rawBuffer, index, value) {
        BitFlags.assertIndexInRange(index);
        if (value) {
            rawBuffer |= (0x01) << index;
        }
        else {
            rawBuffer &= (~(0x01) << index);
        }
    };
    /** flips the value of the flag */
    BitFlags.prototype.flipFlag = function (index) {
        BitFlags.assertIndexInRange(index);
        this.rawBuffer ^= ((0x01 << index));
    };
    BitFlags.flipFlag = function (rawBuffer, index) {
        BitFlags.assertIndexInRange(index);
        rawBuffer ^= ((0x01 << index));
    };
    /** reset everything to false */
    BitFlags.prototype.clear = function () {
        this.rawBuffer = 0;
    };
    BitFlags.prototype.add = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer |= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer |= flags.rawBuffer;
        }
    };
    BitFlags.add = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer |= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer |= flags.rawBuffer;
        }
    };
    BitFlags.prototype.subtract = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer &= ~flags.rawBuffer;
        }
    };
    BitFlags.subtract = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer &= ~rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer &= ~flags.rawBuffer;
        }
    };
    BitFlags.prototype.flip = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            this.rawBuffer ^= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            this.rawBuffer ^= flags.rawBuffer;
        }
    };
    BitFlags.flip = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            rawBuffer ^= rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            rawBuffer ^= flags.rawBuffer;
        }
    };
    BitFlags.prototype.isAllOn = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    };
    BitFlags.isAllOn = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) === flags.rawBuffer;
        }
    };
    BitFlags.prototype.isAnyOn = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (this.rawBuffer & rawBufferInput) !== 0;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (this.rawBuffer & flags.rawBuffer) !== 0;
        }
    };
    BitFlags.isAnyOn = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return (rawBuffer & rawBufferInput) !== 0;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return (rawBuffer & flags.rawBuffer) !== 0;
        }
    };
    BitFlags.prototype.equals = function (bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return this.rawBuffer === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return this.rawBuffer === flags.rawBuffer;
        }
    };
    BitFlags.equals = function (rawBuffer, bitFlagsOrRawBuffer) {
        if (typeof (bitFlagsOrRawBuffer) === "number") {
            var rawBufferInput = bitFlagsOrRawBuffer;
            return rawBuffer === rawBufferInput;
        }
        else {
            var flags = bitFlagsOrRawBuffer;
            return rawBuffer === flags.rawBuffer;
        }
    };
    BitFlags.prototype.getHashCode = function () {
        return this.rawBuffer;
    };
    return BitFlags;
}());
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
var ExpiresDictionary = (function () {
    function ExpiresDictionary(autoTryCleanupInterval, defaultLifetime) {
        var _this = this;
        this.autoTryCleanupInterval = autoTryCleanupInterval;
        this.defaultLifetime = defaultLifetime;
        this._storage = {};
        this._nextInspectIndex = 0;
        this._inspectKeys = [];
        /** estimates the non-expired items contained (this is an upper-bound).   increased by setting (new items created), decreased by garbage cleanup. */
        this._allocatedItemSlots = 0;
        setInterval(function () {
            _this._tryCleanupOne();
        }, this.autoTryCleanupInterval.asMilliseconds());
    }
    ExpiresDictionary.prototype._tryCleanupOne = function () {
        if (this._nextInspectIndex >= this._inspectKeys.length) {
            //past end, re-aquire
            this._nextInspectIndex = 0;
            this._inspectKeys = Object.keys(this._storage);
        }
        if (this._inspectKeys.length < 1) {
            return; //nothing to do;
        }
        //try to clean up (dispose) an item that's too old
        var currentIndex = this._nextInspectIndex;
        this._nextInspectIndex++;
        var key = this._inspectKeys[currentIndex];
        var item = this._storage[key];
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
    };
    ExpiresDictionary.prototype.get = function (key, defaultIfUndefined) {
        var item = this._storage[key];
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
    };
    ExpiresDictionary.prototype.set = function (key, value, customLifetime) {
        if (customLifetime === void 0) { customLifetime = this.defaultLifetime; }
        if (this._storage[key] === undefined) {
            this._allocatedItemSlots++;
        }
        this._storage[key] = { value: value, expires: moment().add(customLifetime) };
    };
    ExpiresDictionary.prototype.delete = function (key) {
        delete this._storage[key];
    };
    return ExpiresDictionary;
}());
exports.ExpiresDictionary = ExpiresDictionary;
/**
 *  enumerate over the key+items in a collection, removing each pair as they are enumerated. *
 */
function ezForEachAndRemove(
    /** a javascript object with enumerable properties */
    collection, 
    /** return a rejected promise from the callback to abort enumeration.  item is removed from collection immediatly prior to the callback being invoked, so if you wish it to remain in the collection you will need to manually re-add it.*/
    callback) {
    var keys = Object.keys(collection);
    var nextIndex = 0;
    var toReturn = new Promise(function (resolve, reject) {
        function _iterationWorker() {
            if (nextIndex >= keys.length) {
                resolve();
                return;
            }
            var currentIndex = nextIndex;
            nextIndex++;
            var currentKey = keys[currentIndex];
            var currentItem = collection[currentKey];
            //remove value to be enumerated
            delete collection[currentKey];
            callback(currentItem, currentKey)
                .then(function () {
                _iterationWorker();
            }, function (err) {
                return reject(err);
            });
        }
        _iterationWorker();
    });
    return toReturn;
}
exports.ezForEachAndRemove = ezForEachAndRemove;
/** a queue that returns Promises, allowing oversubscribing.   if there is a deficit of available items an unresolve promise will be returned by .dequeue().  processing occurs in a FIFO fashion.  */
var PromiseQueue = (function () {
    function PromiseQueue() {
        /** stores queue values */
        this._storage = [];
        /** stores deficit (unresolved) promises */
        this._awaitQueue = [];
    }
    Object.defineProperty(PromiseQueue.prototype, "availableCount", {
        /** how many items are currently available for dequeing.  If this is more than zero, .awaitCount will be zero. */
        get: function () { return this._storage.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseQueue.prototype, "awaitCount", {
        /** number of deficit requests.   if this is more than zero, .availableCount will be zero. */
        get: function () { return this._awaitQueue.length; },
        enumerable: true,
        configurable: true
    });
    /** private helper that processes available values */
    PromiseQueue.prototype._processPending = function () {
        while (this.availableCount > 0 && this.awaitCount > 0) {
            var val = this._storage.shift();
            var toProcess = this._awaitQueue.shift();
            if (toProcess == null) {
                throw new Error("corrupted state, PromiseQueue._awaitQueue failed to dequeue");
            }
            toProcess.resolve(val);
        }
    };
    /** obtain a promise for a value.   if no values are available, will return an unresolved promise.   Unresolved promises are resolved in a FIFO fashion when .enqueue() is called. */
    PromiseQueue.prototype.dequeue = function () {
        var deferred = {};
        deferred.promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        this._awaitQueue.push(deferred);
        this._processPending();
        return deferred.promise;
    };
    /** enqueue a value.  if there are pending deqeueue() requests they are resolved in a FIFO fashion when you call this. */
    PromiseQueue.prototype.enqueue = function (val) {
        this._storage.push(val);
        this._processPending();
    };
    return PromiseQueue;
}());
exports.PromiseQueue = PromiseQueue;
//# sourceMappingURL=collections.js.map