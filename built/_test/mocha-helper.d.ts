/// <reference types="mocha" />
export declare function it1(testFcn: () => void | PromiseLike<any>): Mocha.Test;
/** hack fix for mocha bug, unable to have a timeout for async tests */
export declare function it2(testFcn: () => Promise<any>): Mocha.Test;
//# sourceMappingURL=mocha-helper.d.ts.map