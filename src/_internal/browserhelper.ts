"use strict";

//import * as jsHelper from "../jshelper";
//import * as ex from "../exception";

//import jsHelper = require("../jshelper");
//import ex = require("../exception");
import * as _ from "lodash";

/** low-level javascript helpers for use in the browser. graceful fallbacks if not a browser*/


declare var phantom: any; //global var if we are running under phantomjs
/** DEPRECATED:  use jsHelper.platformType instead.   
determine if running in a browser (if false, most likely running in node.js) */
export var isBrowser = typeof window !== "undefined" && typeof phantom === "undefined";


/** detect ie version, or undefined if ie10+ or non ie browser.
usage:  if(ieVersion<9){...}*/
export var ieVersion: number = (function () {
	if (typeof (document) === "undefined") {
		return null;
	}
	var undef:any,
		v = 3,
		div = document.createElement("div"),
		all = div.getElementsByTagName("i");

	while (
		div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
		all[0]
		) {
		//no op
	};

	return v > 4 ? v : undef;
} ());
/** detects if we are running any ie, even 10  (looks for 'trident' in user agent) */
export var isIE: boolean = (function () {
	if (typeof (navigator) === "undefined") {
		return false;
	}
	if (ieVersion || navigator.userAgent.toLowerCase().indexOf("trident") >= 0) {
		return true;
	}
	return false;
} ());

/** provides onload() capabilities that work on old versions of IE too */
export function onLoad(domElement: HTMLElement | any, callback: any): void {
	//throw new Error("depricated.  still used?");
	//jquery handling of callbacks, taken from http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
	if (typeof domElement.onload === "undefined" && domElement.onreadystatechange !== "undefined") {
		throw new Error("the element you wish to attach the callback does not have a .onload() method to attach to!");
	}
    var done = false;
    

    domElement.onload = domElement.onreadystatechange = function (this: any, ev: Event) {
		if (!done && (! this.readyState ||
			this.readyState === "loaded" || this.readyState === "complete")) {
			done = true;
			//jQuery.handleSuccess(s, xhr, status, data);
			//jQuery.handleComplete(s, xhr, status, data);

			callback(ev);

			//if (!environment._DEBUG_MODE) {
			// Handle memory leak in IE
			domElement.onload = domElement.onreadystatechange = <any>null;
			//if (domElement && scriptElement.parentNode) {
			//	domElement.removeChild(scriptElement);
			//}
			//}
		}
	};
}


/** get the first attribute and return it"s value from a dom element
example:
var amdMain = getFirstAttribute("script","data-amd-main");
*/
export function getDomAttribute(elementType: string, attribute: string, searchTopDown: boolean = false): string|null {
	if (typeof (document) === "undefined") {
		return null;
	}

	var foundElement = getDomElement(elementType, attribute, undefined, searchTopDown);
	if (foundElement == null) { return null; }

	return foundElement.getAttribute(attribute);
}
/** get the first html element found and return it.  */
export function getDomElement(elementType: string,
	/** if not null, finds an element with this attribute */
	attribute?: string, attributeValue?: string, searchTopDown = false): HTMLElement |null {
	if (typeof (document) === "undefined") {
		return null;
	}
	var foundElement: any;
	var elements: HTMLElement[];
	elements = <any> document.getElementsByTagName(elementType);
	if (attribute == null) {
		//return first element found
		if (elements.length >= 1) {
			foundElement = elements[0];
		}
	} else {
		//search for attribute name

		var searchPredicate = (element: any) => {
			var foundAttributeValue = element.getAttribute(attribute);
			if (foundAttributeValue) {
				if (attributeValue == null) {
					//got it!   stop
					foundElement = element;
					return true;
				} else {
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
        } else {

            _.forEachRight(elements, searchPredicate);
            //jsHelper.forEachArrayReverse(elements, searchPredicate);
		}
	}
	return foundElement;
}

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
export var getCookies = (() => {
	/** cached query so we only get cookies once per pageload*/
	var parsedCookies: { [key: string]: string };

	function _getCookies() {
		if (parsedCookies == null) {
			if (typeof (document) === "undefined") { //for severside not using something like jsdom
				throw new Error("document (base object) is missing.  this function is meant for browser use.  are you running serverside?");
			} else {
				parsedCookies = {};
				var rawCookies = document.cookie.split(";");
				
				for (var i = 0; i < rawCookies.length; i++) {
					var keypair = rawCookies[i].trim();
					if (keypair.length === 0) {
						continue;
					}

					var raw = rawCookies[i];

					var key: string;
					var value: string;

					var splitLocation = raw.indexOf("=");
					if (splitLocation === -1) {
						key = raw;
						value = raw;
					} else if (splitLocation === 0) {
						//throw new Error("invalid cookie format.  cookie= " + raw);
						console.error("invalid cookie format.  cookie= " + raw);
						continue;
					} else {
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

export function getCookie(key: string, valueIfNullOrEmpty?: string|null): string|null {

	var parsedCookies = getCookies();

	var result = parsedCookies[key];
	if (valueIfNullOrEmpty !== undefined) {
		if (result == null || result.length === 0) {
			return valueIfNullOrEmpty;
		}
	}
	return result;
}
export var getQuerystringVariables = (() => {
	/** cached query so we only get cookies once per pageload*/
	var parsedQuerystrings: { [key: string]: string };

	function _getQuerystringVariables() {
		if (parsedQuerystrings == null) {
			if (typeof (window) === "undefined") { //for severside not using something like jsdom
				throw new Error("window (base object) is missing.  this function is meant for browser use.  are you running serverside?");
            } else {
                if (window.location.search.length === 0) {
                    //no querystrings to parse
                    return {};
                }

				var rawVars = window.location.search.substring(1).split("&");
				parsedQuerystrings = {};
				for (var i = rawVars.length - 1; i >= 0; i--) {
                    var pair = rawVars[i].split("=");
                    var key:string;
                    var value:string;
                    if (pair.length == 1) {
                        key = pair[0];
                        value = key;
                    }else if (pair.length == 2) {

				        key = pair[0];
				        value = pair[1];
                    } else {
                        key = pair[0];
                        value = (<string>rawVars[i]).substring(key.length);
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

export function getQuerystringVariable(key: string, valueIfNullOrEmpty?: string|null): string|null {
	//from: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	var parsedQuerystrings : {[key:string]:string} = getQuerystringVariables() as any;

	var result = parsedQuerystrings[key];
	if (valueIfNullOrEmpty !== undefined) {
		if (result == null || result.length === 0) {
			return valueIfNullOrEmpty;
		}
	}
	return result;
}

