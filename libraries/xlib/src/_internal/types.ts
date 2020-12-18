
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 	// 	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//! Below are types useful for advanced mixin/union type creation.  See ```exception.errorToJson``` for an example usage.
//! * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection)

/** returns props shared by both types.  When both types have the same properties, ```TPri```'s is used.  (does not union property types)
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection) */
export type PropsIntersection<TPri, TSec> = { [ K in keyof TPri & keyof TSec ]: TPri[ K ] };

/** returns props unique to ```TPri``` (not found in ```TSec```) 
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection) */
export type PropsUnique<TPri, TSec> = PropsRemove<{ [ K in keyof TPri ]: K extends keyof TSec ? never : TPri[ K ] }>;


/** helper that returns prop names except those to filter.  This helper type is needed to actually remove the prop, as otherwise the prop still exists in the type just as "never". 
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection) */
// eslint-disable-next-line @typescript-eslint/naming-convention
type _PropsRemove_Helper_Name<TTarget, TPropToRemove> = { [ K in keyof TTarget ]: TTarget[ K ] extends TPropToRemove ? never : K }[ keyof TTarget ];
/** remove props of the given type.   always removes ```never``` type props.  if no ```TPropToRemove``` is provided, removes just ```never``` type props.
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection) */
export type PropsRemove<TTarget, TPropToRemove = never> = Pick<TTarget, _PropsRemove_Helper_Name<TTarget, TPropToRemove>>;

//export type PropsRemoveSimple<TTarget, PropTy> = Pick<TTarget, { [ K in keyof TTarget ]: TTarget[ K ] extends PropTy ? never : K }[ keyof TTarget ]>;

/** returns union of both types.  When both types have the same properties, ```TPri```'s is used.  (does not union property types)
 * 
 * ***BUG NOTE*** due to a bug in Typescript, this does not work on types with index signatures.  See: https://github.com/Microsoft/TypeScript/issues/30293   As a **workaround**,  usually with this ```PropsUnion``` type you can remove your index signature.  But if you still need it and control the object, move your index sig to a explicit property (like a ```tags``` collection)
*/
export type PropsUnion<TPri, TSec> = TPri & PropsUnique<TSec, TPri>;


type DeepPartial<T> = {
	[ P in keyof T ]?: DeepPartial<T[ P ]>
}
