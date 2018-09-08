*Best used with Typescript 3.x*


--------
# Abstract

**```xlib```** is a monolitic core/utilities library.  It's designed to be a one-stop-shop for professional developers who need functionality that will work across Browser or Server.  


# expected setup

While you can use ```npm install xlib``` to use this in just about any javascript project or environment, here are what we test with:

- vscode v.latest
- ts v.latest (3.0.1 or higher suggested)
- node v8.x (6.x or higher suggested)



You can check out the [PhantomJsCloud](https://www.npmjs.com/package/phantomjscloud) NPM library for a real-life usage example.


--------
# Usage

```xlib``` is transpiled to ```es5``` compatable javascript using ```commonjs``` module format.   Thus you can consume it as you would any other NPM module:

```javascript
//typescript 3.0 /es6 example:

import * as xlib from "xlib";
//override environment variables we otherwise read from the node.commandline, system.env, or browser.querystring


//log something
let log = new xlib.diagnostics.logging.Logger(__filename);
log.info("hi",{some:"data"});

```

## Functionality

see [the generated api docs here](./docs/index.html). though the doc generator (TypeDoc) is severely lacking, so best to use the intelisence of your favorite code editor.


The main functional areas ```xlib``` covers
- Cache (collection with expiring values)
- Collection (utilities for collections)
- DateTime (moment and moment utils)
- Environment (cross-platform environment variables and platform detection)
- Exception (improved exception base class)
- Logging (robust, configurable logging)
- Net (axios and http utils)
- Promise (bluebird and bluebird helpers)
- Reflection (hight quality runtime type detection and utils)
- Security (crypto utils)
- Serialization (robust and user friendly JSON (de)serialization)
- Threading (read/write lock)
- Validation (user input scrubbing)
- Utility (lodash, jsHelpers, Array/Number/String utils)

#### Logging

```javascript
let log = new xlib.logging.Logger(__filename);
log.info("hi",{some:"data"});
```

a robust and configurable logger, with log-levels set via global environment variables.

***limitations***:  only logs to console for now.  A configurable listener would be preferable, if you want to send a pull request!

#### Environmental/Startup Options
by default, when you import ```xlib``` it will initialize it's ```xlib.environment``` variables with default values, and verbosely log its self-setting of defaults:
- ```logLevel``` defaults to ```TRACE```
- ```envLevel``` defaults to ```PREPROD```
- ```isTest``` defaults to ```FALSE```
- ```isDev``` defaults to ```FALSE```

if you don't want to set environmental or startup options, you can instead set a ```global._xlibConfigDefaults``` object.  This also silences the verbose console output.

here's an example of how you can use it:
``` typescript
//specify xlib config options, without requiring environmental config
(global as any)._xlibConfigDefaults = {
	logLevel: "ERROR",
	envLevel: "PROD",
	isTest: "FALSE",
	isDev: "FALSE",
	sourceMapSupport: true,
} as typeof _xlibConfigDefaults;
import xlib = require("xlib");
```
 

--------
# Versioning / Upgrading
```xlib``` follows [Semver](https://docs.npmjs.com/getting-started/semantic-versioning) versioning.  Thus any breaking change will be released under a major version, and new functionality will be released under minor versions.  

## v10.x restructure

the 10.x  branch (and semver) is a restructure of this project to take advantage of the now fully mature typescript ecosystem.  Prior to 10.x, to publish a typescript project was a tedious process.

## planned future work

```xlib```'s core functionality has been used in production code since 2015.   While mostly stable since, here are the future plans:

- **v.major,  explicit initialization**:   removal of all auto-initialization code (such as picking up environmental variables and configuring log levels)  and put them into options of an initialization function, something like: 

	```typescript
	import * as xlib from "xlib";
	xlib.initialize({autoDetect:false,logLevel:"trace", env:"dev", tests:true});
	```
- **v.major, async**:  refactor to support async workflows by default

--------
# Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + (re)usability to the Typescript.  
