/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
//entrypoint into all tests.


/** see: https://webpack.js.org/guides/dependency-management/#requirecontext */
declare interface IRequireContextResolve {
	resolve: ( key: string ) => string;
	keys: () => string[];
	id: string;

	/** A context module exports a (require) function that takes one argument: the request. */
	( path: string ): never
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare interface NodeRequire {
	/** for running in a browser viw webpack + mocha-loader.   
	 * @remarks
	 * see: https://github.com/webpack-contrib/mocha-loader and https://webpack.js.org/guides/dependency-management/#requirecontext
*/
	context: ( directory: string, useSubdirectories?: boolean, regExp?: RegExp, mode?: string ) => IRequireContextResolve
}




//bootstrap mocha, as per: https://mochajs.org/#running-mocha-in-the-browser
//import expect from "expect"
//if(globalThis.expect ==null)
// if ( typeof ( expect ) === "undefined" ) {
// 	window[ "expect" ] = require( "chai" )
// }
const mocha = require( "mocha" )
//import "mocha"
mocha.setup( {
	ui: "bdd",
	timeout: 5000, //match jest default
} )
mocha.growl() // enable web notification

//it( "", (done) => { done() })

//import * as chai from "chai-as-promised"

// if ( typeof ( expect ) === "undefined" ) {
// 	( globalThis as unknown as any ).expect = require( "chai" )


// }

//import "./mocha-jest-interop"

// if ( globalThis.describe == null ) {
// 	throw new Error( "no global ```describe``` function to perform interop conversions on" )
// 	//globalThis.describe = () => { }
// }
// if ( globalThis.it == null ) {
// 	throw new Error( "no global ```it``` function to perform interop conversions on" )
// 	//globalThis.it = () => { }
// }

/** Allows using Jest's ```it``` and ```describe``` definitions, even if using mocha.
 * only does this if the jest global is not present and the mocha global is
 * @packageDocumentation
 */
{
	const mochaIt: ANY = it
	globalThis.it = ( ( name, fn, timeout ) => {

		const _test = mochaIt( name, fn )
		if ( timeout != null ) {
			_test.timeout( timeout )
		}
	} )
}



//load up all test files following general advice from: https://stackoverflow.com/questions/32385219/mocha-tests-dont-run-with-webpack-and-mocha-loader
{
	const foundTestsRequire = ( require as unknown as NodeRequire ).context( "..", true, /.*\.test\.js?$/ )
	//console.log( `keys found = ${ foundTestsRequire.keys().length }` )
	for ( const key of foundTestsRequire.keys() ) {
		console.log( key )
		foundTestsRequire( key )
	}
}

//run tests
mocha.run()

