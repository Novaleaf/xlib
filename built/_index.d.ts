/// <reference path="../src/types/xlib-globals/index.d.ts" />
export import lodash = require("lodash");
export import environment = require("./core/environment");
/** helper types, useful for creating complex typescript types such as mixins */
export import types = require("./core/types");
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
export import collections = require("./core/collections");
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
/** @deprecated obsolete features of xlib that are made available for backcompat.  May be updated in the future, but likely will be replaced with something else.*/
export import _obsolete = require("./_obsolete/_index");
//# sourceMappingURL=_index.d.ts.map