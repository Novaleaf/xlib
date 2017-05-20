"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stringHelper = require("./stringhelper");
var numHelper = require("./numhelper");
var jsHelper = require("./jshelper");
var ex = require("./exception");
var _ = require("lodash");
var serialization = require("./serialization");
var reflection = require("./reflection");
var ScrubFailureException = (function (_super) {
    __extends(ScrubFailureException, _super);
    function ScrubFailureException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ScrubFailureException;
}(ex.CorelibException));
/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
var validator = require("validator");
exports.validator = validator;
var logging = require("./logging");
var log = new logging.Logger(__filename);
var Scrub = (function () {
    function Scrub(inputs, clone, deepClone, /** fail message if the inputs are not an object */ errorMessage, printInvalidValues) {
        if (clone === void 0) { clone = false; }
        if (deepClone === void 0) { deepClone = false; }
        if (errorMessage === void 0) { errorMessage = "Scrub.ctor(inputs) invalid Arguments. 'inputs' must be an 'object'. Instead it was of type '" + typeof (inputs) + "'. "; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this.isValid = true;
        this.invalid = {};
        this.errorMessages = [];
        if (clone === true) {
            if (deepClone === true) {
                inputs = _.cloneDeep(inputs);
            }
            else {
                inputs = _.clone(inputs);
            }
        }
        else {
            inputs = inputs;
        }
        if (inputs == null || Object.keys(inputs).length === 0) {
            this.isValid = false;
            this.valid = {};
            this._appendErrorMessage("No inputs provided", false);
        }
        else {
            var inputsType = typeof (inputs);
            if (inputsType !== "object") {
                this.invalid["input"] = inputs;
                this.isValid = false;
                this.valid = {};
                if (errorMessage != null) {
                    this._appendErrorMessage(errorMessage, printInvalidValues, { input: inputs });
                }
            }
            else {
                this.valid = inputs;
            }
        }
        //log.debug("Scrub Inputs", this.valid);
    }
    /** if this.invalid contains anything, will set .isValid=false*/
    Scrub.prototype._maintainValidState = function () {
        var _this = this;
        this.isValid = true;
        _.forEach(this.invalid, function (value) {
            _this.isValid = false;
            return false;
        });
    };
    /** reject a value, and adds to errorMessages list if your errorMessage is supplied*/
    Scrub.prototype._reject = function (key, errorMessage, printInvalidValues, invalidValues) {
        if (printInvalidValues === void 0) { printInvalidValues = false; }
        if (invalidValues === void 0) { invalidValues = {}; }
        this.isValid = false;
        this.invalid[key] = this.valid[key];
        delete this.valid[key];
        if (errorMessage != null) {
            this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
        }
    };
    /** make sure you invoke _maintainValidState() when done with all your accepts*/
    Scrub.prototype._accept = function (key, value) {
        delete this.invalid[key];
        this.valid[key] = value;
    };
    /** constructs an errorMessage with values, pushes it onto our errorMessages array, then returns the constructed value.*/
    Scrub.prototype._appendErrorMessage = function (errorMessage, printInvalidValues, invalidValues) {
        if (printInvalidValues) {
            errorMessage += "  " + Object.keys(invalidValues).length + " invalid/missing values. The following required keys+types were invalid: " + serialization.JSONX.inspectStringify(invalidValues, -1, true, false, true, undefined, "");
            //stringHelper.format(
            //    "  %i invalid/missing values. The following required keys+types were invalid: %s",
            //    Object.keys(invalidValues).length,
            //    serialization.JSONX.inspectStringify(invalidValues, -1, true, false, true, undefined, ""));
        }
        this.errorMessages.push(errorMessage);
        return errorMessage;
    };
    /** allows you to fix up failed validations. */
    Scrub.prototype.fix = function (/** returning a non-undefined value will result in fixing the key.  returning null is not undefined! */ func) {
        var _this = this;
        if (this.isValid === true) {
            return;
        }
        var didAFix = false;
        _.forEach(this.invalid, function (value, key) {
            var fixedValue = func(value, key, _this);
            if (fixedValue !== undefined) {
                _this._accept(key, fixedValue);
                didAFix = true;
            }
        });
        //fixup state after modifications
        if (didAFix === true) {
            this._maintainValidState();
        }
    };
    /** loop through all this.valid values, return false to fail validation. this will move the key/value to this.invalid */
    Scrub.prototype.forEach = function (action) {
        var _this = this;
        _.forEach(this.valid, function (value, key) {
            try {
                var result = action(value, key);
                if (result === false) {
                    _this._reject(key);
                }
            }
            catch (ex) {
                _this._reject(key, ex.toString());
            }
        });
    };
    /** if invalid, will assert*/
    Scrub.prototype.failAssert = function (
        /** if null, the default validation.logger will be used */
        logger, 
        /** if null, a generica failure string will be generated, outputting all messages found in this.errorMessages */
        format) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
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
    };
    /** perform an action when a scrub failure is detected.  if isValid, nothing will be triggered.   */
    Scrub.prototype.failAction = function (action) {
        if (this.isValid) {
            return null;
        }
        return action();
    };
    /** if a scrub failure is detected, will throw an exception. */
    Scrub.prototype.failThrow = function (exceptionMessage) {
        if (exceptionMessage === void 0) { exceptionMessage = stringHelper.format("Validation failed due to %s reasons: %s", this.errorMessages.length, serialization.JSONX.stringifyX(this.errorMessages)); }
        if (this.isValid) {
            return;
        }
        throw new ScrubFailureException(exceptionMessage);
    };
    Scrub.prototype._enumerationHelper = function (errorMessage, printInvalidValues, /** enumeration worker.  return TRUE if the value fails validation.  false otherwise */ isRejectedFunc) {
        var _this = this;
        var invalidValues = {};
        _.forEach(this.valid, function (value, key) {
            var isRejected = false;
            try {
                isRejected = isRejectedFunc(value, key);
            }
            catch (ex) {
                isRejected = true;
                errorMessage = "Exception threw when validating: " + errorMessage;
            }
            if (isRejected === true) {
                _this._reject(key);
                invalidValues[key] = value;
            }
        });
        if (Object.keys(invalidValues).length > 0) {
            this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
        }
    };
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
    Scrub.prototype.is = function (/** return true if valid */ validationFunction, errorMessage, printInvalidValues) {
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        if (errorMessage == null) {
            errorMessage = "failed the is() validationFunction test";
            if (printInvalidValues === true) {
                errorMessage += ": " + stringHelper.summarize(validationFunction.toString());
            }
        }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            var isValid = validationFunction(value, key);
            return !isValid;
        });
        return this;
    };
    /**
     *  Inputs must be string (not null or empty) or number (not NaN).
     * @param errorMessage
     * @param printInvalidValues
     */
    Scrub.prototype.isReal = function (errorMessage, printInvalidValues) {
        if (errorMessage === void 0) { errorMessage = "Inputs must be string (not null or empty) or number (not NaN)."; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            if (value == null) {
                return true;
            }
            if (typeof value === "string" && stringHelper.isNullOrEmpty(value) === true) {
                return true;
            }
            if (typeof value === "number" && numHelper.isReal(value) === false) {
                return true;
            }
            return false;
        });
        return this;
    };
    Scrub.prototype.isUUID = function (errorMessage, printInvalidValues) {
        if (errorMessage === void 0) { errorMessage = "Inputs must be UUID (GUID)."; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            return validator.isUUID(value) ? false : true;
        });
        return this;
    };
    Scrub.prototype.isString = function (errorMessage, printInvalidValues) {
        if (errorMessage === void 0) { errorMessage = "Inputs must be of type string."; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            if (value == null) {
                return true;
            }
            if (typeof value !== "string") {
                return true;
            }
            return false;
        });
        return this;
    };
    Scrub.prototype.isNumber = function (errorMessage, printInvalidValues) {
        if (errorMessage === void 0) { errorMessage = "Inputs must be of type number."; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            if (value == null) {
                return true;
            }
            if (typeof value !== "number") {
                return true;
            }
            return false;
        });
        return this;
    };
    Scrub.prototype.isType = function (typeName, errorMessage, printInvalidValues) {
        if (errorMessage === void 0) { errorMessage = "Inputs must be of type " + typeName; }
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        this._enumerationHelper(errorMessage, printInvalidValues, function (value, key) {
            if (value == null) {
                return true;
            }
            if (typeof value !== typeName) {
                return true;
            }
            return false;
        });
        return this;
    };
    /** ensure that this object being scrubbed has all the properties found in a template, and the same type.  only works for first-order children right now*/
    Scrub.prototype.isTemplatePopulated = function (template, errorMessage, printInvalidValues) {
        var _this = this;
        if (printInvalidValues === void 0) { printInvalidValues = true; }
        if (errorMessage == null) {
            errorMessage = "required values are not present.  ";
        }
        var invalid = {};
        _.forEach(template, function (templateValue, key) {
            //log.debug("key", key, "templateValue", templateValue,"value",this.valid[key]);
            if (templateValue == null) {
                //ignore null
                return;
            }
            var templateValueType = reflection.getTypeName(templateValue);
            if (templateValueType === "object") {
                throw new ex.CorelibException("template is a complex JSON object.   template currently only works for first-order children right now");
            }
            if (_this.valid[key] == null) {
                invalid[key] = templateValueType;
            }
            else {
                var currentValue = _this.valid[key];
                var currentValueType = reflection.getTypeName(currentValue);
                if (templateValueType !== currentValueType) {
                    invalid[key] = templateValueType;
                }
            }
        });
        if (Object.keys(invalid).length > 0) {
            var errors = this._appendErrorMessage(errorMessage, true, invalid);
            this.invalid["isTemplatePopulated"] = errors;
            this._maintainValidState();
        }
        return this;
    };
    Scrub.prototype.getValid = function (key, valueIfUndefined) {
        var value = this.valid[key];
        if (value !== undefined) {
            return value;
        }
        return valueIfUndefined;
    };
    return Scrub;
}());
exports.Scrub = Scrub;
/**
 *  allows scrubbing of user input.
 * @param values
 * @param clone
 * @param deepClone
 */
function scrub(values, clone, deepClone) {
    if (clone === void 0) { clone = false; }
    if (deepClone === void 0) { deepClone = false; }
    return new Scrub(values, clone, deepClone);
}
exports.scrub = scrub;
function isTemplatePopulated(input, /** required values that must exist in the input, and of the right type */ template) {
    function nodeLoop(inputTargetNode, templateTargetNode, key, nodeChain) {
        //log.debug({ inputTargetNode, templateTargetNode, key, nodeChain});
        if (templateTargetNode == null) {
            return { valid: true };
        }
        nodeChain = nodeChain + "." + key;
        if (inputTargetNode == null) {
            return { valid: false, invalidMessage: "input is missing the required node: " + nodeChain };
        }
        //make sure the types of the nodes match
        var templateNodeType = reflection.getType(templateTargetNode);
        var inputNodeType = reflection.getType(inputTargetNode);
        if (templateNodeType !== inputNodeType) {
            return { valid: false, invalidMessage: "input node is of the wrong type.  Got " + reflection.Type[inputNodeType] + " but expected " + reflection.Type[templateNodeType] + " at node: " + nodeChain };
        }
        //if the template node isn't an object, stop becasue we are at a leaf
        if (templateNodeType !== reflection.Type.object) {
            return { valid: true };
        }
        //template node has children
        var tempNodeResult = null;
        _.forEach(templateTargetNode, function (nextValue, nextKey) {
            tempNodeResult = nodeLoop(inputTargetNode[nextKey], templateTargetNode[nextKey], nextKey, nodeChain);
            if (tempNodeResult.valid === false) {
                return false;
            }
            return true;
        });
        if (tempNodeResult == null) {
            //no children to loop
            tempNodeResult = { valid: true };
        }
        return tempNodeResult;
    }
    var finalResult = nodeLoop(input, template, "value", "");
    return finalResult;
}
exports.isTemplatePopulated = isTemplatePopulated;
function scrubUserInput(untrustedUserInput, requiredValues, defaultValues, options) {
    if (defaultValues === void 0) { defaultValues = {}; }
    if (options === void 0) { options = {}; }
    var targetTemplate = _.merge({}, requiredValues, defaultValues);
    var parsedInput = serialization.JSONX.parseUsingTemplate(targetTemplate, untrustedUserInput, options);
    var templateResult = isTemplatePopulated(parsedInput, targetTemplate);
    if (templateResult.valid !== true) {
        throw new Error("scrubUserInput failed, error while validating the template.  error= " + templateResult.invalidMessage);
    }
    _.defaults(parsedInput, defaultValues);
    return parsedInput;
}
exports.scrubUserInput = scrubUserInput;
var _tests;
(function (_tests) {
    //"use strict";
    describe(__filename, function () {
        describe("isTemplatePopulated()", function () {
            var simple1 = { hi: "there", nested: { bye: 2 } };
            //let simple1 = { hi: "there" };
            var simple2 = { hi: "there", nested: { bye: 2 }, another: 3 };
            var simple3 = { hi: "there", nested: { bye: 2, anotherNested: 4 }, another: 3 };
            var simple1_wrongType = { hi: "there", nested: { bye: "two not 2" } };
            //let simple1_wrongType = { hi: 1 };
            var simple3_wrongType = { hi: "there", nested: { bye: 2, anotherNested: "four not 4" }, another: 3 };
            it("parse identical template", function () {
                var input = simple1;
                var template = simple1;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === true);
            });
            it("parse input has more values", function () {
                var input = simple3;
                var template = simple1;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === true);
            });
            it("fail template, missing node", function () {
                var input = simple1;
                var template = simple2;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result: result });
            });
            it("fail template, type mismatch", function () {
                var input = simple1_wrongType;
                var template = simple1;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result: result });
            });
            it("fail template, missing child node", function () {
                var input = simple2;
                var template = simple3;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result: result });
            });
            it("fail template, type mismatch on nested node", function () {
                var input = simple3_wrongType;
                var template = simple3;
                var result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result: result });
            });
        });
    });
})(_tests || (_tests = {}));
//# sourceMappingURL=validation.js.map