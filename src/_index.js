"use strict";
//need the following ///reference line so that ambient @types .d.ts declarations get loaded.
/// <reference types="node" /> 
/// <reference types="bluebird" /> 
/// <reference types="mocha" /> 
//declare namespace Mocha{
//	interface IRunnable{
//		/** specify how long before the test timesout.  default if not set is 2000 (2 sec) */
//		timeout:(ms:number)=>this;
//	}
//}
Object.defineProperty(exports, "__esModule", { value: true });
//export import lodash = require("lodash");
var lodash = require("lodash");
exports.lodash = lodash;
var __configDefaults = {
    logLevel: undefined,
    envLevel: undefined,
    isTest: undefined,
    isDev: undefined,
    sourceMapSupport: true,
};
if (global._xlibConfigDefaults == null) {
    global._xlibConfigDefaults = {};
}
lodash.defaults(global._xlibConfigDefaults, __configDefaults);
if (_xlibConfigDefaults.sourceMapSupport === true) {
    /** https://www.npmjs.com/package/source-map-support
     * This module provides source map support for stack traces in node via the V8 stack trace API. It uses the source-map module to replace the paths and line numbers of source-mapped files with their original paths and line numbers. The output mimics node's stack trace format with the goal of making every compile-to-JS language more of a first-class citizen. Source maps are completely general (not specific to any one language) so you can use source maps with multiple compile-to-JS languages in the same node process.
      */
    var source_map_support = require("source-map-support");
    //import * as source_map_support from "source-map-support";
    //can be removed by webpack
    if (source_map_support != null && source_map_support.install != null) {
        //console.info("source map support installing");
        source_map_support.install();
        //console.info("source map support installed by xlib, as requested by calling module.");
    }
    else if (source_map_support != null && source_map_support.sourceMapSupport != null) {
        //console.warn("source map support installing 2");
        source_map_support.sourceMapSupport.install();
    }
    else {
        console.warn("NO source map support installed.  could not find the module.  (is it no-oped?)");
        console.log(JSON.stringify(source_map_support, undefined, "\t"));
    }
}
///** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
//import mockMocha = require("./internal/mockmocha");
var mockMocha = require("./internal/mockmocha");
mockMocha._initialize();
///** low-level javascript helpers, to smooth over warts in the language */
//export import * as jsHelper from "./jshelper";
//export import * as arrayHelper from "./arrayhelper";
//export import ClassBase = require("./classbase");
//export import * as logging from "./logging";
var jsHelper = require("./jshelper");
exports.jsHelper = jsHelper;
var arrayHelper = require("./arrayhelper");
exports.arrayHelper = arrayHelper;
var classbase_1 = require("./classbase");
exports.ClassBase = classbase_1.ClassBase;
var logging = require("./logging");
exports.logging = logging;
//export import * as exception from "./exception";
//export import collections = require("./collections");
var exception = require("./exception");
exports.exception = exception;
var collections = require("./collections");
exports.collections = collections;
/** various math and numerical conversion/manipulation related helper functions */
//export import * as numHelper from "./numhelper";
//export import * as stringHelper from "./stringhelper";
//export import * as reflection from "./reflection";
//export import * as environment from "./environment";
//export import dateTime = require("./datetime");
var numHelper = require("./numhelper");
exports.numHelper = numHelper;
var stringHelper = require("./stringhelper");
exports.stringHelper = stringHelper;
var reflection = require("./reflection");
exports.reflection = reflection;
var environment = require("./environment");
exports.environment = environment;
var dateTime = require("./datetime");
exports.dateTime = dateTime;
//export import * as validation from "./validation";
//export import * as serialization from "./serialization";
var validation = require("./validation");
exports.validation = validation;
var serialization = require("./serialization");
exports.serialization = serialization;
//export import compression = require("./compression");
//export import threading = require("./threading");
var compression = require("./compression");
exports.compression = compression;
var threading = require("./threading");
exports.threading = threading;
//set lodash as a global if it's not.
if (environment.getGlobal()["_"] == null) {
    environment.getGlobal()["_"] = lodash;
}
//export import * as promise from "./promise";
//export import net = require("./net");
//export import cache = require("./cache");
var promise = require("./promise");
exports.promise = promise;
var net = require("./net");
exports.net = net;
var cache = require("./cache");
exports.cache = cache;
/** templates for various design patterns */
//export import designPatterns = require("./design-patterns/_index");
var designPatterns = require("./design-patterns/_index");
exports.designPatterns = designPatterns;
/** security and cryptographic helpers.   (cross-platform)
 *  note:  our ```KDF``` is nodejs only, and can be found in the ```nlib.security``` module.
 * */
//export import security = require("./security");
var security = require("./security");
exports.security = security;
/** custom type definitions */
//export import definitions = require("./definitions/_index");
var definitions = require("./definitions/_index");
exports.definitions = definitions;
///** decimal.js: high precision numbers
//https://www.npmjs.com/package/decimal.js
//*/
//export import decimal = require("decimal.js");
//export import lolo = require("./lolo");
var lolo = require("./lolo");
exports.lolo = lolo;
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/events.html
// * -------------------
// * Many objects in Node emit events: a net.Server emits an event each time a peer connects to it, 
// * a fs.readStream emits an event when the file is opened. All objects which emit events are instances of events.EventEmitter. 
// * You can access this module by doing: require("events");
// * Typically, event names are represented by a camel-cased string, however, 
// * there aren't any strict restrictions on that, as any string will be accepted.
// * Functions can then be attached to objects, to be executed when an event is emitted. 
// * These functions are called listeners. Inside a listener function, 
// * this refers to the EventEmitter that the listener was attached to.
// */
//export import events = require("events");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/buffer.html 
// * -----------------
// * Pure JavaScript is Unicode friendly but not nice to binary data. When dealing with TCP streams or the file system, 
// * it's necessary to handle octet streams. Node has several strategies for manipulating, creating, 
// * and consuming octet streams.
// * Raw data is stored in instances of the Buffer class. 
// * A Buffer is similar to an array of integers but corresponds to a raw memory allocation outside the V8 heap. 
// * A Buffer cannot be resized.
//The Buffer class is a global, making it very rare that one would need to ever require('buffer').
// */
//export import buffer = require("buffer");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/path.html
// * -------------------
// * This module contains utilities for handling and transforming file paths. 
// * Almost all these methods perform only string transformations. 
// * The file system is not consulted to check whether paths are valid.
// */
//export import path = require("path");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/punycode.html
// * -------------------
// * Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System. 
// * For example "münich" would be encoded as "mnich-kva".
// */
//export import punycode = require("punycode");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/querystring.html
// * -------------------
// * This module provides utilities for dealing with query strings.
// */
//export import querystring = require("querystring");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/stream.html
// * -------------------
// * A stream is an abstract interface implemented by various objects in Node. 
// * For example a request to an HTTP server is a stream, as is stdout. 
// * Streams are readable, writable, or both. All streams are instances of EventEmitter
// */
//export import stream = require("stream");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/string_decoder.html
// * -------------------
// * StringDecoder decodes a buffer to a string. 
// * It is a simple interface to buffer.toString() but provides additional support for utf8.
// */
//export import string_decoder = require("string_decoder");
///** cross-platform implementation of the nodejs module: http://nodejs.org/api/url.html
// * -------------------
// * This module has utilities for URL resolution and parsing. 
// */
//export import url = require("url");
/** exposes helper utilities meant for internal use. */
exports._internal = require("./internal/_index");
//# sourceMappingURL=_index.js.map