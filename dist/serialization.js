///// <reference path="../../../typings/all.d.ts" />
"use strict";
var jsHelper = require("./jshelper");
var reflection = require("./reflection");
var ex = require("./exception");
var json5 = require("json5");
var stringHelper = require("./stringhelper");
var util = require("util");
/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 *
 */
var JsonX = (function () {
    function JsonX() {
    }
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
    JsonX.prototype.parse = function (text, reviver, 
        /** if true, will sanitize strings to prevent injection attacks.  default false. */
        escapeStrings, 
        /** if set, throws an exception if the input is too long */
        maxInputLength) {
        if (escapeStrings === void 0) { escapeStrings = false; }
        if (maxInputLength === void 0) { maxInputLength = -1; }
        if (text == null || text.length < 1) {
            return null;
        }
        if (text.length === undefined) {
            throw new ex.CorelibException("JsonX.parse() failed due to non string/Buffer input");
        }
        if (maxInputLength >= 0) {
            if (text.length > maxInputLength) {
                throw new ex.CorelibException("JsonX.parse() failed due to input length of " + text.length + " exceeding max of " + maxInputLength + " ");
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
        var pojo;
        try {
            pojo = json5.parse.apply(json5, arguments);
        }
        catch (err) {
            var message = "JsonX.parse() failed: " + err.message + " original input=" + text;
            throw new ex.CorelibException(message);
        }
        function recurser(node) {
            var nodeType = typeof (node);
            if (nodeType === "string") {
                var sanitizedValue = encodeURIComponent(node); // stringHelper.escapeUserInput(node as string);// encodeURIComponent(_sanitizeHtml(node as string));
                return sanitizedValue;
            }
            else if (nodeType === "object") {
                jsHelper.forEachProperty(node, function (nodeValue, nodeKey) {
                    node[nodeKey] = recurser(nodeValue);
                });
                return node;
            }
            else {
                return node;
            }
        }
        if (escapeStrings === true) {
            pojo = recurser(pojo);
        }
        return pojo;
    };
    JsonX.prototype.stringify = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return JSON.stringify.apply(JSON, arguments);
    };
    JsonX.prototype.stringifyX = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        try {
            return json5.stringify.apply(json5, arguments);
        }
        catch (ex) {
            //if json5 fails, try normal json
            return JSON.stringify.apply(JSON, arguments);
        }
    };
    /** parses your object, then attempts to parse string values in your object.  failed parse() calls will return the original string for that variable */
    JsonX.prototype.parseRecursive = function (textOrObj, reviver, 
        /** if true, will sanitize strings to prevent injection attacks.  default false. */
        escapeStrings, 
        /** if set, throws an exception if the input is too long */
        maxInputLength) {
        var _this = this;
        if (escapeStrings === void 0) { escapeStrings = false; }
        if (maxInputLength === void 0) { maxInputLength = -1; }
        if (typeof (textOrObj) === "string") {
            try {
                textOrObj = this.parse(textOrObj, reviver, escapeStrings, maxInputLength);
            }
            catch (ex) {
                return textOrObj;
            }
        }
        jsHelper.forEachProperty(textOrObj, function (value, key, obj) {
            if (typeof (value) === "string") {
                obj[key] = _this.parseRecursive(value, reviver, escapeStrings, maxInputLength);
            }
        });
        return textOrObj;
    };
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
    JsonX.prototype.inspectJSONify = function (value, maxSearchDepth, hideType, showVerboseDetails, disableCircularDetection, replacer, verboseObjectsOut) {
        if (maxSearchDepth === void 0) { maxSearchDepth = 2; }
        if (hideType === void 0) { hideType = false; }
        if (showVerboseDetails === void 0) { showVerboseDetails = false; }
        if (disableCircularDetection === void 0) { disableCircularDetection = false; }
        if (verboseObjectsOut === void 0) { verboseObjectsOut = []; }
        var _superStringifyTokenId = "$$___corelib.serialization.superStringify.tokenId";
        /** tracks objects that are flagged as circular references (we remove our tracking tag at the end) */
        var _processedNodes = [];
        /** recurses through a node's key/value pairs (all properties) */
        function _nodePropertyRecurser(node, depth, typeName, nodeDepthSearchDisabled) {
            if (nodeDepthSearchDisabled === void 0) { nodeDepthSearchDisabled = false; }
            var objResult = {};
            if (!hideType && typeName !== "[*POJO*]") {
                objResult["[*TYPE*]"] = typeName;
            }
            jsHelper.forEachProperty(node, function (_value, _key) {
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
        function _JSONifyWorker(node, depth, nodeDepthSearchDisabled) {
            if (nodeDepthSearchDisabled === void 0) { nodeDepthSearchDisabled = false; }
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
                        var date = node;
                        var dateDetails = {
                            "[*TYPE*]": typeName,
                            //epochMs: date.getTime(),
                            value: date.toISOString()
                        };
                        if (hideType) {
                            delete dateDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            return dateDetails.value; // delete dateDetails.epochMs;
                        }
                        return dateDetails;
                    case TYPE.function:
                        try {
                            verboseObjectsOut.push(node);
                            var full = node.toString();
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
                        }
                        catch (ex) {
                            return { "[*TYPE*]": typeName, value: "function-unknown" };
                        }
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
                        return null; // "[*NULL*]";
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
                                var promise = node;
                                if (promise["toJSON"] != null) {
                                    var promiseDetails = promise.toJSON();
                                    promiseDetails["[*TYPE*]"] = typeName;
                                    return promiseDetails;
                                }
                                return { "[*TYPE*]": typeName, value: promise.toString() };
                            case "Buffer":
                                try {
                                    var buffer = node;
                                    var bufferDetails = { "[*TYPE*]": typeName, value: stringHelper.summarize(buffer.toString(), 200), length: buffer.length };
                                    if (hideType) {
                                        delete bufferDetails["[*TYPE*]"];
                                    }
                                    if (!showVerboseDetails) {
                                    }
                                    return bufferDetails;
                                }
                                catch (ex) {
                                    return { "[*TYPE*]": typeName, value: "buffer-unknown" };
                                }
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
                                var momentValue = node;
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
                                exports.JSONX.stringifyX(node, replacer);
                            }
                            //able to stringify (no exception thrown), so lets ignore depth searching for our children (avoid stringifying to gain perf)
                            return _nodePropertyRecurser(node, depth, typeName, true);
                        }
                        catch (ex) {
                            //couldn't stringify
                            if (depth >= maxSearchDepth) {
                                return "[*MAX_DEPTH*]";
                            }
                            //can't stringify it, so...
                            if (ex.message.toLowerCase().indexOf("circular") < 0 && ex.message.toLowerCase().indexOf("TypeError") < 0) {
                                //exception isn't due to circular, so let's just stop
                                if (ex.toString == null) {
                                    return "[*ERROR_ex=" + ex + "*]";
                                }
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
                        var unknownDetails;
                        if (node.toString == null) {
                            unknownDetails = { "[*TYPE*]": typeName, status: "inspectJSONify does not know how to parse this", value: "some-node" };
                        }
                        else {
                            unknownDetails = { "[*TYPE*]": typeName, status: "inspectJSONify does not know how to parse this", value: node.toString() };
                        }
                        if (hideType) {
                            delete unknownDetails["[*TYPE*]"];
                        }
                        if (!showVerboseDetails) {
                            return "[*???*] " + unknownDetails.value;
                        }
                        return unknownDetails;
                }
            }
            catch (ex) {
                //logger.assert(ex);
                return "error:  {0}" + String(ex);
            }
        }
        try {
            var normalizedResult = _JSONifyWorker(value, 0);
            return normalizedResult;
        }
        finally {
            if (!disableCircularDetection) {
                //clean up node tracker markers
                jsHelper.forEachArray(_processedNodes, function (_value) {
                    delete _value[_superStringifyTokenId];
                });
                _processedNodes.length = 0;
            }
        }
    };
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
    JsonX.prototype.inspectStringify = function (value, maxSearchDepth, hideType, showVerboseDetails, disableCircularDetection, replacer, space, verboseObjectsOut) {
        if (space === void 0) { space = "\t"; }
        var normalizedResult = this.inspectJSONify(value, maxSearchDepth, hideType, showVerboseDetails, disableCircularDetection, replacer, verboseObjectsOut);
        var toReturn = this.stringifyX(normalizedResult, replacer, space);
        return toReturn;
    };
    /** convert user input (options,config,etc) into the format expected by you (as defined by the template parameter).
     * similar to parseRecursive, but doesn't attempt to recursively parse fields not found in the template (unless the parseOrphans parameter is set).
     * DOES NOT fail if user input doesn't include fields in the template.  they just won't exist in the output.  to specify "default values" for these missing fields, use runtime.jsHelper.mixin()
    */
    JsonX.prototype.parseUsingTemplate = function (templateObj, 
        /** you can pass a string (to parse to an object) or an existing object */
        input, options) {
        var _this = this;
        if (options == null) {
            options = {};
        }
        if (options.maxInputLength == null) {
            options.maxInputLength = -1;
        }
        var inputType = reflection.getTypeName(input);
        var outputObject;
        if (inputType === "Buffer") {
            if (options.maxInputLength >= 0) {
                if (input.length > options.maxInputLength) {
                    throw new ex.CorelibException("JsonX.parseUsingTemplate() failed.  input lenght of " + input.length + " exceeds max of " + options.maxInputLength + ".");
                }
            }
            input = input.toString();
            inputType = reflection.getTypeName(input);
        }
        if (inputType === "string") {
            if (options.maxInputLength >= 0) {
                if (input.length > options.maxInputLength) {
                    throw new ex.CorelibException("JsonX.parseUsingTemplate() failed.  input lenght of " + input.length + " exceeds max of " + options.maxInputLength + ".");
                }
            }
            try {
                outputObject = this.parse(input, options.reviver, options.escapeStrings);
            }
            catch (err) {
                throw new ex.CorelibException("JsonX.parseUsingTemplate() failed.  err=" + err);
            }
        }
        else {
            //object
            if (options.allowObjectInput !== true) {
                throw new ex.CorelibException("JsonX.parseUsingTemplate() failed. input is object and options.allowObjectInput!==true");
            }
            outputObject = input;
        }
        /** helper to recursively walk through both our templateObj and parseFirstPass, attempting to deserialize */
        var recursive = function (templateCurrentNode, outputCurrentNode) {
            jsHelper.forEachProperty(outputCurrentNode, function (value, key) {
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
                    }
                    else if (options.parseOrphans) {
                        outputCurrentNode[key] = _this.parseRecursive(outputCurrentNode[key], options.reviver, options.escapeStrings);
                    }
                    return;
                }
                if (templateType !== "string" && parseType === "string") {
                    //need to parse the parseTarget[key] so it hopefully matches
                    outputCurrentNode[key] = _this.parse(outputCurrentNode[key], options.reviver, false);
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
    };
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
    JsonX.prototype.inspectToText = function (object, options) {
        return util.inspect(object, options);
    };
    return JsonX;
}());
exports.JsonX = JsonX;
/** JSON5.parse (forgiving) coupled with JSON.stringify (standards compliant serialization), plus extra helpers
 */
exports.JSONX = new JsonX();
//polyfill JSON if it doesn't exist (IE7)
if (typeof (window) !== "undefined" && window.JSON == null) {
    window.JSON = exports.JSONX;
}
/** A parser and formatter for DSV (CSV and TSV) files.
Extracted from D3.
https://www.npmjs.com/package/d3-dsv */
exports.dsv = require("d3-dsv");
//# sourceMappingURL=serialization.js.map