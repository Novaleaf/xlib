"use strict";

import * as diagnostics from "../core/diagnostics";

/** root class, includes the following functionality:
typeName, toString, dispose, assertIsAlive, hashCode */
class ClassBase {
	private _debugIsBaseCtorCalled = false;
	private _typeName: string | undefined;
	constructor() {
		this._debugIsBaseCtorCalled = true;
	}


	/** the name of the class this object is an instance of */
	public getTypeName(): string {
		if ( this._typeName == null ) {
			var funcNameRegex = /function (.{1,})\(/;
			var results = ( funcNameRegex ).exec( ( <any>this ).constructor.toString() );
			this._typeName = ( results && results.length > 1 ) ? results[ 1 ] : "";
		}
		return this._typeName;
	}
	/** default implementation: returns typeName.   override to add functionality */
	public toString(): string {
		return this.getTypeName();
	}

	private _isDisposed = false;
	/** has this object been disposed (if so, do not use!) */
	public getIsDisposed(): boolean { return this._isDisposed; }
	/** dispose this object if not already disposed.
returns:  true == we just disposed.   false==already disposed so we do nothing */
	public tryDispose(): boolean {
		if ( this._isDisposed ) { return false; }
		this.dispose();
		return true;
	}
	/** dispose this object.   asserts if already disposed */
	public dispose() {
		if ( this._isDisposed ) {
			throw new diagnostics.XlibException( "already disposed.  class= " + this.getTypeName() );
		}
		if ( !this._isDisposed ) {
			this._isDisposed = true;
			this._disposing();
		}
	}
	/* tslint:disable */
	/** override this method to add your disposal cleanup logic. */
	protected _disposing() {
	}
	/* tslint:enable */

	public _assertIsAlive() {
		if ( this._debugIsBaseCtorCalled !== true ) {
			throw new diagnostics.XlibException( "assertIsAlive failed.  you forgot to call the super() from your constructor class= " + this.getTypeName() );
		}
		if ( this.getIsDisposed() === true ) {
			throw new diagnostics.XlibException( "assertIsAlive failed.  already disposed.  class= " + this.getTypeName() );
		}
	}

	private static _hashPrefix: string = "ClassBase:" + Date.now().toString() + ":";
	private static _hashId: number = 0;
	private _hashCode: string;
	/** returns a string uniquely identifying this object instance.
	override to provide your own hashing function */
	public getHashCode(): string {
		if ( this._hashCode == null ) {
			this._hashCode = ClassBase._hashPrefix + ClassBase._hashId.toString(); //collections.hashHelper.createUniqueCodeInternal();
			ClassBase._hashId++;
		}
		return this._hashCode;
	}
}

export = ClassBase;
