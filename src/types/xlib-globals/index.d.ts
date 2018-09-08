/** these libraries and references are all included when you use xlib, so we need to properly emit them
	* so that dependant projects can pick them up automatically (without requiring the project to do things like ```npm install @types/node```)
  */
/// <reference types="node" />
/// <reference types="mocha" />

///// <reference types="bluebird" />
//import * as bluebird from "bluebird";

// declare module bluebird {
// 	declare class Bluebird {
// 		readonly [ Symbol.toStringTag ]: 'Promise';
// 	}
// }

// /** used to inject custom type definitions in the global namespace */
// declare global {
// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	////////////////////////////   inject bluebird typings as the global promise type.
// 	/**  DISABLING:   better usage practice is to force the dev wanting to use bluebird's rich functionality to explicitly use bluebird,
// 		and not use a global Promise extended with bluebird's features.

// 		this is because 3rd party modules may use their own promise type, so it's not safe to assume that all promises comply with
// 		bluebird's extended functionality.  for example:  ```someLib.asyncFunction().timeout(1000);``` can fail, as ```.timeout()```
// 		is bluebird specific code.

// 		assigning bluebird's type definitions to the global Promise would confuse developers, letting them assume that all promises include all bluebird features.

// 		*/
// 	// // // 	/** gives proper intelisence for invoking bluebird directly such as via ```Promise.resolve()``` */
// 	// // // 	export const Promise: typeof bluebird;
// 	// // // /** doesn't seem to do much except let us see where ```Promise``` is used in lines like ```async myFunc():Promise<T>{}``` */
// 	// // // 	export interface Promise<T> extends bluebird<T> {	};

// }