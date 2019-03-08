/** helpers for backend node.js stuff  NODE.JS ONLY!!! */
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