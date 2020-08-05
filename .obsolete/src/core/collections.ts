// tslint:disable: no-bitwise
import numHelper = require( "./_util/numhelper" );
import diagnostics = require( "./diagnostics" );

/** a Map extended to allow keys to expire a given time after setting. */
export class ExpiresMap<K, V> extends Map<K, V>{

	/** tracks expirations */
	private _handleMap: Map<K, NodeJS.Timeout> = new Map();


	constructor(
		/** how long in Ms before an entity expires */
		public expireMs: number | { valueOf(): number; },
		/** optionally allows pre-populating the map. these are still subject to expiration   */
		entries?: Iterable<[ K, V ]> | null
	) {
		super();
		if ( entries != null ) {
			for ( const [ key, val ] of entries ) {
				this.set( key, val );
			}
		}

	}

	public set( key: K, value: V ): this {

		//remove existing handle, if any
		{
			const handle = this._handleMap.get( key );
			if ( handle != null ) {
				clearTimeout( handle );
			}
		}
		super.set( key, value );

		//set new handle
		{
			const handle = setTimeout( () => {


				clearTimeout( handle );
				this._handleMap.delete( key );
				this.delete( key );
			}, this.expireMs.valueOf() );
			this._handleMap.set( key, handle );
		}

		return this;
	}

	public delete( key: K ) {
		//remove existing handle, if any
		{
			const handle = this._handleMap.get( key );
			if ( handle != null ) {
				clearTimeout( handle );
			}
			this._handleMap.delete( key );
		}
		return super.delete( key );
	}
}
