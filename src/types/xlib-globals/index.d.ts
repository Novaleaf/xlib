/** these libraries and references are all included when you use xlib, so we need to properly emit them
	* so that dependant projects can pick them up automatically (without requiring the project to do things like ```npm install @types/node```)
  */
/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="tslib" />

///// <reference types="bluebird" />
//import * as bluebird from "bluebird";

// declare module bluebird {
// 	declare class Bluebird {
// 		readonly [ Symbol.toStringTag ]: 'Promise';
// 	}
// }


//declare namespace Xlib {

//import * as environment from '../../core/environment';

interface XlibInitArgs {
	/** if true, disables overriding settings from the commandline, envVars, or querystring */
	disableEnvAutoRead?: boolean,
	logLevel?: "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL",
	envLevel?: "DEV" | "TEST" | "UAT" | "PROD",
	//testLevel?: environment.TestLevel | "NONE" | "UNIT" | "INTEGRATION" | "SYSTEM" | "ACCEPTANCE",
	logLevelOverrides?: { namePattern: RegExp, newLogLevel: "TRACE" | "INFO" | "WARN" | "ERROR" | "FATAL" }[],
	/** set to true to not log startup initialization details */
	silentInit?: boolean,
}

interface XlibGlobals {
	/** if you want to override the default xlib configuration, do so by setting this config object, and do so BEFORE you first import xlib into your project. */
	__xlibInitArgs: XlibInitArgs;
}
//}
// Augments the DOM `Window` object when lib.dom.d.ts is loaded.
// tslint:disable-next-line no-empty-interface
interface Window extends XlibGlobals { }

declare namespace NodeJS {

	// Augments NodeJS's `global` object when node.d.ts is loaded
	// tslint:disable-next-line no-empty-interface
	interface Global extends XlibGlobals { }
}

// declare module "xlib" {
// 	export = Xlib;
// }


// /** used to inject custom type definitions in the global namespace */
// declare global {

// 	/** if you want to override the default xlib configuration, do so by setting this config object, and do so BEFORE you first import xlib into your project. */
// 	export let __xlibInit: XlibInitArgs;


// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	// 	////////////////////////////   inject bluebird typings as the global promise type.
// 	// 	/**  DISABLING:   better usage practice is to force the dev wanting to use bluebird's rich functionality to explicitly use bluebird,
// 	// 		and not use a global Promise extended with bluebird's features.

// 	// 		this is because 3rd party modules may use their own promise type, so it's not safe to assume that all promises comply with
// 	// 		bluebird's extended functionality.  for example:  ```someLib.asyncFunction().timeout(1000);``` can fail, as ```.timeout()```
// 	// 		is bluebird specific code.

// 	// 		assigning bluebird's type definitions to the global Promise would confuse developers, letting them assume that all promises include all bluebird features.

// 	// 		*/
// 	// 	// // // 	/** gives proper intelisence for invoking bluebird directly such as via ```Promise.resolve()``` */
// 	// 	// // // 	export const Promise: typeof bluebird;
// 	// 	// // // /** doesn't seem to do much except let us see where ```Promise``` is used in lines like ```async myFunc():Promise<T>{}``` */
// 	// 	// // // 	export interface Promise<T> extends bluebird<T> {	};

// }
