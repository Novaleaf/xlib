///// <reference path="../../typings/all.d.ts" />
"use strict";

///** a high-quality date-time library: http://momentjs.com/ Also includes the moment-timezone extension*/
//export import moment = require("moment-timezone");

/** a high-quality date-time library: http://momentjs.com/ */
export import moment = require("moment");

export function getDateFromIsoString(isoDateTimeString: string) {
	if (isoDateTimeString == null) {
		return null;
	}
	return isoDateTimeString.substring(0, isoDateTimeString.lastIndexOf("T"));
}
//export class DateTime {

//	protected _instance: moment.Moment;

//	/** To get the current date and time, just call moment() with no parameters.  This is essentially the same as calling moment(new Date()). */
//	constructor();

//	constructor(date: number);
//	constructor(date: number[]);
//	/** When creating a moment from a string, we first check if the string matches known ISO 8601 formats, then fall back to new Date(string) if a known format is not found.

//var day = moment("1995-12-25");
//Warning: Browser support for parsing strings is inconsistent. Because there is no specification on which formats should be supported, what works in some browsers will not work in other browsers.

//For consistent results parsing anything other than ISO 8601 strings, you should use String + Format.

//Supported ISO 8601 strings

//An ISO 8601 string requires a date part.

//2013-02-08  # A calendar date part
//2013-W06-5  # A week date part
//2013-039    # An ordinal date part
//A time part can also be included, separated from the date part by a space or a uppercase T.

//2013-02-08T09            # An hour time part separated by a T
//2013-02-08 09            # An hour time part separated by a space
//2013-02-08 09:30         # An hour and minute time part
//2013-02-08 09:30:26      # An hour, minute, and second time part
//2013-02-08 09:30:26.123  # An hour, minute, second, and millisecond time part
//2013-02-08 24:00:00.000  # hour 24, minute, second, millisecond equal 0 means next day at midnight
//Any of the date parts can have a time part.

//2013-02-08 09  # A calendar date part and hour time part
//2013-W06-5 09  # A week date part and hour time part
//2013-039 09    # An ordinal date part and hour time part
//If a time part is included, an offset from UTC can also be included as +-HH:mm, +-HHmm, or Z.

//2013-02-08 09+07:00            # +-HH:mm
//2013-02-08 09-0100             # +-HHmm
//2013-02-08 09Z                 # Z
//2013-02-08 09:30:26.123+07:00  # +-HH:mm
//Note: Automatic cross browser ISO-8601 support was added in version 1.5.0. Support for the week and ordinal formats was added in version 2.3.0.

//If a string does not match any of the above formats and is not able to be parsed with Date.parse, moment#isValid will return false.

//moment("not a real date").isValid(); // false */
//	constructor(date: string);
//	/** If you know the format of an input string, you can use that to parse a moment.

//moment("12-25-1995", "MM-DD-YYYY");
//The parser ignores non-alphanumeric characters, so both of the following will return the same thing.

//moment("12-25-1995", "MM-DD-YYYY");
//moment("12\25\1995", "MM-DD-YYYY");
//The parsing tokens are similar to the formatting tokens used in moment#format. 
//	*/
//	constructor(date: string, format?: string, strict?: boolean);
//	constructor(date: string, format?: string, language?: string, strict?: boolean);
//	/** If you don't know the exact format of an input string, but know it could be one of many, you can use an array of formats.

//This is the same as String + Format, only it will try to match the input to multiple formats.

//moment("12-25-1995", ["MM-DD-YYYY", "YYYY-MM-DD"]); */
//	constructor(date: string, formats: string[], strict?: boolean);
//	constructor(date: string, formats: string[], language?: string, strict?: boolean);
//	constructor(date: string, specialFormat: () => void, strict?: boolean);
//	constructor(date: string, specialFormat: () => void, language?: string, strict?: boolean);
//	constructor(date: string, formatsIncludingSpecial: any[], strict?: boolean);
//	constructor(date: string, formatsIncludingSpecial: any[], language?: string, strict?: boolean);
//	constructor(date: Date);
//	constructor(date: moment.Moment);
//	constructor(date: Object);
//	constructor(...args: any[]) {

//		this._instance = _moment.apply(_moment, args);

//	}

//}

//export class TimeZone {
//	constructor(public value: string) {

//	}
//	public toString() {
//		return this.value;
//	}

//	public static America_Los_Angeles = new TimeZone("America/Los_Angeles");
//}

//export enum tz{
//	"America/Los_Angeles",
//	oops,
//}










