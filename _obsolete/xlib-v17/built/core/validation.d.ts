/// <reference types="node" />
import { URL } from "url";
export declare class UrlValidator {
    options?: {
        /** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
        allowLocalhost?: boolean;
        /** default false to avoid reading the local file system */
        allowFileProtocol?: boolean;
        /** default false to avoid obsolete protocol */
        allowGopherProtocol?: boolean;
        /** default false to mitigate network scans.  setting to true allows local subnet ip's. */
        allowPrivateIp?: boolean;
        /** default false, allow domain name using non-printable ascii characters */
        allowUnicodeDomain?: boolean;
    };
    isValid: boolean;
    errorMessage: string;
    url: URL;
    constructor(input: string | URL, options?: {
        /** default false to mitigate attack surface.  setting to true allows "localhost" or "127.0.0.1" */
        allowLocalhost?: boolean;
        /** default false to avoid reading the local file system */
        allowFileProtocol?: boolean;
        /** default false to avoid obsolete protocol */
        allowGopherProtocol?: boolean;
        /** default false to mitigate network scans.  setting to true allows local subnet ip's. */
        allowPrivateIp?: boolean;
        /** default false, allow domain name using non-printable ascii characters */
        allowUnicodeDomain?: boolean;
    });
}
/** from  https://stackoverflow.com/questions/8113546/how-to-determine-whether-an-ip-address-in-private*/
export declare function isPrivateIp(ipV4Address: string): boolean;
//# sourceMappingURL=validation.d.ts.map