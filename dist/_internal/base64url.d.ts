/// <reference types="node" />
/**
 *  Converting to, and from, base64url https://en.wikipedia.org/wiki/Base64#RFC_4648
example:   base64=```'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='``` base64Url=```'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'```
uses the npm package: https://www.npmjs.com/package/base64url
 */
declare module base64Url {
    /** base64url encode stringOrBuffer
    ```
    Example

> base64url('ladies and gentlemen, we are floating in space')
'bGFkaWVzIGFuZCBnZW50bGVtYW4sIHdlIGFyZSBmbG9hdGluZyBpbiBzcGFjZQ'
    ```*/
    function encode(input: string | Buffer, encoding?: string): string;
    /** Convert a base64url encoded string into a raw string. Encoding defaults to 'utf8'.
    ```
    > base64url.decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg')
'ride: dreams burn down'
    ```*/
    function decode(base64url: string, encoding?: string): string;
    /** Convert a base64url encoded string to a base64 encoded string
    ```
> base64url.toBase64('qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA')
'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='
    ```
    */
    function toBase64(base64url: string | Buffer): string;
    /** Convert a base64 encoded string to a base64url encoded string

Example
    ```
> base64url.fromBase64('qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA==')
'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'
    ```
    */
    function fromBase64(base64: string): string;
    /**
    Convert a base64url encoded string to a Buffer
    ```
> base64url.toBuffer('c3Bpcml0dWFsaXplZA')
<Buffer 73 70 69 72 69 74 75 61 6c 69 7a 65 64>
    ```*/
    function toBuffer(base64url: string): Buffer;
}
export = base64Url;
