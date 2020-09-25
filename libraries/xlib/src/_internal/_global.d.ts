/* eslint-disable @typescript-eslint/ban-types */

declare type ANY = typeof any
declare function describe( name: string, fn: Function )
declare function it( name: string, fn?: ( cb: IDoneCallback ) => ANY, timeout?: number ): void;


interface IDoneCallback {
	( ...args: ANY[] ): ANY;
	//fail( error?: string | { message: string } ): ANY;
}
