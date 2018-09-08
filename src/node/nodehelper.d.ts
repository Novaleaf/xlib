/** helpers for backend node.js stuff  NODE.JS ONLY!!! */
/** get a list of all ip addresses of this server.  after generating the ip's, will cache results for next time you call this method */
export declare var getNetworkIPs: (callback: (error: any, ipV4Addresses: string[], ipV6Addresses: string[]) => void, bypassCache?: boolean) => void;
/** return all key-value arguments passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */
export declare var getCommandlineArgs: () => {
    [key: string]: string;
};
/** return a key-value argument passed tothe commandline (does not return single-value arguments)
 * example:  "myKey=myValue" will return, but "someValue" will not.
 * if you need single value args, access process.argv directly.
 */
export declare function getCommandlineArg(key: string, valueIfNullOrEmpty?: string): string;
//# sourceMappingURL=nodehelper.d.ts.map