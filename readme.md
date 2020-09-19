# THIS IS AN R&D REPO
monorepo doing R&D for the next version of ```xlib```

work here will be ported to the current ```xlib``` repository once R&D has met the following goals:

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

**PENDING**
- testing:  can test feature set equally well x-plat
- publishing:  ensure xlib ecosystem can be published to npm
- basic react e2e: proof of concept using react to setup a real app (including ssl and dev vs production env)
- documentation:  proper code documentation, auto-gen from source
  - functional doc system using ```api-extractor``` via the ```@xlib/xlib-docs``` website project.
  - if we need to change in the future, consider using https://github.com/tgreyuk/typedoc-plugin-markdown
- doc site:  a documenation site with full text search and versioning
- modern promise libary


# development

## tagline
Your isomorphic, swiss army knife, utility library


## env setup
- core dev env
  - install node 14.x
  - ```npm install -g pnpm @microsoft/rush```
- supplemental build tooling
  -  ```npm install -g npm-check-updates  concurrently  ```  //was: jest @microsoft/api-extractor @microsoft/api-documenter

# REWRITE NOTES
- date
  - day.js probably (maybe luxon)
- net io
  - gaxios
- webworkers
  - threads.js
- serialization
  - need to add benchmarks for
    - msgpack
    - simdjson
    - json5


# scratch

## isomorphic research notes
- https://source.coveo.com/2016/05/11/isomorphic-typescript-ava-w-coverage/
- https://jamesmonger.com/2019/09/10/super-robust-api-with-isomorphic-typescript.html
- https://github.com/happygrammer/isomorphic-typescript-starter
- https://github.com/ericmasiello/isomorphic-typescript-react-redux-starter
- https://hackernoon.com/building-isomorphic-javascript-packages-1ba1c7e558c5
- https://zellwk.com/blog/publishing-npm-packages-that-can-be-used-in-browsers-and-node/

## library extensibility / plugin architecture
- https://www.npmjs.com/package/tapable

## promises
- probably can use native promises now (bluebird not needed): https://dev.to/blacksonic/what-does-javascript-promise-us-for-2020-4l1i


  