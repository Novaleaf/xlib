/// <reference path="../src/types/xlib-globals/index.d.ts" />
export import lodash = require("lodash");
export import environment = require("./core/environment");
export import promise = require("./core/promise");
import * as numeric from "./core/numeric";
export { numeric };
/** contains shortcuts to commonly used xlib modules and objects.
 * example usage:
 * @example
 * import __ = xlib.lolo;
 * __.log.info("hi there");
 */
export import lolo = require("./core/lolo");
export import diagnostics = require("./core/diagnostics");
/**  various math and numerical conversion/manipulation related helper functions, and node built-in libraries */
export import util = require("./core/util");
export import reflection = require("./core/reflection");
export import time = require("./core/time");
export import validation = require("./core/validation");
export import serialization = require("./core/serialization");
export import threading = require("./core/threading");
/** network io */
export import net = require("./core/net");
/** security and cryptographic helpers.   (cross-platform)
 * */
export import security = require("./core/security");
//# sourceMappingURL=_index.d.ts.map