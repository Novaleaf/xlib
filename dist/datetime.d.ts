/** a high-quality date-time library: http://momentjs.com/ */
import * as moment from "moment";
export { moment };
export declare function getDateFromIsoString(isoDateTimeString: string): string | null;
/** helper to generate a random date between the two dates */
export declare function randomDate(/** inclusive */ start: Date, /** inclusive */ end: Date): Date;
