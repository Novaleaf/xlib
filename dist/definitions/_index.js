(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./stripe-d"], factory);
    }
})(function (require, exports) {
    "use strict";
    //export import stripe = require("./stripe-d");
    var stripe = require("./stripe-d");
    exports.stripe = stripe;
});
//# sourceMappingURL=_index.js.map