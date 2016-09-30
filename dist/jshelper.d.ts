import * as _ from "lodash";
export { _ };
/** low-level javascript helpers, to smooth over warts in the language */
/**
 * if value is null, returns the default value
 * @param value
 * @param defaultValue
 */
export declare function defaultIfNull<T>(value: T, defaultValue: T): T;
/**
* Helper function for iterating over values in the array. If the func returns
* a false value, it will break out of the loop.
* call will return true if enumerated everything, or false if terminated enumeration early.
*/
export declare function forEachArray<T>(
    /** if a collection (an object with a .length property), will enumerate indicies */
    collection: T[], func: (
    /** null values are not discarded (unlike most foreach methods do!) */
    value: T, index: number, collection: T[]) => boolean, 
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    enumerateCopy?: boolean): boolean;
export declare function forEachArray<T>(
    /** if a collection (an object with a .length property), will enumerate indicies */
    collection: T[], func: (
    /** null values are not discarded (unlike most foreach methods do!) */
    value: T, index: number, collection: T[]) => void, 
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    enumerateCopy?: boolean): void;
/**
* Helper function for iterating over values in the object. If the func returns
* a false value, it will break out of the loop.
*/
export declare function forEachArrayReverse<T>(
    /** if a collection (an object with a .length property), will enumerate indicies */
    collection: T[], func: (
    /** null values are not discarded (unlike most foreach methods do!) */
    value: T, index: number, collection: T[]) => boolean, 
    /** if true, a copy of the collection is made and enumerated.
this is useful if you wish to add/remove from the original collection while enumerating */
    enumerateCopy?: boolean): boolean;
export declare function forEachProperty<T>(
    /** enumerate hasOwnProperties of this   */
    object: any, func: (
    /** null values are not discarded (unlike most foreach methods do!) */
    value: T, key: string, collection: any) => void, recursive?: boolean): void;
/** same as function.apply, but allows prepending arguments in front of an array of arguments */
export declare function apply<TReturn>(targetFcn: (...args: any[]) => TReturn, thisObj: any, argArray: any[], argsToPrepend?: any[], argsToPostpend?: any[]): TReturn;
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
