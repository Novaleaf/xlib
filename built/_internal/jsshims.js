"use strict";
// tslint:disable
/** bootstraps various compatibilities for browsers with old versions of javascript */
Object.defineProperty(exports, "__esModule", { value: true });
function initialize() {
    //declare class Buffer { };
    //vNEXT: disable for ts compile purposes
    //if (typeof (btoa) === "undefined") {
    //	btoa = function (str) {
    //		//return Base64.encode(str);
    //		return new (<any>Buffer)(str).toString("base64");
    //	};
    //}
    //if (typeof (atob) === "undefined") {
    //	atob = function (str) {
    //		//return Base64.encode(str);
    //		return new (<any>Buffer)(str, "base64").toString("utf8");
    //	};
    //}
    if (typeof (window) !== "undefined") {
        /** Object.keys shim for ie7, ie8, from http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation */
        Object.keys = Object.keys || (function () {
            var _hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"), DontEnums = [
                "toString",
                "toLocaleString",
                "valueOf",
                "hasOwnProperty",
                "isPrototypeOf",
                "propertyIsEnumerable",
                "constructor"
            ], DontEnumsLength = DontEnums.length;
            return function (o) {
                if (typeof o !== "object" && typeof o !== "function" || o == null)
                    throw new TypeError("Object.keys called on a non-object");
                var result = [];
                for (var name in o) {
                    if (o.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                if (hasDontEnumBug) {
                    for (var i = 0; i < DontEnumsLength; i++) {
                        if (_hasOwnProperty.call(o, DontEnums[i]))
                            result.push(DontEnums[i]);
                    }
                }
                return result;
            };
        })();
        if (Object.setPrototypeOf === undefined) {
            Object.setPrototypeOf = function (target, prototype) {
                target.__proto__ = prototype;
                return target;
            };
        }
        if (Object.create === undefined) {
            Object.create = function (o) {
                function F() { }
                F.prototype = o;
                return new F();
            };
        }
        /** Array.filter shim for ie7, ie8, from http://stackoverflow.com/questions/7153470/why-wont-filter-work-in-interent-explorer-8 */
        if (!Array.prototype.filter) {
            Array.prototype.filter = function (fun /*, thisp */) {
                "use strict";
                if (this === void 0 || this == null)
                    throw new TypeError();
                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun !== "function")
                    throw new TypeError();
                var res = [];
                var thisp = arguments[1];
                for (var i = 0; i < len; i++) {
                    if (i in t) {
                        var val = t[i]; // in case fun mutates this
                        if (fun.call(thisp, val, i, t))
                            res.push(val);
                    }
                }
                return res;
            };
        }
        if (typeof (window) !== "undefined") {
            ////configure fallbacks for old browsers
            if (typeof window.console === "undefined") {
                window.console = {
                    assert: (test) => {
                        if (test) {
                            return;
                        }
                        eval("debugger");
                    },
                    error: () => {
                        eval("debugger");
                    },
                    log: () => {
                    }
                };
            }
            ///// add crappy error trace for old IE browsers
            //window.onerror = <any> function (err, url, line) {
            //	console.log(err + '\n on page: ' + url + '\n on line: ' + line);
            //}
        }
        if (!window.location.origin) {
            //fix for ie 9,10
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }
    }
}
exports.initialize = initialize;
//# sourceMappingURL=jsshims.js.map