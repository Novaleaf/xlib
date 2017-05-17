///// <reference path="../../typings/all.d.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///** a high-quality date-time library: http://momentjs.com/ Also includes the moment-timezone extension*/
exports.moment = require("moment-timezone");
// /** a high-quality date-time library: http://momentjs.com/ */
// // import * as moment from "moment";
// // export { moment };
// export import moment =require("moment");
function getDateFromIsoString(isoDateTimeString) {
    if (isoDateTimeString == null) {
        return null;
    }
    return isoDateTimeString.substring(0, isoDateTimeString.lastIndexOf("T"));
}
exports.getDateFromIsoString = getDateFromIsoString;
/** helper to generate a random date between the two dates */
function randomDate(/** inclusive */ start, /** inclusive */ end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
exports.randomDate = randomDate;
;
function format(date, /** defaults to "YYYY-MM-DDTHH:mm:ss" */ fmt) {
    if (fmt === void 0) { fmt = "YYYY-MM-DDTHH:mm:ss"; }
    return exports.moment(date).utc().format(fmt);
}
exports.format = format;
function formatLocalTz(date, /** defaults to "YYYY-MM-DDTHH:mm:ss" */ dateFmt, /** defaults to "(Z, z)" */ tzFmt) {
    if (dateFmt === void 0) { dateFmt = "YYYY-MM-DDTHH:mm:ss"; }
    if (tzFmt === void 0) { tzFmt = "(Z, z)"; }
    var asMoment = exports.moment.tz(date, exports.moment.tz.guess());
    var localTimeAsText = asMoment.format(dateFmt);
    var timeZoneAsText = asMoment.format(tzFmt);
    return { date: localTimeAsText, tz: timeZoneAsText };
}
exports.formatLocalTz = formatLocalTz;
//# sourceMappingURL=datetime.js.map