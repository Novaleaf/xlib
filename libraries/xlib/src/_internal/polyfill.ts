
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

//https://github.com/GoogleChrome/proxy-polyfill
//import "proxy-polyfill"
import "proxy-polyfill/proxy.min.js"

//https://github.com/zloirock/core-js
import "core-js"
// /** IE9, IE10 and IE11 requires all of the following polyfills.
//  * from: https://github.com/angular/angular-cli/issues/7776#issuecomment-358361833
//  *  **/
// import "core-js/es6/symbol"
// import "core-js/es6/object"
// import "core-js/es6/function"
// import "core-js/es6/parse-int"
// import "core-js/es6/parse-float"
// import "core-js/es6/number"
// import "core-js/es6/math"
// import "core-js/es6/string"
// import "core-js/es6/date"
// import "core-js/es6/array"
// import "core-js/es6/regexp"
// import "core-js/es6/map"
// import "core-js/es6/weak-map"
// import "core-js/es6/set"

// import "core-js/es6/array"
// import "core-js/es7/array"

//https://www.npmjs.com/package/regenerator-runtime
import "regenerator-runtime/runtime"