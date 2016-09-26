﻿
//copied source code from the npm package: https://www.npmjs.com/package/base64url on 20160926.
//why:  because that npm package used the old "typings" system and it causes visual studio to error on virtual projects.

/**
 *  Converting to, and from, base64url https://en.wikipedia.org/wiki/Base64#RFC_4648
example:   base64=```'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='``` base64Url=```'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA'```
uses the npm package: https://www.npmjs.com/package/base64url
 */
module base64Url {

    function padString(input: string): string {
        let segmentLength = 4;
        let stringLength = input.length;
        let diff = stringLength % segmentLength;

        if (!diff) {
            return input;
        }

        let position = stringLength;
        let padLength = segmentLength - diff;
        let paddedStringLength = stringLength + padLength;
        let buffer = new Buffer(paddedStringLength);

        buffer.write(input);

        while (padLength--) {
            buffer.write("=", position++);
        }

        return buffer.toString();
    }

    /** base64url encode stringOrBuffer 
    ```
    Example

> base64url('ladies and gentlemen, we are floating in space')
'bGFkaWVzIGFuZCBnZW50bGVtYW4sIHdlIGFyZSBmbG9hdGluZyBpbiBzcGFjZQ'
    ```*/
    export function encode(input: string | Buffer, encoding: string = "utf8"): string {
        if (Buffer.isBuffer(input)) {
            return fromBase64(input.toString("base64"));
        }
        return fromBase64(new Buffer(input as string, encoding).toString("base64"));
    };

    /** Convert a base64url encoded string into a raw string. Encoding defaults to 'utf8'. 
    ```
    > base64url.decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg')
'ride: dreams burn down'
    ```*/
    export function decode(base64url: string, encoding: string = "utf8"): string {
        return new Buffer(toBase64(base64url), "base64").toString(encoding);
    }


    /** Convert a base64url encoded string to a base64 encoded string
    ```
> base64url.toBase64('qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA')
'qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA=='
    ```
    */
    export function toBase64(base64url: string | Buffer): string {
        // We this to be a string so we can do .replace on it. If it's
        // already a string, this is a noop.
        base64url = base64url.toString();
        return padString(base64url)
            .replace(/\-/g, "+")
            .replace(/_/g, "/");
    }

    /** Convert a base64 encoded string to a base64url encoded string

Example
    ```
> base64url.fromBase64('qL8R4QIcQ/ZsRqOAbeRfcZhilN/MksRtDaErMA==')
'qL8R4QIcQ_ZsRqOAbeRfcZhilN_MksRtDaErMA' 
    ```
    */
    export function fromBase64(base64: string): string {
        return base64
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }

    /**
    Convert a base64url encoded string to a Buffer
    ```
> base64url.toBuffer('c3Bpcml0dWFsaXplZA')
<Buffer 73 70 69 72 69 74 75 61 6c 69 7a 65 64>
    ```*/
    export function toBuffer(base64url: string): Buffer {
        return new Buffer(toBase64(base64url), "base64");
    }
}

export = base64Url;


//export interface Base64Url {
//    (input: string | Buffer, encoding?: string): string;
//    encode(input: string | Buffer, encoding?: string): string;
//    decode(base64url: string, encoding?: string): string;
//    toBase64(base64url: string | Buffer): string;
//    fromBase64(base64: string): string;
//    toBuffer(base64url: string): Buffer;
//}

//let base64url = encode as Base64Url;

//base64url.encode = encode;
//base64url.decode = decode;
//base64url.toBase64 = toBase64;
//base64url.fromBase64 = fromBase64;
//base64url.toBuffer = toBuffer;

//export = base64url;



    