// "use strict";

// /** a 'minimal' bundle, of core cross-platform apis.  used as an internal lib for other files in the xlib library */


// /** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.  */
// import mockMocha = require("./core/diagnostics/mockmocha");
// mockMocha._initialize();


// /** low-level javascript helpers, to smooth over warts in the language */
// export import jsHelper = require("./core/jshelper");
// export import arrayHelper = require("./core/arrayhelper");
// export import ClassBase = require("./core/classbase");
// export import diagnostics = require("./core/diagnostics");
// export import lolo = require("./core/lolo");
// export import exception = require("./core/exception");
// /** various math and numerical conversion/manipulation related helper functions */
// export import numHelper = require("./core/numhelper");
// //export import runtime = require("./core/runtime");
// export import stringHelper = require("./core/stringhelper");


// export import reflection = require("./core/reflection");
// export import environment = require("./core/environment");

// export import validation = require("./core/validation");
// export import serialization = require("./core/serialization");