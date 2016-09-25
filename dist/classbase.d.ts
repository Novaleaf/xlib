/** root class, includes the following functionality:
typeName, toString, dispose, assertIsAlive, hashCode */
declare class ClassBase {
    private _debugIsBaseCtorCalled;
    private _typeName;
    constructor();
    /** the name of the class this object is an instance of */
    getTypeName(): string;
    /** default implementation: returns typeName.   override to add functionality */
    toString(): string;
    private _isDisposed;
    /** has this object been disposed (if so, do not use!) */
    getIsDisposed(): boolean;
    /** dispose this object if not already disposed.
returns:  true == we just disposed.   false==already disposed so we do nothing */
    tryDispose(): boolean;
    /** dispose this object.   asserts if already disposed */
    dispose(): void;
    /** override this method to add your disposal cleanup logic. */
    protected _disposing(): void;
    _assertIsAlive(): void;
    private static _hashPrefix;
    private static _hashId;
    private _hashCode;
    /** returns a string uniquely identifying this object instance.
    override to provide your own hashing function */
    getHashCode(): string;
}
export = ClassBase;
