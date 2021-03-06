// tslint:disable

import * as _ from "lodash";


import * as ex from "../core/exception";

/** low-level javascript helpers, to smooth over warts in the language */

// PROXY IS DEPRECATED.  use function.bind() instead.
///** wraps your function, so that the 'this' parameter (the scope) is preserved when being executed by an external caller.
// * for use by callbacks.
// * example: return __.proxy(this,function(){ return this.x; }); 
// * see: https://stackoverflow.com/questions/4986329/understanding-proxy-in-jquery */
//export function proxy<TMethod extends Function>(self: any, method: TMethod): TMethod {
//	var callback = function () {
//		return method.apply(self, arguments);
//	};
//	return <any>callback;
//}
//export function proxy2<T>(self: any, method: T): T {
//    var callback = function () {
//        return (<Function><any>method).apply(self, arguments);
//    };
//    return <any>callback;
//}

// /**
//  * if value is null, returns the default value
//  * @param value
//  * @param defaultValue
//  */
// export function defaultIfNull<T, TDefault extends T>( value: T, defaultValue: TDefault ): T {
// 	return value == null ? defaultValue : value;
// }


// /** invokes the native es6 Object.setPrototypeOf() if it exists.  if not, calls a pollyfill.  Note: pollyfill works on old Chrome/Firefox, NOT IE10 or below. */
// export function setPrototypeOf<T>( obj, newPrototype: T ): T {
// 	if ( ( Object as any ).setPrototypeOf != null ) {
// 		return ( Object as any ).setPrototypeOf( obj, newPrototype );
// 	} else {
// 		obj.__proto__ = newPrototype;
// 		return obj;
// 	}
// }

/**
* Helper function for iterating over values in the array. If the func returns
* a false value, it will break out of the loop.
* call will return true if enumerated everything, or false if terminated enumeration early.
*/
// export function forEachArray<T>
// 	(
// 	/** if a collection (an object with a .length property), will enumerate indicies */
// 	collection: T[]
// 	, func: (
// 		/** null values are not discarded (unlike most foreach methods do!) */
// 		value: T
// 	/** this is the index. */
// 		, index: number
// 		, collection: T[]
// 	) => boolean,
// 	/** if true, a copy of the collection is made and enumerated.
// this is useful if you wish to add/remove from the original collection while enumerating */
// 	enumerateCopy?: boolean
// 	): boolean;
// export function forEachArray<T>
// 	(
// 	/** if a collection (an object with a .length property), will enumerate indicies */
// 	collection: T[]
// 	, func: (
// 		/** null values are not discarded (unlike most foreach methods do!) */
// 		value: T
// 	/** this is the index. */
// 		, index: number
// 		, collection: T[]
// 	) => void,
// 	/** if true, a copy of the collection is made and enumerated.
// this is useful if you wish to add/remove from the original collection while enumerating */
// 	enumerateCopy?: boolean
// 	): void;
export function forEachArray<T>
	(
	/** if a collection (an object with a .length property), will enumerate indicies */
	collection: T[]
	, func: (
		/** null values are not discarded (unlike most foreach methods do!) */
		value: T
		/** this is the index. */
		, index: number
		, collection: T[]
	) => boolean | void,
	/** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
	enumerateCopy = false
	): boolean {
	if ( !collection ) { return; }
	if ( collection[ "length" ] == null ) {
		throw new ex.XlibException( "should have length property" );
	}

	if ( enumerateCopy ) {
		collection = collection.slice( 0 );
	}

	for ( var i = 0; i < collection.length; i++ ) {
		if ( func( collection[ i ], i, collection ) === false ) {
			//yielded
			return false;
		}
	}
	//not yielded
	return true;
}
/**
* Helper function for iterating over values in the object. If the func returns
* a false value, it will break out of the loop.
*/
export function forEachArrayReverse<T>
	(
	/** if a collection (an object with a .length property), will enumerate indicies */
	collection: T[]
	, func: (
		/** null values are not discarded (unlike most foreach methods do!) */
		value: T
		/** this is the index. */
		, index: number
		, collection: T[]
	) => boolean,
	/** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
	enumerateCopy = false
	): boolean {
	if ( !collection ) { return; }
	if ( !( length in collection ) ) {
		throw new ex.XlibException( "should have length property" );
	}

	if ( enumerateCopy ) {
		collection = collection.slice( 0 );
	}
	for ( var i = collection.length - 1; i >= 0; i-- ) {
		if ( func( collection[ i ], i, collection ) === false ) {
			//yielded
			return false;
		}
	}
	//not yielded
	return true;
}
// export function forEachProperty<T>(
// 	/** enumerate hasOwnProperties of this   */
// 	object
// 	, func: (
// 		/** null values are not discarded (unlike most foreach methods do!) */
// 		value: T
// 	/** the name of the property the value is assigned to */
// 		, key: string
// 		, collection
// 	) => void
// 	, recursive?: boolean): void;
export const forEachProperty = _.forOwn;
// export function forEachProperty<T>(
// 	/** enumerate hasOwnProperties of this   */
// 	object
// 	, func: (
// 		/** null values are not discarded (unlike most foreach methods do!) */
// 		value: T
// 		/** the name of the property the value is assigned to */
// 		, key: string
// 		, collection
// 	) => boolean | void
// 	, recursive = false ): boolean {
// 	if ( !object ) { return; }
// 	for ( var key in object ) {
// 		if ( object.hasOwnProperty( key ) ) {
// 			if ( func( object[ key ], key, object ) === false ) {
// 				//yielded
// 				return false;
// 			}
// 			if ( recursive === true && ( typeof ( object[ key ] ) === "object" ) ) {
// 				var result: boolean = <any>forEachProperty( object[ key ], func, recursive );

// 				if ( result === false ) {
// 					//if a recursive call returns TRUE, we abort all calls
// 					return false;
// 				}
// 			}
// 		}
// 	}
// 	//not yielded
// 	return true;
// }

// ///** creates and returns a rate-limited facade over the input function.    
// // * this lets you invoke the facade and the underlying function will execute at maximum once per rateLimit period.  
// // * any additional calls are enqueued and triggered in a FIFO order.
// // * You can abort remaining */
// //export function rateLimitFacade<T>(

// /** simple ratelimiter, executes at most N times per second.  rate limit is shared by all calls to this method, even for dissimilar functions.*/
// export function rateLimit( perSecondLimit, fn ) {
// 	var callsInLastSecond = 0;
// 	var queue = [];
// 	return function limited() {
// 		if ( callsInLastSecond >= perSecondLimit ) {
// 			queue.push( [ this, arguments ] );
// 			return;
// 		}

// 		callsInLastSecond++;
// 		setTimeout( function () {
// 			callsInLastSecond--;
// 			var parms;
// 			if ( parms = queue.shift() ) {
// 				limited.apply( parms[ 0 ], parms[ 1 ] );
// 			}
// 		}, 1010 );

// 		fn.apply( this, arguments );
// 	};
// }

/** call a constructor procedurally,
from http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply */
//function ctor(Constructor) {
//	var args = Array.prototype.slice.call(arguments, 1);
//	return function () {
//		var Temp = function () { }, // temporary constructor
//			inst, ret; // other vars

//		// Give the Temp constructor the Constructor"s prototype
//		Temp.prototype = Constructor.prototype;

//		// Create a new instance
//		inst = new Temp;

//		// Call the original Constructor with the temp
//		// instance as its context (i.e. its "this" value)
//		ret = Constructor.apply(inst, args);

//		// If an object has been returned then return it otherwise
//		// return the original instance.
//		// (consistent with behaviour of the new operator)
//		return Object(ret) === ret ? ret : inst;
//	}
//}




// /** same as function.apply, but allows prepending arguments in front of an array of arguments */
// //export function apply<TReturn>(targetFcn: (arg1: any, ...anyArgs: any[]) => TReturn, thisObj: any, argArray: any[], ...argsToPrepend: any[]): TReturn
// export function apply<TReturn>( targetFcn: ( ...args: any[] ) => TReturn, thisObj: any, argArray: any[], argsToPrepend: any[] = [], argsToPostpend: any[] = [] ): TReturn {
// 	//in case this is IArguments or something of the sort, make a new array
// 	if ( argArray.unshift == null ) {
// 		var tmp = [];
// 		for ( var i = 0; i < argArray.length; i++ ) {
// 			tmp.push( argArray[ i ] );
// 		}
// 		argArray = tmp;
// 	} else {
// 		//make a copy to not modify original args passed in
// 		argArray = argArray.slice();
// 	}
// 	argArray.unshift.apply( argArray, argsToPrepend );
// 	argArray = argArray.concat( argsToPostpend );

// 	//for (var i = argsToPrepend.length-1; i >= 0; i--)
// 	//{
// 	//	argArray.unshift(argsToPrepend[i]);
// 	//}

// 	return targetFcn.apply( thisObj, argArray );
// }
// /** if the targetFcn is null, silently ignore (no errors) */
// export function applyOrNoop( targetFcn: Function, thisObj: any, argArray: any[], ...argsToPrepend: any[] ): any {
// 	if ( targetFcn == null ) {
// 		return;
// 	}
// 	//in case this is IArguments or something of the sort, make a new array
// 	if ( argArray.unshift == null ) {
// 		var tmp = [];
// 		for ( var i = 0; i < argArray.length; i++ ) {
// 			tmp.push( argArray[ i ] );
// 		}
// 		argArray = tmp;
// 	} else {
// 		//make a copy to not modify original args passed in
// 		argArray = argArray.slice();
// 	}
// 	argArray.unshift.apply( argArray, argsToPrepend );

// 	//for (var i = argsToPrepend.length-1; i >= 0; i--)
// 	//{
// 	//	argArray.unshift(argsToPrepend[i]);
// 	//}

// 	return targetFcn.apply( thisObj, argArray );
// }

// /** make a copy of a function (doesn"t copy properties) */
// export function clone( fn: Function, targetThis: any = {} ) {
// 	// Workaround for commander.js issue.
// 	// http://stackoverflow.com/a/6772648
// 	return fn.bind( targetThis );
// }



/**
 * Simple function to mix in properties from source into target,
 * but only if target does not already have a property of the same name.
 * we overwrite 'undefined' but not 'null' values.
 */
export function mixin(
	/** the object that will have it's members added/replaced by the source's members */
	target, source,
	/** if true, overwrites existing properties in the target if they exist in the source*/
	overwriteExisting = false,
	/** if non-zero, walks through source child members, copying their members to new objects (copy-by-value).
	expensive and usually not what you want (this can be very expensive for json objects). 
	if 0, will 'shallow copy' source members to target (copy-by-reference).   the value of this decreases by 1 each level
	be careful with arrays: this will overwrite existing array-elements that exist in the target (does not append).
	*/
	deepCloneDepth = 0
) {
	if ( source ) {
		forEachProperty( source, function ( value, prop ): boolean {
			var type = typeof ( value );
			if ( overwriteExisting || !target.hasOwnProperty( prop ) || target[ prop ] === undefined ) {
				if ( deepCloneDepth !== 0 ) {
					switch ( type ) {
						case "string":
						case "number":
						case "boolean":
							target[ prop ] = value;
							break;
						case "function":
							//if (cloneFunctions) {										
							//	target[prop] = (<Function>value).bind(target);
							//}
							break;
						default:
							//if target doesn't exist, create it
							if ( !target[ prop ] ) {
								//create either an array or normal js object
								if ( source[ prop ] instanceof Array ) {
									target[ prop ] = [];
								} else {
									target[ prop ] = {};
								}
							}
							//recurse down
							mixin( target[ prop ], value, overwriteExisting, deepCloneDepth - 1 );
							break;
					}
				} else {
					target[ prop ] = value;
				}
			}
			return false;
		} );
	}
}


//export function mixin(
//	/** the object that will have it's members added/replaced by the source's members */
//	target, source,
//	/** if true, overwrites existing properties in the target if they exist in the source*/
//	overwriteExisting = false,
//	/** if true, walks through source child members, copying their members to new objects (copy-by-value).
//	expensive and usually not what you want (this can be very expensive for arrays). 
//	if false, will 'shallow copy' source members to target (copy-by-reference)*/
//	deepClone = false) {
//	if (source) {
//		forEachProperty(source, function (value, prop): boolean {
//			if (overwriteExisting || !target.hasOwnProperty(prop)) {
//				if (deepClone && typeof value !== "string") {
//					if (!target[prop]) {
//						target[prop] = {};
//					}
//					mixin(target[prop], value, overwriteExisting, deepClone);
//				} else {
//					target[prop] = value;
//				}
//			}
//			return false;
//		});
//	}
//	//return target;
//}







/** allows chaining callbacks (sequentially)
example usage:  object.callback = __.chainCallbacks(object.callback, myCallback, otherCallback, anotherAddedCallback);
*/
export function chainCallbacks( ...callbacks: Function[] ): ( ...args: any[] ) => void {
	return ( ...args: any[] ) => {
		for ( var i = 0; i < callbacks.length; i++ ) {
			if ( callbacks[ i ] != null ) {
				callbacks[ i ].apply( null, args );
			}
		}
	};
}

/** create an instance of your class, and makes it callable
example:
//create instance of MyClass, passing args to the constructor
var myInstance = __.createCallableInstance(myMethod,MyClass,"ctorArg1",ctorArg2);
//invoke myMethod on instance of myClass
myInstance(myMethod1Arg);
*/
export function createCallableInstance(
	/* tslint:disable */
	/** method you want to be able to invoke
	example: var myMethod = (arg1)=>{};*/
	nakedCallableMethod: Function,
	/** name of the class you want to create an instance of
	example:  class MyClass{} */
	classType: any, ...args: any[] ): any {
	//can add properties to naked functions, but not naked functions to objects
	var toReturn = <any>function ( ...args: any[] ) { return nakedCallableMethod.apply( toReturn, args ); };
	//copy properties from our prototype
	for ( var x in classType.prototype ) {
		if ( classType.prototype.hasOwnProperty( x ) ) {
			toReturn[ x ] = classType.prototype[ x ];
		}
	}
	toReturn.constructor = classType.prototype.constructor;
	//copy properties from our function
	for ( var x in nakedCallableMethod.prototype ) {
		if ( nakedCallableMethod.prototype.hasOwnProperty( x ) ) {
			toReturn[ x ] = classType.prototype[ x ];
		}
	}
	//invoke the prototype's constructor
	toReturn.constructor.apply( toReturn, args );
	//return our instance
	return toReturn;
	/* tslint:enable */
}

/** disallow enumeration of a property
return true if succesfull false otherwise (such as if platform doesn't support it)*/
export function disablePropertyEnumeration( obj: any, propertyName: string ): boolean {
	try {
		if ( Object.defineProperty != null ) {
			Object.defineProperty( obj, propertyName, { enumerable: false } );
			return true;
		} else {
			return false;
		}
	} catch ( ex ) {
		//could not set for some reason
		return false;
	}
}

import * as util from "util";

/** inherit the prototype methods from one constructor into another. The prototype of constructor will be set to a new object created from superConstructor.

As an additional convenience, superConstructor will be accessible through the constructor.super_ property.

var util = require("util");
var events = require("events");

function MyStream() {
	events.EventEmitter.call(this);
}

util.inherits(MyStream, events.EventEmitter);

MyStream.prototype.write = function(data) {
	this.emit("data", data);
}

var stream = new MyStream();

console.log(stream instanceof events.EventEmitter); // true
console.log(MyStream.super_ === events.EventEmitter); // true

stream.on("data", function(data) {
	console.log('Received data: "' + data + '"');
})
stream.write("It works!"); // Received data: "It works!" 
*/
export function inherits( constructor: any, superConstructor: any ) {
	util.inherits( constructor, superConstructor );
}
