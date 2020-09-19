export * from "./_diagnostics/exception";
import * as exception from "./_diagnostics/exception";
import * as _logging from "./_diagnostics/logging";
export { _logging };
/** A high quality console logger.  shortcut to diagnostics._logging.log. */
export declare const log: _logging.Logger;
/** computes the callSite (file+line+col) of a location in the call stack */
export declare function computeCallSite(/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive?: RegExp | number | string, 
/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame?: boolean): string;
/** computes the fileName of a location in the call stack */
export declare function computeCallFile(/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive?: RegExp | number | string, 
/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame?: boolean): string;
/** get a stack trace of the current call stack*/
export declare function computeStackTrace(/**
    * regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
    0 = the method calling .genStackTrace() will be on top;
    */ startingFrameExclusive?: RegExp | number | string, 
/** max frames to return */ maxFrames?: number, 
/** changes the first ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
keepStartingFrame?: boolean): Array<string>;
/** @deprecated please use diagnostics.computeStackTrace() under most circumstances.
    *
    extract stack frames.   note that the first frame contains the message, so if you don't want that, pass the optional ```startingFrame``` parameter */
export declare function extractStackFrames(/** error or stack string */ error: exception.IError | string, /** @default undefined (all frames)*/ frames?: number, /** @default 0 */ startingFrame?: number): string[];
/** thrown on race-check failures */
export declare class RaceCheckException extends exception.XlibException {
}
/** DEBUG ONLY!  noops self if environment.logLevel is greater than DEBUG helper to check for algorithm race conditions (example: removing from a collection while enumerating) */
export declare class DebugRaceCheck {
    debugText: string;
    private _version;
    private _lockVersion;
    constructor(debugText?: string);
    enter(): void;
    exit(): void;
    /** quickly locks and unlocks */
    edit(): void;
    /** ensures that this raceCheck is not currently locked */
    poke(): void;
    toString(): string;
}
//# sourceMappingURL=diagnostics.d.ts.map