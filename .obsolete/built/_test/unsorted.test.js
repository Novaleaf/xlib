"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mocha_helper_1 = require("./mocha-helper");
const xlib = tslib_1.__importStar(require("../_index"));
var _ = xlib.lodash;
var __ = xlib.lolo;
var log = xlib.diagnostics.log;
// import * as os from "os";
// const loadAvg = ( os.loadavg[ 0 ] / os.cpus.length );
describe(__filename + " basic xlib unit tests", () => {
    // it1( function checkTsLint() {
    // 	log.throwIf( it1.length === 0 ); //expect tslint to complain about treating a function as an object.
    // 	// tslint:disable-next-line: one-variable-per-declaration
    // 	let x = 33, y = 0;
    // 	// tslint:disable-next-line: strict-boolean-expressions
    // 	if ( x ) { //x not bool, this should error
    // 		//derp
    // 		y = 88;
    // 	}
    // 	if ( y > 0 ) {
    // 		log.info( "This test verifies compile time syntax checks, and always passes at runtime." );
    // 	}
    // 	// tslint:disable-next-line: no-inferrable-types
    // 	const testStr: string = "meow";  //tslint complain
    // } );
    mocha_helper_1.it1(async function parseFunctions() {
        // try {
        // 	await this.goto( "https://opjav.club/v/npjx-a2y5lkyl-4" );
        // 	this.on( "request", ( details ) => {
        // 		if ( details.resourceType === "media" ) { page.meta.store.set( details.url, details ); }
        // 	} );
        // } catch ( err ) {
        // 	this.logError( "overseer script unhandled thrown error", { name: err.name, message: err.message, stack: err.stack } );
        // 	this.done( 400, "overseer script error, check logs" );
        // }
        async function async88() {
            let x = () => {
                return 88;
            };
            return x();
        }
        log.throwCheck((await xlib.serialization.parseFunction(async88.toString())()) === 88);
        // let fcnStr = fcn.toString();
        // let resultFcn = xlib.serialization.parseFunction( fcnStr ).toString();
        // log.infoFull( fcnStr );
        // log.infoFull( resultFcn );
    });
    mocha_helper_1.it1(function parameterReassignment() {
        //sanity check to verify assumptions regarding parameter property reassignment  (setting "public" on ctor parameters)
        class TestParameterReassignment {
            constructor(options) {
                this.options = options;
                options = { ...options, arg1: "ctorSet" };
                this.options = options;
                log.throwCheck(options.arg1 === "ctorSet" && this.options.arg1 === "ctorSet", "ctor did not set options.arg1 properly", { optionsThis: this.options, optionsPassed: options });
                log.throwCheck(options === this.options, "options references are not equal.", { optionsThis: this.options, optionsPassed: options });
                log.throwCheck(options.arg2 === "callerSet", "options did not get passed properly", { optionsThis: this.options, optionsPassed: options });
                log.throwCheck(this.options.arg2 === "callerSet", "this.options did not get passed properly", { optionsThis: this.options, optionsPassed: options });
            }
        }
        let testObj = new TestParameterReassignment({ arg1: "callerSet", arg2: "callerSet" });
    });
    describe("log_module", function log_module() {
        mocha_helper_1.it1(function testThrowIfFunctionality() {
            let gotTooFar = false;
            try {
                log.throwCheck(false, "should throw an error that will be caught by the test");
                gotTooFar = true;
            }
            catch (_err) {
            }
            if (gotTooFar === true) {
                throw new Error("got too far.  log.throwIf() is not working properly.");
            }
        });
        it("test assert functionality", function testAssertFunctionality() {
            let gotTooFar = false;
            try {
                log.assert(false, "should throw an error that will be caught by the test");
                gotTooFar = true;
            }
            catch (_err) {
            }
            if (gotTooFar === true) {
                throw new Error("got too far.  log.throwIf() is not working properly.");
            }
        });
        mocha_helper_1.it2(async function loggerBasicConsoleOutput() {
            const testLogger = xlib.diagnostics.log; //  new diagnostics.Logger( "test logging" );
            testLogger.trace("traced");
            testLogger.info("infoed");
            testLogger.warn("warned");
            testLogger.error("errored");
            //testLogger.assert( false, "asserted" );
        });
        mocha_helper_1.it1(function testReadXlibEnvironmentEnvLevel() {
            xlib.diagnostics.log.throwCheck(xlib.environment.envLevel != null);
            //log.info( { envLevel: xlib.environment.envLevel } );
        });
        mocha_helper_1.it1(function testLogAutoTruncation() {
            log.info("hi", { some: "data" });
            let resultArgs = log.info("this 1000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey(1000, 10) });
            log.throwCheck(resultArgs[4].length < 350);
            resultArgs = log.warnFull("this 1000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey(1000, 10) });
            log.throwCheck(resultArgs[4].length > 350);
        });
        mocha_helper_1.it1(function logOverridesTest() {
            try {
                let result = log.info("should show");
                log.throwCheck(result != null);
                log.overrideLogLevel("ERROR");
                result = log.trace("should not show");
                log.throwCheck(result == null);
                result = log.debug("should not show");
                log.throwCheck(result == null);
                result = log.info("should not show");
                log.throwCheck(result == null);
                result = log.warn("should not show");
                log.throwCheck(result == null);
                result = log.error("should show");
                log.throwCheck(result != null);
            }
            finally {
                //reset loglevel
                log.overrideLogLevel(xlib.environment.logLevel);
            }
        });
    });
    mocha_helper_1.it2(async function testingBasicNetRemoteHttpEndpointFunctionalityReadFromExampleCom() {
        const remoteEndpoint = new xlib.net.RemoteHttpEndpoint({
            endpoint: { origin: "http://example.com" },
            retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
        });
        let response = await remoteEndpoint.get();
        log.throwCheck(response.status === 200, "invalid status response", response);
        //log.info( `got response`, response );
        log.throwCheck(response.data.indexOf("Example Domain") >= 0, "Example Domain text not found");
        //log.info( response );
    });
    mocha_helper_1.it1(function testingReflection() {
        const reflection = xlib.reflection;
        const Type = reflection.Type;
        class MyClass {
            constructor() {
                this.x = 0;
            }
        }
        log.throwCheck(reflection.getType(MyClass) === Type.classCtor);
        log.throwCheck(reflection.getTypeName(MyClass) === "MyClass");
        let myInstance = new MyClass();
        log.throwCheck(reflection.getType(myInstance) === Type.object);
        log.throwCheck(reflection.getTypeName(myInstance) === "MyClass");
        log.throwCheck(reflection.getType(reflection.getType) === Type.function);
        log.throwCheck(reflection.getType(xlib) === Type.object);
    });
    mocha_helper_1.it2(async function testingAutoscalerFunctionalityRequestFromPhantomjscloudCom() {
        const apiKey = xlib.environment.getEnvironmentVariable("phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address");
        const options = {
            endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${apiKey}/` },
            autoscalerOptions: { minParallel: 4, busyGrowDelayMs: 30000, growDelayMs: 5000, idleOrBusyDecreaseMs: 5000 },
        };
        const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint(options);
        try {
            const httpResponse = await phantomJsCloudEndpoint.post({ url: "https://example.com", renderType: "plainText", outputAsJson: true });
            log.throwCheck(httpResponse.status === 200);
            const userResponse = httpResponse.data;
            log.throwCheck(userResponse.content.encoding === "utf8");
            log.throwCheck(userResponse.content.data.length > 0);
            log.throwCheck(userResponse.content.data.indexOf("Example Domain") >= 0);
        }
        catch (_err) {
            if (xlib.reflection.getTypeName(_err) === "AxiosError") {
                const axiosError = _err;
            }
            log.throwCheck(false, "request failed", _err);
        }
    }).timeout(5000);
    describe("security_module", function security_module() {
        const tokenTestData = { billing: "bypass", credits: 1.0, use: "direct", lots: { of: "less than words", values: ["abc", "do re me", 123], now: new Date() }, mots2: {} };
        let keyPair_P256;
        let keyPair_P256_2;
        before(async () => {
            keyPair_P256 = await xlib.security.generateECKeyPair("P-256");
            keyPair_P256_2 = await xlib.security.generateECKeyPair();
        });
        mocha_helper_1.it1(async function tinyToken_validNoExpire() {
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri);
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub);
            log.throwCheck(result.isValid === true && result.isExpired === false && result.isSigValid === true, "verify result status checks abnormal");
            log.throwCheck(JSON.stringify(tokenTestData) === JSON.stringify(result.data), "resulting token data does not match input", tokenTestData, result.data);
            //log.infoFull( "tinyToken_basicE2e done success", { dataLen: JSON.stringify( data ).length, tokenLen: token.length, token, result } );
        });
        mocha_helper_1.it1(async function tinyToken_validExpire5s() {
            const now = __.utc().minus({ second: 5 });
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri, { expires: "10s", currentDate: now.toJSDate() });
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub);
            log.throwCheck(result.isValid === true && result.isExpired === false && result.isSigValid === true, "verify result status checks abnormal");
            log.throwCheck(JSON.stringify(tokenTestData) === JSON.stringify(result.data), "resulting token data does not match input", tokenTestData, result.data);
        });
        mocha_helper_1.it1(async function tinyToken_validExpire5s_P256_Under255Char() {
            const maximumData = { billing: "bypass", credits: 1.0, use: "direct", lots: { values: ["abc", "do re me", 123], now: new Date() } };
            const now = __.utc().minus({ second: 5 });
            const token = await xlib.security.tinyToken.sign(maximumData, keyPair_P256.pri, { expires: "10s", currentDate: now.toJSDate() });
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256.pub);
            log.info("token = ", token.length, token);
            log.info("dataLen = ", JSON.stringify(maximumData).length);
            log.throwCheck(token.length <= 255, "token length too long");
            log.throwCheck(result.isValid === true && result.isExpired === false && result.isSigValid === true, "verify result status checks abnormal");
            log.throwCheck(JSON.stringify(maximumData) === JSON.stringify(result.data), "resulting token data does not match input", tokenTestData, result.data);
        });
        mocha_helper_1.it1(async function tinyToken_Expired1s() {
            const now = __.utc().minus({ second: 11 });
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri, { expires: "10s", currentDate: now.toJSDate() });
            let isError = false;
            try {
                const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub);
            }
            catch (_err) {
                isError = true;
            }
            log.throwCheck(isError === true, "token did not fail as test expected");
            //log.throwCheck( JSON.stringify( tokenTestData ) === JSON.stringify( result.data ), "resulting token data does not match input" );
        });
        mocha_helper_1.it1(async function tinyToken_Expired1s_resultsAnyway() {
            const smallTestData = { now: new Date() };
            const now = __.utc().minus({ second: 11 });
            const token = await xlib.security.tinyToken.sign(smallTestData, keyPair_P256_2.pri, { expires: "10s", currentDate: now.toJSDate() });
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub, { allowValidationFailure: true });
            log.warnFull("diagnose payloads", { smallTestData: smallTestData, token, result });
            log.throwCheck(result.isValid === false && result.isExpired === true && result.isSigValid === true, "verify result status checks abnormal");
            log.throwCheck(JSON.stringify(smallTestData) === JSON.stringify(result.data), "resulting token data does not match input", smallTestData, result.data);
        });
        mocha_helper_1.it1(async function tinyToken_Expired7d1s() {
            const now = __.utc().minus({ day: 7, second: 1 });
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri, { expires: "7d", currentDate: now.toJSDate() }); // currentDate: new Date( Date.now() - ( ( 7 * 24 * 3600 ) - ( 1 * 60 ) ) * 1000 ) } ) );
            let isError = false;
            try {
                const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub);
            }
            catch (_err) {
                isError = true;
            }
            log.throwCheck(isError === true, "token did not fail as test expected");
            //log.throwCheck( JSON.stringify( tokenTestData ) === JSON.stringify( result.data ), "resulting token data does not match input" );
        });
        mocha_helper_1.it1(async function tinyToken_invalid_wrongSig() {
            const now = __.utc(); //.minus( { day: 7, second: 1 } );
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri, { expires: "7d", currentDate: now.toJSDate() }); // currentDate: new Date( Date.now() - ( ( 7 * 24 * 3600 ) - ( 1 * 60 ) ) * 1000 ) } ) );
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256.pub, { allowValidationFailure: true });
            log.throwCheck(result.isValid === false && result.isExpired === false && result.isSigValid === false, "verify result status checks abnormal");
        });
        mocha_helper_1.it1(async function tinyToken_validExpire1sFrom7dAgo() {
            const now = __.utc().minus({ day: 7 }).plus({ second: 1 });
            const token = await xlib.security.tinyToken.sign(tokenTestData, keyPair_P256_2.pri, { expires: "7d", currentDate: now.toJSDate() });
            const result = await xlib.security.tinyToken.verify(token, keyPair_P256_2.pub);
            log.throwCheck(result.isValid === true && result.isExpired === false && result.isSigValid === true, "verify result status checks abnormal");
            log.throwCheck(JSON.stringify(tokenTestData) === JSON.stringify(result.data), "resulting token data does not match input", tokenTestData, result.data);
        });
        mocha_helper_1.it1(async function jwt_ec_keyPair_basicE2e() {
            const token = await new __.bb((resolve, reject) => {
                xlib.security.jwt.sign(tokenTestData, keyPair_P256.pri, { algorithm: "ES256", expiresIn: "5m" }, (_err, encoded) => {
                    if (_err != null) {
                        reject(_err);
                        return;
                    }
                    resolve(encoded);
                });
            });
            // const tokenZipBuff = zlib.deflateRawSync( token );
            // const tokenZip = xlib.util.stringHelper.base64Url.encode( tokenZipBuff );
            //log.info( "verifying" );
            const result = await new __.bb((resolve, reject) => {
                xlib.security.jwt.verify(token, keyPair_P256.pub, {
                    algorithms: ["ES256"],
                }, (_err, decoded) => {
                    if (_err != null) {
                        reject(_err);
                        return;
                    }
                    resolve(decoded);
                });
            });
            //log.infoFull( "jwt_ec_keyPair_basicE2e done success", { dataLen: JSON.stringify( data ).length, tokenLen: token.length, token, result } );
        });
        mocha_helper_1.it2(async function jwt_keyPair_basicE2e() {
            return new __.bb((resolve, reject) => {
                //generate RSA key pair
                //from: https://stackoverflow.com/a/52775583/1115220
                xlib.security.crypto.generateKeyPair('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'spki',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'pem',
                        cipher: undefined,
                        passphrase: undefined,
                    }
                }, (err, publicKey, privateKey) => {
                    // Handle errors and use the generated key pair.
                    try {
                        log.throwCheck(err == null, "error encountered", err);
                        const testData = { hello: "world" };
                        //log.info( "signing" );
                        const jwtPayload = xlib.security.jwt.sign(testData, privateKey, { algorithm: "RS256" });
                        //log.info( "verifying" );
                        const resultData = xlib.security.jwt.verify(jwtPayload, publicKey, {
                            algorithms: ["RS256"],
                            clockTolerance: 600, maxAge: "5m"
                        });
                        log.throwCheck(resultData.hello === testData.hello, "data is wrong");
                        resolve();
                    }
                    catch (_err) {
                        reject(_err);
                    }
                });
                // const rsaPub = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfsPvbmKqU3kPfXn7fz/DS1N2O\nDlrn+2aFche4FacoHL7h16ZpVRFHNllaLO1OenasG8Z9ILZxgKg4s2R+j3ChXajC\nVzbj8MYENDyCne2tc2ztt7Q8HqF75J70LmQ6bLoG39Xadf6MpQYEqkCzkETWxxrL\nsXnPgOXaKY563y9ldQIDAQAB\n-----END PUBLIC KEY-----\n";
                // const rsaPri = "-----BEGIN PRIVATE KEY-----\nMIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAN+w+9uYqpTeQ99e\nft/P8NLU3Y4OWuf7ZoVyF7gVpygcvuHXpmlVEUc2WVos7U56dqwbxn0gtnGAqDiz\nZH6PcKFdqMJXNuPwxgQ0PIKd7a1zbO23tDweoXvknvQuZDpsugbf1dp1/oylBgSq\nQLOQRNbHGsuxec+A5dopjnrfL2V1AgMBAAECgYEAneC9MdVDeASTpOB97ZtG3pbs\ntGl/UcIHLuJCyWNG8jGvq5hX1Hn80uUSFWomJ0CZ54lHA2OGQP/MOxCqOgUlOPzO\nZxzTXZRLkpRc+RftMVEUU3qYF+0OFhXXQDYHSeudISwWe+Yd0eaBcBHifFB54cNo\n1bktZ4EjqZnKT/iy1BUCQQD6Q0VusaQRnCl7O8MZOEmSpy66HrnQxMpXuhA8d7Yn\nfQa284E5nJ8mWljiZ711jtwZfEdsedDQSzmWqIQsY+l7AkEA5NHFhpK6uUXxXs8e\nDetRPHcQYcRci/WjDkoqpxgczYamXyhh9066cq5QNyqF0HgwuKmvRGx2Zh0fOqw3\ntmphzwJAeIU3BcTkt1pWG7O/FAEoZUi/1v//CkwLCc5gDU61WTT7q9V+sQj9F9JA\npd/BvMBsvJU+LD5J0lW3yRckd+AxywJBAM6v5Vpfo6bDVPms4Jr2GlUhv3xwYKBT\n60t3FvwEPdAwdoux8Hvxc10vs2mBUYozZt8G9zg5OOGYIKNg+JofkeUCQQCIg2hk\naRPniqczmMKn+FuqGr2228w2snLhwIfAQMSI/Zd4/F+9Omn6jEWZqZ+/+XHbsNQ/\nA+bIgi4sCUHTuZ/t\n-----END PRIVATE KEY-----\n";
            });
        }).timeout(10000);
    });
    mocha_helper_1.it1(function testExceptions() {
        class MyException extends xlib.diagnostics.Exception {
            constructor() {
                super(...arguments);
                this.someVal = 22;
            }
        }
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
            log.throwCheck(_err instanceof Error);
            log.throwCheck(_err instanceof MyException);
            const err = xlib.diagnostics.toError(_err);
            log.throwCheck(err === _err, "because _err was an instanceOf Error, we should have gotten the same object back, but now strongly typed");
            log.throwCheck(err.message === "second   innerException: first"); //we include innerException message in the parent exception message
            if (err instanceof MyException) {
                log.throwCheck(err.innerError != null && err.innerError.message === "first");
            }
            const errCast = _err;
            const asJson1 = errCast.toJson();
            const asJson2 = xlib.diagnostics.errorToJson(_err);
            log.throwCheck(asJson1.someVal === 22);
            log.throwCheck(asJson2.someVal === 22);
            log.throwCheck(_.isEqual(asJson2, asJson1), "json vals should be equal");
            log.info("testExceptions", asJson1);
        }
    });
    mocha_helper_1.it1(function testUrlValidation() {
        let urlVal = new xlib.validation.UrlValidator("http://www.example.com:881");
        log.throwCheck(urlVal.isValid === true, "basic url should be valid", urlVal);
        urlVal = new xlib.validation.UrlValidator("data:text/html,<script>alert('hi');</script>");
        log.throwCheck(urlVal.isValid === true, "data url should be valid", urlVal);
        urlVal = new xlib.validation.UrlValidator("http://localhost:881");
        log.throwCheck(urlVal.isValid === false, "local url should be invalid", urlVal);
        urlVal = new xlib.validation.UrlValidator("http://localhost:881", { allowLocalhost: true });
        log.throwCheck(urlVal.isValid === true, "local url should be valid", urlVal);
    });
    mocha_helper_1.it1(function testLolo() {
        __.log.info(`the current time is ${__.utc().toISO()}`, { isDebug: __.isDebug() });
    });
    mocha_helper_1.it2(async function testStopwatch() {
        const stopwatch = new xlib.time.Stopwatch("unit test");
        __.log.throwCheck(stopwatch.getElapsed().valueOf() === 0);
        await xlib.promise.bluebird.delay(200);
        __.log.throwCheck(stopwatch.getElapsed().valueOf() === 0);
        stopwatch.start();
        await xlib.promise.bluebird.delay(2000);
        let elapsedMs = stopwatch.getElapsed().valueOf();
        __.log.throwCheck(elapsedMs > 0);
        stopwatch.stop();
        let elapsed = stopwatch.getElapsed();
        await xlib.promise.bluebird.delay(200);
        __.log.throwCheck(elapsed.valueOf() === stopwatch.getElapsed().valueOf());
        __.log.info("stopwatch is", elapsed.valueOf());
        __.log.throwCheck(elapsed.valueOf() >= 2000);
        __.log.throwCheck(elapsed.valueOf() < 2100);
        //restarting
        stopwatch.start();
        __.log.throwCheck(__.num.aboutEqual(stopwatch.valueOf(), 0, 100));
        __.log.throwCheck(elapsedMs > stopwatch.valueOf());
        __.log.throwCheck(stopwatch.isPaused === false);
        await __.bb.delay(10);
        elapsedMs = stopwatch.valueOf();
        log.info("restarted delay 10ms", stopwatch.toJson());
        stopwatch.pause();
        log.info("restarted aprox pause", stopwatch.toJson());
        __.log.throwCheck(stopwatch.isPaused);
        await __.bb.delay(200);
        log.info("restarted delay 200ms", stopwatch.toJson());
        log.throwCheck(__.num.aboutEqual(stopwatch.valueOf(), elapsedMs, 0.1, 100));
        elapsedMs = stopwatch.valueOf();
        log.throwCheck(elapsedMs === stopwatch.valueOf());
        stopwatch.unpause();
        log.info("unpause", stopwatch.toJson());
        __.log.throwCheck(stopwatch.isPaused === false);
        await __.bb.delay(1);
        log.info("delay 1", stopwatch.toJson());
        stopwatch.stop();
        log.info("stop", stopwatch.toJson());
        log.throwCheck(stopwatch.valueOf() > elapsedMs);
    }).timeout(3200);
    describe("serialization_module", function serialization_module() {
        class TestSymbol {
            constructor(name, someVal) {
                this.name = name;
                this.someVal = someVal;
            }
            toString() { return "TestSymbol"; }
        }
        mocha_helper_1.it1(function symbolInspection() {
            let testObj = { cache: 22.2, cash: 88.8, [Symbol("KEY")]: { name: "Jason", id: 123 }, dumbNotKey: Symbol("seekreet") };
            let parsedToInspect = xlib.serialization.jsonX.inspectStringify(testObj, { maxDepth: 999 });
            log.throwCheck(parsedToInspect.includes("Symbol(seekreet)") && parsedToInspect.includes("Symbol(KEY)") && parsedToInspect.includes("Jason"), "Symbol details are missing from jxons.inspectStringify() result", { parsed: parsedToInspect });
        });
    });
    describe("collection_module", function collection_module() {
        mocha_helper_1.it2(async function ExpiresMap_basic() {
            let inputMap = new Map();
            inputMap.set("null-expires-ok", "hello");
            inputMap.set("null-expires-ok", null);
            let expireMap = new xlib.collections.ExpiresMap(100, inputMap);
            //check for setting, and setting null
            log.throwCheck(expireMap.get("undefined-not-here") === undefined, "key should not have this key");
            log.throwCheck(expireMap.has("undefined-not-here") === false, "undefined is not a valid value");
            log.throwCheck(expireMap.get("null-expires-ok") === null, "key should have set null value");
            log.throwCheck(expireMap.has("null-expires-ok") === true, "null is a valid value");
            expireMap.set("del-immediate", "bye");
            log.throwCheck(expireMap.has("del-immediate"), "del-immediate key missing");
            expireMap.delete("del-immediate");
            log.throwCheck(expireMap.has("del-immediate") === false, "del-immediate  key should not be there");
            expireMap.set("persist-past-expire-check", "persist");
            await __.bb.delay(50);
            expireMap.set("persist-past-expire-check", "persist again");
            await __.bb.delay(50);
            expireMap.set("persist-past-expire-check", "persist again and again");
            await __.bb.delay(50);
            log.throwCheck(expireMap.has("null-expires-ok") === false, "still has key 'null-expires-ok'");
            log.throwCheck(expireMap.has("del-immediate") === false, "0 key should not exist");
            log.throwCheck(expireMap.has("persist-past-expire-check") === true, "key 1 should not have expired");
        });
    });
    mocha_helper_1.it2(async function testPerfTimer() {
        /** needs to stay 5 otherwise the assert check at the bottom of the test needs to be changed */
        const loops = 5;
        const loopSleepMs = 3;
        const logIntervalMs = undefined;
        const perfTimer = new xlib.time.PerfTimer({ autoLogIntervalMs: logIntervalMs, autoLogLevel: xlib.environment.LogLevel.WARN });
        const outsideWatch = perfTimer.start("outside");
        for (let i = 0; i < loops; i++) {
            const mainLoopWatch = perfTimer.start("mainLoop");
            for (let j = 0; j < loops; j++) {
                const innerA = perfTimer.start("innerA");
                for (let k = 0; k < loops; k++) {
                    const innerAA = perfTimer.start("innerAA");
                    await __.bb.delay(loopSleepMs);
                    innerAA.stop();
                }
                await __.bb.delay(loopSleepMs);
                innerA.stop();
            }
            for (let j = 0; j < loops; j++) {
                const innerB = perfTimer.start("innerB");
                await __.bb.delay(loopSleepMs);
                innerB.stop();
            }
            await __.bb.delay(loopSleepMs);
            mainLoopWatch.stop();
        }
        outsideWatch.stop();
        const { logData, rawData } = await perfTimer.logNowAndClear();
        __.log.throwCheck(Object.keys(logData).length <= 5, "too many keys.  why?");
        __.log.throwCheck(Object.keys(logData).length === 5 && logData["outside"] != null, "perfTimer.logNowAndClear() should have been awaited, giving other fulfilled promises from stopwatch('outside') a chance to finalize and be reported");
        __.log.throwCheck(logData["outside"].runs === 1 && logData["mainLoop"].runs === 5 && logData["innerAA"].runs === 125 && logData["innerA"].runs === 25 && logData["innerB"].runs === 25);
        __.log.throwCheck(rawData["mainLoop"].raw.length === 5);
    }).timeout(5000); //runs long
    mocha_helper_1.it1(function testQuartileCalculations() {
        const input = [500, 468, 454, 469];
        const quantiles = [0, 0.25, 0.5, 0.75, 1];
        const outputMathJs = xlib.numeric.mathjs.quantileSeq(input, quantiles, false);
        const inputDuration = input.map((val) => xlib.time.luxon.Duration.fromMillis(val));
        const outputTime = xlib.time.quantile(inputDuration);
        __.log.info("test quartile calculations mathjs", { input, quantiles, outputMathJs, outputTime });
        __.log.throwCheck(_.isEqual(outputMathJs, [454, 464.5, 468.5, 476.75, 500]));
        __.log.throwCheck(_.isEqual(outputMathJs, outputTime));
        __.log.throwCheck(xlib.numeric.mathjs.median(input) === outputMathJs[2], "expect mean to equal 50% quantile value");
        // 	const rejection = xlib.promise.bluebird.reject( "error string" );
        // 	__.log.throwIf( rejection.reason instanceof Error );
        // 	__.log.throwIf( ( rejection.reason() as Error ).message === "error string" );
    });
    mocha_helper_1.it2(async function autoscalerTest() {
        const chanceOfBusy = 0.01;
        const chanceOfFail = 0.01;
        const replyDelay = 30;
        const replyDelaySpread = 30;
        class TestAutoScaleError extends xlib.diagnostics.Exception {
            constructor(message, options) {
                super(message, options);
                this.shouldRejectBusy = options.shouldRejectBusy;
            }
        }
        let testScaler = new xlib.threading.Autoscaler({ busyGrowDelayMs: 100, busyExtraPenalty: 4, idleOrBusyDecreaseMs: 30, growDelayMs: 5, minParallel: 4 }, async (_chanceOfBusy, _chanceOfFail, _replyDelay, _replyDelaySpread) => {
            //this is the "backendWorker" that is being autoscaled
            let delay = _replyDelay + __.num.randomInt(0, _replyDelaySpread);
            await __.bb.delay(_replyDelay);
            const isBusy = __.num.randomBool(_chanceOfBusy);
            if (isBusy) {
                return xlib.promise.bluebird.reject(new TestAutoScaleError("backend busy", { shouldRejectBusy: true }));
            }
            const isFail = __.num.randomBool(_chanceOfFail);
            if (isFail) {
                return __.bb.reject(new TestAutoScaleError("backend failure", { shouldRejectBusy: false }));
            }
            return xlib.promise.bluebird.resolve("backend success");
        }, ((err) => {
            if (err.shouldRejectBusy === true) {
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
            // await xlib.promise.bluebird.each( awaitsArray, ( toInspect ) => {
            //  } );
            for (const toInspectPromise of awaitsArray) {
                // 	try {
                // 		const result = await awaitsArray[ i ];
                // 		__.log.throwIf( result === "backend success" );
                // 	} catch ( _err ) {
                // 		const err = xlib.diagnostics.toError( _err );
                // 		__.log.throwIf( err instanceof TestAutoScaleError );
                // 		__.log.throwIf( err.message === "backend failure" );
                // 	}
                const { toInspect } = await xlib.promise.awaitInspect(toInspectPromise).timeout((replyDelay + replyDelaySpread) + 5000, "reply took too long, while this could be because of debugging overhead, should investigate");
                __.log.throwCheck(toInspect.isResolved());
                if (toInspect.isFulfilled()) {
                    __.log.throwCheck(toInspect.value() === "backend success");
                }
                else {
                    const err = xlib.diagnostics.toError(toInspect.reason());
                    __.log.throwCheck(err instanceof TestAutoScaleError);
                    __.log.throwCheck(err.message === "backend failure");
                }
            }
        }
        finally {
            clearTimeout(handle);
        }
    }).timeout(10000); //end it()
}); //end describe()
//# sourceMappingURL=unsorted.test.js.map