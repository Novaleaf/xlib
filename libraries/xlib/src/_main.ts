/** 
 * @packageDocumentation
 * isomorphic swiss army knife
*/

console.warn( "xlib entrypoint (_main)" )


import * as _imports from "./_imports"
import * as net from "./net"
import * as util from "./util"

//export * as lodash from "lodash"

//import * as _ from "lodash"

import * as lolo from "./lolo"

export { _imports, net, util, lolo }



// //import threads = _imports.threads
// import * as testWorker from "./_internal/_test-worker"

// import { spawn, Thread, Worker } from "threads"



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