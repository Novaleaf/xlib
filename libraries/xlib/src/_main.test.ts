import * as xlib from "./_main"

import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use( chaiAsPromised )
import { expect } from "chai"


// describe( "Example Test", () => {
// 	it( "correctly runs a test", () => {
// 		expect( xlib.f.length > 0 ).toBeTruthy()
// 	} )
// 	it( "returns string", () => {
// 		expect( xlib.f( "papa" ).includes( "papa" ) ).toBeTruthy()
// 	} )





// } )

import threads = xlib._imports.threads
import * as testWorker from "./_internal/_test-worker"

describe( "threads import", () => {

	it( "threads basic e2e", async () => {


		const counter = await threads.spawn<testWorker.Counter>( new threads.Worker( "./_internal/_test-worker" ) )
		const initialCount = await counter.getCount()
		expect( initialCount ).equals( 0 )
		await counter.increment()
		const update1Count = await counter.getCount()
		expect( update1Count ).equals( 1 )
		void counter.increment()
		const update2Count = await counter.getCount()
		expect( update2Count ).equals( 2 )
		await threads.Thread.terminate( counter )

		console.log( `threads!  noice!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )

	} )
} )