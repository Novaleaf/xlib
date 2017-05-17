declare namespace Mocha {
	interface IRunnable {
		/** specify how long before the test timesout.  default if not set is 2000 (2 sec) */
		timeout: (ms: number) => this;
	}
}