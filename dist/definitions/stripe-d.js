/** stripe's values in definetely typed are for the online stripe checkout only.   this is for the node api.   anyone who want's to merge this with the definetely typed stored version can be my guest. */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
});
//# sourceMappingURL=stripe-d.js.map