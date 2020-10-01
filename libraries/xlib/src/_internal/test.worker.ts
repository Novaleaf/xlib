//helper used for testing the threads import

// counter.ts
//import { expose } from "threads/worker"


console.warn( "start myst!" )

import { parentPort } from "worker_threads"
import * as comlink from "comlink"
import nodeEndpoint from "comlink/dist/umd/node-adapter"

let currentCount = 0

const counter = {
	getCount() {
		return currentCount
	},
	increment() {
		return ++currentCount
	},
	decrement() {
		return --currentCount
	}
}

console.warn( "mystery!" )
export type Counter = typeof counter

//expose( counter )
comlink.expose( counter )
//comlink.expose( counter, nodeEndpoint( parentPort as never ) )