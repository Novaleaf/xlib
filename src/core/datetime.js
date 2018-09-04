///// <reference path="../../typings/all.d.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** a high-quality date-time library: http://momentjs.com/ Also includes the moment-timezone extension*/
exports.moment = require("moment-timezone");
function getDateFromIsoString(isoDateTimeString) {
    if (isoDateTimeString == null) {
        return null;
    }
    return isoDateTimeString.substring(0, isoDateTimeString.lastIndexOf("T"));
}
exports.getDateFromIsoString = getDateFromIsoString;
//# sourceMappingURL=datetime.js.map