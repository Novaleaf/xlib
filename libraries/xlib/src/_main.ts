/** 
 * @packageDocumentation
 * isomorphic swiss army knife
*/
import "./_internal/polyfill"


//console.warn( "xlib entrypoint (_main)" )



import * as environment from "./environment"
export { environment as env }

import * as _imports from "./_imports"
export { _imports }
import * as net from "./net"
export { net }
// import * as util from "./util"
// export { util }
import * as lodash from "lodash"
export { lodash }

// import * as lolo from "./lolo"
// export { lolo }
import * as diagnostics from "./diagnostics"
export { diagnostics as diag }
import * as reflection from "./reflection"
export { reflection }

import * as promise from "./promise"
export { promise }

import * as numeric from "./numeric"
export { numeric }

import * as collection from "./collection"
export { collection }


import * as  _enum from "./enum"
export { _enum as enum }

import * as num from "./num"
export { num }

import * as array from "./array"
export { array }

import * as str from "./str"
export { str }

import * as hex from "./hex"
export { hex }

import * as guid from "./guid"
export { guid }

import * as exception from "./exception"
export { exception as ex }

import * as rand from "./rand"
export { rand }

import * as convert from "./convert"
export { convert }

import * as security from "./security"
export { security as sec }

import * as serialization from "./serialization"
export { serialization }

import * as time from "./time"
export { time }

import * as validation from "./validation"
export { validation }


const log = new diagnostics.Logger( "main" )

export const HELLO = "world12"


//import threads = _imports.threads
import * as testWorker from "./_internal/_test-worker"

import { spawn, Thread, Worker } from "threads"



async function asyncHuh(): Promise<void> {
	const counter = await spawn<testWorker.Counter>( new Worker( "./_internal/_test-worker" ) )
	const initialCount = await counter.getCount()
	//expect( initialCount ).toEqual( 0 )
	await counter.increment()
	const update1Count = await counter.getCount()
	//expect( update1Count ).toEqual( 1 )
	void counter.increment()
	const update2Count = await counter.getCount()
	//expect( update2Count ).toEqual( 2 )
	await Thread.terminate( counter )

	console.log( `Thread test, got callback from worker thread!!!  ${ JSON.stringify( { initialCount, update1Count, update2Count } ) }` )

}

void asyncHuh()
console.error( "Thread test:  called asyncHuh() test function ################################################################################################################################################################################################### " )



log.error( "TEMP: done executing xlib _.main.ts..." )

