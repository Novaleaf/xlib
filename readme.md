# REWRITE IN PROGRESS
Xlib is being rewritten from first principles.  The current ```master``` branch of this repo is dedicated to this rewrite.   The current ```npm xlib``` package  points to ```xlib@17.x``` which is a stable, high quality core/util library for node.  See the ```v17``` branch for it's source.

The ```v17``` branch is:
- highly stable
- full featured
- used in production
- available as the default ```npm xlib``` package

**The remainder of this readme is dedicated to the ```v18``` rewrite.**

# XLIB v18+
*Your isomorphic swiss army knife*

## Current Status
Critical R&D complete.   Now porting most useful xlib features to the new codebase.

## Goals
- Monorepo: hosting projects related to xlib
- Docs: full online documentation
- Promises: ```async / await``` by default
- Isometric:  full support for node and browser
- Performance: take advantage of worker threads where it makes sense
- Full Featured: aim to provide 80% of utility needs
- Professional:  no hacks, fully documented, deployment environment aware
- Dev Experience: will include dev-env scafolding scripts and an easy build system

## Non-Goals
- Full browser support: Ignoring IE, but Edge-Classic support will be attempted
- Old Node support:  Development targets Node 14.x
- Tooling Agnostism:  Development targets VSCode on ubuntu.  Should work on windows, but not tested.  (Win10 Tip:  Use WSL)



## R&D Status

**COMPLETE**: 
- isomorphic:  xlib feature parity for browser and node projects
  - needed to setup a mock ```xlib-browser``` project to build esm version of library
- typings:  ensure dependent projects get sub-package typings automatically
  - basically, ```tsconfig.json``` has to be setup properly.   for example, ```esModuleInterop:true```
- debugging:  ensure dependent projects can debug into xlib's *.ts source files
  - dependent project's ```launch.json``` needs to properly setup the ```outFiles``` setting.   see ```build-examples/xlib-node-basic```
- monorepo: develop xlib ecosystem as seperate projects within the same repository
  - use ```npm @microsoft/rush```
- upgradeability: ensure dependent modules can be properly upgraded in a reliable way
  - use ```rush check``` and ```rush dep-check``` and ```rush dep-upgrade``` for this workflow
- documentation:  proper code documentation, auto-gen from source
  - functional doc system using ```api-extractor``` via the ```@xlib/xlib-docs``` website project.
  - if we need to change in the future, consider using https://github.com/tgreyuk/typedoc-plugin-markdown

**PENDING**
- testing:  can test feature set equally well x-plat
- publishing:  ensure xlib ecosystem can be published to npm
- basic react e2e: proof of concept using react to setup a real app (including ssl and dev vs production env)
- doc site:  a documenation site with full text search and versioning
- modern promise libary
  - probably just use builtin promises


