export function copy(array, startIndex, endIndex) {
    if (startIndex === void 0) { startIndex = 0; }
    return Array.prototype.slice.call(array, startIndex, endIndex);
}
export function isArray(it) {
    return Object.prototype.toString.call(it) === "[object Array]";
}
/** append the elements from an array to the end of your targetArray */
export function append(array, toAppend) {
    array.push.apply(array, toAppend);
}
/** remove the first occurance of the item */
export function removeFirst(array, toRemove) {
    var index = array.indexOf(toRemove);
    if (index < 0) {
        //throw new ex.CorelibException("not found to remove");
        return false;
    }
    array.splice(index, 1);
    return true;
}
/** if exist, remove first occurance,  returns true if successful. */
export function tryRemoveFirst(array, toRemove) {
    var index = array.indexOf(toRemove);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
}
/** check if value exists in the array */
export function contains(array, toFind) {
    return array.indexOf(toFind) >= 0;
}
/** returns an array containing the removed elements */
export function removeAt(array, index, count) {
    if (count === void 0) { count = 1; }
    return array.splice(index, count);
}
/** removes all elements after the given length.  returns the removed items*/
export function removeAfter(array, lengthToKeep) {
    return array.splice(lengthToKeep, array.length);
}
/**
 *  split an array into chunks according to maxChunkSize
 * @param array
 * @param maxChunkSize
 */
export function chunk(array, maxChunkSize) {
    var toReturn = [];
    for (var i = 0; i < array.length; i += maxChunkSize) {
        toReturn.push(array.slice(i, i + maxChunkSize));
    }
    return toReturn;
}
//# sourceMappingURL=arrayhelper.js.map