/// <reference types="bluebird" />
import * as Promise from "bluebird";
declare function retry<TValue>(func: () => Promise<TValue>, options?: any): Promise<TValue>;
export default retry;
