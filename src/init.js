"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/** allows internal xlib modules to hook the xlib.initialize() method */
const promise = require("./core/promise");
var bb = promise.bluebird;
let isStarted = false;
const finishedPromise = promise.CreateExposedPromise();
const initWorkArray = [];
function initialize(args) {
    return __awaiter(this, void 0, void 0, function* () {
        args = Object.assign({}, args);
        if (isStarted) {
            throw new Error("initialize already started and trying to start it again");
        }
        isStarted = true;
        for (let i = 0; i < initWorkArray.length; i++) {
            const initWork = initWorkArray[i];
            if (typeof initWork === "function") {
                yield bb.method(initWork)(args);
            }
            else {
                yield bb.resolve(initWork);
            }
        }
        finishedPromise.fulfill(args);
    });
}
exports.initialize = initialize;
;
/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
function onInitialize(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isStarted) {
            throw new Error("initialize already started and you are trying to schedule init work");
        }
        if (initWork != null) {
            initWorkArray.push(initWork);
            // if ( typeof initWork === "function" ) {
            //     initWorkArray.push( bb.try( initWork ) );
            // } else {
            //     initWorkArray.push( bb.resolve( initWork ) );
            // }
        }
        return finishedPromise;
    });
}
exports.onInitialize = onInitialize;
//# sourceMappingURL=init.js.map