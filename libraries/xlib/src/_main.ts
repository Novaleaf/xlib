console.log( "Hello, worldly!!!" )

export const hello = "world wtf?!!!"

/** the world always says
 * @public
 */
export const goodbye = "world rebuild 42s"

/** does it exist? 
 * @beta */
export const shmaybe = "iz good?"


/** a test func returning hello name */
export function f( name: string ): string {

	return `hellos ${ name }`

}


import * as net from "./net"
export { net }


import * as _imports from "./_imports"
export { _imports }

//import threads = _imports.threads
import * as testWorker from "./_internal/_test-worker"

import { spawn, Worker, Thread } from "threads";

const __workerTarget = "./_internal/_test-worker"
async function asyncHuh(): Promise<void> {
	const counter = await spawn<testWorker.Counter>( new Worker( __workerTarget ) )
	const initialCount = await counter.getCount()
	//expect( initialCount ).toEqual( 0 )
	await counter.increment()
	const update1Count = await counter.getCount()
	//expect( update1Count ).toEqual( 1 )
	void counter.increment()
	const update2Count = await counter.getCount()
	//expect( update2Count ).toEqual( 2 )
	await Thread.terminate( counter )

	console.log( `threads!  noice!!!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )

}

void asyncHuh()
console.log( "called asyncHuh" )