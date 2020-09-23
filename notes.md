#Rush + Heft
Typescript based monorepo build system.


# add to ```install.sh``` scripts

```bash
npm install -g pnpm
pnpm install -g @microsoft/rush
pnpm install -g npm-check-updates #per-project command added in config/rush/command-line.json and each package.json

```


# Heft notes


- https://rushstack.io/pages/heft_tutorials/getting_started/


# winmerge

- https://sourceforge.net/projects/winmerge/
- sourcetree integration:
  - use custom settings:  ```-e -u -dl \"Mine\" -dm \"Merged\" -dr \"Theirs\" \"$LOCAL\" \"$MERGED\" \"$REMOTE\"```
	  - from: https://community.atlassian.com/t5/Sourcetree-questions/Can-t-launch-external-merge-tool-WinMerge-on-Windows/qaq-p/315156#M31520


# xlib xplat notes

- following workflow from : https://github.com/microsoft/rushstack/blob/master/build-tests/heft-webpack-basic-test
  - as per: https://rushstack.io/pages/heft_tasks/webpack/


# debug visualizer
https://addyosmani.com/blog/visualize-data-structures-vscode/


# troubleshooting
- webpack failure with ```No template for dependency: ConstDependency```:
  - heft webpack version is out of date with locally installed version.
  - find heft webpack version by running it (version is emitted in console output) then update project, for example: ```rush add -p webpack@4.31.0 -m```

  
## development



### env setup
- core dev env
  - install node 14.x
  - ```npm install -g pnpm @microsoft/rush```
- supplemental build tooling
  -  ```npm install -g npm-check-updates  concurrently  ```  //was: jest @microsoft/api-extractor @microsoft/api-documenter

### REWRITE NOTES
- date
  - day.js probably (maybe luxon)
- net io
  - gaxios
- webworkers
  - threads.js
  - maybe https://www.npmjs.com/package/worker-loader
  - maybe https://www.npmjs.com/package/comlink
  - maybe https://isomorphic-git.org/docs/en/webworker
  - see also: https://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
  - 
- serialization
  - need to add benchmarks for
    - msgpack
    - simdjson
    - json5
- future eslint extensions:
  - https://github.com/sindresorhus/eslint-plugin-unicorn
  - https://www.npmjs.com/package/eslint-plugin-filenames
- test assertion framework
  - chai works, but what is better?

## scratch

### isomorphic research notes
- https://source.coveo.com/2016/05/11/isomorphic-typescript-ava-w-coverage/
- https://jamesmonger.com/2019/09/10/super-robust-api-with-isomorphic-typescript.html
- https://github.com/happygrammer/isomorphic-typescript-starter
- https://github.com/ericmasiello/isomorphic-typescript-react-redux-starter
- https://hackernoon.com/building-isomorphic-javascript-packages-1ba1c7e558c5
- https://zellwk.com/blog/publishing-npm-packages-that-can-be-used-in-browsers-and-node/

### library extensibility / plugin architecture
- https://www.npmjs.com/package/tapable


### promises
- probably can use native promises now (bluebird not needed): https://dev.to/blacksonic/what-does-javascript-promise-us-for-2020-4l1i


  