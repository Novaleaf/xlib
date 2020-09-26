/* eslint-disable no-restricted-globals */
import * as xlib from "./_main"

// import chai from "chai"
// import chaiAsPromised from "chai-as-promised"
// chai.use( chaiAsPromised )
//import { expect } from "chai"



// // describe( "Example Test", () => {
// // 	it( "correctly runs a test", () => {
// // 		expect( xlib.f.length > 0 ).toBeTruthy()
// // 	} )
// // 	it( "returns string", () => {
// // 		expect( xlib.f( "papa" ).includes( "papa" ) ).toBeTruthy()
// // 	} )





// // } )

// // // import threads = xlib._imports.threads
// // // import * as testWorker from "./_internal/_test-worker"
// // // const testWorkerSpawn = new threads.Worker( "./_internal/_test-worker" )

// // // let jobsDone = false
// // // const counterPromise = threads.spawn<testWorker.Counter>( testWorkerSpawn ).finally( () => { jobsDone = true } )

// // // describe( "threads import", () => {



// // // 	it( "threads basic e2e", async () => {


// // // 		return new Promise( ( resolve, reject ) => {

// // // 			setInterval( () => {
// // // 				console.log( `is jobsDone?  ${ jobsDone }` )
// // // 				if ( jobsDone === true ) {
// // // 					resolve()
// // // 				}
// // // 			}, 100 )
// // // 			// 	return await counterPromise
// // // 		} )

// // // 		// async function getCounter() {
// // // 		// 	const counter = await counterPromise
// // // 		// 	console.warn( "SHMERE" )
// // // 		// 	return counter
// // // 		// }

// // // 		// //Promise.any( [async () => { }])

// // // 		// // const counter = await new Promise( ( resolve, reject ) => {

// // // 		// // 	//setTimeout( () => { resolve() }, 100 )
// // // 		// // 	return await counterPromise

// // // 		// // } )
// // // 		// //const counter = ( await Promise.all( [ counterPromise ] ) )[ 0 ]
// // // 		// const counter = await getCounter()
// // // 		// //const counter = await async()=> { return await counterPromise }
// // // 		// const initialCount = await counter.getCount()
// // // 		// expect( initialCount ).equals( 0 )
// // // 		// await counter.increment()
// // // 		// const update1Count = await counter.getCount()
// // // 		// expect( update1Count ).equals( 1 )
// // // 		// void counter.increment()
// // // 		// const update2Count = await counter.getCount()
// // // 		// expect( update2Count ).equals( 2 )
// // // 		// await threads.Thread.terminate( counter )

// // // 		// console.log( `threads!  noice! TEST  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )


// // // 	} )
// // // } )

import pino from "pino"
const logger = pino()

logger.info( "info from pino" )

describe( "Test", () => {

	// it( "should fail", () => {
	// 	//		throw new Error( "Failed" )
	// 	setTimeout( () => {
	// 		throw new Error( "Failed" )
	// 	}, 1000 )
	// } )

	it( "should success cb", ( done ) => {
		setTimeout( () => {
			done()
		}, 100 )
	} )
	it( "should fail cb timeout", ( done ) => {
		setTimeout( () => {
			done()
		}, 300 )
	}, 200 )
	it( "should success cb timeout 3000", ( done ) => {
		setTimeout( () => {
			done()
		}, 300 )
	}, 350 )

	it( "should fail cb", ( done ) => {
		//		throw new Error( "Failed" )
		setTimeout( () => {
			//throw new Error( "Failed" )
			done( new Error( "fail in setTimeout expected" ) )
		}, 100 )
	} )


	it( "should log", async () => {


	} )

	// it( "should randomly fail", () => {
	// 	if ( require( "./module" ) ) {
	// 		throw new Error( "Randomly failed" )
	// 	}
	// } )
} )

// module.exports = true
