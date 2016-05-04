"use strict";
import stringHelper = require("./stringhelper");
import numHelper = require("./numhelper");
import jsHelper = require("./jshelper");
import ex = require("./exception");
import _ = require("lodash");
import serialization = require("./serialization");
import reflection = require("./reflection");

class ScrubFailureException extends ex.CorelibException {

}


/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
export import validator = require("validator");

import logging = require("./diagnostics/logging")

var log = new logging.Logger(__filename);




export class Scrub<T>{

	public isValid = true;
    public valid: {};
	public invalid = {}
	public errorMessages: string[] = [];

    constructor(inputs: {}, clone = false, deepClone = false, /** fail message if the inputs are not an object */ errorMessage = "Scrub.ctor(inputs) invalid Arguments. 'inputs' must be an 'object'. Instead it was of type '"+typeof(inputs)+"'. ", printInvalidValues = true) {

        if (clone === true) {
            inputs = _.clone(inputs, deepClone);
        } else {
            inputs = inputs;
        }
        if (inputs == null || Object.keys(inputs).length===0) {
            this.isValid = false;
            this.valid = {};
            this._appendErrorMessage("No inputs provided", false);
        } else {
            var inputsType = typeof (inputs);
            if (inputsType !== "object") {
                this.invalid["input"] = inputs as any;
                this.isValid = false;
                this.valid = {};
                if (errorMessage != null) {
                    this._appendErrorMessage(errorMessage, printInvalidValues, { input: inputs });
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
		_.forEach(this.invalid, (value) => {
			this.isValid = false;
			return false;
		});
	}

	/** reject a value, and adds to errorMessages list if your errorMessage is supplied*/
	private _reject(key: string, errorMessage?: string, printInvalidValues = false, invalidValues = {}) {
		this.isValid = false;
		this.invalid[key] = this.valid[key];
		delete this.valid[key];

		if (errorMessage != null) {
			this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
		}

	}
	/** make sure you invoke _maintainValidState() when done with all your accepts*/
	private _accept(key: string, value: T) {
		delete this.invalid[key];
		this.valid[key] = value;
	}

	/** constructs an errorMessage with values, pushes it onto our errorMessages array, then returns the constructed value.*/
    private _appendErrorMessage(errorMessage: string, printInvalidValues: boolean, invalidValues?: {}): string {
        
		if (printInvalidValues) {
			errorMessage += stringHelper.format("  %i invalid/missing values. The following required keys+types were invalid: %s", Object.keys(invalidValues).length, serialization.JSONX.inspectStringify(invalidValues, -1, true, false, true, null, ""));
		}
		this.errorMessages.push(errorMessage);
		return errorMessage;
	}


	/** allows you to fix up failed validations. */
	public fix(/** returning a non-undefined value will result in fixing the key.  returning null is not undefined! */func: (value: T, key: string, self: Scrub<T>) => T) {
		if (this.isValid === true) {
			return;
		}
		var didAFix = false;
		_.forEach(this.invalid, (value, key) => {
			var fixedValue = func(value, key, this);
			if (fixedValue !== undefined) {
				this._accept(key, fixedValue);
				didAFix = true;
			}
		});
		//fixup state after modifications
		if (didAFix === true) {
			this._maintainValidState();
		}
	}

	/** loop through all this.valid values, return false to fail validation. this will move the key/value to this.invalid */
	public forEach(action: (value: any, key: string) => boolean|void) {
        _.forEach(this.valid, (value, key) => {
            try {
                var result = action(value, key);
                if (result === false) {
                    this._reject(key);
                }
            } catch (ex) {
                this._reject(key, ex.toString());
            }
		});
	}


	/** if invalid, will assert*/
	public failAssert(
		/** if null, the default validation.logger will be used */
		logger?: logging.Logger,
		/** if null, a generica failure string will be generated, outputting all messages found in this.errorMessages */
		format?: string, ...params: any[]) {
		if (this.isValid === true) {
			return;
		}
		if (format == null) {
			format = stringHelper.format("Validation failed due to %s reasons: %s", this.errorMessages.length, serialization.JSONX.stringifyX(this.errorMessages));
		}
		if (logger == null) {
			logger = log;
		}
		jsHelper.apply(logger.assert, logger, params, [false, format]);
	}
	/** perform an action when a scrub failure is detected.  if isValid, nothing will be triggered.   */
	public failAction<TActionReturn>(action?: () => TActionReturn): TActionReturn {
		if (this.isValid) {
			return;
		}
		return action();
	}

	/** if a scrub failure is detected, will throw an exception. */
	public failThrow(exceptionMessage = stringHelper.format("Validation failed due to %s reasons: %s", this.errorMessages.length, serialization.JSONX.stringifyX(this.errorMessages))) {
		if (this.isValid) {
			return;
		}
		throw new ScrubFailureException(exceptionMessage);
	}


	private _enumerationHelper(errorMessage: string, printInvalidValues: boolean,		/** enumeration worker.  return TRUE if the value fails validation.  false otherwise */		isRejectedFunc: (value: T, key: string) => boolean): void {

		var invalidValues: _.Dictionary<T> = {};
		_.forEach(this.valid, (value, key) => {
			let isRejected = false;
			try {
				isRejected = isRejectedFunc(value, key);
			} catch (ex) {
				isRejected = true;
				errorMessage = "Exception threw when validating: " + errorMessage;
			}
			if (isRejected === true) {
				this._reject(key);
				invalidValues[key] = value;
			}

		});
		if (Object.keys(invalidValues).length > 0) {
			this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
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
	public is(/** return true if valid */validationFunction: (value: T, key: string) => boolean, errorMessage?: string, printInvalidValues = true): Scrub<T> {
		if (errorMessage == null) {
			errorMessage = "failed the is() validationFunction test";
			if (printInvalidValues === true) {
				errorMessage += ": " + stringHelper.summarize(validationFunction.toString());
			}
		}
		this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
			let isValid = validationFunction(value, key);
			return !isValid;
		});

		return this;
	}

	/**
	 *  Inputs must be string (not null or empty) or number (not NaN).
	 * @param errorMessage
	 * @param printInvalidValues
	 */
	public isReal(errorMessage = "Inputs must be string (not null or empty) or number (not NaN).", printInvalidValues = true): Scrub<T> {
		this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
			if (value == null) { return true; }
			if (typeof value === "string" && stringHelper.isNullOrEmpty(value) === true) { return true; }
			if (typeof value === "number" && numHelper.isReal(value) === false) { return true; }
			return false;
		});

		return this;
	}
	public isUUID(errorMessage = "Inputs must be UUID (GUID).", printInvalidValues = true): Scrub<T> {
		this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
			return validator.isUUID(value) ? false : true;
		});
        return this;

        
	}
	public isString(errorMessage = "Inputs must be of type string.", printInvalidValues = true): Scrub<string> {
		this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
			if (value == null) { return true; }
			if (typeof value !== "string") { return true; }
			return false;
		});

		return <any>this;
	}
	public isNumber(errorMessage = "Inputs must be of type number.", printInvalidValues = true): Scrub<number> {
		this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
			if (value == null) { return true; }
			if (typeof value !== "number") { return true; }
			return false;
		});

		return <any>this;
	}

    

    public isType<U>(typeName: string, errorMessage = "Inputs must be of type " + typeName, printInvalidValues = true): Scrub<U> {
        this._enumerationHelper(errorMessage, printInvalidValues, (value: any, key) => {
            if (value == null) { return true; }
            if (typeof value !== typeName) { return true; }
            return false;
        });

        return <any>this;
    }

    
    
	/** ensure that this object being scrubbed has all the properties found in a template, and the same type.  only works for first-order children right now*/
    public isTemplatePopulated(template: {}, errorMessage?:string, printInvalidValues = true): Scrub<T> {
        if (errorMessage == null) {
            errorMessage = "required values are not present.  ";
        }
		var invalid: _.Dictionary<T> = {};        
		_.forEach(template, (templateValue, key) => {

            //log.debug("key", key, "templateValue", templateValue,"value",this.valid[key]);

			if (templateValue == null) {
				//ignore null
				return;
            }
            var templateValueType = reflection.getTypeName(templateValue);
            if (templateValueType === "object") {
                throw new  ex.CorelibException("template is a complex JSON object.   template currently only works for first-order children right now");
            }
            if (this.valid[key] == null) {
                invalid[key] = <any>templateValueType;
            } else {
                var currentValue = this.valid[key];
                var currentValueType = reflection.getTypeName(currentValue);
                if (templateValueType !== currentValueType) {
                    invalid[key] = <any>templateValueType;
                }
            }
		});

		if (Object.keys(invalid).length > 0) {

			var errors = this._appendErrorMessage(errorMessage, true, invalid);
			this.invalid["isTemplatePopulated"] = <any>errors;

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

	public getValid<U>(key, valueIfInvalid: U = null): T|U {
		var value = this.valid[key];
		if (value !== undefined) {
			return value;
		}
		return valueIfInvalid;
	}
}

export function scrub(values: _.Dictionary<any> | {}, clone = false, deepClone = false): Scrub<any> {
	return new Scrub(<any>values, clone, deepClone);
}
