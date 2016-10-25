*Best used with Typescript 2.x*

--------
# Abstract
**```xlib```** is a monolitic core/utilities library.  It's designed to be a one-stop-shop for professional developers who need functionality that will work across Browser or Server.  

--------
# Limitations
While **```xlib```** aims to cover the range of functionality any frontend or backend developer would need, there are a few caveats: 

1) No ```.md``` or ```.html``` API Docs yet.  ```xlib``` was designed with Typescript 2.x in mind, but the main documentation tool [TypeDoc](http://typedoc.org) does not yet support Typescript 2.x.  When TypeDoc is upgraded, we will add docs.  However, if you are using Typescriptt 2.x the intellisence works fine right now!
1) ```xlib``` *(mostly)* doesn't include the ```NodeJs``` standard modules.  This is because we expect you to use ```WebPack``` or ```Browserify``` when building a Browser app (thus getting the ```NodeJs``` Modules already)
1) Only **cross-platform** functionality is included.  Browser or Server specific functionality can be found in the 
**[```blib```](https://www.npmjs.com/package/blib)** or **[```slib```](https://www.npmjs.com/package/slib)** libraries.
1) Missing a scenario you need?  Please feel free to make a pull request, or add an issue to the issue tracker.

--------
# Installation

## Server (NodeJs)

Tested with Node 6.x.

```bash
npm install --save xlib
```

You can check out the [PhantomJsCloud](https://www.npmjs.com/package/phantomjscloud) NPM library for a real-life usage example.

## Browser

Tested with WebPack, works down to IE9.  Designed for development using Chrome (logging and stack traces tested)

Use ```WebPack``` or ```Browserify```.  ```xlib``` is tested and compatible with WebPack.  Here is [an example using ```xlib``` with WebPack and React](https://www.npmjs.com/package/xlib-webpack-react-test) that includes minification.

--------
# Usage

```xlib``` is transpiled to ```es5``` compatable javascript using ```commonjs``` module format.   Thus you can consume it as you would any other NPM module:

```javascript
//typescript 2.0 /es6 example:

import xlib = require("xlib");
//or
import * as xlib from "xlib";


//log something
let log = new xlib.logging.Logger(__filename);
log.info("hi",{some:"data"});

```

## Functionality
*this section will probabbly be removed when API documentation generation is working.*

The main functional areas ```xlib``` covers
- Cache (collection with expiring values)
- Collection (utilities for collections)
- Compression (just zlib for now)
- DateTime (moment and moment utils)
- Environment (cross-platform environment variables and platform detection)
- Exception (improved exception base class)
- Logging (robust, configurable logging)
- Net (axios and http utils)
- Promise (bluebird and bluebird helpers)
- Reflection (hight quality runtime type detection and utils)
- Security (crypto utils)
- Serialization (robust and user friendly JSON (de)serialization)
- Threading (read/write lock and async)
- Validation (user input scrubbing)
- Utility (lodash, jsHelpers, Array/Number/String utils)

#### Logging

```javascript
let log = new xlib.logging.Logger(__filename);
log.info("hi",{some:"data"});
```

a robust and configurable logger, with log-levels set via global environment variables.

***limitations***:  only logs to console for now.  A configurable listener would be preferable, if you want to send a pull request!


--------
# Versioning / Upgrading
```xlib``` follows [Semver](https://docs.npmjs.com/getting-started/semantic-versioning) versioning.  Thus any breaking change will be released under a major version, and new functionality will be released under minor versions.  

```xlib```'s core functionality has been used in production code for more than a year so major refactoring is not expected to occur.


--------
# Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + (re)usability to the Typescript.  
