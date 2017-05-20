export declare var webworker_threads: () => never;
/** From https://github.com/71104/rwlock    Asynchronous read/write lock implementation for Node.js.
== Main rules: ==
there may be zero or more readers at a time,
there may be only one writer at a time,
there may be no writer if there are one or more readers already.
== Basic usage ==
var lock = new ReadWriteLock();
//Acquiring a read lock:
lock.readLock(function (release) {
 // do stuff
    release();
});
//Acquiring a write lock:
lock.writeLock(function (release) {
    // do stuff
    release();
});
//Locks can be released later:
lock.readLock(function (release) {
    // not ready to release yet
    setTimeout(function () {  // ok, now I'm ready
        release();    }, 1000);
});
 *
 */
export interface ReadWriteLock {
    readLock(wrapFcn: (release: () => void) => any): void;
    readLock(
        /**
         * Every ReadWriteLock instance allows you to work on a virtually unlimited number of completely independent read/write locks.
Locks are identified by names called "keys". Every exposed method has an optional "key" first argument indicating the lock to work on; if you don't specify a key, the default lock is used.
         */
        key: string, wrapFcn: (release: () => void) => any): void;
    writeLock(wrapFcn: (release: () => void) => any): void;
    writeLock(
        /**
         * Every ReadWriteLock instance allows you to work on a virtually unlimited number of completely independent read/write locks.
Locks are identified by names called "keys". Every exposed method has an optional "key" first argument indicating the lock to work on; if you don't specify a key, the default lock is used.
         */
        key: string, wrapFcn: (release: () => void) => any): void;
}
/** From https://github.com/71104/rwlock    Asynchronous read/write lock implementation for Node.js.
== Main rules: ==
there may be zero or more readers at a time,
there may be only one writer at a time,
there may be no writer if there are one or more readers already.
== Basic usage ==
var lock = new ReadWriteLock();
//Acquiring a read lock:
lock.readLock(function (release) {
 // do stuff
    release();
});
//Acquiring a write lock:
lock.writeLock(function (release) {
    // do stuff
    release();
});
//Locks can be released later:
lock.readLock(function (release) {
    // not ready to release yet
    setTimeout(function () {  // ok, now I'm ready
        release();    }, 1000);
});
 *
 */
export declare var ReadWriteLock: {
    new (): ReadWriteLock;
};
