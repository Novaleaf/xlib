import * as lodash from "lodash";
export { lodash };
declare global  {
    let _xlibConfigDefaults: {
        logLevel: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | undefined;
        envLevel: "PROD" | "PREPROD" | undefined;
        isTest: "TRUE" | "FALSE" | undefined;
        isDev: "TRUE" | "FALSE" | undefined;
        sourceMapSupport?: boolean;
        startupMessageSuppress?: boolean;
    };
}
import * as jsHelper from "./jshelper";
export { jsHelper };
import * as arrayHelper from "./arrayhelper";
export { arrayHelper };
import { ClassBase } from "./classbase";
export { ClassBase };
import * as logging from "./logging";
export { logging };
import * as exception from "./exception";
export { exception };
import * as collections from "./collections";
export { collections };
/** various math and numerical conversion/manipulation related helper functions */
import * as numHelper from "./numhelper";
export { numHelper };
import * as stringHelper from "./stringhelper";
export { stringHelper };
import * as reflection from "./reflection";
export { reflection };
import * as environment from "./environment";
export { environment };
import * as dateTime from "./datetime";
export { dateTime };
import * as validation from "./validation";
export { validation };
import * as serialization from "./serialization";
export { serialization };
import * as compression from "./compression";
export { compression };
import * as threading from "./threading";
export { threading };
import * as promise from "./promise";
export { promise };
import * as net from "./net";
export { net };
import * as cache from "./cache";
export { cache };
/** templates for various design patterns */
import * as designPatterns from "./design-patterns/_index";
export { designPatterns };
/** security and cryptographic helpers.   (cross-platform)
 *  note:  our ```KDF``` is nodejs only, and can be found in the ```nlib.security``` module.
 * */
import * as security from "./security";
export { security };
/** custom type definitions */
import * as definitions from "./definitions/_index";
export { definitions };
import * as lolo from "./lolo";
export { lolo };
/** exposes helper utilities meant for internal use. */
export import _internal = require("./internal/_index");
