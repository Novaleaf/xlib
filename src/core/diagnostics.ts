


//#region re-exports


//export import logging = require( "./diagnostics/logging" );

import { Logger } from "./_diagnostics/logging";
export { Logger };


///** obtain a stack trace at the callsite */
//export import stacktrace = require("./diagnostics/stacktrace");




/** cross-platform implementation of the nodejs module: http://nodejs.org/api/assert.html */
export import assert = require( "assert" );
//#endregion

import exception = require( "./exception" );
import environment = require( "./environment" );
//import jsHelper = require("./runtime/jsHelper");

/** thrown on race-check failures */
export class RaceCheckException extends exception.CorelibException { }

/** DEBUG ONLY!  noops self if environment.logLevel is greater than DEBUG helper to check for algorithm race conditions (example: removing from a collection while enumerating) */
export class DebugRaceCheck {
	private _version = 0;
	private _lockVersion = 0;
	constructor( public debugText = "" ) { }

	public enter: () => void = environment._ifDebug( function () {
		if ( this._lockVersion !== 0 ) {
			//set lock version to -1 to cause the other thread caller to assert also
			this._lockVersion = -1;
			throw new RaceCheckException( "DebugRaceCheck.Enter() failed!  Something else has this locked!  Additional Info=" + String( this.debugText ) );
		}
		this._lockVersion = this._version;
		this._version++;
	} );

	public exit: () => void = environment._ifDebug( function () {
		if ( this._lockVersion !== this._version - 1 ) {
			if ( this._lockVersion === 0 ) {
				throw new RaceCheckException( "DebugRaceCheck.Exit() failed!  Already unlocked and we are calling unlock again!  Additional Info=" + String( this.debugText ) );
			} else {
				throw new RaceCheckException( "DebugRaceCheck.Exit() failed!  internal state is corrupted, moste likely from multithreading  Additional Info=" + String( this.debugText ) );
			}
			//cause the assert to keep occuring if this failed
			//return;
		}

		this._lockVersion = 0;
	} );

	/** quickly locks and unlocks */
	public edit: () => void = environment._ifDebug( function () {
		this.enter();
		this.exit();
	} );

	/** ensures that this raceCheck is not currently locked */
	public poke: () => void = environment._ifDebug( function () {
		this._version++;
		if ( this._lockVersion !== 0 ) {
			throw new RaceCheckException( "DebugRaceCheck.Exit() failed!internal state is corrupted, moste likely from multithreading  Additional Info=" + String( this.debugText ) );
		}
	} );

	public toString(): string {
		if ( environment.logLevel <= environment.LogLevel.DEBUG ) {
			var isEdit = this._lockVersion === 0 ? false : true;
			return "version=" + String( this._version ) + " isBeingEdited=" + String( isEdit );
		} else {
			return "DebugRaceCheck is DISABLED when baselib.environment.logLevel > EnvLevel.DEBUG.  use baselib.concurrency.Lock if you need something in production";
		}
	}
}
