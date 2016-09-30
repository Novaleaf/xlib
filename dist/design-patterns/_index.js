(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./atomic-cache"], factory);
    }
})(function (require, exports) {
    "use strict";
    //export import atomicCache = require("./atomic-cache");
    var atomicCache = require("./atomic-cache");
    exports.atomicCache = atomicCache;
});
//# sourceMappingURL=_index.js.map