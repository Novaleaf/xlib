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

I haven't found a good documentation tool (TypeDoc sucks for libraries), if you know if one, let me know!   In the meantime, I suggest browsing via your code editor's Intelisense.


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

### Logging

```javascript
const log = xlib.diagnostics.log;
log.info( "hi", { some: "data" } );

const __ = xlib.lolo;
log.info( "this 1000 character string gets auto-truncated nicely via __.inspect()", __.inspect( { longKey: xlib.security.humanFriendlyKey( 1000, 10 ) } ) );

```

a robust logger, with log-levels set via global environment variables.

***limitations***:  only logs to console for now.  A configurable listener would be preferable, if you want to send a pull request!

#### log filtering

you can set a minimum log level per file or per ```RegExp``` so that you can toggle the verbosity of your files.  

``` typescript
// yourcode.ts
log.info( "will show" );
log._overrideLogLevel( "ERROR" ); //toggles logLevel for the current file (yourcode.ts).  you can also pass a RegExp that matches the callSite.
log.info( "will not show" );
log.warn( "will not show" );
log.error( "will show" );
```

These filters can also be passed as xlib.initialization parameters, via the following choices:
- envVar (commandLine, systemEnv, or QueryString):  pass the ```logLevelOverrides``` parameter.   Example: ```"logLevelOverrides={'.*connection':'WARN', '.*xlib.dev.core.net.js':'INFO'}"``` 
- by code before importing ```xlib``` by setting the ```global.__xlibInitArgs.logLevelOverrides``` global.  Example: ```global.__xlibInitArgs = { logLevelOverrides: [{namePattern:/.*connection/,newLogLevel:"WARN"},{namePattern:/.*xlib.dev.core.net.js/,newLogLevel:"INFO"}]};```

### Environmental/Startup Options
```xlib``` is automatically initialized as soon as you import it for the first time.    It will read system environmental variables from the commandline, querystring, or systemEnv (in that order of priority).    Alternately, you ***may*** configure it's environment variables explicitly via code BEFORE you import ```xlib```.  Here's an example showing how you can explicitly set the initialization:

``` typescript
global.__xlibInitArgs = {
    envLevel: "DEV",
    logLevel: "ERROR",
};
import xlib = require("xlib");

```

as long as you have ```import xlib = require("xlib");``` in your file, you'll get proper intelisense for ```global.__xlibInitArgs```.

- ```logLevel``` defaults to ```TRACE```
- ```envLevel``` defaults to ```DEV```

If you are writing a library, here's how you can specify xlibInitArg ***defaults*** while still letting the consuming application override:
``` typescript

global.__xlibInitArgs = {
    envLevel: "PROD",
    logLevel: "INFO",
    /** don't display startup console messages */
    silentInit: true,
    /** let any previously set args override these */
    ...global.__xlibInitArgs
};
import xlib = require( "xlib" );
```


 

--------
# Versioning / Upgrading
```xlib``` follows [Semver](https://docs.npmjs.com/getting-started/semantic-versioning) versioning.  Thus any breaking change will be released under a major version, and new functionality will be released under minor versions.  


## planned future work (roadmap)

```xlib```'s core functionality has been used in production code since 2015.   While mostly stable since, here are the future plans:

- **v.major, async**:  refactor to support async workflows by default

--------
# Why

Since I started programming, I've a big fan of the .NET Framework.  Xlib is my attempt to bring that level of great features + (re)usability to the Typescript.  

# Changelog

- v11: remove testLevel as external testing frameworks like mocha set their testLevel in a different way.
- v10: the 10.x  branch (and semver) is a restructure of this project to take advantage of the now fully mature typescript ecosystem.  Prior to 10.x, to publish a typescript project was a tedious process.