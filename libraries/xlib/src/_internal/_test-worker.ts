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

export type Counter = typeof counter

expose( counter )