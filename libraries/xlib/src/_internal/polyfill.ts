
/**
 * pollyfill globalThis.  from https://mathiasbynens.be/notes/globalthis
 */

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
declare const __magic__: any
( function () {
	if ( typeof globalThis === "object" ) return
	// eslint-disable-next-line no-extend-native
	Object.defineProperty( Object.prototype, "__magic__", {
		get: function () {
			return this
		},
		configurable: true // This makes it possible to `delete` the getter later.
	} )
	__magic__.globalThis = __magic__ // lolwat
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	delete ( Object.prototype as any ).__magic__
}() )
/** explicitly get the  ```globalThis``` object.
 * @remarks
 * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
*/

// //https://github.com/GoogleChrome/proxy-polyfill
// import "proxy-polyfill"

// //https://github.com/zloirock/core-js
// import "core-js"


// //https://www.npmjs.com/package/regenerator-runtime
// import "regenerator-runtime/runtime"