export import lolo = require("./core/lolo");
export import jsHelper = require("./core/jshelper");
export import arrayHelper = require("./core/arrayhelper");
export import ClassBase = require("./core/classbase");
export import diagnostics = require("./core/diagnostics");
export import exception = require("./core/exception");
export import collections = require("./core/collections");
/** various math and numerical conversion/manipulation related helper functions */
export import numHelper = require("./core/numhelper");
export import stringHelper = require("./core/stringhelper");
export import reflection = require("./core/reflection");
export import environment = require("./core/environment");
export import dateTime = require("./core/datetime");
export import validation = require("./core/validation");
export import serialization = require("./core/serialization");
export import compression = require("./core/compression");
export import threading = require("./core/threading");
export import lodash = require("lodash");
export import promise = require("./core/promise");
export import net = require("./core/net");
export import cache = require("./core/cache");
/** templates for various design patterns */
export import designPatterns = require("./core/design-patterns/design-patterns");
/** security and cryptographic helpers.   (cross-platform)
 *  note:  our ```KDF``` is nodejs only, and can be found in the ```nlib.security``` module.
 * */
export import security = require("./core/security");
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
export import events = require("events");
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
export import buffer = require("buffer");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/path.html
 * -------------------
 * This module contains utilities for handling and transforming file paths.
 * Almost all these methods perform only string transformations.
 * The file system is not consulted to check whether paths are valid.
 */
export import path = require("path");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/punycode.html
 * -------------------
 * Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.
 * For example "münich" would be encoded as "mnich-kva".
 */
export import punycode = require("punycode");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/querystring.html
 * -------------------
 * This module provides utilities for dealing with query strings.
 */
export import querystring = require("querystring");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/stream.html
 * -------------------
 * A stream is an abstract interface implemented by various objects in Node.
 * For example a request to an HTTP server is a stream, as is stdout.
 * Streams are readable, writable, or both. All streams are instances of EventEmitter
 */
export import stream = require("stream");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/string_decoder.html
 * -------------------
 * StringDecoder decodes a buffer to a string.
 * It is a simple interface to buffer.toString() but provides additional support for utf8.
 */
export import string_decoder = require("string_decoder");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/url.html
 * -------------------
 * This module has utilities for URL resolution and parsing.
 */
export import url = require("url");
export import definitions = require("./definitions/definitions");
/**
 * allows describing user input as a Class instead of a POJO, and enforces conformance of the class via templates.
 */
export declare abstract class PayloadTemplate<TThis> {
    constructor(jsonPayload?: string | Buffer, templateObj?: TThis, 
        /** defaults: {parseOrphans:false,pruneOrphans:true,sanitizeStrings:true,maxInputLength:5000}
        set to FALSE to not parse
        */
        templateParseOptions?: {
        reviver?: (key: any, value: any) => any;
        /** if true, an object can be passed in, not just a string or Buffer */
        allowObjectInput?: boolean;
        /** if true, attempts to parse any additional strings found in the input (and does this recursively) */
        parseOrphans?: boolean;
        /** if true, deletes any orphans found.  default = TRUE */
        pruneOrphans?: boolean;
        /** if true, will escape strings to prevent injection attacks.  default false.   to ignore pruning of a node's children, set that node to null.  ex: ```myTemplate.userTags=null``` */
        escapeStrings?: boolean;
        /** if set, throws an exception if the input is too long.  default=5000 */
        maxInputLength?: number;
        /** true to not validate that all template fields are present.  default=false*/
        skipValidation?: boolean;
    });
}
