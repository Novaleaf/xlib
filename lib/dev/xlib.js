"use strict";
var jsShims = require("./core/jsshims");
///** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
var mockMocha = require("./core/diagnostics/mockmocha");
mockMocha._initialize();
exports.lolo = require("./core/lolo");
if (exports.lolo.isDebug === true) {
    //try {
    ///** https://www.npmjs.com/package/source-map-support
    // * This module provides source map support for stack traces in node via the V8 stack trace API. It uses the source-map module to replace the paths and line numbers of source-mapped files with their original paths and line numbers. The output mimics node's stack trace format with the goal of making every compile-to-JS language more of a first-class citizen. Source maps are completely general (not specific to any one language) so you can use source maps with multiple compile-to-JS languages in the same node process.
    //  */
    console.log("loading sourcemap support");
    var source_map_support = require("source-map-support");
    source_map_support.install({ handleUncaughtExceptions: false });
}
///** low-level javascript helpers, to smooth over warts in the language */
exports.jsHelper = require("./core/jshelper");
//jsHelper.initialize();
exports.arrayHelper = require("./core/arrayhelper");
exports.ClassBase = require("./core/classbase");
exports.diagnostics = require("./core/diagnostics");
exports.exception = require("./core/exception");
exports.collections = require("./core/collections");
/** various math and numerical conversion/manipulation related helper functions */
exports.numHelper = require("./core/numhelper");
exports.stringHelper = require("./core/stringhelper");
exports.reflection = require("./core/reflection");
exports.environment = require("./core/environment");
exports.dateTime = require("./core/datetime");
//define momentStatic
exports.environment.getGlobal()["moment"] = exports.dateTime.moment;
exports.validation = require("./core/validation");
exports.serialization = require("./core/serialization");
exports.compression = require("./core/compression");
exports.threading = require("./core/threading");
exports.lodash = require("lodash");
exports.promise = require("./core/promise");
exports.net = require("./core/net");
exports.cache = require("./core/cache");
/** templates for various design patterns */
exports.designPatterns = require("./core/design-patterns/design-patterns");
/** security and cryptographic helpers.   (cross-platform)
 *  note:  our ```KDF``` is nodejs only, and can be found in the ```nlib.security``` module.
 * */
exports.security = require("./core/security");
/** decimal.js: high precision numbers
https://www.npmjs.com/package/decimal.js
*/
exports.decimal = require("decimal.js");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/events.html
 * -------------------
 * Many objects in Node emit events: a net.Server emits an event each time a peer connects to it,
 * a fs.readStream emits an event when the file is opened. All objects which emit events are instances of events.EventEmitter.
 * You can access this module by doing: require("events");
 * Typically, event names are represented by a camel-cased string, however,
 * there aren't any strict restrictions on that, as any string will be accepted.
 * Functions can then be attached to objects, to be executed when an event is emitted.
 * These functions are called listeners. Inside a listener function,
 * this refers to the EventEmitter that the listener was attached to.
 */
exports.events = require("events");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/buffer.html
 * -----------------
 * Pure JavaScript is Unicode friendly but not nice to binary data. When dealing with TCP streams or the file system,
 * it's necessary to handle octet streams. Node has several strategies for manipulating, creating,
 * and consuming octet streams.
 * Raw data is stored in instances of the Buffer class.
 * A Buffer is similar to an array of integers but corresponds to a raw memory allocation outside the V8 heap.
 * A Buffer cannot be resized.

The Buffer class is a global, making it very rare that one would need to ever require('buffer').
 */
exports.buffer = require("buffer");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/path.html
 * -------------------
 * This module contains utilities for handling and transforming file paths.
 * Almost all these methods perform only string transformations.
 * The file system is not consulted to check whether paths are valid.
 */
exports.path = require("path");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/punycode.html
 * -------------------
 * Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.
 * For example "münich" would be encoded as "mnich-kva".
 */
exports.punycode = require("punycode");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/querystring.html
 * -------------------
 * This module provides utilities for dealing with query strings.
 */
exports.querystring = require("querystring");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/stream.html
 * -------------------
 * A stream is an abstract interface implemented by various objects in Node.
 * For example a request to an HTTP server is a stream, as is stdout.
 * Streams are readable, writable, or both. All streams are instances of EventEmitter
 */
exports.stream = require("stream");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/string_decoder.html
 * -------------------
 * StringDecoder decodes a buffer to a string.
 * It is a simple interface to buffer.toString() but provides additional support for utf8.
 */
exports.string_decoder = require("string_decoder");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/url.html
 * -------------------
 * This module has utilities for URL resolution and parsing.
 */
exports.url = require("url");
exports.definitions = require("./definitions/definitions");
/**
 * allows describing user input as a Class instead of a POJO, and enforces conformance of the class via templates.
 */
var PayloadTemplate = (function () {
    function PayloadTemplate(jsonPayload, templateObj, 
        /** defaults: {parseOrphans:false,pruneOrphans:true,sanitizeStrings:true,maxInputLength:5000}
        set to FALSE to not parse
        */
        templateParseOptions) {
        if (jsonPayload == null) {
            return;
        }
        if (templateParseOptions == null) {
            templateParseOptions = {};
        }
        exports.lodash.defaults(templateParseOptions, { parseOrphans: false, pruneOrphans: true, escapeStrings: false, maxInputLength: 5000, skipValidation: false, });
        var parsedObj;
        if (templateObj != null) {
            parsedObj = exports.serialization.JSONX.parseUsingTemplate(templateObj, jsonPayload, templateParseOptions);
        }
        else {
            parsedObj = exports.serialization.JSONX.parse(jsonPayload);
        }
        exports.lodash.assign(this, parsedObj);
        if (templateParseOptions.skipValidation !== true) {
            exports.validation.scrub(this).isTemplatePopulated(templateObj).failThrow();
        }
    }
    return PayloadTemplate;
}());
exports.PayloadTemplate = PayloadTemplate;
//# sourceMappingURL=xlib.js.map