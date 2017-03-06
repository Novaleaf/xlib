"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as ex from "./exception";
const ex = require("./exception");
/** root class, includes the following functionality:
typeName, toString, dispose, assertIsAlive, hashCode */
class ClassBase {
    constructor() {
        this._debugIsBaseCtorCalled = false;
        this._isDisposed = false;
        this._debugIsBaseCtorCalled = true;
    }
    /** the name of the class this object is an instance of */
    getTypeName() {
        if (this._typeName == null) {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec(this.constructor.toString());
            this._typeName = (results && results.length > 1) ? results[1] : "";
        }
        return this._typeName;
    }
    /** default implementation: returns typeName.   override to add functionality */
    toString() {
        return this.getTypeName();
    }
    /** has this object been disposed (if so, do not use!) */
    getIsDisposed() { return this._isDisposed; }
    /** dispose this object if not already disposed.
returns:  true == we just disposed.   false==already disposed so we do nothing */
    tryDispose() {
        if (this._isDisposed) {
            return false;
        }
        this.dispose();
        return true;
    }
    /** dispose this object.   asserts if already disposed */
    dispose() {
        if (this._isDisposed) {
            throw new ex.CorelibException("already disposed.  class= " + this.getTypeName());
        }
        if (!this._isDisposed) {
            this._isDisposed = true;
            this._disposing();
        }
    }
    /* tslint:disable */
    /** override this method to add your disposal cleanup logic. */
    _disposing() {
    }
    /* tslint:enable */
    _assertIsAlive() {
        if (this._debugIsBaseCtorCalled !== true) {
            throw new ex.CorelibException("assertIsAlive failed.  you forgot to call the super() from your constructor class= " + this.getTypeName());
        }
        if (this.getIsDisposed() === true) {
            throw new ex.CorelibException("assertIsAlive failed.  already disposed.  class= " + this.getTypeName());
        }
    }
    /** returns a string uniquely identifying this object instance.
    override to provide your own hashing function */
    getHashCode() {
        if (this._hashCode == null) {
            this._hashCode = ClassBase._hashPrefix + ClassBase._hashId.toString(); //collections.hashHelper.createUniqueCodeInternal();
            ClassBase._hashId++;
        }
        return this._hashCode;
    }
}
ClassBase._hashPrefix = "ClassBase:" + Date.now().toString() + ":";
ClassBase._hashId = 0;
exports.ClassBase = ClassBase;
//# sourceMappingURL=classbase.js.map