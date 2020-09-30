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



//const log = new diagnostics.Logger( "main" )


import * as testWorker from "./_internal/test.thread-worker"
import { spawn, Thread, Worker, BlobWorker } from "threads"

async function threadTest(): Promise<void> {
	const counter = await ( async () => {
		if ( environment.getEnvInfo().platform === "browser" ) {
			const testWorkerBlob = require( "raw-loader!./_internal/test.thread-worker" )
			return await spawn<testWorker.Counter>( BlobWorker.fromText( testWorkerBlob.default ) ) 
		} else {
			return await spawn<testWorker.Counter>( new Worker( "./_internal/test.thread-worker" ) )
		}

	} )()

	const initialCount = await counter.getCount()
	await counter.increment()
	const update1Count = await counter.getCount()
	void counter.increment()
	const update2Count = await counter.getCount()
	await Thread.terminate( counter )

	console.log( `threads!  noice!!!?!!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )
}

void threadTest()
console.error( "called threadTest " )