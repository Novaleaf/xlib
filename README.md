# A Base Platform Library for Typescript.  Cross Platform.
*Kitchen sink included.*

Xlib is Typescript's answer to .Net's Core Library.  It is not a 1:1 translation of mscorlib, but rather a collection of functions and features you'll use every day in your JavaScript code.

--------
# Status: BETA, Active Development (May 5, 2016)

**xlib** has been used as the BCL for high quality production systems, including [PhantomJs Cloud](https://PhantomJsCloud.com), so feel free to use it now!   However, some reorganizing is still occuring as I translate it from a private lib to a npm published one.  I recommend you do not take a hard dependency on it until v1.0.0 is released (a few days)


## Designed for
1. Browser: Chrome.  works in all browsers (IE9+) via Browserify/Webpack, but the ```logging``` output is most pretty in Chrome.
2. Node: Tested with 0.12 to 6.0.0
3. Typescript: xlib is written in Typescript, and designed with it in mind.

## Use with Typescript (intellisense typings)

External module type definitions in Typescript is a complete mess.  to use xlib with typescript intellisence you will need to do the following:

1. ```npm install typings --global```
2. ```typings install --save --ambient async axios d3-dsv decimal.js json5 node sanitize-html sprintf-js```
3. ```typings install --save bluebird chalk jsonwebtoken lodash validator```

lets hope this gets fixed in typescript 2.0


## Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + usability to the Javascript (and Typescript!) world.
