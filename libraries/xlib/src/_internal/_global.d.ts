/* eslint-disable @typescript-eslint/ban-types */

/** @packageDocumentation
 * declare global variables used throughout the project
	*/


declare type ANY = typeof any



/** jest style test scafolding.  converted into mocha for the browser by the ```./_internal/browser-mocha-test-launcher``` file */
declare function describe( name: string, fn: Function ): void
/** jest style test scafolding.  converted into mocha for the browser by the ```./_internal/browser-mocha-test-launcher``` file */
declare function it( name: string, fn?: ( cb: IDoneCallback ) => ANY, timeout?: number ): void
/** jest style test scafolding.  converted into mocha for the browser by the ```./_internal/browser-mocha-test-launcher``` file */
declare function beforeAll( fn: Function, timeout?: number ): void


interface IDoneCallback {
	( error?: Error ): void
	//( ...args: ANY[] ): ANY;
	//fail( error?: string | { message: string } ): ANY;
}
