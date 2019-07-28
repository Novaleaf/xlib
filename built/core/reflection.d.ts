/** primitive types as identified by javascript, plus well known object types */
export declare enum Type {
    /** null is not undefined, unfortunately  */
    "null" = 0,
    "undefined" = 1,
    "string" = 2,
    "number" = 3,
    "boolean" = 4,
    "function" = 5,
    "symbol" = 6,
    /** unknown (custom) object types.  you can use .getTypeName(obj) to get the actual type name */
    "object" = 7,
    /** a class that can be constructed via the "new" keyword */
    classCtor = 8,
    /** derrives from error.   can use .getTypeName(err) to get names of errors that derrive from the Error base type*/
    Error = 9,
    Array = 10,
    RegExp = 11,
    Date = 12
}
/** provides the primitive type of a variable. better than using 'typeof()' because this handles array and null. */
export declare function getType(obj: any): Type;
/** get all properties of an object, excluding constructor, Symbols, and props from Object.prototype
 *
 * **Why is this useful?** to get fields and functions of a class instantiated object.
*/
export declare function getPropertyNames(obj: any): Set<string>;
/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
export declare function getTypeName(obj: any): string;
/** names of all parameters of a function */
export declare function getArgumentNames(argsOrFunction: IArguments | Function): Array<string>;
/** returns a key-value collection of argument names (keys) and their mapped input arg (values).
 * if no argumentNames are passed in, the current function's argument names are used.
 * useful for debugging/logging parameters */
export declare function mapArgumentsValues(args: IArguments, argumentNames?: Array<string>): {
    [argName: string]: any;
};
//# sourceMappingURL=reflection.d.ts.map