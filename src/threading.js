"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/all.d.ts" />
///** https://adambom.github.io/parallel.js/ 
// * Parallel Computing with Javascript
//Parallel.js is a tiny library for multi-core processing in Javascript. It was created to take full advantage of the ever-maturing web-workers API. Javascript is fast, no doubt, but lacks the parallel computing capabilites of its peer languages due to its single-threaded computing model. In a world where the numbers of cores on a CPU are increasing faster than the speed of the cores themselves, isn't it a shame that we can't take advantage of this raw parallelism?
//Parallel.js solves that problem by giving you high level access to multicore processing using web workers. It runs in your browser (as long as it supports web workers). Check it out.
//USAGE:  var p = new Parallel([1,2,3]);
// */
//export import Parallel = require("paralleljs");
//also try adding https://www.npmjs.com/package/webworker-threads sometime
exports.webworker_threads = function () { throw new Error("to implement"); };
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
exports.ReadWriteLock = require("rwlock");
//# sourceMappingURL=threading.js.map