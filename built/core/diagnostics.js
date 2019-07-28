"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = tslib_1.__importStar(require("lodash"));
const stringHelper = tslib_1.__importStar(require("./_util/stringhelper"));
const environment = tslib_1.__importStar(require("./environment"));
tslib_1.__exportStar(require("./_diagnostics/exception"), exports);
const exception = tslib_1.__importStar(require("./_diagnostics/exception"));
const _logging = tslib_1.__importStar(require("./_diagnostics/logging"));
exports._logging = _logging;
/** A high quality console logger.  shortcut to diagnostics._logging.log. */
exports.log = new _logging.Logger();
/** computes the callSite (file+line+col) of a location in the call stack */
function computeCallSite(/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive, 
/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame = false) {
    if (typeof (startingFrameExclusive) === "number") {
        //add 1 to ignore this location
        startingFrameExclusive += 1;
    }
    let frame = computeStackTrace(startingFrameExclusive, 1, keepStartingFrame)[0];
    let callSite = stringHelper.removeBefore(frame, "(", false, true);
    callSite = stringHelper.removeAfter(callSite, ")", false, false);
    return callSite;
}
exports.computeCallSite = computeCallSite;
/** computes the fileName of a location in the call stack */
function computeCallFile(/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive, 
/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame = false) {
    if (typeof (startingFrameExclusive) === "number") {
        //add 1 to ignore this location
        startingFrameExclusive += 1;
    }
    let callFile = computeCallSite(startingFrameExclusive, keepStartingFrame);
    //remove line and col numbers, make the assumption that the file.ext preceeds this.
    while (callFile.lastIndexOf(".") < callFile.lastIndexOf(":")) {
        callFile = stringHelper.removeAfter(callFile, ":", false, true);
    }
    return callFile;
}
exports.computeCallFile = computeCallFile;
/** get a stack trace of the current call stack*/
function computeStackTrace(/**
    * regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive, 
/** max frames to return */ maxFrames, 
/** changes the first ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame = false) {
    let tempError = new Error();
    if (tempError.stack == null) {
        return [];
    }
    let splitStack = tempError.stack.split("\n");
    //remove first frame, which contains a message such as "Error" in Node v10.x
    const messageFrame = splitStack.shift();
    //remove next frame, which contains a trace of this genStackTrace method.
    const thisFrame = splitStack.shift();
    if (startingFrameExclusive != null) {
        let lastRemovedFrame;
        if (typeof startingFrameExclusive === "string") {
            startingFrameExclusive = new RegExp(startingFrameExclusive);
        }
        if (startingFrameExclusive instanceof RegExp) {
            let shouldStop = false;
            while (shouldStop === false) {
                lastRemovedFrame = splitStack.shift();
                //only stop if our just removed frame matches and next frame doesn't
                shouldStop = ((startingFrameExclusive.test(lastRemovedFrame) === true) && (startingFrameExclusive.test(splitStack[0]) === false));
                if (splitStack.length === 0) {
                    shouldStop = true;
                }
            }
        }
        else if (typeof (startingFrameExclusive) === "number" && startingFrameExclusive > 0) {
            for (let i = 0; i < startingFrameExclusive; i++) {
                lastRemovedFrame = splitStack.shift();
            }
        }
        if (keepStartingFrame === true && lastRemovedFrame != null) {
            splitStack.unshift(lastRemovedFrame);
        }
    }
    if (maxFrames != null && splitStack.length > maxFrames) {
        splitStack.length = maxFrames;
    }
    return splitStack;
}
exports.computeStackTrace = computeStackTrace;
/** @deprecated please use diagnostics.computeStackTrace() under most circumstances.
    *
    extract stack frames.   note that the first frame contains the message, so if you don't want that, pass the optional ```startingFrame``` parameter */
function extractStackFrames(/** error or stack string */ error, /** @default undefined (all frames)*/ frames, /** @default 0 */ startingFrame) {
    let stack;
    let stackArray;
    if (typeof (error) === "string") {
        stack = error;
    }
    else {
        stack = error.stack;
    }
    if (typeof stack === "string") {
        stackArray = stack.split("\n");
    }
    else if (_.isArray(stack)) {
        stackArray = stack;
    }
    else {
        //unknown
        return [];
    }
    if (startingFrame != null) {
        for (let i = 0; i < startingFrame; i++) {
            stackArray.shift();
        }
    }
    if (frames != null && stackArray.length > frames) {
        stackArray.length = frames;
    }
    return stackArray;
}
exports.extractStackFrames = extractStackFrames;
/** thrown on race-check failures */
class RaceCheckException extends exception.XlibException {
}
exports.RaceCheckException = RaceCheckException;
/** DEBUG ONLY!  noops self if environment.logLevel is greater than DEBUG helper to check for algorithm race conditions (example: removing from a collection while enumerating) */
class DebugRaceCheck {
    constructor(debugText = "") {
        this.debugText = debugText;
        this._version = 0;
        this._lockVersion = 0;
    }
    enter() {
        if (this._lockVersion !== 0) {
            //set lock version to -1 to cause the other thread caller to assert also
            this._lockVersion = -1;
            throw new RaceCheckException("DebugRaceCheck.Enter() failed!  Something else has this locked!  Additional Info=" + String(this.debugText));
        }
        this._lockVersion = this._version;
        this._version++;
    }
    exit() {
        if (this._lockVersion !== this._version - 1) {
            if (this._lockVersion === 0) {
                throw new RaceCheckException("DebugRaceCheck.Exit() failed!  Already unlocked and we are calling unlock again!  Additional Info=" + String(this.debugText));
            }
            else {
                throw new RaceCheckException("DebugRaceCheck.Exit() failed!  internal state is corrupted, moste likely from multithreading  Additional Info=" + String(this.debugText));
            }
            //cause the assert to keep occuring if this failed
            //return;
        }
        this._lockVersion = 0;
    }
    /** quickly locks and unlocks */
    edit() {
        this.enter();
        this.exit();
    }
    /** ensures that this raceCheck is not currently locked */
    poke() {
        this._version++;
        if (this._lockVersion !== 0) {
            throw new RaceCheckException("DebugRaceCheck.Exit() failed!internal state is corrupted, moste likely from multithreading  Additional Info=" + String(this.debugText));
        }
    }
    toString() {
        if (environment.logLevel <= environment.LogLevel.DEBUG) {
            let isEdit = this._lockVersion === 0 ? false : true;
            return "version=" + String(this._version) + " isBeingEdited=" + String(isEdit);
        }
        else {
            return "DebugRaceCheck is DISABLED when baselib.environment.logLevel > EnvLevel.DEBUG.  use baselib.concurrency.Lock if you need something in production";
        }
    }
}
exports.DebugRaceCheck = DebugRaceCheck;
if (!environment.isDebug()) {
    //noop racecheck functions
    // tslint:disable-next-line: no-empty
    DebugRaceCheck.prototype.edit = () => { };
    // tslint:disable-next-line: no-empty
    DebugRaceCheck.prototype.enter = () => { };
    // tslint:disable-next-line: no-empty
    DebugRaceCheck.prototype.exit = () => { };
    // tslint:disable-next-line: no-empty
    DebugRaceCheck.prototype.poke = () => { };
}
//# sourceMappingURL=diagnostics.js.map