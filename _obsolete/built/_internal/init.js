"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/** allows internal xlib modules to hook the xlib.initialize() method */
const promise = tslib_1.__importStar(require("../core/promise"));
var bb = promise.bluebird;
let isStarted = false;
function isInitializeStarted() {
    return isStarted;
}
exports.isInitializeStarted = isInitializeStarted;
/** resolves when xlib is fully initialized */
exports.finishedPromise = promise.CreateExposedPromise();
const initWorkArray = [];
async function initialize(args) {
    args = { ...args };
    if (isStarted) {
        throw new Error("initialize already started and trying to start it again");
    }
    isStarted = true;
    for (let i = 0; i < initWorkArray.length; i++) {
        const initWork = initWorkArray[i];
        if (typeof initWork === "function") {
            await bb.method(initWork)(args);
        }
        else {
            await bb.resolve(initWork);
        }
    }
    exports.finishedPromise.fulfill(args);
}
exports.initialize = initialize;
/** do work during the .initialize() call.   returning promise yields once all initialize work is complete. */
async function onInitialize(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork) {
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
    return exports.finishedPromise;
}
exports.onInitialize = onInitialize;
//# sourceMappingURL=init.js.map