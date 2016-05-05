
import moment = require("moment");
import Promise = require("bluebird");

/**
 * abstract class used for elements stored in the AtomicCache object
 */
export abstract class AtomicCacheItem<TValue, TModifyParams>{
				/** the last time this was synced with the datastore  max sync time is set by serverConfig.balance, and is 1 min. */
	private _lastSyncTime: moment.Moment;
	/** the last time this was used.  older than max sync time (1 minute) and we dispose */
	private _lastUsedTime: moment.Moment;

	private _syncPending: Promise<any> = Promise.resolve();

	/** read only:  the last time this was used */
	public get lastUsedTime() {
		return this._lastUsedTime;
	}
	/** private helper to know when we have read the state from datastore */
	private _isInitialized = false;
	/** private helper to know when this should not be used again */
	private _isDisposed = false;

	constructor(public key: string,
		/** max amount of time between uses of the cacheItem before we dispose it */
		protected _maxUnusedDuration: moment.Duration,
		/** max amount of time between sync's */
		protected _maxDesyncedDuration: moment.Duration,
		/** if set, and the first sync (during initialization) fails, all future .get() calls within the given duration will return rejected with the same error originally returned from sync.  
		This is useful if for example, the user requests a key that does not exist.
		If you use this, be sure you put retry logic into your doSyncWithMaster functions.
		*/
		protected _blacklistIfFirstSyncFailsDuration:moment.Duration = null) {


		this._lastUsedTime = moment();

		this._trySyncWithMaster();
	}

	/**
	 *  if it's time to resync
	 */
	protected isTimeToResync(): boolean {
		let now = moment();
		
		if (this._lastSyncTime.clone().add(this._maxDesyncedDuration) <= now) {
			//out of sync
			return true;
		}
		

		return false;
	}
	/**
	 *  if there is cached data to write
	 */
	protected abstract hasDataToWrite(): boolean;
	// {
	//	return false;
	//}

	/**
	 *  based on the cached value + any cached-to-write, but without knowing the actual "master" state, return the expected value.
	 */
	protected abstract calculateCurrentValue(): TValue;

	protected _blacklistIfFirstSyncFails_Timeout: moment.Moment;
	protected _blacklistIfFirstSyncFails_InitError: Error;
	/**
	 *  attempts to sync with master, if there is any sync work to be done
	 */
	private _trySyncWithMaster(forceSync: boolean = false): Promise<any> {

		if (this._syncPending.isResolved() !== true) {
			//another sync is in progress, so lets return that one's promise;
			return this._syncPending;
		}

		if (this._isInitialized !== true) {
			//this is the initialization
			//no need to do a full sync, just read
			this._syncPending = this.doSyncWithMaster_Helper_Read()
				.catch((initError) => {
					//handle _blacklistIfFirstSyncFails logic if set (via ctor)
					if (this._blacklistIfFirstSyncFailsDuration != null) {
						this._blacklistIfFirstSyncFails_Timeout = moment().add(this._blacklistIfFirstSyncFailsDuration);
						this._blacklistIfFirstSyncFails_InitError = initError;	
					}

					return Promise.reject(initError);
				})
				.then((readSyncResults) => {
					this._isInitialized = true;
					this._lastSyncTime = moment();
					if (this.hasDataToWrite() === true) {
						//async update a full sync
						this.doSyncWithMaster_Helper_Full().then(() => {
							this._lastSyncTime = moment();
						});
					}
					return Promise.resolve(readSyncResults);

				});
			return this._syncPending;
		} else {
			//already initialized

			if (this.hasDataToWrite() === true && (this.isTimeToResync() === true || forceSync === true)) {
				//time to sync and have data to write, so need to do full sync
				this._syncPending = this.doSyncWithMaster_Helper_Full()
					.then((fullResults) => {
						this._lastSyncTime = moment();
						return Promise.resolve(fullResults);
					});
				return this._syncPending;
			} else if (forceSync === true || this.isTimeToResync() === true) {
				//time to sync and have NO data to write, so just read
				this._syncPending = this.doSyncWithMaster_Helper_Read()
					.then((fullResults) => {
						this._lastSyncTime = moment();
						return Promise.resolve(fullResults);
					});
				return this._syncPending;
			} else {
				//no data to write and not desynced
				return Promise.resolve();
			}
		}


	}

	/**
	 *  do the actual work of syncing with master.
     * inside this function you should check if anything is needed to write, or if you are ok with just reading the master data
	 */
	protected abstract doSyncWithMaster_Helper_Full(): Promise<any>;

	protected abstract doSyncWithMaster_Helper_Read(): Promise<any>;


	public get(): Promise<TValue> {

		return Promise.try<TValue>(() => {
			if (this._isDisposed === true) {
				throw new Error("already disposed");
			}
			this._lastUsedTime = moment();

			if (this._blacklistIfFirstSyncFails_InitError != null) {
				if (this._blacklistIfFirstSyncFails_Timeout < moment()) {
					return Promise.reject(this._blacklistIfFirstSyncFails_InitError);
				} else {
					//clear out the error
					this._blacklistIfFirstSyncFails_InitError = null;
				}
			}
			//let toReturn: TValue;
			if (this._isInitialized !== true) {
				//no sync yet, so wait for that
				return this._trySyncWithMaster()

					.then(() => {
						//let currentData = this._creditBalance.data;
						let toReturn = this.calculateCurrentValue();
						return Promise.resolve(toReturn)
					});
			} else {
				//return current balance data
				let toReturn = this.calculateCurrentValue();

				this._trySyncWithMaster();

				return Promise.resolve(toReturn);
			}
		});
	}

	public getForceSync(): Promise<TValue> {
		if (this._isDisposed === true) {
			throw new Error("already disposed");
		}
		this._lastUsedTime = moment();
		if (this._blacklistIfFirstSyncFails_InitError != null) {
			if (this._blacklistIfFirstSyncFails_Timeout < moment()) {
				return Promise.reject(this._blacklistIfFirstSyncFails_InitError);
			} else {
				//clear out the error
				this._blacklistIfFirstSyncFails_InitError = null;
			}
		}
		return this._trySyncWithMaster(true)
			.then(() => {
				return this.get();
			});
	}

	public modify(params: TModifyParams): void {
		if (this._isDisposed === true) {
			throw new Error("already disposed");
		}
		this._lastUsedTime = moment();

		this.cacheModificationsLocally(params);

		if (this._blacklistIfFirstSyncFails_InitError != null) {
			if (this._blacklistIfFirstSyncFails_Timeout < moment()) {
				return;
			} else {
				//clear out the error
				this._blacklistIfFirstSyncFails_InitError = null;
			}
		}
		this._trySyncWithMaster(); //async attempt

	}

	/**
	 *  cache modifyParams for apply during this.calculateCurrentValue()  (which is also used when syncing with master)
	 * @param params
	 */
	protected abstract cacheModificationsLocally(params: TModifyParams): void;

	/**
 * if last use is too old, will return true and dispose.
 */
	public tryDisposeIfTooOld(forceDisposeNow = false): boolean {
		if (forceDisposeNow === true) {
			this._dispose();
			return true;
		}
		let disposeAfter = this._lastUsedTime.clone().add(this._maxUnusedDuration);
		if (disposeAfter >= moment()) {
			return false;
		}
		//dispose
		this._dispose();
		return true;

	}
	/**
	 * do a final sync with the master and mark this object as unusable
	 */
	private _dispose(): void {

		if (this._isDisposed === true) {
			throw new Error("already disposed");
		}
		this._isDisposed = true;


		if (this.hasDataToWrite() === true) {
			//do a final sync
			this._trySyncWithMaster();
		}


	}

}

/**
 *  allows for local caching of values, plus ability to atomically synchronize modifications with the master
 *  this pattern is known to work with google datastore (via transactions) so can probably be adapted to anything else too.
 * this is useful for data that is tollerant of eventual-consistency.  not so useful as-is for immediate/atomic consistency needs.
 */
export class AtomicCache<CacheItem extends AtomicCacheItem<any, any>, TValue, TModifyParams> {


	constructor(private _cacheItemCtor: (key: string) => CacheItem, private _autoTryCleanupInterval: moment.Duration) {
		setInterval(() => {
			this._tryCleanupOne();
		}, this._autoTryCleanupInterval.asMilliseconds());
	}

	private _storage: { [key: string]: CacheItem } = {};

	private _nextInspectIndex: number = 0;
	private _inspectKeys: string[] = [];

	private _tryCleanupOne(/** set to true to force cleaning up all keys immediately  for testing "new apiKey" roundtrip times.  default false. */ testingForceDispose = false) {

		if (this._nextInspectIndex >= this._inspectKeys.length) {
			//past end, re-aquire
			this._nextInspectIndex = 0;
			this._inspectKeys = Object.keys(this._storage);
		}
		if (this._inspectKeys.length < 1) {
			return; //nothing to do;
		}

		//try to clean up (dispose) an item that's too old
		let currentIndex = this._nextInspectIndex;
		this._nextInspectIndex++;
		let key = this._inspectKeys[currentIndex];
		
		if (this._storage[key].tryDisposeIfTooOld(testingForceDispose) === true) {
			delete this._storage[key];

			//since we clean up 1, try to clean another (keep going till we hit 1 that doesn't cleanup)
			setTimeout(() => {
				//log.info("disposing " + key);
				return this._tryCleanupOne(testingForceDispose);
			});
		}

	}

	private _getItem(key: string): CacheItem {
		let item = this._storage[key];

		if (item == null || item.tryDisposeIfTooOld() === true) {
			item = this._cacheItemCtor(key);// new CacheItem(key);
			this._storage[key] = item;
		}
		return item;
	}


	public getTestForceNew(key: string): Promise<TValue> {
		let item = this._getItem(key);

		let toReturn = item.get().then((value) => {

			setTimeout(() => {
				this._tryCleanupOne(true);
			});

			return value;
		});
		//force invalidate to test
		//item.lastUsedTime = moment(0);
		//item._dispose();



		return toReturn;
	}


	public get(apiKey: string): Promise<TValue> {
		let item = this._getItem(apiKey);

		let toReturn = item.get().then((value) => {

			setTimeout(() => {
				this._tryCleanupOne();
			});

			return value;
		});



		return toReturn;
	}


	public getForceRefresh(apiKey: string): Promise<TValue> {
		let item = this._getItem(apiKey);

		let toReturn = item.getForceSync().then((value) => {

			setTimeout(() => {
				this._tryCleanupOne();
			});

			return value;
		});

		return toReturn;
	}

	public modify(key: string, params: TModifyParams): Promise<TValue> {
		let item = this._getItem(key);

		item.modify(params);

		//let toReturn = item.getBalance();

		//this._tryCleanupOne();

		//return toReturn;
		//

		return item.get();
	}



}