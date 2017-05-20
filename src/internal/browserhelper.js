"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as jsHelper from "../jshelper";
//import * as ex from "../exception";
//import jsHelper = require("../jshelper");
//import * as ex from "../exception";
var _ = require("lodash");
/** DEPRECATED:  use jsHelper.platformType instead.
determine if running in a browser (if false, most likely running in node.js) */
exports.isBrowser = typeof window !== "undefined" && typeof phantom === "undefined";
/** detect ie version, or undefined if ie10+ or non ie browser.
usage:  if(ieVersion<9){...}*/
exports.ieVersion = (function () {
    if (typeof (document) === "undefined") {
        return null;
    }
    var undef, v = 3, div = document.createElement("div"), all = div.getElementsByTagName("i");
    while (div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
        all[0]) {
        //no op
    }
    ;
    return v > 4 ? v : undef;
}());
/** detects if we are running any ie, even 10  (looks for 'trident' in user agent) */
exports.isIE = (function () {
    if (typeof (navigator) === "undefined") {
        return false;
    }
    if (exports.ieVersion || navigator.userAgent.toLowerCase().indexOf("trident") >= 0) {
        return true;
    }
    return false;
}());
/** provides onload() capabilities that work on old versions of IE too */
function onLoad(domElement, callback) {
    //throw new Error("depricated.  still used?");
    //jquery handling of callbacks, taken from http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
    if (typeof domElement.onload === "undefined" && domElement.onreadystatechange !== "undefined") {
        throw new Error("the element you wish to attach the callback does not have a .onload() method to attach to!");
    }
    var done = false;
    domElement.onload = domElement.onreadystatechange = function (ev) {
        if (!done && (!this.readyState ||
            this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            //jQuery.handleSuccess(s, xhr, status, data);
            //jQuery.handleComplete(s, xhr, status, data);
            callback(ev);
            //if (!environment._DEBUG_MODE) {
            // Handle memory leak in IE
            domElement.onload = domElement.onreadystatechange = null;
            //if (domElement && scriptElement.parentNode) {
            //	domElement.removeChild(scriptElement);
            //}
            //}
        }
    };
}
exports.onLoad = onLoad;
/** get the first attribute and return it"s value from a dom element
example:
var amdMain = getFirstAttribute("script","data-amd-main");
*/
function getDomAttribute(elementType, attribute, searchTopDown) {
    if (searchTopDown === void 0) { searchTopDown = false; }
    if (typeof (document) === "undefined") {
        return null;
    }
    var foundElement = getDomElement(elementType, attribute, undefined, searchTopDown);
    if (foundElement == null) {
        return null;
    }
    return foundElement.getAttribute(attribute);
}
exports.getDomAttribute = getDomAttribute;
/** get the first html element found and return it.  */
function getDomElement(elementType, 
    /** if not null, finds an element with this attribute */
    attribute, attributeValue, searchTopDown) {
    if (searchTopDown === void 0) { searchTopDown = false; }
    if (typeof (document) === "undefined") {
        return null;
    }
    var foundElement;
    var elements;
    elements = document.getElementsByTagName(elementType);
    if (attribute == null) {
        //return first element found
        if (elements.length >= 1) {
            foundElement = elements[0];
        }
    }
    else {
        //search for attribute name
        var searchPredicate = function (element) {
            var foundAttributeValue = element.getAttribute(attribute);
            if (foundAttributeValue) {
                if (attributeValue == null) {
                    //got it!   stop
                    foundElement = element;
                    return true;
                }
                else {
                    //we need to match attribute"s value for success match
                    if (attributeValue === foundAttributeValue) {
                        foundElement = element;
                        return true;
                    }
                }
            }
            return false;
        };
        if (searchTopDown) {
            _.forEach(elements, searchPredicate);
            //jsHelper.forEachArray(elements, searchPredicate);
        }
        else {
            _.forEachRight(elements, searchPredicate);
            //jsHelper.forEachArrayReverse(elements, searchPredicate);
        }
    }
    return foundElement;
}
exports.getDomElement = getDomElement;
/////** async load css
////beware the styles may not be loaded before rendering occurs! */
////export function loadCss(url) {
////	var link = <HTMLLinkElement> document.createElement("link");
////	link.type = "text/css";
////	link.rel = "stylesheet";
////	link.href = url;
////	document.getElementsByTagName("head")[0].appendChild(link);
////}
/** obatin all cookies */
exports.getCookies = (function () {
    /** cached query so we only get cookies once per pageload*/
    var parsedCookies;
    function _getCookies() {
        if (parsedCookies == null) {
            if (typeof (document) === "undefined") {
                throw new Error("document (base object) is missing.  this function is meant for browser use.  are you running serverside?");
            }
            else {
                parsedCookies = {};
                var rawCookies = document.cookie.split(";");
                for (var i = 0; i < rawCookies.length; i++) {
                    var keypair = rawCookies[i].trim();
                    if (keypair.length === 0) {
                        continue;
                    }
                    var raw = rawCookies[i];
                    var key;
                    var value;
                    var splitLocation = raw.indexOf("=");
                    if (splitLocation === -1) {
                        key = raw;
                        value = raw;
                    }
                    else if (splitLocation === 0) {
                        //throw new Error("invalid cookie format.  cookie= " + raw);
                        console.error("invalid cookie format.  cookie= " + raw);
                        continue;
                    }
                    else {
                        key = raw.substring(0, splitLocation);
                        value = raw.substring(splitLocation + 1);
                    }
                    //var cookie = rawCookies[i].split("=");
                    //if (cookie.length > 2) {
                    //	throw new Error("invalid cookie format.  cookie= " + rawCookies[i]);
                    //}
                    //var key: string;
                    //var value: string;
                    //if (cookie.length == 1) {
                    //	key = cookie[0];
                    //	value = cookie[0];
                    //} else {
                    //	key = cookie[0];
                    //	value = cookie[1];
                    //}
                    parsedCookies[key] = value;
                }
                //for (var i = rawCookies.length - 1; i >= 0; i--) {
                //	var cookie = rawCookies[i].split("=");
                //	if (cookie.length !== 2) {
                //		throw new Error("invalid cookie format.  cookie= " + rawCookies[i]);
                //	}
                //	var key = cookie[0];
                //	var value = cookie[1];
                //	parsedCookies[key] = value;
                //}
            }
        }
        return parsedCookies;
    }
    return _getCookies;
})();
function getCookie(key, valueIfNullOrEmpty) {
    var parsedCookies = exports.getCookies();
    var result = parsedCookies[key];
    if (valueIfNullOrEmpty !== undefined) {
        if (result == null || result.length === 0) {
            return valueIfNullOrEmpty;
        }
    }
    return result;
}
exports.getCookie = getCookie;
exports.getQuerystringVariables = (function () {
    /** cached query so we only get cookies once per pageload*/
    var parsedQuerystrings;
    function _getQuerystringVariables() {
        if (parsedQuerystrings == null) {
            if (typeof (window) === "undefined") {
                throw new Error("window (base object) is missing.  this function is meant for browser use.  are you running serverside?");
            }
            else {
                if (window.location.search.length === 0) {
                    //no querystrings to parse
                    return {};
                }
                var rawVars = window.location.search.substring(1).split("&");
                parsedQuerystrings = {};
                for (var i = rawVars.length - 1; i >= 0; i--) {
                    var pair = rawVars[i].split("=");
                    var key;
                    var value;
                    if (pair.length == 1) {
                        key = pair[0];
                        value = key;
                    }
                    else if (pair.length == 2) {
                        key = pair[0];
                        value = pair[1];
                    }
                    else {
                        key = pair[0];
                        value = rawVars[i].substring(key.length);
                        //throw new Error("invalid querystring format.  var= " + rawVars[i]);
                    }
                    parsedQuerystrings[key] = value;
                }
            }
        }
        return parsedQuerystrings;
    }
    return _getQuerystringVariables;
})();
function getQuerystringVariable(key, valueIfNullOrEmpty) {
    //from: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    var parsedQuerystrings = exports.getQuerystringVariables();
    var result = parsedQuerystrings[key];
    if (valueIfNullOrEmpty !== undefined) {
        if (result == null || result.length === 0) {
            return valueIfNullOrEmpty;
        }
    }
    return result;
}
exports.getQuerystringVariable = getQuerystringVariable;
//# sourceMappingURL=browserhelper.js.map