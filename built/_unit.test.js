"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
global.__xlibInitArgs = {
    logLevel: "DEBUG"
};
const xlib = require("./_index");
var _ = xlib.lodash;
var log = xlib.diagnostics.log;
function it1(testFcn) {
    const testName = xlib.reflection.getTypeName(testFcn);
    return it(testName, testFcn);
}
/** hack fix for mocha bug, unable to have a timeout for async tests */
function it2(testFcn) {
    const testName = xlib.reflection.getTypeName(testFcn);
    return it(testName, function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timeoutMs = this.timeout();
            return xlib.promise.bluebird.resolve(testFcn.apply(this)).timeout(timeoutMs, new xlib.promise.bluebird.TimeoutError(`operation timed out.  Max of ${timeoutMs}ms exceeded`));
        });
    });
}
describe(__filename + " basic xlib unit tests", () => {
    it2(function loggerBasicConsoleOutput() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const testLogger = xlib.diagnostics.log; //  new diagnostics.Logger( "test logging" );
            testLogger.trace("traced");
            testLogger.info("infoed");
            testLogger.warn("warned");
            testLogger.error("errored");
            //testLogger.assert( false, "asserted" );
        });
    });
    it1(function testReadXlibEnvironmentEnvLevel() {
        const log = xlib.diagnostics.log;
        xlib.diagnostics.log.assert(xlib.environment.envLevel != null);
        //log.info( { envLevel: xlib.environment.envLevel } );
    });
    it1(function testLogAutoTruncation() {
        const log = xlib.diagnostics.log;
        log.info("hi", { some: "data" });
        let resultArgs = log.info("this 1000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey(1000, 10) });
        log.assert(resultArgs[4].length < 350);
        resultArgs = log.warnFull("this 1000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey(1000, 10) });
        log.assert(resultArgs[4].length > 350);
    });
    it1(function logOverridesTest() {
        const log = xlib.diagnostics.log;
        try {
            let result = log.info("should show");
            log.assert(result != null);
            log.overrideLogLevel("ERROR");
            result = log.trace("should not show");
            log.assert(result == null);
            result = log.debug("should not show");
            log.assert(result == null);
            result = log.info("should not show");
            log.assert(result == null);
            result = log.warn("should not show");
            log.assert(result == null);
            result = log.error("should show");
            log.assert(result != null);
        }
        finally {
            //reset loglevel
            log.overrideLogLevel(xlib.environment.logLevel);
        }
    });
    it2(function testingBasicNetRemoteHttpEndpointFunctionalityReadFromExampleCom() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const log = xlib.diagnostics.log;
            const remoteEndpoint = new xlib.net.RemoteHttpEndpoint({
                endpoint: { origin: "http://example.com" },
                retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
            });
            let response = yield remoteEndpoint.get();
            log.assert(response.status === 200, "invalid status response", response);
            //log.info( `got response`, response );
            log.assert(response.data.indexOf("Example Domain") >= 0, "Example Domain text not found");
            //log.info( response );
        });
    });
    it1(function testingReflection() {
        const log = xlib.diagnostics.log;
        const reflection = xlib.reflection;
        const Type = reflection.Type;
        class MyClass {
            constructor() {
                this.x = 0;
            }
        }
        ;
        log.assert(reflection.getType(MyClass) === Type.classCtor);
        log.assert(reflection.getTypeName(MyClass) === "MyClass");
        let myInstance = new MyClass();
        log.assert(reflection.getType(myInstance) === Type.object);
        log.assert(reflection.getTypeName(myInstance) === "MyClass");
        log.assert(reflection.getType(reflection.getType) === Type.function);
        log.assert(reflection.getType(xlib) === Type.object);
    });
    it2(function testingAutoscalerFunctionalityRequestFromPhantomjscloudCom() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const log = xlib.diagnostics.log;
            const apiKey = xlib.environment.getEnvironmentVariable("phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address");
            const options = {
                endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${apiKey}/` },
                autoscalerOptions: { minParallel: 4, busyGrowDelayMs: 30000, growDelayMs: 5000, idleOrBusyDecreaseMs: 5000 },
            };
            const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint(options);
            try {
                const httpResponse = yield phantomJsCloudEndpoint.post({ url: "https://example.com", renderType: "plainText", outputAsJson: true });
                log.assert(httpResponse.status === 200);
                const userResponse = httpResponse.data;
                log.assert(userResponse.content.encoding === "utf8");
                log.assert(userResponse.content.data.length > 0);
                log.assert(userResponse.content.data.indexOf("Example Domain") >= 0);
            }
            catch (_err) {
                if (xlib.reflection.getTypeName(_err) === "AxiosError") {
                    const axiosError = _err;
                }
                log.assert(false, "request failed", _err);
            }
        });
    }).timeout(5000);
    it1(function testExceptions() {
        const log = xlib.diagnostics.log;
        class MyException extends xlib.diagnostics.Exception {
            constructor() {
                super(...arguments);
                this.someVal = 22;
            }
        }
        ;
        try {
            try {
                throw new MyException("first");
            }
            catch (_err) {
                throw new MyException("second", { innerError: _err });
            }
        }
        catch (_err) {
            //log.infoFull( "logging error object", _err );
            //log.infoFull( "logging error object as JSON", xlib.diagnostics.errorToJson( _err ) );
            log.assert(_err instanceof Error);
            log.assert(_err instanceof MyException);
            const err = xlib.diagnostics.toError(_err);
            log.assert(err === _err, "because _err was an instanceOf Error, we should have gotten the same object back, but now strongly typed");
            log.assert(err.message === "second	innerException: first"); //we include innerException message in the parent exception message
            log.assert(err.innerError != null && err.innerError.message === "first");
            const asJson = xlib.diagnostics.errorToJson(_err);
            log.assert(_.isEqual(asJson, err.toJson()), "json vals should be equal");
            log.assert(asJson["someVal"] === 22);
            log.info("testExceptions", asJson);
        }
    });
    it1(function testUrlValidation() {
        let urlVal = new xlib.validation.UrlValidator("http://www.example.com:881");
        log.assert(urlVal.isValid === true, "basic url should be valid", urlVal);
        urlVal = new xlib.validation.UrlValidator("data:text/html,<script>alert('hi');</script>");
        log.assert(urlVal.isValid === true, "data url should be valid", urlVal);
        urlVal = new xlib.validation.UrlValidator("http://localhost:881");
        log.assert(urlVal.isValid === false, "local url should be invalid", urlVal);
        urlVal = new xlib.validation.UrlValidator("http://localhost:881", { allowLocalhost: true });
        log.assert(urlVal.isValid === true, "local url should be valid", urlVal);
    });
    it1(function testLolo() {
        const __ = xlib.lolo;
        __.log.info(`the current time is ${__.utc().toISO()}`, { isDebug: __.isDebug() });
    });
    it2(function testStopwatch() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const __ = xlib.lolo;
            const stopwatch = new xlib.time.Stopwatch("unit test");
            __.log.assert(stopwatch.getElapsed().valueOf() === 0);
            yield xlib.promise.bluebird.delay(200);
            __.log.assert(stopwatch.getElapsed().valueOf() === 0);
            stopwatch.start();
            yield xlib.promise.bluebird.delay(2000);
            let elapsedMs = stopwatch.getElapsed().valueOf();
            __.log.assert(elapsedMs > 0);
            stopwatch.stop();
            let elapsed = stopwatch.getElapsed();
            yield xlib.promise.bluebird.delay(200);
            __.log.assert(elapsed.valueOf() === stopwatch.getElapsed().valueOf());
            __.log.info("stopwatch is", elapsed.valueOf());
            __.log.assert(elapsed.valueOf() >= 2000);
            __.log.assert(elapsed.valueOf() < 2100);
            //restarting
            stopwatch.start();
            __.log.assert(__.num.aboutEqual(stopwatch.valueOf(), 0, 100));
            __.log.assert(elapsedMs > stopwatch.valueOf());
            __.log.assert(stopwatch.isPaused === false);
            yield __.bb.delay(10);
            elapsedMs = stopwatch.valueOf();
            log.info("restarted delay 10ms", stopwatch.toJson());
            stopwatch.pause();
            log.info("restarted aprox pause", stopwatch.toJson());
            __.log.assert(stopwatch.isPaused);
            yield __.bb.delay(200);
            log.info("restarted delay 200ms", stopwatch.toJson());
            log.assert(__.num.aboutEqual(stopwatch.valueOf(), elapsedMs, 0.1, 100));
            elapsedMs = stopwatch.valueOf();
            log.assert(elapsedMs === stopwatch.valueOf());
            stopwatch.unpause();
            log.info("unpause", stopwatch.toJson());
            __.log.assert(stopwatch.isPaused === false);
            yield __.bb.delay(1);
            log.info("delay 1", stopwatch.toJson());
            stopwatch.stop();
            log.info("stop", stopwatch.toJson());
            log.assert(stopwatch.valueOf() > elapsedMs);
        });
    }).timeout(3200);
    it2(function testPerfTimer() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const __ = xlib.lolo;
            /** needs to stay 5 otherwise the assert check at the bottom of the test needs to be changed */
            const loops = 5;
            const loopSleepMs = 3;
            const logIntervalMs = undefined;
            const perfTimer = new xlib.time.PerfTimer({ autoLogIntervalMs: logIntervalMs, autoLogLevel: xlib.environment.LogLevel.WARN });
            const outsideWatch = perfTimer.start("outside");
            for (let i = 0; i < loops; i++) {
                const mainLoopWatch = perfTimer.start("mainLoop");
                for (let i = 0; i < loops; i++) {
                    const innerA = perfTimer.start("innerA");
                    for (let i = 0; i < loops; i++) {
                        const innerAA = perfTimer.start("innerAA");
                        yield __.bb.delay(loopSleepMs);
                        innerAA.stop();
                    }
                    yield __.bb.delay(loopSleepMs);
                    innerA.stop();
                }
                for (let i = 0; i < loops; i++) {
                    const innerB = perfTimer.start("innerB");
                    yield __.bb.delay(loopSleepMs);
                    innerB.stop();
                }
                yield __.bb.delay(loopSleepMs);
                mainLoopWatch.stop();
            }
            outsideWatch.stop();
            const { logData, rawData } = yield perfTimer.logNowAndClear();
            __.log.assert(Object.keys(logData).length <= 5, "too many keys.  why?");
            __.log.assert(Object.keys(logData).length === 5 && logData["outside"] != null, "perfTimer.logNowAndClear() should have been awaited, giving other fulfilled promises from stopwatch('outside') a chance to finalize and be reported");
            __.log.assert(logData["outside"].runs === 1 && logData["mainLoop"].runs === 5 && logData["innerAA"].runs === 125 && logData["innerA"].runs === 25 && logData["innerB"].runs === 25);
            __.log.assert(rawData["mainLoop"].raw.length === 5);
        });
    });
    it1(function testQuartileCalculations() {
        const __ = xlib.lolo;
        const input = [500, 468, 454, 469];
        const quantiles = [0, 0.25, 0.5, 0.75, 1];
        const outputMathJs = xlib.numeric.mathjs.quantileSeq(input, quantiles, false);
        const inputDuration = input.map((val) => xlib.time.luxon.Duration.fromMillis(val));
        const outputTime = xlib.time.quantile(inputDuration);
        __.log.info("test quartile calculations mathjs", { input, quantiles, outputMathJs, outputTime });
        __.log.assert(_.isEqual(outputMathJs, [454, 464.5, 468.5, 476.75, 500]));
        __.log.assert(_.isEqual(outputMathJs, outputTime));
        __.log.assert(xlib.numeric.mathjs.median(input) === outputMathJs[2], "expect mean to equal 50% quantile value");
        // 	const rejection = xlib.promise.bluebird.reject( "error string" );
        // 	__.log.assert( rejection.reason instanceof Error );
        // 	__.log.assert( ( rejection.reason() as Error ).message === "error string" );
    });
    it2(function autoscalerTest() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const __ = xlib.lolo;
            const chanceOfBusy = 0.01;
            const chanceOfFail = 0.01;
            const replyDelay = 30;
            const replyDelaySpread = 30;
            ;
            class TestAutoScaleError extends xlib.diagnostics.Exception {
            }
            let testScaler = new xlib.threading.Autoscaler({ busyGrowDelayMs: 100, busyExtraPenalty: 4, idleOrBusyDecreaseMs: 30, growDelayMs: 5, minParallel: 4 }, (chanceOfBusy, chanceOfFail, replyDelay, replyDelaySpread) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                //this is the "backendWorker" that is being autoscaled
                let delay = replyDelay + __.num.randomInt(0, replyDelaySpread);
                yield __.bb.delay(replyDelay);
                const isBusy = __.num.randomBool(chanceOfBusy);
                if (isBusy) {
                    return xlib.promise.bluebird.reject(new TestAutoScaleError("backend busy", { data: { shouldRejectBusy: true } }));
                }
                const isFail = __.num.randomBool(chanceOfFail);
                if (isFail) {
                    return __.bb.reject(new TestAutoScaleError("backend failure", { data: { shouldRejectBusy: false } }));
                }
                return xlib.promise.bluebird.resolve("backend success");
            }), ((err) => {
                if (err.data != null && err.data.shouldRejectBusy === true) {
                    return "TOO_BUSY";
                }
                return "FAIL";
            }));
            let awaitsArray = [];
            for (let i = 0; i < 1000; i++) {
                const toAwait = testScaler.submitRequest(chanceOfBusy, chanceOfFail, replyDelay, replyDelaySpread);
                toAwait.catch(() => Promise.resolve()); //mark this promise as being "handled"
                awaitsArray.push(toAwait);
            }
            let handle = setInterval(() => {
                __.log.info("while testing autoscaler, log it's internal state every 1000ms", testScaler.toJson());
            }, 1000);
            try {
                //wait for all
                for (const i in awaitsArray) {
                    // 	try {
                    // 		const result = await awaitsArray[ i ];
                    // 		__.log.assert( result === "backend success" );
                    // 	} catch ( _err ) {
                    // 		const err = xlib.diagnostics.toError( _err );
                    // 		__.log.assert( err instanceof TestAutoScaleError );
                    // 		__.log.assert( err.message === "backend failure" );
                    // 	}
                    const { toInspect } = yield xlib.promise.awaitInspect(awaitsArray[i]).timeout((replyDelay + replyDelaySpread) + 300, "reply took too long, while this could be because of debugging overhead, should investigate");
                    __.log.assert(toInspect.isResolved());
                    if (toInspect.isFulfilled()) {
                        __.log.assert(toInspect.value() === "backend success");
                    }
                    else {
                        const err = xlib.diagnostics.toError(toInspect.reason());
                        __.log.assert(err instanceof TestAutoScaleError);
                        __.log.assert(err.message === "backend failure");
                    }
                }
            }
            finally {
                clearTimeout(handle);
            }
        });
    }).timeout(10000); //end it()
}); //end describe()
//# sourceMappingURL=_unit.test.js.map