/// <reference types="bluebird" />
import Promise = require('bluebird');
declare function retry<TValue>(func: () => Promise<TValue>, options?: any): Promise<TValue>;
export = retry;
