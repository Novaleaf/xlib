/** 
 * @packageDocumentation
 * utilize http consistently across browser and node
 */

import * as _imports from "./_imports"

export const _gaxios = _imports.gaxios

//const _gaxios2 = _imports.gaxios


import { gaxios } from "./_imports"
export { gaxios }




// const func = async () => {
// 	return gaxios.request( { url: "" } )
// }



// /** access to 3rd party libraries selected for use by `xlib` */
// export namespace _internal {



// 	/**
// 	 * Seems the best isomorphic candidates are `gaxios` and `ky`.  No bugs found in `gaxios` so that's the choice.
// 	 * <!-- -->
// 	 * 
// 	 * right now, `ky` has a bug where ReadableStreams do not work in NodeJs.
// 	 * For example, you can not call `body.GetReader()`.
// 	 * A bug has been filed and accepted in the `ky` project for this, but if
// 	 * we need an alternatie project, can consider:
// 	 * - https://www.npmjs.com/package/isomorphic-unfetch
// 	 * - https://github.com/lquixada/cross-fetch
// 	 * - https://github.com/googleapis/gaxios
// 	 * - https://github.com/sindresorhus/ky
// 	 * 
// 	 * ideas from this thread:  https://github.com/request/request/issues/3142
// 	 */
// 	export const _README = null


// 	/** see {@link _imports.gaxios} ok */
// 	export const gaxios = _gaxios

// 	/** # TITLE
// 	 * 
// 	 * becakse, see
// 	 * 
// 	 * - this is working?
// 	 * @summary
// 	 *   - ***shmaybe***
// 	 * 
// 	 * @remarks
// 	 becakse, see

// 	 - this is working?

// 		 - ***shmaybe***
// 		*/
// 	export const gaxios2 = _gaxios2


// }


