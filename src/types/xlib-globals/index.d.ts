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
	logLevel?: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "ASSERT",
	envLevel?: "DEV" | "TEST" | "UAT" | "PROD",
	logLevelOverrides?: { callSiteMatch: RegExp, minLevel: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "ASSERT" }[],
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
//! 	// 	/**  DISABLING:   better usage practice is to force the dev wanting to use bluebird's rich functionality to explicitly use bluebird,
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


//! Below are types useful for advanced mixin/union type creation.  See ```exception.errorToJson``` for an example usage.

/** returns props shared by both types.  When both types have the same properties, ```TPri```'s is used.  (does not union property types)
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293*/
type PropsIntersection<TPri, TSec> = { [ K in keyof TPri & keyof TSec ]: TPri[ K ] };

/** returns props unique to ```TPri``` (not found in ```TSec```) 
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293*/
type PropsUnique<TPri, TSec> = PropsRemove<{ [ K in keyof TPri ]: K extends keyof TSec ? never : TPri[ K ] }>;


/** helper that returns prop names except those to filter.  This helper type is needed to actually remove the prop, as otherwise the prop still exists in the type just as "never". 
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293 */
type PropsRemove_Name<TTarget, TPropToRemove> = { [ K in keyof TTarget ]: TTarget[ K ] extends TPropToRemove ? never : K }[ keyof TTarget ];
/** remove props of the given type.   always removes ```never``` type props.  if no ```TPropToRemove``` is provided, removes just ```never``` type props.
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293 */
type PropsRemove<TTarget, TPropToRemove=never> = Pick<TTarget, PropsRemove_Name<TTarget, TPropToRemove>>;


/** returns union of both types.  When both types have the same properties, ```TPri```'s is used.  (does not union property types)
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293
 * ***WORKAROUND:*** usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection)
*/
type PropsUnion<TPri, TSec> = TPri & PropsUnique<TSec, TPri>;