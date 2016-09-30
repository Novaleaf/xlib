///// <reference path="../../../typings/all.d.ts" />

import * as jsHelper from "./jshelper";
import * as reflection from "./reflection";
import * as ex from "./exception";

import * as json5 from "json5";
import * as stringHelper from "./stringhelper";
import * as Promise from "bluebird";
import * as moment from "moment";


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
import * as util from "util";



/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 * 
 */
export class JsonX {
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
    parse(
        text: string | Buffer,
        reviver?: (key: any, value: any) => any,
        /** if true, will sanitize strings to prevent injection attacks.  default false. */
        escapeStrings = false,
        /** if set, throws an exception if the input is too long */
        maxInputLength = -1
    ): any {


        if (text == null || text.length < 1) {
            return null;
            //throw new ex.CorelibException("JsonX.parse() failed due to null/empty input");
        }
        if (text.length === undefined) {
            throw new ex.CorelibException("JsonX.parse() failed due to non string/Buffer input");
        }

        if (maxInputLength >= 0) {
            if (text.length > maxInputLength) {
                throw new ex.CorelibException(`JsonX.parse() failed due to input length of ${text.length} exceeding max of ${maxInputLength} `);
            }
        }

        var typeName = reflection.getTypeName(text);
        if (typeName === "Buffer") {
            text = text.toString();
            typeName = typeof (text);
        }

        if (typeName !== "string") {
            throw new ex.CorelibException("JsonX.parse() failed due to typeof text != string");
        }
        var pojo: {};
        try {
            pojo = json5.parse.apply(json5, arguments);
        } catch (err) {
            var message = `JsonX.parse() failed: ${err.message} original input=${text}`
            throw new ex.CorelibException(message);
        }

        function recurser(node: any): any {

            var nodeType = typeof (node);
            if (nodeType === "string") {
                var sanitizedValue = encodeURIComponent(node as string);// stringHelper.escapeUserInput(node as string);// encodeURIComponent(_sanitizeHtml(node as string));
                return sanitizedValue;
            } else if (nodeType === "object") {
                jsHelper.forEachProperty(node, (nodeValue, nodeKey) => {
                    node[nodeKey] = recurser(nodeValue);
                });
                return node;
            } else {
                return node;
            }
        }

        if (escapeStrings === true) {
            pojo = recurser(pojo);
        }

        return pojo;
    }
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
    stringify(...args: any[]): string {
        return JSON.stringify.apply(JSON, arguments);
    }

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
    stringifyX(...args: any[]): string {
        return json5.stringify.apply(json5, arguments);
    }





    /** parses your object, then attempts to parse string values in your object.  failed parse() calls will return the original string for that variable */
    parseRecursive(
        textOrObj: any,
        reviver?: (key: any, value: any) => any
        ,
        /** if true, will sanitize strings to prevent injection attacks.  default false. */
        escapeStrings = false,
        /** if set, throws an exception if the input is too long */
        maxInputLength = -1
    ): any {


        if (typeof (textOrObj) === "string") {
            try {
                textOrObj = this.parse(textOrObj, reviver, escapeStrings, maxInputLength);
            } catch (ex) {
                return textOrObj;
            }
        }
        jsHelper.forEachProperty(textOrObj, (value, key, obj) => {
            if (typeof (value) === "string") {
                obj[key] = this.parseRecursive(value, reviver, escapeStrings, maxInputLength);
            }
        });

        return textOrObj;
    }

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
    inspectJSONify(
        value: any,
        maxSearchDepth = 2, hideType = false, showVerboseDetails = false,
        disableCircularDetection = false, replacer?: (key: string, value: any) => any, verboseObjectsOut: Array<Error> = []): any {

        var _superStringifyTokenId = "$$___corelib.serialization.superStringify.tokenId";
        /** tracks objects that are flagged as circular references (we remove our tracking tag at the end) */
        var _processedNodes: any[] = [];

        /** recurses through a node's key/value pairs (all properties) */
        function _nodePropertyRecurser(node: any, depth: number, typeName: string, nodeDepthSearchDisabled = false): any {
            var objResult: { [key: string]: any } = {};

            if (!hideType && typeName !== "[*POJO*]") { //never show type for pojo's
                objResult["[*TYPE*]"] = typeName;
            }

            jsHelper.forEachProperty(node, (_value, _key) => {

                if (!disableCircularDetection && _key === _superStringifyTokenId) {
                    //don't show our marker
                    return;
                }
                //apply our replacer
                if (replacer != null) {
                    _value = replacer(_key, _value);
                }
                //invoke our main worker recursively on children
                objResult[_key] = _JSONifyWorker(_value, depth + 1, nodeDepthSearchDisabled);
            });

            return objResult;
        }
        /** does the main parsing of a node and figure's out how to act on it */
        function _JSONifyWorker(node: any, depth: number, nodeDepthSearchDisabled = false): any {
            var TYPE = reflection.Type;
            var type = reflection.getType(node);
            var typeName = reflection.getTypeName(node);
            if (typeName === "Object") {
                typeName = "[*POJO*]";
            }
            try {
                switch (type) {
                    case TYPE.boolean:
                    case TYPE.number:
                    case TYPE.string:
                        return node;
                    case TYPE.Date:
                        var date = (node as Date);
                        var dateDetails = {
                            "[*TYPE*]": typeName,
                            //epochMs: date.getTime(),
                            value: date.toISOString()
                        };
                        if (hideType) {
                            delete dateDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            return dateDetails.value;// delete dateDetails.epochMs;
                        }
                        return dateDetails;

                    case TYPE.function:
                        verboseObjectsOut.push(node);
                        var full: string = node.toString();
                        var fcnName = full.substring(full.indexOf(" "), full.indexOf("("));
                        var fcnParams = full.substring(full.indexOf("("), full.indexOf("{") - 1);
                        var fcnDetails = { "[*TYPE*]": typeName, signature: fcnName + fcnParams, full: full };
                        if (hideType) {
                            delete fcnDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            delete fcnDetails.full;
                        }
                        return fcnDetails;
                    case TYPE.Error:
                        verboseObjectsOut.push(node);
                        var errDetails = { "[*TYPE*]": typeName, name: node.name, message: node.message, stack: node.stack == null ? null : node.stack.split("\n") };
                        if (hideType) {
                            delete errDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            delete errDetails.stack;
                        }
                        return errDetails;
                    case TYPE.null:
                        return null;// "[*NULL*]";
                    case TYPE.undefined:
                        return "[*UNDEFINED*]";
                    case TYPE.RegExp:
                    //var regexp = (node as RegExp);
                    //var regexpDetails = { "[*TYPE*]": typeName, source: regexp.source, details: regexp.g };
                    //if (hideType) {
                    //    delete regexpDetails["[*TYPE*]"];
                    //}
                    //if (!showVerboseDetails) {
                    //    delete regexpDetails.source;
                    //}
                    //return regexpDetails;
                    case TYPE.Array:
                    case TYPE.object:
                        switch (typeName) {
                            case "Promise":
                                var promise = (node as Promise<any>);

                                if ((promise as any)["toJSON"] != null) {
                                    var promiseDetails = (promise as any).toJSON();
                                    promiseDetails["[*TYPE*]"] = typeName;
                                    return promiseDetails;
                                }
                                return { "[*TYPE*]": typeName, value: promise.toString() };
                            case "Buffer":
                                var buffer = (node as Buffer);
                                var bufferDetails = { "[*TYPE*]": typeName, value: stringHelper.summarize(buffer.toString(), 200), length: buffer.length };
                                if (hideType) {
                                    delete bufferDetails["[*TYPE*]"];
                                }
                                if (!showVerboseDetails) {
                                    //return bufferDetails.value;
                                }
                                return bufferDetails;
                            case "Stream":
                            case "ReadableStream":
                            case "WriteableStream":
                                var streamDetails = { "[*TYPE*]": typeName, value: "[*STREAM*]" };
                                if (hideType) {
                                    delete streamDetails["[*TYPE*]"];
                                }
                                if (!showVerboseDetails) {
                                    return streamDetails.value;
                                }
                                return streamDetails;
                            case "Moment":
                                let momentValue = (node as moment.Moment);
                                var momentDetails = { "[*TYPE*]": typeName, value: momentValue.toJSON() };
                                if (hideType) {
                                    delete momentDetails["[*TYPE*]"];
                                }
                                if (!showVerboseDetails) {
                                    return momentValue.toISOString();
                                }
                                return momentDetails;
                            default:
                                //try to see if a .toJSON() method exists
                                if (typeof (node["toJSON"]) !== "undefined") {
                                    var toJsonDetails = node.toJSON();
                                    toJsonDetails["[*TYPE*]"] = typeName;
                                    return toJsonDetails;
                                }
                                break;
                        }
                        try {
                            if (!nodeDepthSearchDisabled) {
                                //check to see if we can stringify (no circular dependencies)
                                JSONX.stringifyX(node, replacer as any);
                            }
                            //able to stringify (no exception thrown), so lets ignore depth searching for our children (avoid stringifying to gain perf)
                            return _nodePropertyRecurser(node, depth, typeName, true);
                        } catch (ex) {
                            //couldn't stringify
                            if (depth >= maxSearchDepth) {
                                return "[*MAX_DEPTH*]";
                            }
                            //can't stringify it, so...
                            if (ex.message.toLowerCase().indexOf("circular") < 0) {
                                //exception isn't due to circular, so let's just stop
                                return "[*ERROR_" + ex.toString() + "*]";
                            }
                            if (!disableCircularDetection) {
                                //circular, lets try to recursively work through this
                                if (node[_superStringifyTokenId] !== undefined) {
                                    //circular found, so stop
                                    return "[*CIRCULAR_REFERENCE*]";
                                }
                                //mark this as processed
                                node[_superStringifyTokenId] = null;
                                _processedNodes.push(node);
                            }
                            return _nodePropertyRecurser(node, depth, typeName);

                        }
                    default:
                        var unknownDetails = { "[*TYPE*]": typeName, status: "inspectJSONify does not know how to parse this", value: node.toString() };
                        if (hideType) {
                            delete unknownDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            return "[*???*] " + unknownDetails.value;
                        }
                        return unknownDetails;

                }
            } catch (ex) {
                //logger.assert(ex);
                return "error:  {0}" + String(ex);
            }
        }

        try {
            var normalizedResult = _JSONifyWorker(value, 0);
            return normalizedResult;
        } finally {
            if (!disableCircularDetection) {
                //clean up node tracker markers
                jsHelper.forEachArray(_processedNodes, (_value) => {
                    delete _value[_superStringifyTokenId];
                });
                _processedNodes.length = 0;
            }
        }
    }
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
    inspectStringify(
        value: any, maxSearchDepth?: number, hideType?: boolean, showVerboseDetails?: boolean,
        disableCircularDetection?: boolean, replacer?: (key: string, value: any) => any, space: any = "\t", verboseObjectsOut?: Array<Error>
    ): string {
        var normalizedResult = this.inspectJSONify(value, maxSearchDepth, hideType, showVerboseDetails, disableCircularDetection, replacer, verboseObjectsOut);
        var toReturn = this.stringifyX(normalizedResult, replacer as any, space);
        return toReturn;
    }


	/** convert user input (options,config,etc) into the format expected by you (as defined by the template parameter).
	 * similar to parseRecursive, but doesn't attempt to recursively parse fields not found in the template (unless the parseOrphans parameter is set).
	 * DOES NOT fail if user input doesn't include fields in the template.  they just won't exist in the output.  to specify "default values" for these missing fields, use runtime.jsHelper.mixin()
	*/
    parseUsingTemplate<T>(templateObj: T,
        /** you can pass a string (to parse to an object) or an existing object */
        input: string | Buffer | any,
        options: {
            reviver?: (key: any, value: any) => any;
            /** if true, an object can be passed in, not just a string or Buffer */
            allowObjectInput?: boolean;
            /** if true, attempts to parse any additional strings found in the input (and does this recursively) */
            parseOrphans?: boolean;
            /** if true, deletes any orphans found.   to ignore pruning of a node's children, set that node to null.  ex: ```myTemplate.userTags=null``` */
            pruneOrphans?: boolean;
            /** if true, will sanitize strings to prevent injection attacks.  default false. */
            escapeStrings?: boolean,
            /** if set, throws an exception if the input is too long */
            maxInputLength?: number;
        }
    ): T {
        if (options == null) {
            options = {};
        }
        if (options.maxInputLength == null) {
            options.maxInputLength = -1;
        }

        var inputType = reflection.getTypeName(input);


        var outputObject: T;

        if (inputType === "Buffer") {
            if (options.maxInputLength >= 0) {
                if (input.length > options.maxInputLength) {
                    throw new ex.CorelibException(`JsonX.parseUsingTemplate() failed.  input lenght of ${input.length} exceeds max of ${options.maxInputLength}.`);
                }
            }
            input = input.toString();
            inputType = reflection.getTypeName(input);
        }
        if (inputType === "string") {
            if (options.maxInputLength >= 0) {
                if (input.length > options.maxInputLength) {
                    throw new ex.CorelibException(`JsonX.parseUsingTemplate() failed.  input lenght of ${input.length} exceeds max of ${options.maxInputLength}.`);
                }
            }
            try {
                outputObject = this.parse(input, options.reviver, options.escapeStrings);
            } catch (err) {
                throw new ex.CorelibException(`JsonX.parseUsingTemplate() failed.  err=${err}`);
            }
        } else {
            //object
            if (options.allowObjectInput !== true) {
                throw new ex.CorelibException(`JsonX.parseUsingTemplate() failed. input is object and options.allowObjectInput!==true`);
            }
            outputObject = input;
        }


        /** helper to recursively walk through both our templateObj and parseFirstPass, attempting to deserialize */
        var recursive = (templateCurrentNode: any, outputCurrentNode: any) => {
            jsHelper.forEachProperty(outputCurrentNode, (value, key) => {

                var parseType = typeof (outputCurrentNode[key]);
                var templateType = typeof (templateCurrentNode[key]);
                if (templateCurrentNode[key] === null) {
                    //null implies that this template can be anything, so skip template walking
                    return;
                }
                if (templateCurrentNode[key] === undefined) {
                    //doesn't exist in template to parse, so check if we need to do a full recursive deserialize
                    if (options.pruneOrphans) {
                        delete outputCurrentNode[key];
                    } else if (options.parseOrphans) {
                        outputCurrentNode[key] = this.parseRecursive(outputCurrentNode[key], options.reviver, options.escapeStrings);
                    }
                    return;
                }

                if (templateType !== "string" && parseType === "string") {
                    //need to parse the parseTarget[key] so it hopefully matches
                    outputCurrentNode[key] = this.parse(outputCurrentNode[key], options.reviver, false);
                    parseType = typeof (outputCurrentNode[key]);
                }

                if (parseType !== templateType) {
                    //log.debug("parse and template types should equal now, but they do not"
                    //	, parseType, templateType, parseTarget, templateTarget, key, value);
                    throw new ex.CorelibException("JsonX.parseUsingTemplate() failed.  parse and template types should equal now");
                }
                if (parseType === "object") {
                    //an object, so recurse down
                    recursive(templateCurrentNode[key], outputCurrentNode[key]);
                }
            });
        };

        recursive(templateObj, outputObject);

        return outputObject;

    }


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
    inspectToText(object: any, options?: InspectOptions): string {
        return util.inspect(object, options as InspectOptions);
    }

}
/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 */
export var JSONX = new JsonX();

//polyfill JSON if it doesn't exist (IE7)
if (typeof (window) !== "undefined" && (<any>window).JSON == null) {
    (<any>window).JSON = JSONX;
}


export declare module _d3dsv {
	/** A parser and formatter for DSV (CSV and TSV) files.
Extracted from D3. */
    export class D3Dsv {
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
        public parse<TRow>(
            table: string,
            /** coerce cells (strings) into different types or modify them. return null to strip this row from the output results. */
            accessor?: (row: any) => TRow
        ): TRow[];
		/** Parses the specified string, which is the contents of a CSV file, returning an array of arrays representing the parsed rows. The string is assumed to be RFC4180-compliant. Unlike the parse method, this method treats the header line as a standard row, and should be used whenever the CSV file does not contain a header. Each row is represented as an array rather than an object. Rows may have variable length. For example, consider the following CSV file:

1997,Ford,E350,2.34
2000,Mercury,Cougar,2.38
The resulting JavaScript array is:

[  ["1997", "Ford", "E350", "2.34"],
  ["2000", "Mercury", "Cougar", "2.38"] ]
Note that the values themselves are always strings; they will not be automatically converted to numbers. See parse for details.*/
        public parseRows<TRow>(
            table: string,
            /** coerce cells (strings) into different types or modify them. return null to strip this row from the output results.*/
            accessor?: (row: string[]) => TRow
        ): TRow[];
		/** Converts the specified array of rows into comma-separated values format, returning a string. This operation is the reverse of parse. Each row will be separated by a newline (\n), and each column within each row will be separated by a comma (,). Values that contain either commas, double-quotes (") or newlines will be escaped using double-quotes.

Each row should be an object, and all object properties will be converted into fields. For greater control over which properties are converted, convert the rows into arrays containing only the properties that should be converted and use formatRows. */
        public format(rows: any[]): string;
        /** Converts the specified array of rows into comma-separated values format, returning a string. This operation is the reverse of parseRows. Each row will be separated by a newline (\n), and each column within each row will be separated by a comma (,). Values that contain either commas, double-quotes (") or newlines will be escaped using double-quotes. */
        public formatRows(rows: any[]): string;


    }

    interface loaderFunction {
        (
            /** the symbol used to seperate cells in the row.*/
            delimiter: string,
            /** example: "text/plain" */
            encoding?: string
        ): _d3dsv.D3Dsv;
    }
}


/** A parser and formatter for DSV (CSV and TSV) files.
Extracted from D3. 
https://www.npmjs.com/package/d3-dsv */
export var dsv:_d3dsv.loaderFunction = require("d3-dsv");