"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const atomicCache = tslib_1.__importStar(require("./atomic-cache"));
exports.atomicCache = atomicCache;
/** @deprecated but made available for backcompat */
exports.ClassBase = require("./classbase");
exports.collections = require("./collections");
exports.cache = require("./cache");
// /**
//  * allows describing user input as a Class instead of a POJO, and enforces conformance of the class via templates.
//  */
// export abstract class PayloadTemplate<TThis>{
//     constructor( jsonPayload?: string | Buffer, templateObj?: TThis,
//         /** defaults: {parseOrphans:false,pruneOrphans:true,sanitizeStrings:true,maxInputLength:5000} 
//         set to FALSE to not parse
//         */
//         templateParseOptions?: {
//             reviver?: ( key: any, value: any ) => any;
//             /** if true, an object can be passed in, not just a string or Buffer */
//             allowObjectInput?: boolean;
//             /** if true, attempts to parse any additional strings found in the input (and does this recursively) */
//             parseOrphans?: boolean;
//             /** if true, deletes any orphans found.  default = TRUE */
//             pruneOrphans?: boolean;
//             /** if true, will escape strings to prevent injection attacks.  default false.   to ignore pruning of a node's children, set that node to null.  ex: ```myTemplate.userTags=null``` */
//             escapeStrings?: boolean,
//             /** if set, throws an exception if the input is too long.  default=5000 */
//             maxInputLength?: number;
//             /** true to not validate that all template fields are present.  default=false*/
//             skipValidation?: boolean;
//         }
//     ) {
//         if ( jsonPayload == null ) {
//             return;
//         }
//         if ( templateParseOptions == null ) {
//             templateParseOptions = {}
//         }
//         lodash.defaults( templateParseOptions, { parseOrphans: false, pruneOrphans: true, escapeStrings: false, maxInputLength: 5000, skipValidation: false, } );
//         let parsedObj: any;
//         if ( templateObj != null ) {
//             parsedObj = serialization.JSONX.parseUsingTemplate( templateObj, jsonPayload, templateParseOptions );
//         } else {
//             parsedObj = serialization.JSONX.parse( jsonPayload );
//         }
//         lodash.assign( this, parsedObj );
//         if ( templateParseOptions.skipValidation !== true ) {
//             validation.scrub( this ).isTemplatePopulated( templateObj ).failThrow();
//         }
//     }
// }
//# sourceMappingURL=_index.js.map