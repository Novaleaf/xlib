
import * as _ from "lodash";
import * as stringHelper from "./_util/stringhelper";

import * as environment from "./environment";

export * from "./_diagnostics/exception";
import * as exception from "./_diagnostics/exception";


import * as _logging from "./_diagnostics/logging";
export { _logging };

/** A high quality console logger.  shortcut to diagnostics._logging.log. */
export const log = new _logging.Logger();


/** computes the callSite (file+line+col) of a location in the call stack */
export function computeCallSite(	/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
	0 = the method calling .genStackTrace() will be on top;
	*/ startingFrameExclusive?: RegExp | number | string,
	/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
	keepStartingFrame = false, ): string {
	if ( typeof ( startingFrameExclusive ) === "number" ) {
		//add 1 to ignore this location
		startingFrameExclusive += 1;
	}
	let frame = computeStackTrace( startingFrameExclusive, 1, keepStartingFrame )[ 0 ];
	let callSite = stringHelper.removeBefore( frame, "(", false, true );
	callSite = stringHelper.removeAfter( callSite, ")", false, false );
	return callSite;

}

/** computes the fileName of a location in the call stack */
export function computeCallFile(	/* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
	0 = the method calling .genStackTrace() will be on top;
	*/ startingFrameExclusive?: RegExp | number | string,
	/**only used if ```startingFrameExclusive``` is a string or regexp.   changes ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
	keepStartingFrame = false, ) {

	if ( typeof ( startingFrameExclusive ) === "number" ) {
		//add 1 to ignore this location
		startingFrameExclusive += 1;
	}
	let callFile = computeCallSite( startingFrameExclusive, keepStartingFrame );
	//remove line and col numbers, make the assumption that the file.ext preceeds this.
	while ( callFile.lastIndexOf( "." ) < callFile.lastIndexOf( ":" ) ) {
		callFile = stringHelper.removeAfter( callFile, ":", false, true );
	}
	return callFile;

}
/** get a stack trace of the current call stack*/
export function computeStackTrace(/**
	* regexp choosing the frame you wish to start after.  or number of frames to remove from the front.
	0 = the method calling .genStackTrace() will be on top;
	*/ startingFrameExclusive?: RegExp | number | string,
	/** max frames to return */ maxFrames?: number,
	/** changes the first ```startingFrameExclusive``` to be inclusive, IE keep the frame you search for, instead of throwing it away and getting the next frame.  default false */
	keepStartingFrame = false,
): Array<string> {

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
			for ( let i = 0; i < startingFrameExclusive; i++ ) {
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
	let stackArray: Array<string>;
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

