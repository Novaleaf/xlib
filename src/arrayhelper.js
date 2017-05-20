"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function copy(array, startIndex, endIndex) {
    if (startIndex === void 0) { startIndex = 0; }
    return Array.prototype.slice.call(array, startIndex, endIndex);
}
exports.copy = copy;
function isArray(it) {
    return Object.prototype.toString.call(it) === "[object Array]";
}
exports.isArray = isArray;
/** append the elements from an array to the end of your targetArray */
function append(array, toAppend) {
    array.push.apply(array, toAppend);
}
exports.append = append;
/** remove the first occurance of the item */
function removeFirst(array, toRemove) {
    var index = array.indexOf(toRemove);
    if (index < 0) {
        //throw new ex.CorelibException("not found to remove");
        return false;
    }
    array.splice(index, 1);
    return true;
}
exports.removeFirst = removeFirst;
/** if exist, remove first occurance,  returns true if successful. */
function tryRemoveFirst(array, toRemove) {
    var index = array.indexOf(toRemove);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
}
exports.tryRemoveFirst = tryRemoveFirst;
/** check if value exists in the array */
function contains(array, toFind) {
    return array.indexOf(toFind) >= 0;
}
exports.contains = contains;
/** returns an array containing the removed elements */
function removeAt(array, index, count) {
    if (count === void 0) { count = 1; }
    return array.splice(index, count);
}
exports.removeAt = removeAt;
/** removes all elements after the given length.  returns the removed items*/
function removeAfter(array, lengthToKeep) {
    return array.splice(lengthToKeep, array.length);
}
exports.removeAfter = removeAfter;
/**
 *  split an array into chunks according to maxChunkSize
 * @param array
 * @param maxChunkSize
 */
function chunk(array, maxChunkSize) {
    var toReturn = [];
    for (var i = 0; i < array.length; i += maxChunkSize) {
        toReturn.push(array.slice(i, i + maxChunkSize));
    }
    return toReturn;
}
exports.chunk = chunk;
//# sourceMappingURL=arrayhelper.js.map