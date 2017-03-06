"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringHelper = require("./stringhelper");
const numHelper = require("./numhelper");
const jsHelper = require("./jshelper");
const ex = require("./exception");
const _ = require("lodash");
const serialization = require("./serialization");
const reflection = require("./reflection");
class ScrubFailureException extends ex.CorelibException {
}
/** https://www.npmjs.com/package/validator  this is wrapped by our custom "scrub" framework, so we recommend using that instead for additional error/recovery options  */
const validator = require("validator");
exports.validator = validator;
const logging = require("./logging");
let log = new logging.Logger(__filename);
class Scrub {
    constructor(inputs, clone = false, deepClone = false, /** fail message if the inputs are not an object */ errorMessage = "Scrub.ctor(inputs) invalid Arguments. 'inputs' must be an 'object'. Instead it was of type '" + typeof (inputs) + "'. ", printInvalidValues = true) {
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
    _maintainValidState() {
        this.isValid = true;
        _.forEach(this.invalid, (value) => {
            this.isValid = false;
            return false;
        });
    }
    /** reject a value, and adds to errorMessages list if your errorMessage is supplied*/
    _reject(key, errorMessage, printInvalidValues = false, invalidValues = {}) {
        this.isValid = false;
        this.invalid[key] = this.valid[key];
        delete this.valid[key];
        if (errorMessage != null) {
            this._appendErrorMessage(errorMessage, printInvalidValues, invalidValues);
        }
    }
    /** make sure you invoke _maintainValidState() when done with all your accepts*/
    _accept(key, value) {
        delete this.invalid[key];
        this.valid[key] = value;
    }
    /** constructs an errorMessage with values, pushes it onto our errorMessages array, then returns the constructed value.*/
    _appendErrorMessage(errorMessage, printInvalidValues, invalidValues) {
        if (printInvalidValues) {
            errorMessage += `  ${Object.keys(invalidValues).length} invalid/missing values. The following required keys+types were invalid: ${serialization.JSONX.inspectStringify(invalidValues, -1, true, false, true, undefined, "")}`;
            //stringHelper.format(
            //    "  %i invalid/missing values. The following required keys+types were invalid: %s",
            //    Object.keys(invalidValues).length,
            //    serialization.JSONX.inspectStringify(invalidValues, -1, true, false, true, undefined, ""));
        }
        this.errorMessages.push(errorMessage);
        return errorMessage;
    }
    /** allows you to fix up failed validations. */
    fix(/** returning a non-undefined value will result in fixing the key.  returning null is not undefined! */ func) {
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
    forEach(action) {
        _.forEach(this.valid, (value, key) => {
            try {
                var result = action(value, key);
                if (result === false) {
                    this._reject(key);
                }
            }
            catch (ex) {
                this._reject(key, ex.toString());
            }
        });
    }
    /** if invalid, will assert*/
    failAssert(
        /** if null, the default validation.logger will be used */
        logger, 
        /** if null, a generica failure string will be generated, outputting all messages found in this.errorMessages */
        format, ...params) {
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
    failAction(action) {
        if (this.isValid) {
            return null;
        }
        return action();
    }
    /** if a scrub failure is detected, will throw an exception. */
    failThrow(exceptionMessage = stringHelper.format("Validation failed due to %s reasons: %s", this.errorMessages.length, serialization.JSONX.stringifyX(this.errorMessages))) {
        if (this.isValid) {
            return;
        }
        throw new ScrubFailureException(exceptionMessage);
    }
    _enumerationHelper(errorMessage, printInvalidValues, /** enumeration worker.  return TRUE if the value fails validation.  false otherwise */ isRejectedFunc) {
        var invalidValues = {};
        _.forEach(this.valid, (value, key) => {
            let isRejected = false;
            try {
                isRejected = isRejectedFunc(value, key);
            }
            catch (ex) {
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
    is(/** return true if valid */ validationFunction, errorMessage, printInvalidValues = true) {
        if (errorMessage == null) {
            errorMessage = "failed the is() validationFunction test";
            if (printInvalidValues === true) {
                errorMessage += ": " + stringHelper.summarize(validationFunction.toString());
            }
        }
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
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
    isReal(errorMessage = "Inputs must be string (not null or empty) or number (not NaN).", printInvalidValues = true) {
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
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
    }
    isUUID(errorMessage = "Inputs must be UUID (GUID).", printInvalidValues = true) {
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
            return validator.isUUID(value) ? false : true;
        });
        return this;
    }
    isString(errorMessage = "Inputs must be of type string.", printInvalidValues = true) {
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
            if (value == null) {
                return true;
            }
            if (typeof value !== "string") {
                return true;
            }
            return false;
        });
        return this;
    }
    isNumber(errorMessage = "Inputs must be of type number.", printInvalidValues = true) {
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
            if (value == null) {
                return true;
            }
            if (typeof value !== "number") {
                return true;
            }
            return false;
        });
        return this;
    }
    isType(typeName, errorMessage = "Inputs must be of type " + typeName, printInvalidValues = true) {
        this._enumerationHelper(errorMessage, printInvalidValues, (value, key) => {
            if (value == null) {
                return true;
            }
            if (typeof value !== typeName) {
                return true;
            }
            return false;
        });
        return this;
    }
    /** ensure that this object being scrubbed has all the properties found in a template, and the same type.  only works for first-order children right now*/
    isTemplatePopulated(template, errorMessage, printInvalidValues = true) {
        if (errorMessage == null) {
            errorMessage = "required values are not present.  ";
        }
        var invalid = {};
        _.forEach(template, (templateValue, key) => {
            //log.debug("key", key, "templateValue", templateValue,"value",this.valid[key]);
            if (templateValue == null) {
                //ignore null
                return;
            }
            var templateValueType = reflection.getTypeName(templateValue);
            if (templateValueType === "object") {
                throw new ex.CorelibException("template is a complex JSON object.   template currently only works for first-order children right now");
            }
            if (this.valid[key] == null) {
                invalid[key] = templateValueType;
            }
            else {
                var currentValue = this.valid[key];
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
    }
    getValid(key, valueIfUndefined) {
        var value = this.valid[key];
        if (value !== undefined) {
            return value;
        }
        return valueIfUndefined;
    }
}
exports.Scrub = Scrub;
/**
 *  allows scrubbing of user input.
 * @param values
 * @param clone
 * @param deepClone
 */
function scrub(values, clone = false, deepClone = false) {
    return new Scrub(values, clone, deepClone);
}
exports.scrub = scrub;
function isTemplatePopulated(input, /** required values that must exist in the input, and of the right type */ template) {
    function nodeLoop(inputTargetNode, templateTargetNode, key, nodeChain) {
        //log.debug({ inputTargetNode, templateTargetNode, key, nodeChain});
        if (templateTargetNode == null) {
            return { valid: true };
        }
        nodeChain = `${nodeChain}.${key}`;
        if (inputTargetNode == null) {
            return { valid: false, invalidMessage: `input is missing the required node: ${nodeChain}` };
        }
        //make sure the types of the nodes match
        let templateNodeType = reflection.getType(templateTargetNode);
        let inputNodeType = reflection.getType(inputTargetNode);
        if (templateNodeType !== inputNodeType) {
            return { valid: false, invalidMessage: `input node is of the wrong type.  Got ${reflection.Type[inputNodeType]} but expected ${reflection.Type[templateNodeType]} at node: ${nodeChain}` };
        }
        //if the template node isn't an object, stop becasue we are at a leaf
        if (templateNodeType !== reflection.Type.object) {
            return { valid: true };
        }
        //template node has children
        let tempNodeResult = null;
        _.forEach(templateTargetNode, (nextValue, nextKey) => {
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
    let finalResult = nodeLoop(input, template, "value", "");
    return finalResult;
}
exports.isTemplatePopulated = isTemplatePopulated;
function scrubUserInput(untrustedUserInput, requiredValues, defaultValues = {}, options = {}) {
    let targetTemplate = _.merge({}, requiredValues, defaultValues);
    let parsedInput = serialization.JSONX.parseUsingTemplate(targetTemplate, untrustedUserInput, options);
    let templateResult = isTemplatePopulated(parsedInput, targetTemplate);
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
    describe(__filename, () => {
        describe("isTemplatePopulated()", () => {
            let simple1 = { hi: "there", nested: { bye: 2 } };
            //let simple1 = { hi: "there" };
            let simple2 = { hi: "there", nested: { bye: 2 }, another: 3 };
            let simple3 = { hi: "there", nested: { bye: 2, anotherNested: 4 }, another: 3 };
            let simple1_wrongType = { hi: "there", nested: { bye: "two not 2" } };
            //let simple1_wrongType = { hi: 1 };
            let simple3_wrongType = { hi: "there", nested: { bye: 2, anotherNested: "four not 4" }, another: 3 };
            it("parse identical template", () => {
                let input = simple1;
                let template = simple1;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === true);
            });
            it("parse input has more values", () => {
                let input = simple3;
                let template = simple1;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === true);
            });
            it("fail template, missing node", () => {
                let input = simple1;
                let template = simple2;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result });
            });
            it("fail template, type mismatch", () => {
                let input = simple1_wrongType;
                let template = simple1;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result });
            });
            it("fail template, missing child node", () => {
                let input = simple2;
                let template = simple3;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result });
            });
            it("fail template, type mismatch on nested node", () => {
                let input = simple3_wrongType;
                let template = simple3;
                let result = isTemplatePopulated(input, template);
                log.assert(result.valid === false, { result });
            });
        });
    });
})(_tests || (_tests = {}));
///**
// * allows describing user input as a Class instead of a POJO, and enforces conformance of the class via templates.
// */
//export abstract class PayloadTemplate<TThis>{
//    constructor(jsonPayload?: string | Buffer, templateObj?: TThis,
//		/** defaults: {parseOrphans:false,pruneOrphans:true,sanitizeStrings:true,maxInputLength:5000} 
//		set to FALSE to not parse
//		*/
//        templateParseOptions?: {
//            /** JSON reviver, allows passing a function to transform a node (key+value) into a value of a different type.  for example, translate a date string into a moment object. */
//            reviver?: (key: any, value: any) => any;
//            /** if true, an object can be passed in, not just a string or Buffer */
//            allowObjectInput?: boolean;
//            /** if true, attempts to parse any additional strings found in the input (and does this recursively) */
//            parseOrphans?: boolean;
//            /** if true, deletes any orphans found.  default = TRUE */
//            pruneOrphans?: boolean;
//            /** if true, will escape strings to prevent injection attacks.  default false.   to ignore pruning of a node's children, set that node to null.  ex: ```myTemplate.userTags=null``` */
//            escapeStrings?: boolean,
//            /** if set, throws an exception if the input is too long.  default=5000 */
//            maxInputLength?: number;
//            /** true to not validate that all template fields are present.  default=false*/
//            skipValidation?: boolean;
//        }
//    ) {
//        if (jsonPayload == null) {
//            return;
//        }
//        if (templateParseOptions == null) {
//            templateParseOptions = {}
//        }
//        _.defaults(templateParseOptions, { parseOrphans: false, pruneOrphans: true, escapeStrings: false, maxInputLength: 5000, skipValidation: false, });
//        let parsedObj: any;
//        if (templateObj != null) {
//            parsedObj = serialization.JSONX.parseUsingTemplate(templateObj, jsonPayload, templateParseOptions);
//        } else {
//            parsedObj = serialization.JSONX.parse(jsonPayload);
//        }
//        _.assign(this, parsedObj);
//        if (templateParseOptions.skipValidation !== true) {
//            if (templateObj == null) {
//                throw new Error("Payload validation failed.  no template was passed");
//            }
//            scrub(this).isTemplatePopulated(templateObj).failThrow();
//        }
//    }
//}
//# sourceMappingURL=validation.js.map