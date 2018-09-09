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
xlib.initialize( {
	envLevel: xlib.environment.EnvLevel.DEV,
	logLevel: xlib.environment.LogLevel.INFO,
	suppressStartupMessage: true,
} );

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
When you import ```xlib``` you need to invoke it's ```xlib.initialize()``` method.  It has default values aimed at dev+debug builds, which can be adjusted easily:
- ```logLevel``` defaults to ```TRACE```
- ```envLevel``` defaults to ```DEV```
- ```testLevel``` defaults to ```NONE```

Also, you can silence startup console output by passing the ```suppressStartupMessage: true``` parameter.

here's an example of how you can use it:
``` typescript
import xlib = require("xlib");
xlib.initialize( {
	envLevel: xlib.environment.EnvLevel.DEV,
    logLevel: xlib.environment.LogLevel.INFO,
    testLevel: xlib.environment.TestLevel.FULL,
    disableEnvAutoRead: true, //won't read env vars from environment, which can override your passed in vars    
	suppressStartupMessage: true,
} );
```
 

--------
# Versioning / Upgrading
```xlib``` follows [Semver](https://docs.npmjs.com/getting-started/semantic-versioning) versioning.  Thus any breaking change will be released under a major version, and new functionality will be released under minor versions.  

## v10.x restructure

the 10.x  branch (and semver) is a restructure of this project to take advantage of the now fully mature typescript ecosystem.  Prior to 10.x, to publish a typescript project was a tedious process.

## planned future work (roadmap)

```xlib```'s core functionality has been used in production code since 2015.   While mostly stable since, here are the future plans:

- **v.major, async**:  refactor to support async workflows by default

--------
# Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + (re)usability to the Typescript.  
