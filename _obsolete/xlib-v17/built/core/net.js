"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const diagnostics = tslib_1.__importStar(require("./diagnostics"));
const log = diagnostics.log; // new diagnostics.Logger( __filename );
//import compression = require("./compression");
//export import axios = require("axios");
const axios = tslib_1.__importStar(require("axios"));
exports.axios = axios;
const remote_http_endpoint_1 = require("./_net/remote-http-endpoint");
exports.RemoteHttpEndpoint = remote_http_endpoint_1.RemoteHttpEndpoint;
//module _test {
//	describe(__filename, () => {
//		describe("EzEndpoint", () => {
//			describe("success cases", () => {
//				let test: any = it("basic ezEndpoint, roundtrip phantomjscloud", () => {
//					const testEzEndpoint = new EzEndpoint<any, any>({ origin: "http://phantomjscloud.com", path: "/api/browser/v2/a-demo-key-with-low-quota-per-ip-address/" }, { timeout: 3000, interval: 100, backoff: 3 }, {}, );
//					const targetUrl = "https://example.com";
//					const requestPayload = {
//						pages: [
//							{
//								url: targetUrl,
//								renderType: "html",
//								outputAsJson: true,
//							}
//						],
//					};
//					return testEzEndpoint.post(requestPayload)
//						.then((response) => {
//							log.assert(response.status === 200, "should get success response", { response });
//							log.assert(targetUrl === response.data.pageResponses[0].pageRequest.url, "response contents should contain a value of response.data.pageResponses[0].pageRequest.url that matchest targetUrl", { targetUrl, gotTargetUrl: response.data.pageResponses[0].pageRequest.url, response });
//						}, (err) => {
//							const axiosErr = err as _axiosDTs.AxiosErrorResponse<void>;
//							throw log.error("did not expect an axiosErr", { err });
//						});
//				});
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);
//			});
//			describe("fail cases", () => {
//				let test: any = it("basic retry, 429 error", () => {
//					const testEzEndpoint = new EzEndpoint<void, void>({ origin: "http://phantomjscloud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {}, );
//					return testEzEndpoint.post()
//						.then((response) => {
//							throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
//						}, (err) => {
//							const axiosErr = err as _axiosDTs.AxiosErrorResponse<void>;
//							if (axiosErr.response != null) {
//								log.assert(axiosErr.response.status === 429, "should have failed with 429 response", { axiosErr });
//							} else {
//								throw log.error("expected a axiosErr but didn't get one", { err })
//							}
//						});
//				})
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);
//				test = it("invalid domain", () => {
//					const testEzEndpoint = new EzEndpoint<void, void>({ origin: "http://asdfasdfasdfasetasgoud.com", path: "/examples/helpers/statusCode/429" }, { timeout: 1000, interval: 100, backoff: 3 }, {}, );
//					return testEzEndpoint.post()
//						.then((response) => {
//							throw log.errorAndThrowIfFalse(response.status === 429, "should have failed with 429 response", { response });
//						}, (err) => {
//							//TODO: describe EzEndpoint fail error type, and add error definitions to bluebird
//							// // // // 	export interface AxiosErrorResponse<T> extends Error {
//							// // // // 	/** inherited from the Error object*/
//							// // // // 	name: "Error";
//							// // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
//							// // // // 	message: string;
//							// // // // 	/**
//							// // // // 	 * config that was provided to `axios` for the request
//							// // // // 	 */
//							// // // // 	config: AxiosXHRConfig<T>;
//							// // // // 	/** The server response.  ```undefined``` if no response from server (such as invalid url or network timeout */
//							// // // // 	response?: AxiosXHR<T>;
//							// // // // 	/** example ```ETIMEDOUT```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	code?: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // failure?:{
//							// // // // 	name:string;
//							// // // // 	/**human readable error message, such as ```getaddrinfo ENOTFOUND moo moo:443``` or ```Request failed with status code 401``` */
//							// // // // 	message: string;
//							// // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	code: string;
//							// // // // 	/** example ```ENOTFOUND```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	errno: string;
//							// // // // 	/** example ```getaddrinfo```, but only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	syscall: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	hostname: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	host: string;
//							// // // // 	/** only set if unable to get response from server.  otherwise does not exist (not even undefined!). */
//							// // // // 	port: number;
//							// // // // };
//						});
//				})
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);
//			});
//		});
//		describe("axios", () => {
//			const targetUrl = "http://phantomjscloud.com/examples/helpers/requestdata";
//			const samplePostPayload1 = { hi: 1, bye: "two", inner: { three: 4 } };
//			const sampleHeader1 = { head1: "val1" };
//			describe("success cases", () => {
//				it("basic e2e", () => {
//					return axios.post(targetUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							log.assert(axiosResponse.config != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.data != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.headers != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.status != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.statusText != null, "missing property", { axiosResponse });
//							log.assert(axiosResponse.status === 200, "status code wrong", { axiosResponse });
//							return Promise.resolve();
//						});
//				});
//			});
//			describe("fail cases", () => {
//				it("basic fail e2e", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/400", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 400 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.config != null, "missing property config", { err });
//							log.assert(err.message != null, "missing property message", { err });
//							log.assert(err.name != null, "missing property name", { err });
//							log.assert(err.response != null, "missing property response", { err });
//							log.assert(err.stack != null, "missing property stack", { err });
//							log.assert(err.response.config != null, "missing property response.config", { err });
//							log.assert(err.response.data != null, "missing property response.data", { err });
//							log.assert(err.response.headers != null, "missing property response.headers", { err });
//							log.assert(err.response.status != null, "missing property response.status ", { err });
//							log.assert(err.response.statusText != null, "missing property response.statusText", { err });
//							log.assert(err.response.status === 400, "wrong status code.", { err });
//							return Promise.resolve();
//						});
//				});
//				const badUrl = "http://moo";
//				let test: any = it("invlid url", () => {
//					return axios.post(badUrl, samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with invalid url", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							//log.info("got error as expected", { err });
//							return Promise.resolve();
//						});
//				});
//				// set timeout increase (default=2000ms) https://mochajs.org/#timeouts
//				test.timeout(5000);
//				it("status 401 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/401", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 401 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 401, "wrong status code.", { err });
//							return Promise.resolve();
//						});
//				});
//				it("status 429 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/429", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 429 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 429, "wrong status code.", { err });
//							return Promise.resolve();
//						});
//				});
//				it("status 500 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/500", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 500, "wrong status code.", { err });
//							return Promise.resolve();
//						});
//				});
//				it("status 503 response", () => {
//					return axios.post("http://phantomjscloud.com/examples/helpers/statusCode/503", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//						.then((axiosResponse) => {
//							throw log.error("should have failed with 503 error", { badUrl, axiosResponse });
//						})
//						.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//							if (err.response == null) {
//								throw log.error("response should be defined", { err });
//							}
//							log.assert(err.response.status === 503, "wrong status code.", { err });
//							return Promise.resolve();
//						});
//				});
//				//it("network timeout", () => {
//				//	return axios.post("https://localhost:827", samplePostPayload1, { headers: sampleHeader1, responseType: "json" })
//				//		.then((axiosResponse) => {
//				//			throw log.error("should have failed with 500 error", { badUrl, axiosResponse });
//				//		})
//				//		.catch((err: _axiosDTs.AxiosErrorResponse<any>) => {
//				//			if (err.response == null) {
//				//				throw log.error("response should be defined", { err });
//				//			}
//				//			log.assert(err.response.status === 500, "wrong status code.", { err });
//				//			return Promise.resolve();
//				//		});
//				//});
//			});
//		});
//	});
//}
//# sourceMappingURL=net.js.map