(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "zlib"], factory);
    }
})(function (require, exports) {
    "use strict";
    /** cross-platform implementation of the nodejs module: http://nodejs.org/api/zlib.html
     * -------------------
     * This provides bindings to Gzip/Gunzip, Deflate/Inflate, and DeflateRaw/InflateRaw classes. Each class takes the same options, and is a readable/writable Stream.
     */
    var zlib = require("zlib");
    exports.zlib = zlib;
});
//# sourceMappingURL=compression.js.map