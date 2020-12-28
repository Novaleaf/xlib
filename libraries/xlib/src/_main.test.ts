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

//import { describe, it } from "mocha"
//import {describe, it} from "jest"


// import pino from "pino"
// const logger = pino( {
// 	browser: {
// 		asObject: true
// 	}
// } )

// logger.info( "info from pino!!", { some: "data" } )
// logger.info( "info from pino!! w error", { some: "data", someErr: new Error( "boom" ) } )
// logger.info( "info from pino!! just str" )
// logger.info( { msg: "info from pino!! w error", some: "data", someErr: new Error( "boom" ), stack: xlib.diagnostics.exception.getStackTrace() } )

// logger.info( { arg1: "fish", taco: "arg2" }, "an extra message" )

// const myLog = new xlib.diagnostics.Logger( "first!" )
// myLog.info( "full roundtrip!  just  a msg" )

// myLog.info( { some: "data", someErr: new Error( "boom" ) } )
// myLog.info( "info from pino!! just str" )
// myLog.info( { msg: "info from pino!! w error", some: "data", err: new Error( "boom" ), stack: xlib.diagnostics.exception.getStackTrace() } )

// myLog.info( { arg1: "fish", taco: "arg2" }, "an extra message" )



describe( "meta tests", () => {




	describe( "'it' method verification", () => {

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
		// it( "should fail cb timeout", ( done ) => {
		// 	setTimeout( () => {
		// 		done()
		// 	}, 300 )
		// }, 200 )
		it( "async done() in 150ms. timeout 350", ( done ) => {
			setTimeout( () => {
				done()
			}, 150 )
		}, 350 )

		// it( "should fail cb", ( done ) => {
		// 	//		throw new Error( "Failed" )
		// 	setTimeout( () => {
		// 		//throw new Error( "Failed" )
		// 		done( new Error( "fail in setTimeout expected" ) )
		// 	}, 100 )
		// } )

		it( "async Promise resolve in 150ms.  timeout 350", () => {
			return new Promise( ( resolve ) => {
				setTimeout( () => {
					resolve()
				}, 150 )
			} )
		}, 350 )
		it( "async no work", () => {
		}, 100 )
		// it( "FAIL:  async cb timeout", () => {
		// 	return new Promise( ( resolve ) => {
		// 		setTimeout( () => {
		// 			resolve()
		// 		}, 350 )
		// 	} )
		// }, 350 )

		it( "should log", async () => {


		} )

		// it( "should randomly fail", () => {
		// 	if ( require( "./module" ) ) {
		// 		throw new Error( "Randomly failed" )
		// 	}
		// } )
	} )
} )

describe( "xlib basic features", () => {
	it( "log basic", () => {

		const tempLog = new xlib.diag.Logger( "test main temp" )
		tempLog.debug( "debug message" )

		try {
			tempLog.assert( true, "should do nothing" )
		} catch {
			throw new Error( "assert true should not have threw" )
		}
		let didFail = false
		try {
			tempLog.assert( false, "should throw" )
		} catch {
			didFail = true
		}
		if ( didFail !== true ) {
			throw new Error( "assert false should have threw" )
		}


	} )
} )