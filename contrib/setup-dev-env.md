

# os:  WSL2 (to Ubuntu)
My particular setup is to use WSL to run an ubuntu 20.04 VM.    You of course don't need to do this, but I like to use a vm like this to  keep the dev env seperate from windows, yet still be able to use a windows based git tool (sourcetree) to manage checkins.

## manage WSL
- I use the tool: https://github.com/wslhub/WSL-DistroManager
  - but can use this:  https://github.com/wslhub/WslManager or just the wsl cmdline.

# build requirements

```bash
#  add to ```install.sh``` scripts
npm install -g pnpm
pnpm install -g @microsoft/rush
pnpm install -g npm-check-updates #per-project command added in config/rush/command-line.json and each package.json
```


### env setup

- core dev env
  - install node 14.x
  - ```npm install -g pnpm ```
  - ```pnpm install -g @microsoft/rush```
- supplemental build tooling
  - ```pnpm install -g npm-check-updates  concurrently```  //was: jest @microsoft/api-extractor @microsoft/api-documenter

# secrets management (for Novaleaf internal use only)
secrets used for internal Novaleaf processes.  For the open source xlib projects this is not at all needed, but if you don't have a secrets workflow, you can copy this!

using doppler.com
- installation: https://docs.doppler.com/docs/enclave-installation


## doppler with wsl and vscode

```bash
# load up secrets into env
doppler run --project proj --config dev --command bash
# be sure your WSL remote server is closed (this is the first time running vscode) otherwise your secrets won't be populated
code /repos/proj/proj.workspace
```

## doppler injected into current environment

```bash
#!/bin/bash
tmpCmd=$(doppler --project proj --config dev secrets download --format=env --no-file)
while read -r line; do declare -x "$line"; done <<<"$tmpCmd"
```

the above into a file like ```dopplerInject.sh``` then source it via ```source dopplerInject.sh```


# git tool:  SourceTree (optional)
SourceTree is a great git gui.  You don't have to use it of course, but if you haven't tried it, you should!



## Diff Tools (windows)
sourcetree doesn't have a good merge tool.  winmerge is good

- <https://sourceforge.net/projects/winmerge/>
- sourcetree integration:
  - use custom settings:  ```-e -u -dl \"Mine\" -dm \"Merged\" -dr \"Theirs\" \"$LOCAL\" \"$MERGED\" \"$REMOTE\"```
    - from: <https://community.atlassian.com/t5/Sourcetree-questions/Can-t-launch-external-merge-tool-WinMerge-on-Windows/qaq-p/315156#M31520>




# ide: vscode


## debug visualizer

<https://addyosmani.com/blog/visualize-data-structures-vscode/>

# troubleshooting

- webpack failure with ```No template for dependency: ConstDependency```:
  - heft webpack version is out of date with locally installed version.
  - find heft webpack version by running it (version is emitted in console output) then update project, for example: ```rush add -p webpack@4.31.0 -m```


# publishing

make sure ```./common/config/rush/.npmrc-publish``` is setup with an envVar ref to your npm auth token.

## new project

- make sure all up to date:  ```rush update --full --purge```
- make sure project has entry in ```common/config/rush/version-policies.json```
- publish via ```npm publish --access public```




## bumping versions

2. follow instructions here (follow instructions for setting up version policies):  https://rushjs.io/pages/maintainer/publishing/
   - add policy to ```common/config/rush/version-policies.json```
3. 

```
# publish
rush publish --apply --publish --add-commit-details --tag dev --include-all

# 
```