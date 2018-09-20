*Best used with Typescript 3.x*


--------
# Abstract

**```xlib```** is a monolitic core/utilities library.  It's designed to be a one-stop-shop for professional developers who need functionality that will work across Browser or Server. 

Generally, the aim is to have ```xlib``` contain 80% of the functionality you'll need from ```npm``` modules.


# WORK IN PROGRESS

- ***new changes*** under ```xlib@next``` : currently under very active development. Instead of publishing a new .major version every day or two, instead I'll be publishing to ```xlib@next``` for the near term.   
- ***browser currently unsupported***:    while ```xlib``` is designed for brower support, it's not currently being tested and might be superficially broken.  Previously, in v9.x ```WebPack``` was tested and supported.   




# expected setup

While you can use ```npm install xlib``` to use this in just about any javascript project or environment, here are what we test with:

- vscode v.latest
- ts v.latest (3.0.1 or higher suggested)
- node v8.x (6.x or higher suggested)



You can check out the [PhantomJsCloud](https://www.npmjs.com/package/phantomjscloud) NPM library for a real-life usage example.


--------
# Usage

```xlib``` is transpiled to ```es6``` compatable javascript using ```commonjs``` module format.   Thus you can consume it as you would any other NPM module:

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

# Functionality

I haven't found a good documentation tool (TypeDoc sucks for libraries), if you know if one, let me know!   In the meantime, I suggest browsing via your code editor's Intelisense.

There's a lot of commonly used features in ```xlib```:
- **Diagnostics**: features that change functionaly based on the ```xlib.environment.logLevel``` or ```xlib.environment.envLevel```.  such as sourcemaps and stacktrace logging which are active when ```logLevel <= DEBUG``` or ```envLevel==="DEV"```. *(Custom)*
- **Environment**:  Cross-platform environment variables and platform detection.  *(Custom)*
- **Exception**:  An Improved and extensible exception base class.  *(Custom)*
- **Logging**:  A robust, configurable, and source-map aware console logger. *(Custom)*
- **LoLo**: A shortcut to commonly used xlib functions and modules. *(Custom)*
- **Net**:  An easy to use RemoteHTTPEndpoint class for calling web apis, and generic http request handlers.  *(```axios``` and custom)*
- **Promise**: Various features for Promise and async/await workflows. *(```bluebird``` and custom)*
- **Reflection**: High quality runtime type detection. *(Custom)*
- **Security**:  Various crypto workflows *(```crypto```, ```jsonwebtoken``` and custom)*
- **Serialization**: High quality json manipulation and other import/export features. *(```d3-dsv```, ```json5```, and custom)*
- **Threading**: An async/await focused ReaderWriterLock implementation and autoscaler. *(Custom)*
- **time**:  a chainable datetime lib and helpers *(```luxon```)*
- **Validation**: User input sanitization.  *(```sanitize-html```, ```validator```, and custom)*
- **Utils**: Array, String, and Number helpers, and pollyfills for downlevel support. *(Custom)*

Hopefully you agree with my (opinionated) choices.   If you disagree, let me know in the Issues section.

> **A Note on Code Examples**: most of the examples in this doc come from ```/src/_unit.test.ts``` so consider looking in that file for more details.

Below are intro docs for big impacting features. 

## Logging

a robust logger, with log-levels set via global environment variables.

***limitations***:  only logs to console for now.  A configurable listener would be preferable, if you want to send a pull request!

### Basic Logging
```javascript
const log = xlib.diagnostics.log;
log.info( "hi", { some: "data" } );

log.info( "this 10000 character string gets auto-truncated nicely via __.inspect()", { longKey: xlib.security.humanFriendlyKey( 10000, 10 ) }  );
log.warnFull("this 10000 character screen doesn't get truncated because it's logged via the Full method ", { longKey: xlib.security.humanFriendlyKey( 10000, 10 ) } );

```

The output is nicely colored, formatted, with timestamps, and source location+line numbers **properly sourcemapped back to your typescript code**

```typescript
log.info( "hi", { some: "data" } );
> 2018-09-17T22:17:04.553Z     at Context.it (C:\repos\stage5\xlib\src\_index.unit.test.ts:46:7) INFO 'hi' { some: 'data' }
```

#### A note on sourcemaps:

- Want proper sourcemapping in your typescript project?  Just put ```import xlib = require("xlib")``` at/near the top of your project's entrypoint, and everything loaded after will be sourcemapped.
- For performance reasons, sourcemaps are only loaded when the ```envLevel``` is set to ```"DEBUG"``` (the default) or ```"TRACE"```.  



### log filtering

you can set a minimum log level per file or per ```RegExp``` so that you can toggle the verbosity of your files.  

``` typescript
// yourcode.ts
log.info( "will show" );
log.overrideLogLevel( "ERROR" ); //toggles logLevel for the current file (yourcode.ts).  you can also pass a RegExp that matches the callSite.
log.info( "will not show" );
log.warn( "will not show" );
log.error( "will show" );
//reset loglevel to normal
log.overrideLogLevel( xlib.environment.logLevel );
```

These filters can also be passed as xlib.initialization parameters, via the following choices:
- envVar (commandLine, systemEnv, or QueryString):  pass the ```logLevelOverrides``` parameter.   Example: 
```bash
node . logLevelOverrides="{'.*connection':'WARN', '.*xlib.dev.core.net.js':'INFO'}"
``` 
- by code ***before*** importing ```xlib``` by setting the ```global.__xlibInitArgs.logLevelOverrides``` global.  Example: 
```typescript
global.__xlibInitArgs = { logLevelOverrides: [
    {callSiteMatch:/.*connection/,minLevel:"WARN"},
    {callSiteMatch:/.*xlib.dev.core.net.ts/,minLevel:"INFO"}
    ]};
```

## Environment

### EnvVars Startup Options
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

### Reading/Writing custom envVars

Environmental variables can be detected from numerous sources, in the following order of priority (lower the number, the more important)

#### read envVars in your code
``` typescript
const apiKey = xlib.environment.getEnvironmentVariable("apikey");
```

#### write envVars

> #### NodeJs
1. CommandLine Args
    ``` bash
    node . apikey="your-secret-key";
    ```
2. System Environment Variables
    ``` bash
    set apikey="your-secret-key"
    ```

> #### Browser
1. Querystring variables 
    ```
    http://www.yourserver.com/yourpage?apikey=your-secret-key
    ```
2. cookies
3. dom attribute "data-KEY" in a node
4. dom attribute "KEY" in a node


## reflection

```typescript
import * as xlib from "xlib";
const log = xlib.diagnostics.log;
const reflection = xlib.reflection;
const Type = reflection.Type;
class MyClass { };
log.assert( reflection.getType( MyClass ) === Type.classCtor );
log.assert( reflection.getTypeName( MyClass ) === "MyClass" );
let myInstance = new MyClass();
log.assert( reflection.getType( myInstance ) === Type.object );
log.assert( reflection.getTypeName( myInstance ) === "MyClass" );
log.assert( reflection.getType( reflection.getType ) === Type.function );
log.assert( reflection.getType( xlib ) === Type.object );
```

## lolo

lolo is inspired by ```lodash``` (but doesn't dupe functionality of it).

```typescript
const __ = xlib.lolo;
__.log.info( `the current time is ${ __.utc().toISO() }`, {isDevOrDebug:__.isDevOrDebug()})
```


## network code


### ```RemoteHttpEndpoint```

you can easily construct a request from a webserver: 

```typescript
const remoteEndpoint = new xlib.net.RemoteHttpEndpoint<void, string>( {
    endpoint: { origin: "http://example.com" },
    retryOptions: { backoff: 2, interval: 100, max_interval: 5000, max_tries: 10 },
} );

const log = xlib.diagnostics.log;
let response = await remoteEndpoint.get();
log.info( `got response`,response );
```

and can use it to create an autoscaler endpoint for a web API:
```typescript
const log = xlib.diagnostics.log;

/** POST request data you submit to the server
    * 
    real request data can be more elaborate:  see ```IPageRequest``` in https://phantomjscloud.com/docs/http-api/
    */
type IPjscPostData = { url: string, renderType: "png" | "html" | "pdf" | "jpeg", outputAsJson?: boolean };
/** response data you will get back from the server.
    * 
real response data is more elaborate:  see ```IUserResponse``` in https://phantomjscloud.com/docs/http-api/
    */
type IPjscUserResponse = { content: { name: string, data: string, encoding: string } };

const apiKey = xlib.environment.getEnvironmentVariable( "phantomjscloud_apikey", "a-demo-key-with-low-quota-per-ip-address" );
const options: xlib.net.IRemoteHttpEndpointOptions = {
    endpoint: { origin: "https://phantomjscloud.com", path: `/api/browser/v2/${ apiKey }/` },
    autoscalerOptions: { minParallel: 4, backoffDelayMs: 30000, growDelayMs: 5000, decayDelayMs: 5000 },
};


const phantomJsCloudEndpoint = new xlib.net.RemoteHttpEndpoint<IPjscPostData, IPjscUserResponse>( options );

try {
    const httpResponse = await phantomJsCloudEndpoint.post( { url: "https://example.com", renderType: "pdf", outputAsJson: true } );
    log.assert( httpResponse.status === 200 );
    const userResponse = httpResponse.data;
    log.assert( userResponse.content.encoding === "base64" );
    log.assert( userResponse.content.data.length > 0 );

} catch ( _err ) {
    if ( xlib.reflection.getTypeName( _err ) === "AxiosError" ) {
        const axiosError: xlib.net.axios.AxiosError = _err;
    }
    log.assert( false, "request failed", _err );
}
```

## exception

make sure throws are actually errors:
```typescript
const __ = xlib.lolo;
try{
    throw "yes you can throw a string!";
}catch(_err){
    const err = __.castErr(_err);
    __.log.assert(err.message==="yes you can throw a string!");
}
```

derive from error:
```typescript
const log = xlib.diagnostics.log;
class MyException extends xlib.exception.Exception { };

try {
    try {
        throw new MyException( "first" );
    } catch ( _err ) {
        throw new MyException( "second", { innerException: _err } );
    }
} catch ( _err ) {
    log.assert( _err instanceof Error );
    log.assert( _err instanceof MyException );
    const err = _err as MyException;
    log.assert( err.message === "second	innerException: first" ); //we include innerException message in the parent exception message
    log.assert( err.innerException.message === "first" );
}

```

 
## threading

#### ```AsyncReaderWriterLock```
```typescript
/** an async+promise capable, readerwriter lock.
 * 
 * allows multiple readers (non-exclusive read lock) and single-writers (exclusive write lock)
 * 
 * additionally, allows storage of a value that is atomically written (a helper shortcut for common use: using this value is not required) 
 * 
 * when a race occurs, writes take precidence
 */
export class AsyncReaderWriterLock<TValue=void>
```



## old features

### _obsolete

A lot of "scenario" focused features are obsolete given advances in Typescript and Javascript.   they are still published under the ```/dist/_obsolete/``` folder in case you need them.

they include:

- Cache: collection with expiring values.
- Collection: utilities for collections.  includes a BitFlags implementation.
- ClassBase: base class for OOP workflows.  includes initialization and disposal support.
- Stripe.d.ts:  type definitions for an old version of the Stripe api.  


### _graveyard
Features that used to be in ```xlib``` but are thrown away can be found in the ```/dist/_graveyard/``` folder, but those may not build or work anymore.




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
- v13: modernize.  upgrade all dependencies to latest, deprecate or remove obsolete features, ```xlib.net``` improvements, general cleanup, remove ```moment``` in favor of ```luxon```
- v12: reconfig initialization arguments to be passed prior to import of xlib (IE: specify a ```global.__xlibInitArgs```) . also change logger to be a singleton, and allow better log filtering via log.
- v11: remove testLevel as external testing frameworks like mocha set their testLevel in a different way.
- v10: the 10.x  branch (and semver) is a restructure of this project to take advantage of the now fully mature typescript ecosystem.  Prior to 10.x, to publish a typescript project was a tedious process.