# Rush + Heft

Typescript based monorepo build system.


# Heft notes

- <https://rushstack.io/pages/heft_tutorials/getting_started/>


# xlib xplat notes

- following workflow from : <https://github.com/microsoft/rushstack/blob/master/build-tests/heft-webpack-basic-test>
  - as per: <https://rushstack.io/pages/heft_tasks/webpack/>


### upgrading dependencies
see xlib's ```package.json``` for list of scripts to run.  in particular:  ```rush dep-check --verbose```

### REWRITE NOTES

- date
  - day.js probably (maybe luxon)
- net io
  - gaxios
- webworkers
  - threads.js
  - maybe <https://www.npmjs.com/package/worker-loader>
  - maybe <https://www.npmjs.com/package/comlink>
  - maybe <https://isomorphic-git.org/docs/en/webworker>
  - see also: <https://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string>
  -
- serialization
  - need to add benchmarks for
    - msgpack
    - simdjson
    - json5
- future eslint extensions:
  - <https://github.com/sindresorhus/eslint-plugin-unicorn>
  - <https://www.npmjs.com/package/eslint-plugin-filenames>
- test assertion framework
  - chai works, but what is better?

## scratch

### isomorphic research notes

- <https://source.coveo.com/2016/05/11/isomorphic-typescript-ava-w-coverage/>
- <https://jamesmonger.com/2019/09/10/super-robust-api-with-isomorphic-typescript.html>
- <https://github.com/happygrammer/isomorphic-typescript-starter>
- <https://github.com/ericmasiello/isomorphic-typescript-react-redux-starter>
- <https://hackernoon.com/building-isomorphic-javascript-packages-1ba1c7e558c5>
- <https://zellwk.com/blog/publishing-npm-packages-that-can-be-used-in-browsers-and-node/>

### library extensibility / plugin architecture

- <https://www.npmjs.com/package/tapable>

### promises

- probably can use native promises now (bluebird not needed): <https://dev.to/blacksonic/what-does-javascript-promise-us-for-2020-4l1i>

### after v18
- rename to isol?

- worker threads:  so far threads.js is the easiest to work with.
  - but even with that, can not easily bundle into a single webpack file:  https://github.com/andywer/threads.js/issues/307
  - if other solutions are needed here is a summary as of 202009:
  - 
```
web-worker:  isomorphic worker implementaiton.   https://github.com/developit/web-worker
	doesn't seem to do much in browser?
	
worker-loader: embed workers as blobs into webpack bundle.  https://webpack.js.org/loaders/worker-loader/



comlink:  warpper over worker: https://github.com/GoogleChromeLabs/comlink#readme


comlink-loader:  load comlink into webpack  https://www.npmjs.com/package/comlink-loader
	author thinks worker-plugin is better.
	author also wrote web-worker
worker-plugin:  load comlink into webpack  https://www.npmjs.com/package/worker-plugin
	threads-loader is a copy of this
```
  - 
## todo

- logging:  async logging, and transports to 3rd party such as datadog / papertrail
  - also review all pino options: https://github.com/pinojs/pino/blob/master/docs/api.md#options
- expose chalk in stringHelper
- extra types:  https://github.com/sindresorhus/type-fest