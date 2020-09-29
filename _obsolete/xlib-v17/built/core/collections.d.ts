/** a Map extended to allow keys to expire a given time after setting. */
export declare class ExpiresMap<K, V> extends Map<K, V> {
    /** how long in Ms before an entity expires */
    expireMs: number | {
        valueOf(): number;
    };
    /** tracks expirations */
    private _handleMap;
    constructor(
    /** how long in Ms before an entity expires */
    expireMs: number | {
        valueOf(): number;
    }, 
    /** optionally allows pre-populating the map. these are still subject to expiration   */
    entries?: Iterable<[K, V]> | null);
    set(key: K, value: V): this;
    delete(key: K): boolean;
}
//# sourceMappingURL=collections.d.ts.map