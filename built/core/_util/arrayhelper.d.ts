export declare function copy<T>(array: T[], startIndex?: number, endIndex?: number): T[];
export declare function isArray(it: any): boolean;
/** append the elements from an array to the end of your targetArray */
export declare function append<T>(array: T[], toAppend: T[]): void;
/** remove the first occurance of the item */
export declare function removeFirst(array: any[], toRemove: any): boolean;
/** if exist, remove first occurance,  returns true if successful. */
export declare function tryRemoveFirst(array: any[], toRemove: any): boolean;
/** check if value exists in the array */
export declare function contains(array: any[], toFind: any): boolean;
/** returns an array containing the removed elements */
export declare function removeAt<T>(array: T[], index: number, count?: number): T[];
/** removes all elements after the given length.  returns the removed items*/
export declare function removeAfter<T>(array: T[], lengthToKeep: number): T[];
/**
 *  split an array into chunks according to maxChunkSize
 * @param array
 * @param maxChunkSize
 */
export declare function chunk<T>(array: T[], maxChunkSize: any): T[][];
/** if the array is longer than given size, truncates it.
    * modifies passed in array
 */
export declare function maxLen(array: any[], maxLength: number): void;
//# sourceMappingURL=arrayhelper.d.ts.map