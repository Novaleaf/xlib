/** convert a Error.stack string to an array*/
export declare function stackStringToArray(stack: string, keepHeader?: boolean, keepWhitespace?: boolean): string[];
/** obtain a stacktrace.  TODO:  replace with https://github.com/eriwen/javascript-stacktrace  ???  maybe, try at least */
export declare function getStackTrace(maxStackSize?: number): string[];
