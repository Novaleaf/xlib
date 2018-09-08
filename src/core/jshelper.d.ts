import _ = require("lodash");
/** low-level javascript helpers, to smooth over warts in the language */
/**
 * if value is null, returns the default value
 * @param value
 * @param defaultValue
 */
export declare function defaultIfNull<T, TDefault extends T>(value: T, defaultValue: TDefault): T;
/** invokes the native es6 Object.setPrototypeOf() if it exists.  if not, calls a pollyfill.  Note: pollyfill works on old Chrome/Firefox, NOT IE10 or below. */
export declare function setPrototypeOf<T>(obj: any, newPrototype: T): T;
/**
* Helper function for iterating over values in the array. If the func returns
* a false value, it will break out of the loop.
* call will return true if enumerated everything, or false if terminated enumeration early.
*/
export declare function forEachArray<T>(
/** if a collection (an object with a .length property), will enumerate indicies */
collection: T[], func: (
/** null values are not discarded (unlike most foreach methods do!) */
value: T
/** this is the index. */
, index: number, collection: T[]) => boolean | void, 
/** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
enumerateCopy?: boolean): boolean;
/**
* Helper function for iterating over values in the object. If the func returns
* a false value, it will break out of the loop.
*/
export declare function forEachArrayReverse<T>(
/** if a collection (an object with a .length property), will enumerate indicies */
collection: T[], func: (
/** null values are not discarded (unlike most foreach methods do!) */
value: T
/** this is the index. */
, index: number, collection: T[]) => boolean, 
/** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
enumerateCopy?: boolean): boolean;
export declare const forEachProperty: {
    <T>(object: T, iteratee?: _.ObjectIterator<T, any>): T;
    <T>(object: T, iteratee?: _.ObjectIterator<T, any>): T;
};
/** simple ratelimiter, executes at most N times per second.  rate limit is shared by all calls to this method, even for dissimilar functions.*/
export declare function rateLimit(perSecondLimit: any, fn: any): () => void;
/** call a constructor procedurally,
from http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply */
/** same as function.apply, but allows prepending arguments in front of an array of arguments */
export declare function apply<TReturn>(targetFcn: (...args: any[]) => TReturn, thisObj: any, argArray: any[], argsToPrepend?: any[], argsToPostpend?: any[]): TReturn;
/** if the targetFcn is null, silently ignore (no errors) */
export declare function applyOrNoop(targetFcn: Function, thisObj: any, argArray: any[], ...argsToPrepend: any[]): any;
/** make a copy of a function (doesn"t copy properties) */
export declare function clone(fn: Function, targetThis?: any): any;
/**
 * Simple function to mix in properties from source into target,
 * but only if target does not already have a property of the same name.
 * we overwrite 'undefined' but not 'null' values.
 */
export declare function mixin(
/** the object that will have it's members added/replaced by the source's members */
target: any, source: any, 
/** if true, overwrites existing properties in the target if they exist in the source*/
overwriteExisting?: boolean, 
/** if non-zero, walks through source child members, copying their members to new objects (copy-by-value).
expensive and usually not what you want (this can be very expensive for json objects).
if 0, will 'shallow copy' source members to target (copy-by-reference).   the value of this decreases by 1 each level
be careful with arrays: this will overwrite existing array-elements that exist in the target (does not append).
*/
deepCloneDepth?: number): void;
/** replace a branch of your JSON object.  good for pruning nested hiearchies, for example when wanting to decrease verbosity sent to user (before doing a JSON.stringify() ) */
export declare function replaceNodes(targetObject: any, 
/** example:  'a.b.c.d' will remove the d node, replacing it (with null by default, effectively deleting)*/
nodeHiearchyStrings: string[], replaceWith?: any, replaceEmptyLeafNodes?: boolean): void;
/** allows chaining callbacks (sequentially)
example usage:  object.callback = __.chainCallbacks(object.callback, myCallback, otherCallback, anotherAddedCallback);
*/
export declare function chainCallbacks(...callbacks: Function[]): (...args: any[]) => void;
/** create an instance of your class, and makes it callable
example:
//create instance of MyClass, passing args to the constructor
var myInstance = __.createCallableInstance(myMethod,MyClass,"ctorArg1",ctorArg2);
//invoke myMethod on instance of myClass
myInstance(myMethod1Arg);
*/
export declare function createCallableInstance(
/** method you want to be able to invoke
example: var myMethod = (arg1)=>{};*/
nakedCallableMethod: Function, 
/** name of the class you want to create an instance of
example:  class MyClass{} */
classType: any, ...args: any[]): any;
/** disallow enumeration of a property
return true if succesfull false otherwise (such as if platform doesn't support it)*/
export declare function disablePropertyEnumeration(obj: any, propertyName: string): boolean;
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
export declare function inherits(constructor: any, superConstructor: any): void;
//# sourceMappingURL=jshelper.d.ts.map