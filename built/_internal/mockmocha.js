"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** allows embeding mocha tests (unit tests) in your code, no-oping them if mocha is not present.
 * usage notes: as long as this module is loaded
 *		(which it is unless your minifer is expecting pure functions)
 *		then it's enabled automatically.  if your minifier truncates this, execute this function.
 * why use? otherwise your unit tests will throw type error when running mocha "describe" calls
 */
function initialize() {
    if (typeof (global["describe"]) === "undefined") {
        //var log = new logging.Logger(__filename);
        //log.trace("mocha not present.  nooping describe function");
        /* tslint:disable */
        var noop = () => { };
        /* tslint:enable */
        global["describe"] = noop;
    }
}
exports.initialize = initialize;
//# sourceMappingURL=mockmocha.js.map