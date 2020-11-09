//helper used for testing the threads import

// counter.ts
import { expose } from "threads/worker"

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

console.warn( "Thread Test:  this is an async call, from within the worker thread." )
export type Counter = typeof counter

expose( counter )