"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** a Map extended to allow keys to expire a given time after setting. */
class ExpiresMap extends Map {
    constructor(
    /** how long in Ms before an entity expires */
    expireMs, 
    /** optionally allows pre-populating the map. these are still subject to expiration   */
    entries) {
        super();
        this.expireMs = expireMs;
        /** tracks expirations */
        this._handleMap = new Map();
        if (entries != null) {
            for (const [key, val] of entries) {
                this.set(key, val);
            }
        }
    }
    set(key, value) {
        //remove existing handle, if any
        {
            const handle = this._handleMap.get(key);
            if (handle != null) {
                clearTimeout(handle);
            }
        }
        super.set(key, value);
        //set new handle
        {
            const handle = setTimeout(() => {
                clearTimeout(handle);
                this._handleMap.delete(key);
                this.delete(key);
            }, this.expireMs.valueOf());
            this._handleMap.set(key, handle);
        }
        return this;
    }
    delete(key) {
        //remove existing handle, if any
        {
            const handle = this._handleMap.get(key);
            if (handle != null) {
                clearTimeout(handle);
            }
            this._handleMap.delete(key);
        }
        return super.delete(key);
    }
}
exports.ExpiresMap = ExpiresMap;
//# sourceMappingURL=collections.js.map