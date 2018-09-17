


//#region re-exports


//export import logging = require( "./diagnostics/logging" );

import { Logger } from "./_diagnostics/logging";
export const log = new Logger();
//export { Logger };


///** obtain a stack trace at the callsite */
//export import stacktrace = require("./diagnostics/stacktrace");




/** cross-platform implementation of the nodejs module: http://nodejs.org/api/assert.html */
export import assert = require( "assert" );
//#endregion

import exception = require( "./exception" );
import environment = require( "./environment" );
//import jsHelper = require("./runtime/jsHelper");

import * as stringHelper from "./stringhelper";
import * as _ from "lodash";


export function computeCallFile(	/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
	0 = the method calling .genStackTrace() will be on top;
	*/ startingFrameExclusive?: RegExp | number | string,
	/** changes the first ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
	keepStartingFrame = false, ) {
	if ( typeof ( startingFrameExclusive ) === "number" ) {
		//add 1 to ignore this location
		startingFrameExclusive += 1;
	}
	let frame = computeStackTrace( startingFrameExclusive, 1, keepStartingFrame )[ 0 ];
	let callFile = stringHelper.removeBefore( frame, "(", false, true );
	callFile = stringHelper.removeAfter( callFile, ")", false, false );
	//remove line and col numbers, make the assumption that the file.ext preceeds this.
	while ( callFile.lastIndexOf( "." ) < callFile.lastIndexOf( ":" ) ) {
		callFile = stringHelper.removeAfter( callFile, ":", false, true );
	}
	return callFile;

}
/** get a stack trace*/
export function computeStackTrace(/**
	* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
	0 = the method calling .genStackTrace() will be on top;
	*/ startingFrameExclusive?: RegExp | number | string,
	/** max frames to return */ maxFrames?: number,
	/** changes the first ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
	keepStartingFrame = false,
): string[] {

	let tempError = new Error();
	if ( tempError.stack == null ) {
		return [];
	}
	let splitStack = tempError.stack.split( "\n" );

	//remove first frame, which contains a message such as "Error" in Node v10.x
	const messageFrame = splitStack.shift();
	//remove next frame, which contains a trace of this genStackTrace method.
	const thisFrame = splitStack.shift();


	if ( startingFrameExclusive != null ) {
		let lastRemovedFrame: string;
		if ( typeof startingFrameExclusive === "string" ) {
			startingFrameExclusive = new RegExp( startingFrameExclusive );
		}
		if ( startingFrameExclusive instanceof RegExp ) {
			let shouldStop = false;
			while ( shouldStop === false ) {
				lastRemovedFrame = splitStack.shift();
				//only stop if our just removed frame matches and next frame doesn't
				shouldStop = ( ( startingFrameExclusive.test( lastRemovedFrame ) === true ) && ( startingFrameExclusive.test( splitStack[ 0 ] ) === false ) );
				if ( splitStack.length === 0 ) {
					shouldStop = true;
				}
			}
		} else if ( typeof ( startingFrameExclusive ) === "number" && startingFrameExclusive > 0 ) {
			for ( var i = 0; i < startingFrameExclusive; i++ ) {
				lastRemovedFrame = splitStack.shift();
			}
		}

		if ( keepStartingFrame === true && lastRemovedFrame != null ) {
			splitStack.unshift( lastRemovedFrame );
		}
	}
	if ( maxFrames != null && splitStack.length > maxFrames ) {
		splitStack.length = maxFrames;
	}
	return splitStack;
}

/** @deprecated please use diagnostics.computeStackTrace() under most circumstances. 
	* 
	extract stack frames.   note that the first frame contains the message, so if you don't want that, pass the optional ```startingFrame``` parameter */
export function extractStackFrames(/** error or stack string */ error: exception.IError | string,/** @default undefined (all frames)*/ frames?: number,/** @default 0 */ startingFrame?: number ) {
	let stack: string;
	let stackArray: string[];
	if ( typeof ( error ) === "string" ) {
		stack = error;
	} else {
		stack = error.stack;
	}
	if ( typeof ( stack as any ) === "string" ) {
		stackArray = stack.split( "\n" );
	} else if ( _.isArray( stack as any ) ) {
		stackArray = stack as any;
	} else {
		//unknown
		return [];
	}
	if ( startingFrame != null ) {
		for ( let i = 0; i < startingFrame; i++ ) {
			stackArray.shift();
		}
	}
	if ( frames != null && stackArray.length > frames ) {
		stackArray.length = frames;
	}

	return stackArray;
}





/** thrown on race-check failures */
export class RaceCheckException extends exception.XlibException { }

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
