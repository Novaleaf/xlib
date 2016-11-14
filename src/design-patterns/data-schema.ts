


/** for all supported db types, see: https://cloud.google.com/datastore/docs/concepts/entities#properties_and_value_types		
*/
export type DbType = "string" | "double" | "integer" | "boolean" | "date" | "blob" | "none";


export interface IPropertySchema<TValue> {

	//value?: TValue; //move runtime values to a seperate "entity" type
	default?: TValue;
	/** if input (and store) of this field is optional.  if so, then will store NULL on the database for this property if it is not set. */
	isOptional?: boolean;
	/** if this field is hidden from user input (set on the server side).  note that if both .isOptional and .isHidden are true, it means the property is required to be set on the server before writing to the db. */
	isHidden?: boolean;
	/** how this should be stored in the database.   use "none" to not store the field in the db */
	dbType: DbType;
	/** by default all properties are indexed (add +1x the entity size for each indexed field!  expensive!)  so you can disable this for properties that you know are not going to be sorted by, if a large number of entities of that kind need to be stored. */
	isDbIndexExcluded?: boolean;

	/** can set an optional input format, used when using the react-jsonschema-form react plugin.   used as it's "type" field. */
	inputType?: string;
}


export interface IStringProperty extends IPropertySchema<string> {
	inputType?: "textarea" | "password" | "color" | "text";
	inputFormat?: "email" | "uri" | "data-url" | "date" | "date-time";
	dbType: "string" | "none";
	/** if true, keeps empty strings, otherwise converts to null */
	allowEmpty?: boolean;
}
export interface IDateProperty extends IPropertySchema<Date> {
	inputType?: "text";
	inputFormat: "date" | "date-time";
	dbType: "date" | "none";
}

export interface INumberProperty extends IPropertySchema<number> {
	dbType: "double" | "integer" | "none";
	inputType?: "updown" | "range" | "text";
	minimum?: number;
	maximum?: number;
	multipleOf?: number;
}

export interface IDoubleProperty extends INumberProperty {
	dbType: "double" | "none";
}
export interface IIntegerProperty extends INumberProperty {
	dbType: "integer" | "none";
}

export interface ISchema { //<TData, TEntity extends IEntity<TData>> {

	properties: {
		[propertyName: string]: IPropertySchema<any>;
	}

	db: {
		kind: string;
		/** default false.   if true, will not raise errors on invalid schema from the database reads/writes */
		suppressInvalidSchemaErrors?: boolean;
		/** default false.   if true, will raise an error if the namespace is not specified */
		isNamespaceRequired?: boolean;
	}

	//entityTemplate: TEntity

}



