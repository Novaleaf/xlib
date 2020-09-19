export declare function copy<T>(array: Array<T>, startIndex?: number, endIndex?: number): Array<T>;
export declare function isArray(it: any): boolean;
/** append the elements from an array to the end of your targetArray */
export declare function append<T>(array: Array<T>, toAppend: Array<T>): void;
/** remove the first occurance of the item */
export declare function removeFirst<T>(array: Array<T>, toRemove: T): boolean;
/** if exist, remove first occurance,  returns true if successful. */
export declare function tryRemoveFirst<T>(array: Array<T>, toRemove: T): boolean;
/** check if value exists in the array */
export declare function contains<T>(array: Array<T>, toFind: T): boolean;
/** returns an array containing the removed elements */
export declare function removeAt<T>(array: Array<T>, index: number, count?: number): Array<T>;
/** removes all elements after the given length.  returns the removed items*/
export declare function removeAfter<T>(array: Array<T>, lengthToKeep: number): Array<T>;
/**
 *  split an array into chunks according to maxChunkSize
 * @param array
 * @param maxChunkSize
 */
export declare function chunk<T>(array: Array<T>, maxChunkSize: number): Array<Array<T>>;
/** if the array is longer than given size, truncates it.
    * modifies passed in array
 */
export declare function maxLen(array: Array<any>, maxLength: number): void;
//# sourceMappingURL=arrayhelper.d.ts.map