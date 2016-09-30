/// <reference types="node" />
/** base64url encode stringOrBuffer
```
Example

> base64url('ladies and gentlemen, we are floating in space')
'bGFkaWVzIGFuZCBnZW50bGVtYW4sIHdlIGFyZSBmbG9hdGluZyBpbiBzcGFjZQ'
```*/
export declare function encode(input: string | Buffer, encoding?: string): string;
/** Convert a base64url encoded string into a raw string. Encoding defaults to 'utf8'.
```
> base64url.decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg')
'ride: dreams burn down'
```*/
export declare function decode(base64url: string, encoding?: string): string;
/** Convert a base64url encoded string to a base64 encoded string
```
> base64url.toBase64('qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA')
'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='
```
*/
export declare function toBase64(base64url: string | Buffer): string;
/** Convert a base64 encoded string to a base64url encoded string

Example
```
> base64url.fromBase64('qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA==')
'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'
```
*/
export declare function fromBase64(base64: string): string;
/**
Convert a base64url encoded string to a Buffer
```
> base64url.toBuffer('c3Bpcml0dWFsaXplZA')
<Buffer 73 70 69 72 69 74 75 61 6c 69 7a 65 64>
```*/
export declare function toBuffer(base64url: string): Buffer;
