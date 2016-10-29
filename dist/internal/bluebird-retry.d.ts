import * as Promise from "bluebird";
declare function retry<TValue>(func: () => Promise<TValue>, options?: any): Promise<TValue>;
export = retry;
