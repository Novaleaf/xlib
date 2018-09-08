/// <reference types="node" />
/** An optional options object may be passed that alters certain aspects of the formatted string:

showHidden - if true then the object's non-enumerable properties will be shown too. Defaults to false.

depth - tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.

colors - if true, then the output will be styled with ANSI color codes. Defaults to false. Colors are customizable, see below.

customInspect - if false, then custom inspect() functions defined on the objects being inspected won't be called. Defaults to true.
 */
export interface InspectOptions {
    /** showHidden - if true then the object's non-enumerable properties will be shown too. Defaults to false. */
    showHidden?: boolean;
    /** depth - tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null. */
    depth?: number;
    /** colors - if true, then the output will be styled with ANSI color codes. Defaults to false. Colors are customizable, see below. */
    colors?: boolean;
    /** customInspect - if false, then custom inspect() functions defined on the objects being inspected won't be called. Defaults to true. */
    customInspect?: boolean;
}
export interface ITemplateParseOptions {
    /** used by the JSON object, transforms a node from one type to another.  for example, useful for turning a string to Date or Moment object */
    reviver?: (key: any, value: any) => any;
    /** if true, an object can be passed in, not just a string or Buffer */
    allowObjectInput?: boolean;
    /** if true, attempts to parse any additional strings found in the input (and does this recursively) */
    parseOrphans?: boolean;
    /** if true, deletes any orphans found.   to ignore pruning of a node's children, set that node to null.  ex: ```myTemplate.userTags=null``` */
    pruneOrphans?: boolean;
    /** if true, will sanitize strings to prevent injection attacks.  default false. */
    escapeStrings?: boolean;
    /** if set, throws an exception if the input is too long */
    maxInputLength?: number;
}
/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 *
 */
export declare class JsonX {
    /**
      * === JSON5.Parse (much more forgiving parser). ===
      * see http://json5.org/
      * 		[-- JSON5 - Modern JSON --]
    JSON isn't the friendliest to write and maintain by hand. Keys need to be quoted; objects and arrays can't have trailing commas;
    comments aren't supported - even though none of these are the case with regular JavaScript today.
    [-- WHEN TO USE THIS --]
for parsing simple, hand-written configs, such as those embedded into html element attributes
serializes objects to a JSON compatable format.
deserializes from a more relaxed superset of json (allows syntactically correct es5 javascript)
    [-- Features of JSON5 --]
    == Objects ==
    Object keys can be unquoted if they're valid identifiers. Yes, even reserved keywords are valid unquoted keys in ES5 [11.1.5, 7.6].
    [TODO: Unicode characters and escape sequences aren't yet supported in this implementation.]
    Objects can have trailing commas.
    == Arrays ==
    Arrays can have trailing commas.
    == Strings ==
    Strings can be single-quoted.
    Strings can be split across multiple lines; just prefix each newline with a backslash. [ES5 7.8.4]
    == Numbers ==
    Numbers can be hexadecimal (base 16). (Note that signed hexadecimals are not allowed by ES5, nor are hexadecimal floats.)
    Numbers can begin or end with a (leading or trailing) decimal point.
    Numbers can include Infinity and -Infinity.
    Numbers can begin with an explicit plus (+) sign.
    == Comments ==
    Both inline (single-line) and block (multi-line) comments are allowed. */
    parse(text: string | Buffer, reviver?: (key: any, value: any) => any, 
    /** if true, will sanitize strings to prevent injection attacks.  default false. */
    escapeStrings?: boolean, 
    /** if set, throws an exception if the input is too long */
    maxInputLength?: number): any;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      */
    stringify(value: any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer A function that transforms the results.
      */
    stringify(value: any, replacer: (key: string, value: any) => any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer Array that transforms the results.
      */
    stringify(value: any, replacer: any[]): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer A function that transforms the results.
      * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
      */
    stringify(value: any, replacer: (key: string, value: any) => any, space: any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer Array that transforms the results.
      * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
      */
    stringify(value: any, replacer: any[], space: any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
        different from normal stringify in that we omit visual clutter like " marks around keys.
      */
    stringifyX(value: any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer A function that transforms the results.
      */
    stringifyX(value: any, replacer: (key: string, value: any) => any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer Array that transforms the results.
      */
    stringifyX(value: any, replacer: any[]): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer A function that transforms the results.
      * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
      */
    stringifyX(value: any, replacer: (key: string, value: any) => any, space: any): string;
    /**
      * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
      * @param value A JavaScript value, usually an object or array, to be converted.
      * @param replacer Array that transforms the results.
      * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
      */
    stringifyX(value: any, replacer: any[], space: any): string;
    /** parses your object, then attempts to parse string values in your object.  failed parse() calls will return the original string for that variable */
    parseRecursive(textOrObj: any, reviver?: (key: any, value: any) => any, 
    /** if true, will sanitize strings to prevent injection attacks.  default false. */
    escapeStrings?: boolean, 
    /** if set, throws an exception if the input is too long */
    maxInputLength?: number): any;
    /** take any object (including complex/circular referenced) and generate an object that's compatable with JSON.stringify().
    good for data visualization, but not much else
    important note:  arrays are converted to json objects.  you can tell it was an array by looking at the '[*TYPE*]' and that the keys will be integers starting from '0'.
    * @param value A JavaScript value, usually an object or array, to be converted.
    * @param replacer A function that transforms the results.
    * @param hideType default false.  If true, does not display the non-primitive's type.
    * @param disableCircularDetection default false.  if false,adds (and then deletes) a tracking token on each object to determine circular references.
    * @param showVerboseDetails default false.  If true, includes stack trace for errors, and body for functions. (potentially very long... verbose!)
    * @param verboseObjectsOut pass an array to have error objects and functions added.  useful if you want to show error details (Ex: stack traces) seperately.
    * @param maxSearchDepth default=2.  if the object has circular references, this is the max depth we brute-force through trying to find JSON.stringifiable objects.
    * note once we find an an object is stringifiable (no circular references), maxSearchDepth is ignored for that object and it's children.
    * @param space Adds indentation, white space (default is \t), and line break characters to the return-value JSON text to make it easier to read.*/
    inspectJSONify(value: any, maxSearchDepth?: number, hideType?: boolean, showVerboseDetails?: boolean, disableCircularDetection?: boolean, replacer?: (key: string, value: any) => any, verboseObjectsOut?: Array<Error>): any;
    /**
    Converts a JavaScript value to a bastardized (but still valid) JSON string.
    This is simply superJSONify() but outputs to a sting instead of an object. (ie: for human presentation)
    * @param value A JavaScript value, usually an object or array, to be converted.
    * @param replacer A function that transforms the results.
    * @param hideType default false.  If true, does not display the non-primitive's type.
    * @param disableCircularDetection default false.  if false,adds (and then deletes) a tracking token on each object to determine circular references.
    * @param showVerboseDetails default false.  If true, includes stack trace for errors, and body for functions. (potentially very long... verbose!)
    * @param verboseObjectsOut pass an array to have error objects and functions added.  useful if you want to show error details (Ex: stack traces) seperately.
    * @param maxSearchDepth default=2.  if the object has circular references, this is the max depth we brute-force through trying to find JSON.stringifiable objects.
    * note once we find an an object is stringifiable (no circular references), maxSearchDepth is ignored for that object and it's children.
    * @param space Adds indentation, white space (default is \t), and line break characters to the return-value JSON text to make it easier to read.*/
    inspectStringify(value: any, maxSearchDepth?: number, hideType?: boolean, showVerboseDetails?: boolean, disableCircularDetection?: boolean, replacer?: (key: string, value: any) => any, space?: any, verboseObjectsOut?: Array<Error>): string;
    /** convert user input (options,config,etc) into the format expected by you (as defined by the template parameter).
     * similar to parseRecursive, but doesn't attempt to recursively parse fields not found in the template (unless the parseOrphans parameter is set).
     * DOES NOT fail if user input doesn't include fields in the template.  they just won't exist in the output.  to specify "default values" for these missing fields, use runtime.jsHelper.mixin()
    */
    parseUsingTemplate<T>(templateObj: T, 
    /** you can pass a string or Buffer (to parse to an object) or an existing object */
    input: string | Buffer | any, options: ITemplateParseOptions): T;
    /** == wrapper over nodejs.util.inspect().  the output is *NOT* JSON compatable! ==
    ----------------
    Return a string representation of object, which is useful for debugging.
    Example of inspecting all properties of the util object:

    var util = require('util');

    console.log(util.inspect(util, { showHidden: true, depth: null }));
    Customizing util.inspect colors#
    Color output (if enabled) of util.inspect is customizable globally via util.inspect.styles and util.inspect.colors objects.

    util.inspect.styles is a map assigning each style a color from util.inspect.colors. Highlighted styles and their default values are:
    number (yellow) boolean (yellow) string (green) date (magenta) regexp (red) null (bold) undefined (grey) special - only function at this time (cyan) * name (intentionally no styling)

    Predefined color codes are: white, grey, black, blue, cyan, green, magenta, red and yellow. There are also bold, italic, underline and inverse codes.

    Objects also may define their own inspect(depth) function which util.inspect() will invoke and use the result of when inspecting the object:

    var util = require('util');

    var obj = { name: 'nate' };
    obj.inspect = function(depth) {
      return '{' + this.name + '}';
    };

    util.inspect(obj);
      // "{nate}" */
    inspectToText(object: any, options?: InspectOptions): string;
}
/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 */
export declare var JSONX: JsonX;
export declare module _d3dsv {
    /** A parser and formatter for DSV (CSV and TSV) files.
Extracted from D3. */
    class D3Dsv {
        /** Parses the specified string, which is the contents of a CSV file, returning an array of objects representing the parsed rows.
        The string is assumed to be RFC4180-compliant.
        Unlike the parseRows method, this method requires that the first line of the CSV file contains a comma-separated list of column names;
        these column names become the attributes on the returned objects.
        For example, consider the following CSV file:

Year,Make,Model,Length
1997,Ford,E350,2.34
2000,Mercury,Cougar,2.38

The resulting JavaScript array is:

[  {"Year": "1997", "Make": "Ford", "Model": "E350", "Length": "2.34"},
  {"Year": "2000", "Make": "Mercury", "Model": "Cougar", "Length": "2.38"} ]
         */
        parse<TRow>(table: string, 
        /** coerce cells (strings) into different types or modify them. return null to strip this row from the output results. */
        accessor?: (row: any) => TRow): TRow[];
        /** Parses the specified string, which is the contents of a CSV file, returning an array of arrays representing the parsed rows. The string is assumed to be RFC4180-compliant. Unlike the parse method, this method treats the header line as a standard row, and should be used whenever the CSV file does not contain a header. Each row is represented as an array rather than an object. Rows may have variable length. For example, consider the following CSV file:

1997,Ford,E350,2.34
2000,Mercury,Cougar,2.38
The resulting JavaScript array is:

[  ["1997", "Ford", "E350", "2.34"],
  ["2000", "Mercury", "Cougar", "2.38"] ]
Note that the values themselves are always strings; they will not be automatically converted to numbers. See parse for details.*/
        parseRows<TRow>(table: string, 
        /** coerce cells (strings) into different types or modify them. return null to strip this row from the output results.*/
        accessor?: (row: string[]) => TRow): TRow[];
        /** Converts the specified array of rows into comma-separated values format, returning a string. This operation is the reverse of parse. Each row will be separated by a newline (\n), and each column within each row will be separated by a comma (,). Values that contain either commas, double-quotes (") or newlines will be escaped using double-quotes.

Each row should be an object, and all object properties will be converted into fields. For greater control over which properties are converted, convert the rows into arrays containing only the properties that should be converted and use formatRows. */
        format(rows: any[]): string;
        /** Converts the specified array of rows into comma-separated values format, returning a string. This operation is the reverse of parseRows. Each row will be separated by a newline (\n), and each column within each row will be separated by a comma (,). Values that contain either commas, double-quotes (") or newlines will be escaped using double-quotes. */
        formatRows(rows: any[]): string;
    }
    type loaderFunction = (
    /** the symbol used to seperate cells in the row.*/
    delimiter: string, 
    /** example: "text/plain" */
    encoding?: string) => _d3dsv.D3Dsv;
}
/** A parser and formatter for DSV (CSV and TSV) files.
Extracted from D3.
https://www.npmjs.com/package/d3-dsv */
export declare var dsv: _d3dsv.loaderFunction;
//# sourceMappingURL=serialization.d.ts.map