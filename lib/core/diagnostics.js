//#region re-exports
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
var mockMocha = require("./diagnostics/mockmocha");
mockMocha._initialize();
exports.logging = require("./diagnostics/logging");
///** obtain a stack trace at the callsite */
//export import stacktrace = require("./diagnostics/stacktrace");
/** cross-platform implementation of the nodejs module: http://nodejs.org/api/assert.html */
exports.assert = require("assert");
//#endregion
var exception = require("./exception");
var environment = require("./environment");
//import jsHelper = require("./runtime/jsHelper");
/** thrown on race-check failures */
var RaceCheckException = (function (_super) {
    __extends(RaceCheckException, _super);
    function RaceCheckException() {
        _super.apply(this, arguments);
    }
    return RaceCheckException;
}(exception.CorelibException));
exports.RaceCheckException = RaceCheckException;
/** DEBUG ONLY!  noops self if environment.logLevel is greater than DEBUG helper to check for algorithm race conditions (example: removing from a collection while enumerating) */
var DebugRaceCheck = (function () {
    function DebugRaceCheck(debugText) {
        if (debugText === void 0) { debugText = ""; }
        this.debugText = debugText;
        this._version = 0;
        this._lockVersion = 0;
        this.enter = environment._ifDebug(function () {
            if (this._lockVersion !== 0) {
                //set lock version to -1 to cause the other thread caller to assert also
                this._lockVersion = -1;
                throw new RaceCheckException("DebugRaceCheck.Enter() failed!  Something else has this locked!  Additional Info=" + String(this.debugText));
            }
            this._lockVersion = this._version;
            this._version++;
        });
        this.exit = environment._ifDebug(function () {
            if (this._lockVersion !== this._version - 1) {
                if (this._lockVersion === 0) {
                    throw new RaceCheckException("DebugRaceCheck.Exit() failed!  Already unlocked and we are calling unlock again!  Additional Info=" + String(this.debugText));
                }
                else {
                    throw new RaceCheckException("DebugRaceCheck.Exit() failed!  internal state is corrupted, moste likely from multithreading  Additional Info=" + String(this.debugText));
                }
            }
            this._lockVersion = 0;
        });
        /** quickly locks and unlocks */
        this.edit = environment._ifDebug(function () {
            this.enter();
            this.exit();
        });
        /** ensures that this raceCheck is not currently locked */
        this.poke = environment._ifDebug(function () {
            this._version++;
            if (this._lockVersion !== 0) {
                throw new RaceCheckException("DebugRaceCheck.Exit() failed!internal state is corrupted, moste likely from multithreading  Additional Info=" + String(this.debugText));
            }
        });
    }
    DebugRaceCheck.prototype.toString = function () {
        if (environment.logLevel <= environment.LogLevel.DEBUG) {
            var isEdit = this._lockVersion === 0 ? false : true;
            return "version=" + String(this._version) + " isBeingEdited=" + String(isEdit);
        }
        else {
            return "DebugRaceCheck is DISABLED when baselib.environment.logLevel > EnvLevel.DEBUG.  use baselib.concurrency.Lock if you need something in production";
        }
    };
    return DebugRaceCheck;
}());
exports.DebugRaceCheck = DebugRaceCheck;
//# sourceMappingURL=diagnostics.js.map