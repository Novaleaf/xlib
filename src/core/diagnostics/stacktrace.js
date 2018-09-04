"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** convert a Error.stack string to an array*/
function stackStringToArray(stack, keepHeader = false, keepWhitespace = false) {
    var stackArray = stack.toString().split("\n");
    if (keepWhitespace !== true) {
        stackArray = stackArray.map((value) => value.trim());
    }
    if (keepHeader !== true) {
        stackArray.shift();
    }
    return stackArray;
}
exports.stackStringToArray = stackStringToArray;
/** obtain a stacktrace.  TODO:  replace with https://github.com/eriwen/javascript-stacktrace  ???  maybe, try at least */
function getStackTrace(maxStackSize = 50) {
    var callstack = new Array(0);
    var isCallstackPopulated = false;
    //if(__.jsHelper.platformType===PlatformType.PhantomJs){
    //}
    if (typeof Error !== "undefined") {
        //console.log("getting error object"); /////////////////////////////////////////////////////////////////////////////
        var errorObj = new Error();
        if (errorObj.stack == null) {
            try {
                throw new Error("throwing an error to obtain a .stack variable");
            }
            catch (ex) {
                errorObj = ex;
            }
        }
        if (errorObj.stack != null) {
            //console.log("getting error object stack"); /////////////////////////////////////////////////////////////////////////////
            var stack = stackStringToArray(errorObj.stack);
            //remove call to this function:
            stack.shift();
            if (stack.length > 0) {
                callstack = stack;
                isCallstackPopulated = true;
            }
        }
    }
    if (!isCallstackPopulated) {
        try {
            var _ii;
            _ii.dont.exist += 0; //doesn"t exist- that"s the point
        }
        catch (e) {
            var lines;
            var len;
            if (e.stack) { //Firefox
                //console.log("//Firefox"); /////////////////////////////////////////////////////////////////////////////
                lines = e.stack.split("\n");
                //console.log("LINES == " +lines.join("\n"));
                len = lines.length;
                for (var i1 = 0; i1 < len; i1++) {
                    if (lines[i1].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        callstack.push(lines[i1]);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
            else if (window && window.opera && e.message) { //Opera
                //console.log("//Opera"); /////////////////////////////////////////////////////////////////////////////
                lines = e.message.split("\n");
                len = lines.length;
                for (var i2 = 0; i2 < len; i2++) {
                    if (lines[i2].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        var entry = lines[i2];
                        //Append next line also since it has the file info
                        if (lines[i2 + 1]) {
                            entry += " at " + lines[i2 + 1];
                            i2++;
                        }
                        callstack.push(entry);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
        }
    }
    if (!isCallstackPopulated) { //IE and Safari
        //console.log("//IE and Safari"); /////////////////////////////////////////////////////////////////////////////
        /* tslint:disable */
        var currentFunction = arguments.callee.caller;
        /* tslint:enable */
        var loopCount = 0;
        while (currentFunction && loopCount <= maxStackSize) {
            loopCount++;
            var fn = currentFunction.toString();
            var fname = fn.substring(0, fn.indexOf("{")) || "unknown";
            callstack.push(fname);
            //callstack.push(fn);
            currentFunction = currentFunction.caller;
        }
    }
    //console.log("//returning callstack"); /////////////////////////////////////////////////////////////////////////////
    //truncate stack if needed
    if (callstack.length > maxStackSize) {
        callstack.length = maxStackSize;
        callstack.push(" STACK TRUNCATED: exceeded frames.  Max= " + maxStackSize);
    }
    return callstack;
    //output(callstack);
}
exports.getStackTrace = getStackTrace;
//# sourceMappingURL=stacktrace.js.map