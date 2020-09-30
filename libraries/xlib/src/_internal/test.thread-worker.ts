//helper used for testing the threads import
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
console.warn( "finished loading worker" )

export type Counter = typeof counter
expose( counter )