export import logging = require("./diagnostics/logging");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/assert.html */
export import assert = require("assert");
import exception = require("./exception");
/** thrown on race-check failures */
export declare class RaceCheckException extends exception.CorelibException {
}
/** DEBUG ONLY!  noops self if environment.logLevel is greater than DEBUG helper to check for algorithm race conditions (example: removing from a collection while enumerating) */
export declare class DebugRaceCheck {
    debugText: string;
    private _version;
    private _lockVersion;
    constructor(debugText?: string);
    enter: () => void;
    exit: () => void;
    /** quickly locks and unlocks */
    edit: () => void;
    /** ensures that this raceCheck is not currently locked */
    poke: () => void;
    toString(): string;
}
