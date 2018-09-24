"use strict";
import stringHelper = require( "./_util/stringhelper" );
import numHelper = require( "./_util/numhelper" );
import ex = require( "./_diagnostics/exception" );
import _ = require( "lodash" );
import serialization = require( "./serialization" );
import reflection = require( "./reflection" );


/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
export import validator = require( "validator" );

export import sanitizeHtml = require( "sanitize-html" );

import diagnostics = require( "./diagnostics" )

import { URL } from "url";

const log = diagnostics.log; // var log = new diagnostics.Logger( __filename );

export class UrlValidator {

	public isValid = true;
	public errorMessage: string;

	public url: URL;

	constructor(
		input: string | URL,
		public options?: {
			/** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
			allowLocalhost?: boolean,
			/** default false to avoid reading the local file system */
			allowFileProtocol?: boolean,
			/** default false to avoid obsolete protocol */
			allowGopherProtocol?: boolean,
			/** default false to mitigate network scans.  setting to true allows local subnet ip's. */
			allowPrivateIp?: boolean,
			/** default false, allow domain name using non-printable ascii characters */
			allowUnicodeDomain?: boolean,
		}
	) {
		this.options = {
			//option defaults
			allowFileProtocol: false,
			allowLocalhost: false,
			allowPrivateIp: false,
			//merge in user defined options
			...options
		};

		try {
			if ( input instanceof URL ) {
				this.url = new URL( input.toString() );
			} else if ( typeof ( input ) === "string" ) {
				let inputString = input.trim();
				this.url = new URL( inputString );
			} else {
				throw new Error( "input is not string or URL" );
			}

			//check hostname
			const hostname = this.url.hostname.toLowerCase();
			if ( hostname.length === 0 ) {
				throw new Error( `invalid hostname blank: "${ hostname }"` );
			}
			if ( options.allowUnicodeDomain === true ) {
				//ok
			} else if ( isAscii( hostname ) !== true ) {
				throw new Error( `invalid hostname characters of "${ hostname }"` );
			}
			if ( options.allowLocalhost === true ) {
				//ok
			} else if ( hostname === "localhost" || hostname === "127.0.0.1" ) {
				throw new Error( `invalid hostname of "${ hostname }"` );
			}
			if ( options.allowPrivateIp === true ) {
				//ok
			} else {
				if ( isPrivateIp( hostname ) === true ) {
					if ( options.allowLocalhost === true && hostname === "127.0.0.1" ) {
						//ok, we allow localhost
					} else {
						throw new Error( `invalid hostname ip of "${ hostname }"` );
					}
				}
			}


			//check protocol
			const protocol = this.url.protocol
			switch ( protocol ) {
				case "gopher:":
					if ( options.allowGopherProtocol === true ) {
						break;
					} else {
						throw new Error( `invalid protocol of "${ protocol }"` );
					}
				case "file:":
					if ( options.allowFileProtocol === true ) {
						break;
					} else {
						throw new Error( `invalid protocol of "${ protocol }"` );
					}
				case "http:":
				case "https:":
				case "ftp:":
				case "ws:":
				case "wss:":
					//ok;
					break;
				default:
					throw new Error( `invalid protocol of "${ protocol }"` );
			}
		} catch ( ex ) {
			this.isValid = false;
			if ( ex instanceof Error ) {
				this.errorMessage = ex.message;
			} else {
				this.errorMessage = "unknown error:" + ex;
			}
		}
	}


}


/** from  https://stackoverflow.com/questions/8113546/how-to-determine-whether-an-ip-address-in-private*/
export function isPrivateIp( ipV4Address: string ) {
	const ipParts = ipV4Address.trim().split( "." ).map( ( str ) => numHelper.parseInt( str ) );
	if ( ipParts.length !== 4 ) {
		return false;
	}
	if (
		( ipParts[ 0 ] === 10 ) // single class A network
		|| ( ipParts[ 0 ] === 172 && ipParts[ 1 ] >= 16 && ipParts[ 1 ] <= 31 ) // 16 contiguous class B network
		|| ( ipParts[ 0 ] === 192 && ipParts[ 1 ] === 168 ) // 256 contiguous class C network
		|| ( ipParts[ 0 ] === 169 && ipParts[ 1 ] === 254 ) // Link-local address also referred to as Automatic Private IP Addressing
		|| ( ipParts[ 0 ] === 127 ) // localhost
	) {
		return true;
	}
}
/** verify that a string only contains ascii characters (no unicode) */
function isAscii(
	toCheck: string,
	/** default is "printable" */
	charSet: "standard" | "extended" | "printable" = "printable" ) {
	if ( typeof ( toCheck as any ) !== "string" ) {
		return false;
	}
	if ( toCheck.length === 0 ) {
		return true;
	}
	//test regex from https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
	switch ( charSet ) {
		case "printable":
			return /^[\x20-\x7F]*$/.test( toCheck );
		case "extended":
			return /^[\x00-\xFF]*$/.test( toCheck );
		case "standard":
			return /^[\x00-\x7F]*$/.test( toCheck );
		default:
			throw new Error( "invalid charSet option to validation.isAscii()" );
	}
}




/** @deprecated needs refactoring */
class ScrubFailureException extends ex.XlibException {

}


/** @deprecated needs refactoring */
export class Scrub<T>{

	public isValid = true;
	public valid: {};
	public invalid = {}
	public errorMessages: string[] = [];

	constructor( inputs: {}, clone = false, deepClone = false, /** fail message if the inputs are not an object */ errorMessage = "Scrub.ctor(inputs) invalid Arguments. 'inputs' must be an 'object'. Instead it was of type '" + typeof ( inputs ) + "'. ", printInvalidValues = true ) {

		if ( clone === true ) {
			if ( deepClone === true ) {
				inputs = _.cloneDeep( inputs );
			} else {
				inputs = _.clone( inputs );
			}
		} else {
			inputs = inputs;
		}
		if ( inputs == null || Object.keys( inputs ).length === 0 ) {
			this.isValid = false;
			this.valid = {};
			this._appendErrorMessage( "No inputs provided", false );
		} else {
			var inputsType = typeof ( inputs );
			if ( inputsType !== "object" ) {
				this.invalid[ "input" ] = inputs as any;
				this.isValid = false;
				this.valid = {};
				if ( errorMessage != null ) {
					this._appendErrorMessage( errorMessage, printInvalidValues, { input: inputs } );
				}
			} else {
				this.valid = inputs;
			}
		}
		//log.debug("Scrub Inputs", this.valid);
	}



	/** if this.invalid contains anything, will set .isValid=false*/
	private _maintainValidState() {
		this.isValid = true;
		_.forEach( this.invalid, ( value ) => {
			this.isValid = false;
			return false;
		} );
	}

	/** reject a value, and adds to errorMessages list if your errorMessage is supplied*/
	private _reject( key: string, errorMessage?: string, printInvalidValues = false, invalidValues = {} ) {
		this.isValid = false;
		this.invalid[ key ] = this.valid[ key ];
		delete this.valid[ key ];

		if ( errorMessage != null ) {
			this._appendErrorMessage( errorMessage, printInvalidValues, invalidValues );
		}

	}
	/** make sure you invoke _maintainValidState() when done with all your accepts*/
	private _accept( key: string, value: T ) {
		delete this.invalid[ key ];
		this.valid[ key ] = value;
	}

	/** constructs an errorMessage with values, pushes it onto our errorMessages array, then returns the constructed value.*/
	private _appendErrorMessage( errorMessage: string, printInvalidValues: boolean, invalidValues?: {} ): string {

		if ( printInvalidValues ) {
			errorMessage += `${ Object.keys( invalidValues ).length } invalid/missing values. The following required keys+types were invalid: ${ serialization.jsonX.inspectStringify( invalidValues ) }`;
		}
		this.errorMessages.push( errorMessage );
		return errorMessage;
	}


	/** allows you to fix up failed validations. */
	public fix(/** returning a non-undefined value will result in fixing the key.  returning null is not undefined! */func: ( value: T, key: string, self: Scrub<T> ) => T ) {
		if ( this.isValid === true ) {
			return;
		}
		var didAFix: boolean = false as boolean;
		_.forEach( this.invalid, ( value, key ) => {
			var fixedValue = func( value as any, key, this );
			if ( fixedValue !== undefined ) {
				this._accept( key, fixedValue );
				didAFix = true;
			}
		} );
		//fixup state after modifications
		if ( didAFix === true ) {
			this._maintainValidState();
		}
	}

	/** loop through all this.valid values, return false to fail validation. this will move the key/value to this.invalid */
	public forEach( action: ( value: any, key: string ) => boolean | void ) {
		_.forEach( this.valid, ( value, key ) => {
			try {
				var result = action( value, key );
				if ( result === false ) {
					this._reject( key );
				}
			} catch ( ex ) {
				this._reject( key, ex.toString() );
			}
		} );
	}


	/** if invalid, will assert*/
	public failAssert(
		/** if null, the default validation.logger will be used */
		logger = log,
		/** if null, a generic failure string will be generated, outputting all messages found in this.errorMessages */
		format?: string, ...params: any[] ) {
		if ( this.isValid === true ) {
			return;
		}
		if ( format == null ) {
			format = `Validation failed due to ${ this.errorMessages.length } reasons: ${ serialization.jsonX.inspectStringify( this.errorMessages ) }`;
		}
		if ( logger == null ) {
			logger = log;
		}
		logger.assert( false, format, ...params );
		//jsHelper.apply( logger.assert, logger, params, [ false, format ] );
	}
	/** perform an action when a scrub failure is detected.  if isValid, nothing will be triggered.   */
	public failAction<TActionReturn>( action?: () => TActionReturn ): TActionReturn {
		if ( this.isValid ) {
			return;
		}
		return action();
	}

	/** if a scrub failure is detected, will throw an exception. */
	public failThrow( exceptionMessage = `Validation failed due to ${ this.errorMessages.length } reasons: ${ serialization.jsonX.inspectStringify( this.errorMessages ) }` ) {
		if ( this.isValid ) {
			return;
		}
		throw new ScrubFailureException( exceptionMessage );
	}


	private _enumerationHelper( errorMessage: string, printInvalidValues: boolean,		/** enumeration worker.  return TRUE if the value fails validation.  false otherwise */		isRejectedFunc: ( value: T, key: string ) => boolean ): void {

		var invalidValues: _.Dictionary<T> = {};
		_.forEach( this.valid, ( value, key ) => {
			let isRejected = false;
			try {
				isRejected = isRejectedFunc( value as any, key );
			} catch ( ex ) {
				isRejected = true;
				errorMessage = "Exception threw when validating: " + errorMessage;
			}
			if ( isRejected === true ) {
				this._reject( key );
				invalidValues[ key ] = value as any;
			}

		} );
		if ( Object.keys( invalidValues ).length > 0 ) {
			this._appendErrorMessage( errorMessage, printInvalidValues, invalidValues );
		}
	}

	//public isReal(errorMessage = "Inputs must be string (not null or empty) or number (not NaN).", printInvalidValues = true): Scrub<T> {
	//	var invalidValues: any[] = [];
	//	jsHelper.forEach(<any>this.inputs,(value, index) => {
	//		var isRejected = false;
	//		if (value == null) { isRejected = true; }
	//		if (typeof value === "string" && stringHelper.isNullOrEmpty(value) === true) { isRejected = true; }
	//		if (typeof value === "number" && numHelper.isReal(value) === false) { isRejected = true; }
	//		if (isRejected) {
	//			this._reject(index);
	//			invalidValues.push(value);
	//		}
	//	});
	//	if (invalidValues.length > 0) {
	//		this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
	//	}
	//	return this;
	//}

	/**
	 * allows custom / flexible validation of all values.
	 * @param validationFunction
	 * @param errorMessage
	 * @param printInvalidValues
	 */
	public is(/** return true if valid */validationFunction: ( value: T, key: string ) => boolean, errorMessage?: string, printInvalidValues = true ): Scrub<T> {
		if ( errorMessage == null ) {
			errorMessage = "failed the is() validationFunction test";
			if ( printInvalidValues === true ) {
				errorMessage += ": " + stringHelper.summarize( validationFunction.toString() );
			}
		}
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			let isValid = validationFunction( value, key );
			return !isValid;
		} );

		return this;
	}

	/**
	 *  Inputs must be string (not null or empty) or number (not NaN).
	 * @param errorMessage
	 * @param printInvalidValues
	 */
	public isReal( errorMessage = "Inputs must be string (not null or empty) or number (not NaN).", printInvalidValues = true ): Scrub<T> {
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			if ( value == null ) { return true; }
			if ( typeof value === "string" && stringHelper.isNullOrEmpty( value ) === true ) { return true; }
			if ( typeof value === "number" && numHelper.isReal( value ) === false ) { return true; }
			return false;
		} );

		return this;
	}
	public isUUID( errorMessage = "Inputs must be UUID (GUID).", printInvalidValues = true ): Scrub<T> {
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			return validator.isUUID( value ) ? false : true;
		} );
		return this;


	}
	public isString( errorMessage = "Inputs must be of type string.", printInvalidValues = true ): Scrub<string> {
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			if ( value == null ) { return true; }
			if ( typeof value !== "string" ) { return true; }
			return false;
		} );

		return <any>this;
	}
	public isNumber( errorMessage = "Inputs must be of type number.", printInvalidValues = true ): Scrub<number> {
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			if ( value == null ) { return true; }
			if ( typeof value !== "number" ) { return true; }
			return false;
		} );

		return <any>this;
	}



	public isType<U>( typeName: string, errorMessage = "Inputs must be of type " + typeName, printInvalidValues = true ): Scrub<U> {
		this._enumerationHelper( errorMessage, printInvalidValues, ( value: any, key ) => {
			if ( value == null ) { return true; }
			if ( typeof value !== typeName ) { return true; }
			return false;
		} );

		return <any>this;
	}



	/** ensure that this object being scrubbed has all the properties found in a template, and the same type.  only works for first-order children right now*/
	public isTemplatePopulated( template: {}, errorMessage?: string, printInvalidValues = true ): Scrub<T> {
		if ( errorMessage == null ) {
			errorMessage = "required values are not present.  ";
		}
		var invalid: _.Dictionary<T> = {};
		_.forEach( template, ( templateValue, key ) => {

			//log.debug("key", key, "templateValue", templateValue,"value",this.valid[key]);

			if ( templateValue == null ) {
				//ignore null
				return;
			}
			var templateValueType = reflection.getTypeName( templateValue );
			if ( templateValueType === "object" ) {
				throw new ex.XlibException( "template is a complex JSON object.   template currently only works for first-order children right now" );
			}
			if ( this.valid[ key ] == null ) {
				invalid[ key ] = <any>templateValueType;
			} else {
				var currentValue = this.valid[ key ];
				var currentValueType = reflection.getTypeName( currentValue );
				if ( templateValueType !== currentValueType ) {
					invalid[ key ] = <any>templateValueType;
				}
			}
		} );

		if ( Object.keys( invalid ).length > 0 ) {

			var errors = this._appendErrorMessage( errorMessage, true, invalid );
			this.invalid[ "isTemplatePopulated" ] = <any>errors;

			this._maintainValidState();
		}

		return <any>this;
	}


	///** converts all this.valid into escaped strings via encodeURIComponent. */
	//public sanitizeUserInput(leaveNull = false): Scrub<string> {
	//	_.forEach(this.valid, (value: any, key) => {
	//		if (value == null) {
	//			if (leaveNull == true) {
	//				this.valid[key] = null;
	//				return;
	//			}
	//			value = "";
	//		}
	//		this.valid[key] = <any> encodeURIComponent(value);
	//	});

	//	return <any>this;
	//}

	public getValid<U>( key, valueIfInvalid: U = null ): T | U {
		var value = this.valid[ key ];
		if ( value !== undefined ) {
			return value;
		}
		return valueIfInvalid;
	}
}
/** @deprecated needs refactoring */
export function scrub( values: _.Dictionary<any> | {}, clone = false, deepClone = false ): Scrub<any> {
	return new Scrub( <any>values, clone, deepClone );
}
