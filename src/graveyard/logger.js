/* jshint -W087 */ //allow "debugger;" statement
/** logging tools that work cross-platform, IE in browser and serverside (node.js) */
var logger;
(function (logger) {
    /** when true, asserts are enabled.
    when running in a browser, set this by adding a "data-debug" attribute to a script tag.
    example: <script src="require.js" data-debug="true"></script>
    when running on a node.js server, set this by running node with the "--debug" argument.
    example: "node --debug main.js" */
    logger._DEBUG_MODE = false;
    /** when true, logger.writeTrace() and logger.trace() methods are enabled.
    when running in a browser, set this by adding a "data-trace" attribute to a script tag.
    when running on a node.js server, set this by running node with the "--debug" argument
    you can enable/disable keys by modifying the logger._tracesToEnable array */
    logger._TRACE_MODE = false;
    /** when true, unit-tests are enabled.
    when running in a browser, set this by adding a "data-test" attribute to a script tag.
    when running on a node.js server, set this by running node with the "--debug" argument*/
    logger._TEST_MODE = false;
    function assert(conditionOrError, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (message == null) {
            message = "Assert Failed.";
        }
        if (conditionOrError instanceof Error) {
            var error = conditionOrError;
            conditionOrError = false;
            message += "Error=" + error.toString();
        }
        if (conditionOrError === false) {
            if (!logger._DEBUG_MODE && !logger._TRACE_MODE) {
                //no op
                return;
            }
            if (message instanceof Error || message.stack != null) {
                message = " Error=" + JSON.stringify(jsonifyAnything(message), null, "\t");
            }
            //replace error args with strings
            //for (var i = 0; i < args.length; i++) {
            //	if(args[i].stack!=null ) {
            //		args[i] = __.format("EXCEPTION= {0}\n{1}", args[i].toString(), args[i].stack);
            //	}
            //}
            if (args.length > 0) {
                message = __.jsHelper.apply(__.format, __, args, message);
            }
            if (__.jsHelper.platformType === __.jsHelper.PlatformType.PhantomJs) {
                //phantomjs doesn't provide us stack info for asserts, so we need to do it ourselves
                var stackTrace = __.jsHelper.stackTrace();
                //remove our "assert" from the logged trace
                stackTrace.shift();
                message += "\n" + stackTrace.join("\n").toString();
            }
            if (__.jsHelper.platformType === __.jsHelper.PlatformType.Browser) {
                //reduce spam on browser by only showing trace if not in browser
                if (logger._DEBUG_MODE) {
                    console.assert(false, message);
                    eval("debugger");
                }
                else {
                    if (console.trace != null) {
                        console.trace("ASSERT:" + message);
                    }
                }
            }
            else {
                if (logger._DEBUG_MODE) {
                    if (console.trace != null) {
                        console.trace("ASSERT:" + message);
                    }
                    debugger;
                }
                else {
                    console.assert(false, message);
                }
            }
        }
    }
    logger.assert = assert;
    /** does a traceDebug() and then assert() if any of the args are null/undefined */
    function notNull() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isError = false;
        for (var i = 0; i < args.length; i++) {
            if (args[i] == null) {
                isError = true;
                break;
            }
        }
        if (isError) {
            inspectDebug.apply(this, args);
            logger.assert(false, "a required parameter is null.  see above traceDebug()");
        }
    }
    logger.notNull = notNull;
    /** placeholder for something you need to code before running. if in #TRACE or #TEST mode, or NOT in #DEBUG mode
    throws an assert */
    function todo(reason) {
        if (logger._TRACE_MODE === true || logger._TEST_MODE === true || logger._DEBUG_MODE !== true) {
            assert(false, __.format("TODO= {0}", reason));
        }
    }
    logger.todo = todo;
    /** note to redo this before shipping (any time not in #DEBUG mode) */
    function refactor(reason) {
        assert(logger._DEBUG_MODE, __.format("REFACTOR= {0}", reason));
    }
    logger.refactor = refactor;
    /** write a message to console, if #DEBUG is on */
    function writeDebug(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!logger._DEBUG_MODE) {
            return;
        }
        if (args.length > 0) {
            message = __.jsHelper.apply(__.format, __, args, message);
        }
        console.log(message);
        //chrome has great object inspection, so show whatever args passed in
        if (__.browserHelper.isBrowser && args.length > 0) {
            var toLog = {};
            for (var i = 0; i < args.length; i++) {
                toLog["arg" + i] = args[i];
            }
            console.log(toLog);
        }
    }
    logger.writeDebug = writeDebug;
    function stringifyWithFunctions(obj) {
        var temp = {};
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            if (typeof (obj[key]) === "function") {
                temp[key] = obj[key].toString().substring(0, 30);
            }
            else {
                temp[key] = obj[key];
            }
        }
        return JSON.stringify(temp);
    }
    logger.stringifyWithFunctions = stringifyWithFunctions;
    /** convert an object into something that is sendable to JSON.stringify() */
    function jsonifyAnything(obj) {
        try {
            //var temp = {};
            //var x = ["hi", "bye"];
            if (typeof (obj) === "object") {
                //for error objects
                if (obj.stack != null) {
                    return { type: "error", message: obj.toString(), stack: obj.stack.split("\n") };
                }
                else {
                    //for normal objects, stringify
                    var thisArg = {};
                    __.forEachProperty(obj, function (value, key) {
                        if (typeof (value) === "object") {
                            try {
                                thisArg[key] = stringifyWithFunctions(value); // JSON.stringify(value);
                            }
                            catch (ex) {
                                thisArg[key] = value.toString();
                            }
                        }
                        else if (typeof (value) === "function") {
                            thisArg[key] = value.toString().substring(0, 30);
                        }
                        else {
                            thisArg[key] = value;
                        }
                    });
                    return thisArg;
                }
            }
            else {
                return obj;
            }
        }
        catch (ex) {
            //console.log("EX! in jsonifyAnything");
            return obj.toString();
        }
    }
    logger.jsonifyAnything = jsonifyAnything;
    /** if condition is false, first invokes logger.inspectDebug(args) and then logger.assert() */
    function assertDebug(condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (condition === false) {
            __.jsHelper.apply(inspectDebug, this, args, "=== logger.assertDebug(false) ===");
            //__.arrayHelper.append(args,["=== logger.assertDebug(false) ==="]);
            inspectDebug.apply(this, args);
            assert(false, "logger.assertDebug() fail.  see above inspection log for more details.");
        }
    }
    logger.assertDebug = assertDebug;
    /** write a message to console, if #DEBUG is on */
    function inspectDebugHelper() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!logger._DEBUG_MODE) {
            return;
        }
        if (__.browserHelper.isBrowser && !__.browserHelper.isIE) {
            //chrome has great object inspection, so just log the object			
            console.log(args);
        }
        else if (__.browserHelper.isIE) {
            for (var i = 0; i < args.length; i++) {
                //in ie, so do some plain console logging.
                console.log(serialization.superStringify(args[i], 1, false, true, undefined, null, null));
            }
        }
        else {
            for (i = 0; i < args.length; i++) {
                var argName = i + "_" + __.jsHelper.getTypeName(args[i]);
                var argValue = "";
                try {
                    if (args[i] == null) {
                        argValue = "NULL";
                    }
                    else if (args[i].stack != null) {
                        argValue = args[i].toString() + args[i].stack;
                    }
                    else {
                        try {
                            argValue = JSON.stringify(args[i]); //,null,"\t");
                        }
                        catch (ex) {
                            argValue = args[i].toString();
                        }
                    }
                }
                catch (ex) {
                    argValue = " = EXCEPTION!: " + ex.toString();
                }
                console.log(argName + " : " + argValue);
            }
        }
    }
    //function inspectDebugHelper__OLD(...args: any[]) {
    //	if (!logger._DEBUG_MODE) {
    //		return;
    //	}
    //	var i;
    //	var toLog;
    //	if (__.browserHelper.isBrowser && !__.browserHelper.isIE) {
    //		toLog = {};
    //		for (i = 0; i < args.length; i++) {
    //			var argName = i + "_" + typeof (args[i]);
    //			//chrome has great object inspection, so just log the object
    //			toLog[argName] = args[i];
    //		}
    //	} else {
    //		toLog = [];
    //		for (i = 0; i < args.length; i++) {
    //			var argName = i + "_" + typeof (args[i]);
    //			try {
    //				if (args[i] == null) {
    //					args[i] = "NULL";
    //				}
    //				if (args[i].stack != null) {
    //					toLog[i] = args[i].toString() + " (see below for error details)";
    //					console.log(JSON.stringify(toLog) + "\n" + args[i].stack);
    //					//console.log(JSON.stringify(toLog));
    //					//console.log(args[i].stack);
    //					toLog = [];
    //				} else {
    //					//other platforms have crappy object inspection, so try to convert objects to json strings for better inspection
    //					toLog[i] = jsonifyAnything(args[i]);
    //				}
    //			} catch (ex) {
    //				toLog[i] = argName + " = EXCEPTION!: " + ex.toString();
    //			}
    //		}
    //	}
    //	try {
    //		switch (__.jsHelper.platformType) {
    //			case __.jsHelper.PlatformType.Browser:
    //				if (!__.browserHelper.isIE) {
    //					console.log(toLog);
    //					break;
    //				}
    //			case __.jsHelper.PlatformType.NodeJs:
    //			default:
    //				console.log(JSON.stringify(toLog));
    //				break;
    //		}
    //	} catch (ex) {
    //		//console.log("EX! writing toLog");
    //		console.error("logger.inspectDebug() failure, ex=" + ex.toString());
    //	}
    //}
    /** logs out the arguments line-by-line if in #TRACE.  best way for inspecting complex objects */
    function inspectDebug() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        try {
            if (!logger._DEBUG_MODE) {
                return;
            }
            if (!(__.browserHelper.ieVersion <= 8)) {
                console.error("======= logger.inspectDebug() =========");
            }
            else {
                console.log("======= logger.inspectDebug() =========");
            }
            //args.unshift("======= logger.inspectDebug() =========");
            __.jsHelper.apply(inspectDebugHelper, this, args);
            if (!logger._TRACE_MODE) {
                return;
            }
            if (__.browserHelper.isBrowser && !__.browserHelper.isIE) {
            }
            else {
                if (!(__.browserHelper.ieVersion <= 8)) {
                    //console.log(" SSSSSSSSSSSSSS TART STACK");
                    //everything except chrome, show a stack trace.
                    var stack = __.jsHelper.stackTrace().slice(1, 5);
                    console.debug(stack.join("\n"));
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    logger.inspectDebug = inspectDebug;
    /** keys in this array are enabled for tracing requests (logger.trace)  if null, all traces are enabled.
    if empty, no traces are enabled.
    you can add the "data-trace-keys" attribute to your boot-loader script element,
    with a comma-seperated list of keys you wish to enable.
    if running with node.js, or if you wish to change keys at runtime,
    add/remove from logger._traceKeysToEnable*/
    /* jshint -W030 */
    logger._traceKeysToEnable;
    /* jshint +W030 */
    /** print a console.log message and stack trace if the key is enabled */
    function trace(key, message) {
        if (message === void 0) { message = ""; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (logger._traceKeysToEnable && !__.arrayHelper.contains(logger._traceKeysToEnable, key)) {
            //no op
            return;
        }
        //console.log(" ...............................   TRACE TRACE TRACE ................ ");
        var msg = __.format(" .................TRACE TRACE TRACE..... logger.trace(\"{0}\")  ................ ", key);
        //console.log(__.format(" .................TRACE TRACE TRACE.....TraceKey = {0}  ................ ", key));
        if (message != null) {
            if (args.length > 0) {
                msg += "\n" + __.jsHelper.apply(__.format, __, args, message);
            }
            else {
                msg += "\n\tMESSAGE: " + message;
            }
        }
        var stackTrace = __.jsHelper.stackTrace();
        if (stackTrace != null) {
            msg += "\n\tSTACKTRACE: " + stackTrace.join("\n");
        }
        else {
            msg += "\n\tSTACKTRACE:  NONE_AVAILABLE!";
        }
        //console.log({ stackTrace: __.jsHelper.stackTrace() });
        console.log(msg);
        if (__.jsHelper.platformType === __.jsHelper.PlatformType.Browser) {
            var msgObject = {};
            for (var i = 0; i < args.length; i++) {
                msgObject["arg" + i] = args[i];
            }
            msgObject["stackTrace"] = stackTrace;
            console.log(msgObject);
        }
    }
    logger.trace = trace;
    /** print a console.log message if the key is enabled (no stack trace shown) */
    function writeTrace(key, msg) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (logger._traceKeysToEnable && !__.arrayHelper.contains(logger._traceKeysToEnable, key)) {
            //no op
            return;
        }
        //console.log(__.format(" logger.message,  Key = {0}  ................ ", key));
        if (msg != null) {
            if (args.length > 0) {
                msg = __.jsHelper.apply(__.format, __, args, msg);
            }
            msg = __.format("---------------\n > > logger.writeTrace(\"{0}\"): {1}\n", key, msg);
            console.log(msg);
            if (__.jsHelper.platformType === __.jsHelper.PlatformType.Browser) {
                var msgObject = {};
                for (var i = 0; i < args.length; i++) {
                    msgObject["arg" + i] = args[i];
                }
                console.log(msgObject);
            }
            console.log();
        }
    }
    logger.writeTrace = writeTrace;
    /** send a warning message to the devops team (but don't crash our app) */
    function serviceWarning(key, msg) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        writeTrace(key, __.format(__.jsHelper.apply(__.format, __, args, msg)));
    }
    logger.serviceWarning = serviceWarning;
    /** execute the function argument if we are in debug mode */
    function execIfDebug(fcn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (logger._DEBUG_MODE) {
            return fcn.apply(null, args);
        }
        return null;
    }
    logger.execIfDebug = execIfDebug;
})(logger = exports.logger || (exports.logger = {}));
//# sourceMappingURL=logger.js.map