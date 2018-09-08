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
const promise = require("./core/promise");
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.initialize = initialize;
;
function onInitializeComplete() {
    return __awaiter(this, void 0, void 0, function* () { });
}
exports.onInitializeComplete = onInitializeComplete;
;
const isInitialized = promise.CreateExposedPromise();
const initWorkArray = [];
function onInitializeStarted(/**if your code needs to do asynchronous work during initialize, initialize won't finish until the promise is resolved. */ initWork) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isInitialized.isResolved()) {
            throw new Error("initialize already finished and you are trying to schedule init work");
        }
        if (initWork != null) {
            initWorkArray.push(initWork);
        }
        return isInitialized;
    });
}
exports.onInitializeStarted = onInitializeStarted;
//# sourceMappingURL=init.js.map