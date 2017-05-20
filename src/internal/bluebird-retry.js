"use strict";
var Promise = require("bluebird");
/**
 *  Stopping
The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of retry.StopError from within the called function.


//
// Subclass of Error that can be thrown to indicate that retry should stop.
// If called with an instance of Error subclass, then the retry promise will be
// rejected with the given error.
//
// Otherwise the cancel error object itself is propagated to the caller.

For example:

var retry = require('bluebird-retry');
var i = 0;
var err;
var swing = function() {
i++;
console.log('strike ' + i);
if (i == 3) {
    throw new retry.StopError('yer out');
}
throw new Error('still up at bat');
};

retry(swing, {timeout: 10000})
.catch(function(e) {
console.log(e.message)
});
Will display:

strike 1
strike 2
strike 3
yer out
The StopError constructor accepts one argument. If it is invoked with an instance of Error, then the promise is rejected with that error argument. Otherwise the promise is rejected with the StopError itself.*

 */
function StopError(err) {
    this.name = 'StopError';
    if (err instanceof Error) {
        this.err = err;
    }
    else {
        this.message = err || 'cancelled';
    }
}
StopError.prototype = Object.create(Error.prototype);
retry.StopError = StopError;
// Retry `func` until it succeeds.
//
// Waits `options.interval` milliseconds (default 1000) between attempts.
//
// Increases wait by a factor of `options.backoff` each interval, up to
// a limit of `options.max_interval`.
//
// Keeps trying until `options.timeout` milliseconds have elapsed,
// or `options.max_tries` have been attempted, whichever comes first.
//
// If neither is specified, then the default is to make 5 attempts.
function retry(func, options) {
    options = options || {};
    var interval = typeof options.interval === 'number' ? options.interval : 1000;
    var max_tries = null;
    var giveup_time = null;
    if (typeof (options.max_tries) !== 'undefined') {
        max_tries = options.max_tries;
    }
    if (options.timeout) {
        giveup_time = new Date().getTime() + options.timeout;
    }
    //if(max_tries==null && giveup_time==null){
    if (!max_tries && !giveup_time) {
        max_tries = 5;
    }
    var tries = 0;
    var start = new Date().getTime();
    // If the user didn't supply a predicate function then add one that
    // always succeeds.
    //
    // This is used in bluebird's filtered catch to flag the error types
    // that should retry.
    var predicate = options.predicate || function (err) { return true; };
    var stopped = false;
    function try_once() {
        var tryStart = new Date().getTime();
        return Promise.attempt(function () {
            return func();
        })
            .caught(StopError, function (err) {
            stopped = true;
            if (err.err instanceof Error) {
                return Promise.reject(err.err);
            }
            else {
                return Promise.reject(err);
            }
        })
            .caught(predicate, function (err) {
            if (stopped) {
                return Promise.reject(err);
            }
            ++tries;
            if (tries > 1) {
                interval = backoff(interval, options);
            }
            var now = new Date().getTime();
            if ((max_tries && (tries === max_tries) ||
                (giveup_time && (now + interval >= giveup_time)))) {
                if (!(err instanceof Error)) {
                    var failure = err;
                    if (failure) {
                        if (typeof failure !== 'string') {
                            failure = JSON.stringify(failure);
                        }
                    }
                    err = new Error('rejected with non-error: ' + failure);
                    err.failure = failure;
                }
                var timeout = new Error('operation timed out after ' + (now - start) + ' ms, ' + tries + ' tries with error: ' + err.message);
                timeout.failure = err;
                timeout.code = 'ETIMEDOUT';
                return Promise.reject(timeout);
            }
            else {
                var delay = interval - (now - tryStart);
                if (delay <= 0) {
                    return try_once();
                }
                else {
                    return Promise.delay(delay).then(try_once);
                }
            }
        });
    }
    return try_once();
}
// Return the updated interval after applying the various backoff options
function backoff(interval, options) {
    if (options.backoff) {
        interval = interval * options.backoff;
    }
    if (options.max_interval) {
        interval = Math.min(interval, options.max_interval);
    }
    return interval;
}
module.exports = retry;
//# sourceMappingURL=bluebird-retry.js.map