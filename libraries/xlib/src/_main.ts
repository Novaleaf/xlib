/** 
 * @packageDocumentation
 * isomorphic swiss army knife
*/
import "./_internal/polyfill"


//console.warn( "xlib entrypoint (_main)" )



import * as environment from "./environment"
export { environment }

import * as _imports from "./_imports"
export { _imports }
import * as net from "./net"
export { net }
import * as util from "./util"
export { util }
import * as lodash from "lodash"
export { lodash }

import * as lolo from "./lolo"
export { lolo }
import * as diagnostics from "./diagnostics"
export { diagnostics }
import * as reflection from "./reflection"
export { reflection }




// //import threads = _imports.threads
// import * as testWorker from "./_internal/_test-worker"

// import { spawn, Thread, Worker } from "threads"


import * as comlink from "comlink"
//import * as testWorker from "./_internal/test.worker"



if ( globalThis.Worker == null ) {
	const webWorker = require( "web-worker" )
	globalThis.Worker = webWorker
}
//import Worker from "web-worker"

//let nodeEndpoint = ( worker: Worker ) => worker
// if ( globalThis.Worker == null ) {
// 	const workerThreads = require( ( () => "worker_threads" )() )
// 	globalThis.Worker = workerThreads.Worker as never
// 	nodeEndpoint = require( "comlink/dist/umd/node-adapter" )
// }

import * as path from "path"

//import 

async function asyncHuh(): Promise<void> {
	//const worker = new Worker( path.normalize( path.join( __dirname, "./_internal/test.worker.js" ) ), { type: "module" } )
	const worker = new Worker( "./_internal/test.worker", { type: "module" } )
	//const counter = comlink.wrap<testWorker.Counter>( nodeEndpoint( worker ) )
	const counter = comlink.wrap<ANY>( worker )
	const initialCount = await counter.getCount()
	//expect( initialCount ).toEqual( 0 )
	await counter.increment()
	const update1Count = await counter.getCount()
	//expect( update1Count ).toEqual( 1 )
	void counter.increment()
	const update2Count = await counter.getCount()
	//expect( update2Count ).toEqual( 2 )
	await worker.terminate()

	console.log( `threads!  noice!!!?!!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )

}

void asyncHuh()
console.log( "called asyncHuh!!" )


// async function asyncHuh(): Promise<void> {
// 	const counter = await spawn<testWorker.Counter>( new Worker( "./_internal/_test-worker" ) )
// 	const initialCount = await counter.getCount()
// 	//expect( initialCount ).toEqual( 0 )
// 	await counter.increment()
// 	const update1Count = await counter.getCount()
// 	//expect( update1Count ).toEqual( 1 )
// 	void counter.increment()
// 	const update2Count = await counter.getCount()
// 	//expect( update2Count ).toEqual( 2 )
// 	await Thread.terminate( counter )

// 	console.log( `threads!  noice!!!?!!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )

// }

// void asyncHuh()
// console.log( "called asyncHuh!!" )