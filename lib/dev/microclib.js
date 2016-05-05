"use strict";
/** a 'minimal' bundle, of core cross-platform apis.  used as an internal lib for other files in the xlib library */
/** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
var mockMocha = require("./core/diagnostics/mockmocha");
mockMocha._initialize();
/** low-level javascript helpers, to smooth over warts in the language */
exports.jsHelper = require("./core/jshelper");
exports.arrayHelper = require("./core/arrayhelper");
exports.ClassBase = require("./core/classbase");
exports.diagnostics = require("./core/diagnostics");
exports.lolo = require("./core/lolo");
exports.exception = require("./core/exception");
/** various math and numerical conversion/manipulation related helper functions */
exports.numHelper = require("./core/numhelper");
//export import runtime = require("./core/runtime");
exports.stringHelper = require("./core/stringhelper");
exports.reflection = require("./core/reflection");
exports.environment = require("./core/environment");
exports.validation = require("./core/validation");
exports.serialization = require("./core/serialization");
//# sourceMappingURL=microclib.js.map