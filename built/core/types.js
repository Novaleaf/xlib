"use strict";
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//! Below are types useful for advanced mixin/union type creation.  See ```exception.errorToJson``` for an example usage.
//! * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection)
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map