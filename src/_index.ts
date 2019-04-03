// tslint:disable-next-line: no-reference
/// <reference path="./types/xlib-globals/index.d.ts" />


import * as jsShims from "./_internal/jsshims";
/**
 * ! initialization of xlib:  some "preinit" has to be done as soon as a submodule is imported,
 * ! so it can be properly used by other xlib submodules, so we do that manually inline.
 * ! however we do other init via an IoC pattern via the _internal/init.ts module.  the init submodule is invoked at the very end of this file.
 */
jsShims.initialize();


//import source_map_support = require( "source-map-support" );
import * as source_map_support from "source-map-support";

let _initArgs: init.IInitArgs = {};
if ( typeof global !== "undefined" && global.__xlibInitArgs != null ) {
    _initArgs = global.__xlibInitArgs;
} else if ( typeof window !== "undefined" && window.__xlibInitArgs != null ) {
    _initArgs = window.__xlibInitArgs;
}

export import lodash = require( "lodash" );
if ( _initArgs == null || lodash.isEmpty( _initArgs ) ) {
    // tslint:disable-next-line:no-console
    console.log( `XLIB INFO:  no "global.__xlibInit" object detected.  we will use the default values (or read them from the environment).  To hide this message, you must set it.  For example:  global.__xlibInit={logLevel:"WARN", envLevel:"PROD",silentInit:true}` );
    _initArgs = {};
}


export import environment = require( "./core/environment" );
environment.initialize( _initArgs );
//set lodash as a global if it's not.
if ( environment.getGlobal()[ "_" ] == null ) {
    environment.getGlobal()[ "_" ] = lodash;
}


///** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
import * as mockMocha from "./_internal/mockmocha";
mockMocha.initialize();


if ( environment.envLevel < environment.EnvLevel.UAT || environment.logLevel < environment.LogLevel.INFO ) {
    //try {
    ///** https://www.npmjs.com/package/source-map-support
    // * This module provides source map support for stack traces in node via the V8 stack trace API. It uses the source-map module to replace the paths and line numbers of source-mapped files with their original paths and line numbers. The output mimics node's stack trace format with the goal of making every compile-to-JS language more of a first-class citizen. Source maps are completely general (not specific to any one language) so you can use source maps with multiple compile-to-JS languages in the same node process.
    //  */
    if ( _initArgs.silentInit !== true ) {
        // tslint:disable-next-line:no-console
        console.log( "loading sourcemap support and longjohn for long stack traces  (envLevel is DEV or TEST,  or if logLevel is TRACE or DEBUG" );
    }
    let envName: "browser" | "node" = environment.platformType === environment.PlatformType.Browser ? "browser" : "node";
    source_map_support.install( { handleUncaughtExceptions: true, environment: envName } );
    //} catch (ex) {
    //	console.log("eating sourcemap support call");
    //}
    
    const longjohn: any = require( "longjohn" );  //see https://github.com/mattinsler/longjohn
    longjohn.async_trace_limit = -1;
}

/** helper types, useful for creating complex typescript types such as mixins */
export import types = require( "./core/types" );

export import promise = require( "./core/promise" );


import * as numeric from "./core/numeric";
export { numeric };


//serialInits.push( mockMocha.initialize );
/** contains shortcuts to commonly used xlib modules and objects.
 * example usage:
 * @example
 * import __ = xlib.lolo;
 * __.log.info("hi there");
 */
export import lolo = require( "./core/lolo" );


export import diagnostics = require( "./core/diagnostics" );


const log = diagnostics.log; // new diagnostics.Logger( __filename );


/**  various math and numerical conversion/manipulation related helper functions, and node built-in libraries */
export import util = require( "./core/util" );
// export import numHelper = require( "./core/_util/numhelper" );
// export import stringHelper = require( "./core/_util/stringhelper" );
//export import arrayHelper = require( "./core/_util/arrayhelper" );

export import reflection = require( "./core/reflection" );


export import time = require( "./core/time" );
// if ( environment.getGlobal()[ "moment" ] == null ) {
//     //define momentStatic
//     environment.getGlobal()[ "moment" ] = dateTime.moment;
// }

export import validation = require( "./core/validation" );
export import serialization = require( "./core/serialization" );

//export import compression = require( "./core/compression" );
export import threading = require( "./core/threading" );


/** network io */
export import net = require( "./core/net" );

/** security and cryptographic helpers.   (cross-platform)
 * */
export import security = require( "./core/security" );
// /** decimal.js: high precision numbers
// https://www.npmjs.com/package/decimal.js
// */
// export import decimal = require( "decimal.js" );


//export import definitions = require( "./definitions/definitions" );


/** @deprecated obsolete features of xlib that are made available for backcompat.  May be updated in the future, but likely will be replaced with something else.*/
//export import _obsolete = require( "./_obsolete/_index" );

//////////////////////  initialization section
import * as init from "./_internal/init";
let floatingPromise = init.initialize( _initArgs );


// setTimeout( () => {
//     if ( init.isInitializeStarted() !== true ) {
//         throw new Error( "xlib.initialize() was not called immediately after importing.   To use xlib we expect initialization logic to be performed. " );
//     }
// }, 0 )

