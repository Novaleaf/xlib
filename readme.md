# ToC

- [ToC](#toc)
- [REWRITE IN PROGRESS](#rewrite-in-progress)
- [XLIB v18+](#xlib-v18)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
  - [R&D Status](#rd-status)
    - [COMPLETE](#complete)
    - [PENDING](#pending)

# REWRITE IN PROGRESS
Xlib is being rewritten from first principles.  The current ```master``` branch of this repo is dedicated to this rewrite.   The current [```npm xlib```](https://www.npmjs.com/package/xlib) package  points to ```xlib@17.x``` which is a stable, high quality core/util library for node.  See the [```v17```](https://github.com/Novaleaf/xlib/tree/v17) branch for it's source.

The [```v17```](https://github.com/Novaleaf/xlib/tree/v17) branch is:
- highly stable
- full featured
- used in production
- available as the default [```npm xlib```](https://www.npmjs.com/package/xlib) package

**The remainder of this readme is dedicated to the ```v18``` rewrite.**

# XLIB v18+
*Your isomorphic toolbox*


## Goals
- Monorepo: the core ```xlib```, tooling, and build verification projects all live in this repo
- Docs: full online documentation
- Promises: ```async / await``` by default
- Isometric:  full support for node and browser
- Performance: take advantage of worker threads where it makes sense
- Full Featured: aim to provide 80% of utility needs
- Professional:  no hacks, fully documented, deployment environment aware
- Dev Experience: will include dev-env scafolding scripts and an easy build system
- Lightweight: A library, not framework.  No unexpected logging to console, tree-shake support

## Non-Goals
- Full browser support: Ignoring IE, but Edge-Classic support will be attempted
- Old Node support:  Development is done on Node 14.x.    Node 12.x should work fine.
- Tooling Agnostism:  Development is done on VSCode via ubuntu.  You should be able to build/dev on windows, but it's not tested.  
  - *Win10 Tip:  Use [WSL](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode) for development!*



## R&D Status
Current ```v18.x``` is of ```develop``` build quality (meaning: ***do not use this right now***).  

Critical R&D complete.   Now porting most useful xlib features to the new codebase.


The following signifiers will be attached to the v18 rewrite as work progresses

- ```develop```: not suitable for any use.
- ```alpha```: usable for PoC projects only.  
- ```beta```: can be used for production, but features may be missing, and breaking changes should be expected between ```xlib``` versions




### COMPLETE
- **isomorphic**:  xlib feature parity for browser and node projects
  - needed to setup a mock ```xlib-browser``` project to build esm version of library
- **typings**:  ensure dependent projects get sub-package typings automatically
  - basically, ```tsconfig.json``` has to be setup properly.   for example, ```esModuleInterop:true```
- **debugging**:  ensure dependent projects can debug into xlib's *.ts source files
  - dependent project's ```launch.json``` needs to properly setup the ```outFiles``` setting.   see ```build-examples/xlib-node-basic```
  - browser debugging properly sourcemaps to original ```.ts``` files
- **monorepo**: develop xlib ecosystem as seperate projects within the same repository
  - use ```npm @microsoft/rush```
- **upgradeability**: ensure dependent modules can be properly upgraded in a reliable way
  - use ```rush check``` and ```rush dep-check``` and ```rush dep-upgrade``` for this workflow
- **documentation**:  proper code documentation, auto-gen from source
  - functional doc system using ```api-extractor``` via the ```@xlib/xlib-docs``` website project.
  - if we need to change in the future, consider using https://github.com/tgreyuk/typedoc-plugin-markdown
- **testing**:  isometric testing supported:  ```mocha``` used in browsers, ```jest``` used in node
  - jest doesn't work in browsers.  didn't switch to full mocha because ```heft``` nicely runs jest tests when it builds typescript, and I don't want to spend the time figuring out to do similar with mocha.
  - however there is a problem, in that jest's ```expect``` library isn't available cross-platform and it doesn't seem easy to register another assertion lib to globally override jest's in node.
  - so currently working on building the ```xlib.diagnostics.logging``` module to handle this kind of work.

### PENDING
- publishing:  ensure xlib ecosystem can be published to npm
- basic react e2e: proof of concept using react to setup a real app (including ssl and dev vs production env)
- doc site:  a documenation site with full text search and versioning
- modern promise libary
  - probably just use builtin promises
- enterprise grade logging system (without the enterprise plumbing requirement)
  - ??? some plugable listener lib probably
- isomorphic worker threads:  currently using ```npm threads``` which works, but is brittle



