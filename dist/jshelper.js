"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//export import _ = require("lodash");
var _ = require("lodash");
exports._ = _;
//import * as ex from "./exception";
//import * as lodash from "lodash";
//import * as exception from "./exception";
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
/**
 * if value is null, returns the default value
 * @param value
 * @param defaultValue
 */
function defaultIfNull(value, defaultValue) {
    return value == null ? defaultValue : value;
}
exports.defaultIfNull = defaultIfNull;
/** if an unhandled exception is thrown when evaluating the "action" function, the defaultValue will be used" */
function defaultIfThrow(action, defaultValue) {
    try {
        return action();
    }
    catch (ex) {
        return defaultValue;
    }
}
exports.defaultIfThrow = defaultIfThrow;
function forEachArray(
    /** if a collection (an object with a .length property), will enumerate indicies */
    collection, func, 
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    enumerateCopy) {
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    if (enumerateCopy === void 0) { enumerateCopy = false; }
    if (collection == null) {
        throw new Error("input collection is null/undefined");
    }
    if (collection["length"] == null) {
        throw new Error("should have length property");
    }
    if (enumerateCopy) {
        collection = collection.slice(0);
    }
    for (var i = 0; i < collection.length; i++) {
        if (func(collection[i], i, collection) === false) {
            //yielded
            return false;
        }
    }
    //not yielded
    return true;
}
exports.forEachArray = forEachArray;
/**
* Helper function for iterating over values in the object. If the func returns
* a false value, it will break out of the loop.
*/
function forEachArrayReverse(
    /** if a collection (an object with a .length property), will enumerate indicies */
    collection, func, 
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    enumerateCopy) {
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    if (enumerateCopy === void 0) { enumerateCopy = false; }
    if (collection == null) {
        throw new Error("input collection is null/undefined");
    }
    if (!(length in collection)) {
        throw new Error("should have length property");
    }
    if (enumerateCopy) {
        collection = collection.slice(0);
    }
    for (var i = collection.length - 1; i >= 0; i--) {
        if (func(collection[i], i, collection) === false) {
            //yielded
            return false;
        }
    }
    //not yielded
    return true;
}
exports.forEachArrayReverse = forEachArrayReverse;
function forEachProperty(
    /** enumerate hasOwnProperties of this   */
    object, func, recursive) {
    if (recursive === void 0) { recursive = false; }
    if (object == null) {
        throw new Error("input object is null/undefined");
    }
    for (var key in object) {
        if (object.hasOwnProperty != null && object.hasOwnProperty(key)) {
            if (func(object[key], key, object) === false) {
                //yielded
                return false;
            }
            if (recursive === true && (typeof (object[key]) === "object")) {
                var result = forEachProperty(object[key], func, recursive);
                if (result === false) {
                    //if a recursive call returns TRUE, we abort all calls
                    return false;
                }
            }
        }
    }
    //not yielded
    return true;
}
exports.forEachProperty = forEachProperty;
///////** creates and returns a rate-limited facade over the input function.    
////// * this lets you invoke the facade and the underlying function will execute at maximum once per rateLimit period.  
////// * any additional calls are enqueued and triggered in a FIFO order.
////// * You can abort remaining */
//////export function rateLimitFacade<T>(
/////** simple ratelimiter, executes at most N times per second.  rate limit is shared by all calls to this method, even for dissimilar functions.*/
////export function rateLimit(perSecondLimit:number, fn:Function) {
////    var callsInLastSecond = 0;
////    var queue:any[] = [];
////    return function limited() {
////        if (callsInLastSecond >= perSecondLimit) {
////            queue.push([this, arguments]);
////            return;
////        }
////        callsInLastSecond++;
////        setTimeout(function () {
////            callsInLastSecond--;
////            var parms: any;
////            if (parms = queue.shift()) {
////                limited.apply(parms[0], parms[1]);
////            }
////        }, 1010);
////        fn.apply(this, arguments);
////    };
////}
///** call a constructor procedurally,
//from http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply */
////function ctor(Constructor) {
////	var args = Array.prototype.slice.call(arguments, 1);
////	return function () {
////		var Temp = function () { }, // temporary constructor
////			inst, ret; // other vars
////		// Give the Temp constructor the Constructor"s prototype
////		Temp.prototype = Constructor.prototype;
////		// Create a new instance
////		inst = new Temp;
////		// Call the original Constructor with the temp
////		// instance as its context (i.e. its "this" value)
////		ret = Constructor.apply(inst, args);
////		// If an object has been returned then return it otherwise
////		// return the original instance.
////		// (consistent with behaviour of the new operator)
////		return Object(ret) === ret ? ret : inst;
////	}
////}
/** same as function.apply, but allows prepending arguments in front of an array of arguments */
//export function apply<TReturn>(targetFcn: (arg1: any, ...anyArgs: any[]) => TReturn, thisObj: any, argArray: any[], ...argsToPrepend: any[]): TReturn
function apply(targetFcn, thisObj, argArray, argsToPrepend, argsToPostpend) {
    if (argsToPrepend === void 0) { argsToPrepend = []; }
    if (argsToPostpend === void 0) { argsToPostpend = []; }
    //in case this is IArguments or something of the sort, make a new array
    if (argArray.unshift == null) {
        var tmp = [];
        for (var i = 0; i < argArray.length; i++) {
            tmp.push(argArray[i]);
        }
        argArray = tmp;
    }
    else {
        //make a copy to not modify original args passed in
        argArray = argArray.slice();
    }
    argArray.unshift.apply(argArray, argsToPrepend);
    argArray = argArray.concat(argsToPostpend);
    //for (var i = argsToPrepend.length-1; i >= 0; i--)
    //{
    //	argArray.unshift(argsToPrepend[i]);
    //}
    return targetFcn.apply(thisObj, argArray);
}
exports.apply = apply;
///** if the targetFcn is null, silently ignore (no errors) */
//export function applyOrNoop(targetFcn: Function, thisObj: any, argArray: any[], ...argsToPrepend: any[]): any {
//	if (targetFcn == null) {
//		return;
//	}
//	//in case this is IArguments or something of the sort, make a new array
//	if (argArray.unshift == null) {
//		var tmp:any[] = [];
//		for (var i = 0; i < argArray.length; i++) {
//			tmp.push(argArray[i]);
//		}
//		argArray = tmp;
//	} else {
//		//make a copy to not modify original args passed in
//		argArray = argArray.slice();
//	}
//	argArray.unshift.apply(argArray, argsToPrepend);
//	//for (var i = argsToPrepend.length-1; i >= 0; i--)
//	//{
//	//	argArray.unshift(argsToPrepend[i]);
//	//}
//	return targetFcn.apply(thisObj, argArray);
//}
///** make a copy of a function (doesn"t copy properties) */
//export function clone(fn: Function, targetThis: any = {}) {
//	// Workaround for commander.js issue.
//	// http://stackoverflow.com/a/6772648
//	return fn.bind(targetThis);    
//}
///**
// * Simple function to mix in properties from source into target,
// * but only if target does not already have a property of the same name.
// * we overwrite 'undefined' but not 'null' values.
// */
//export function mixin(
//	/** the object that will have it's members added/replaced by the source's members */
//	target: any, source: any,
//	/** if true, overwrites existing properties in the target if they exist in the source*/
//	overwriteExisting = false,
//	/** if non-zero, walks through source child members, copying their members to new objects (copy-by-value).
//	expensive and usually not what you want (this can be very expensive for json objects). 
//	if 0, will 'shallow copy' source members to target (copy-by-reference).   the value of this decreases by 1 each level
//	be careful with arrays: this will overwrite existing array-elements that exist in the target (does not append).
//	*/
//	deepCloneDepth = 0
//) {
//	if (source) {
//		forEachProperty(source, function (value, prop): boolean {
//			var type = typeof (value);
//			if (overwriteExisting || !target.hasOwnProperty(prop) || target[prop] === undefined) {
//				if (deepCloneDepth !== 0) {
//					switch (type) {
//						case "string":
//						case "number":
//						case "boolean":
//							target[prop] = value;
//							break;
//						case "function":
//							//if (cloneFunctions) {										
//							//	target[prop] = (<Function>value).bind(target);
//							//}
//							break;
//						default:
//							//if target doesn't exist, create it
//							if (!target[prop]) {
//								//create either an array or normal js object
//								if (source[prop] instanceof Array) {
//									target[prop] = [];
//								} else {
//									target[prop] = {};
//								}
//							}
//							//recurse down
//							mixin(target[prop], value, overwriteExisting, deepCloneDepth - 1);
//							break;
//					}
//				} else {
//					target[prop] = value;
//				}
//			}
//			return false;
//		});
//	}
//}
////export function mixin(
////	/** the object that will have it's members added/replaced by the source's members */
////	target, source,
////	/** if true, overwrites existing properties in the target if they exist in the source*/
////	overwriteExisting = false,
////	/** if true, walks through source child members, copying their members to new objects (copy-by-value).
////	expensive and usually not what you want (this can be very expensive for arrays). 
////	if false, will 'shallow copy' source members to target (copy-by-reference)*/
////	deepClone = false) {
////	if (source) {
////		forEachProperty(source, function (value, prop): boolean {
////			if (overwriteExisting || !target.hasOwnProperty(prop)) {
////				if (deepClone && typeof value !== "string") {
////					if (!target[prop]) {
////						target[prop] = {};
////					}
////					mixin(target[prop], value, overwriteExisting, deepClone);
////				} else {
////					target[prop] = value;
////				}
////			}
////			return false;
////		});
////	}
////	//return target;
////}
/** replace a branch of your JSON object.  good for pruning nested hiearchies, for example when wanting to decrease verbosity sent to user (before doing a JSON.stringify() ) */
function replaceNodes(targetObject, 
    /** example:  'a.b.c.d' will remove the d node, replacing it (with null by default, effectively deleting)*/
    nodeHiearchyStrings, replaceWith, replaceEmptyLeafNodes) {
    if (replaceWith === void 0) { replaceWith = null; }
    if (replaceEmptyLeafNodes === void 0) { replaceEmptyLeafNodes = false; }
    /** recursive helper for walking through the current hiearchy, replacing as it goes*/
    function currentNodeProcessor(previousNode, nodeName, hiearchyIndex, hiearchy) {
        if (previousNode == null || _.isString(previousNode)) {
            //if our previous node is null (or a string), nothing to do.
            return;
        }
        if (hiearchyIndex === (hiearchy.length - 1)) {
            //the node is the last node in our hiearchy, 
            //so we are on the node to remove.remove it and we are done
            if (previousNode[nodeName] != null || replaceEmptyLeafNodes === true) {
                previousNode[nodeName] = replaceWith;
            }
            return;
        }
        //walk down the hiearchy
        var thisNode = previousNode[nodeName];
        var nextHiearchyIndex = hiearchyIndex + 1;
        var nextNodeName = hiearchy[nextHiearchyIndex];
        if (_.isArray(thisNode) === true && _.isString(thisNode) === false) {
            //walk each element in the array automatically
            _.forEach(thisNode, function (element) {
                currentNodeProcessor(element, nextNodeName, nextHiearchyIndex, hiearchy);
            });
            return;
        }
        else {
            currentNodeProcessor(thisNode, nextNodeName, nextHiearchyIndex, hiearchy);
        }
    }
    //loop through all nodeHiearchyStrings to remove, removing the leaf.
    _.forEach(nodeHiearchyStrings, function (hiearchyString) {
        var hiearchy = hiearchyString.split(".");
        if (hiearchy.length < 1) {
            return;
        }
        currentNodeProcessor(targetObject, hiearchy[0], 0, hiearchy);
    });
}
exports.replaceNodes = replaceNodes;
/** allows chaining callbacks (sequentially)
example usage:  object.callback = __.chainCallbacks(object.callback, myCallback, otherCallback, anotherAddedCallback);
*/
function chainCallbacks() {
    var callbacks = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        callbacks[_i] = arguments[_i];
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i] != null) {
                callbacks[i].apply(null, args);
            }
        }
    };
}
exports.chainCallbacks = chainCallbacks;
/** create an instance of your class, and makes it callable
example:
//create instance of MyClass, passing args to the constructor
var myInstance = __.createCallableInstance(myMethod,MyClass,"ctorArg1",ctorArg2);
//invoke myMethod on instance of myClass
myInstance(myMethod1Arg);
*/
function createCallableInstance(
    /* tslint:disable */
    /** method you want to be able to invoke
    example: var myMethod = (arg1)=>{};*/
    nakedCallableMethod, 
    /** name of the class you want to create an instance of
    example:  class MyClass{} */
    classType) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    //can add properties to naked functions, but not naked functions to objects
    var toReturn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return nakedCallableMethod.apply(toReturn, args);
    };
    //copy properties from our prototype
    for (var x in classType.prototype) {
        if (classType.prototype.hasOwnProperty(x)) {
            toReturn[x] = classType.prototype[x];
        }
    }
    toReturn.constructor = classType.prototype.constructor;
    //copy properties from our function
    for (var x in nakedCallableMethod.prototype) {
        if (nakedCallableMethod.prototype.hasOwnProperty(x)) {
            toReturn[x] = classType.prototype[x];
        }
    }
    //invoke the prototype's constructor
    toReturn.constructor.apply(toReturn, args);
    //return our instance
    return toReturn;
    /* tslint:enable */
}
exports.createCallableInstance = createCallableInstance;
/** disallow enumeration of a property
return true if succesfull false otherwise (such as if platform doesn't support it)*/
function disablePropertyEnumeration(obj, propertyName) {
    try {
        if (Object.defineProperty != null) {
            Object.defineProperty(obj, propertyName, { enumerable: false });
            return true;
        }
        else {
            return false;
        }
    }
    catch (ex) {
        //could not set for some reason
        return false;
    }
}
exports.disablePropertyEnumeration = disablePropertyEnumeration;
//# sourceMappingURL=jshelper.js.map