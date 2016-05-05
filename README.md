# A Base Platform Library for Typescript.  Cross Platform.
*Kitchen sink included.*

Xlib is Typescript's answer to .Net's Core Library.  It is not a 1:1 translation of mscorlib, but rather a collection of functions and features you'll use every day in your JavaScript code.

--------
# Status: UNSTABLE, Active Development (May 5, 2016)

This project should work as a normal, javascript NPM module, but has not been tested yet.   Testing will be done in the next day or two.   

Typescript Typings is still being worked on, and is consiered ***not usable*** for typescript right now.   Hopefully this will change in the next day or two (20160505)


## Designed for
1. Browser: Chrome.  works in all browsers (IE9+) via Browserify/Webpack, but the ```logging``` output is most pretty in Chrome.
2. Node: Tested with 0.12 to 6.0.0
3. Typescript: xlib is written in Typescript, but due to the way external typings are *(not)* handled in TS, you will need to use the ```Typings``` project to get typings.  ***this is a work in progress, not done yet***

## Use with Typescript (intellisense typings)

external module type definitions in Typescript is a complete mess.  to use xlib with intellisence you will need to do the following:

1. ```npm install typings --global```
2. ```typings install --save --ambient async axios d3-dsv decimal.js json5 node sanitize-html sprintf-js```
3. ```typings install --save bluebird chalk jsonwebtoken lodash validator```

lets hope this gets fixed in typescript 2.0


## Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + usability to the Javascript (and Typescript!) world.
