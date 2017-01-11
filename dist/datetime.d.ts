export import moment = require("moment-timezone");
export declare function getDateFromIsoString(isoDateTimeString: string): string | null;
/** helper to generate a random date between the two dates */
export declare function randomDate(/** inclusive */ start: Date, /** inclusive */ end: Date): Date;
