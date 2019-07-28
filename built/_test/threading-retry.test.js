"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mocha_helper_1 = require("./mocha-helper");
const xlib = tslib_1.__importStar(require("../_index"));
var __ = xlib.lolo;
var log = xlib.diagnostics.log;
describe("threading.retry tests", function threading_retry_tests() {
    let currentTry = 0;
    async function testWorker(tryToWorkOn) {
        await __.bb.delay(100);
        currentTry++;
        if (currentTry === tryToWorkOn) {
            return { status: "done", try: currentTry, tryToWorkOn };
        }
        throw new Error(`currentTry ${currentTry} waiting on ${tryToWorkOn}`);
    }
    mocha_helper_1.it2(async function e2e_basic() {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const retryObj = new xlib.threading.Retry({}, testWorker);
        currentTry = 0;
        let normalOpResult = await retryObj.invoke(1);
        log.throwCheck(normalOpResult.status === "done" && normalOpResult.try === 1);
    });
    mocha_helper_1.it2(async function retries_basic() {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const retryObj = new xlib.threading.Retry({}, testWorker);
        currentTry = 0;
        let normalOpResult = await retryObj.invoke(10);
        log.throwCheck(normalOpResult.status === "done" && normalOpResult.try === 10);
    }).timeout(20000);
    mocha_helper_1.it2(async function maxRetries_basic() {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const retryObj = new xlib.threading.Retry({ maxRetries: 3 }, testWorker);
        currentTry = 0;
        let didSuccess = false;
        try {
            let normalOpResult = await retryObj.invoke(10);
            didSuccess = true;
        }
        catch (_a) { }
        log.throwCheck(didSuccess === false);
    });
    mocha_helper_1.it2(async function totalTimeout_basic() {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const retryObj = new xlib.threading.Retry({ totalTimeout: 300 }, testWorker);
        currentTry = 0;
        let didSuccess = false;
        try {
            let normalOpResult = await retryObj.invoke(10);
            didSuccess = true;
        }
        catch (_a) { }
        log.throwCheck(didSuccess === false);
    });
});
//# sourceMappingURL=threading-retry.test.js.map