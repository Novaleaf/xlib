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

  