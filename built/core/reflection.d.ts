/** primitive types as identified by javascript, plus well known object types */
export declare enum Type {
    /** null is not undefined, unfortunately  */
    "null" = 0,
    "undefined" = 1,
    "string" = 2,
    "number" = 3,
    "boolean" = 4,
    "function" = 5,
    /** unknown (custom) object types.  you can use .getTypeName(obj) to get the actual type name */
    "object" = 6,
    /** a class that can be constructed via the "new" keyword */
    classCtor = 7,
    /** derrives from error.   can use .getTypeName(err) to get names of errors that derrive from the Error base type*/
    Error = 8,
    Array = 9,
    RegExp = 10,
    Date = 11
}
/** provides the primitive type of a variable. better than using 'typeof()' because this handles array and null. */
export declare function getType(obj: any): Type;
/** get the name of an object's type. better than using 'typeof()' because this handles array and null.*/
export declare function getTypeName(obj: any): string;
/** names of all parameters of a function */
export declare function getArgumentNames(args: IArguments): string[];
export declare function getArgumentNames(func: Function): string[];
/** returns a key-value collection of argument names (keys) and their mapped input arg (values).
 * if no argumentNames are passed in, the current function's argument names are used.
 * useful for debugging/logging parameters */
export declare function mapArgumentsValues(args: IArguments, argumentNames?: string[]): {
    [argName: string]: any;
};
//# sourceMappingURL=reflection.d.ts.map