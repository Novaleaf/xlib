global.__xlibInitArgs = {
	logLevel: "DEBUG"
};


import * as xlib from "../_index";
import _ = xlib.lodash;
import log = xlib.diagnostics.log;
import __ = xlib.lolo;


export function it1( testFcn: () => void | PromiseLike<any> ) {
	const testName = xlib.reflection.getTypeName( testFcn );

	return it( testName, testFcn );
}


/** hack fix for mocha bug, unable to have a timeout for async tests */
export function it2( testFcn: () => Promise<any> ) {
	const testName = xlib.reflection.getTypeName( testFcn );
	return it( testName, async function () {
		// tslint:disable-next-line: no-invalid-this
		const timeoutMs = this.timeout();
		// tslint:disable-next-line: no-invalid-this
		return xlib.promise.bluebird.resolve( testFcn.apply( this ) ).timeout( timeoutMs, new xlib.promise.bluebird.TimeoutError( `operation timed out.  Max of ${ timeoutMs }ms exceeded` ) );

	} );

}

