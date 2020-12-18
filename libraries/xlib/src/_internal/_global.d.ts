/* eslint-disable @typescript-eslint/ban-types */

/** @packageDocumentation
 * declare common global variables used throughout the project
 * additional custom types may be found by importing "types"
	*/


/** custom type to explicitly allow the usage of the "any" type.   Normally we disallow using "any" (using a linter).   Use "ANY" to override this linting (when you really, really mean it) */
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

/** allows passing a "number" or a custom types that contain number information.   
 * Note: you don't need to pass a fancy custom Numeric type.  you can always just use a normal Javascript Number, as it also has the .valueOf() method.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
declare type Numeric = { valueOf(): number }