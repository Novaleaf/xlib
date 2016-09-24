/** low-level javascript helpers, to smooth over warts in the language */
/**
 * if value is null, returns the default value
 * @param value
 * @param defaultValue
 */
export declare function defaultIfNull<T>(value: T, defaultValue: T): T;
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
