export import moment = require("moment-timezone");
export declare function getDateFromIsoString(isoDateTimeString: string): string | null;
/** helper to generate a random date between the two dates */
export declare function randomDate(/** inclusive */ start: Date, /** inclusive */ end: Date): Date;
export declare function format(date: Date, /** defaults to "YYYY-MM-DDTHH:mm:ss" */ fmt?: string): string;
export declare function formatLocalTz(date: Date, /** defaults to "YYYY-MM-DDTHH:mm:ss" */ dateFmt?: string, /** defaults to "(Z, z)" */ tzFmt?: string): {
    date: string;
    tz: string;
};
