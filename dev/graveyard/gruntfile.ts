/// <reference path="../../typings/all.d.ts" />

//config file for grunt, all projects.  this is devenv stuff
//example usage:  "grunt build-dev" from command-line.



import _ = require("lodash");
import json5 = require("json5");
import path = require("path");
import convertSourceMap = require("convert-source-map"); //https://www.npmjs.com/package/convert-source-map
//import commonDir = require("commondir");


/** entrypoint accessed by grunt on execution.  here we load tasks and config them. */
function __entryPoint(grunt: IGrunt) {



	var config: grunt.config.IProjectConfig = {
		/** read npm package.json values, so values can be read by various grunt tasks. */
		pkg: grunt.file.readJSON("package.json"),
	};

	//function loadExample() {
	//	//first load up your task
	//	grunt.loadNpmTasks("npm-name-here");
	//	//then configure it
	//	_.merge(config, { some: "config stuff" }); 
	//	//then do any fancy code based configurations here

	//	grunt.event.on("watch",(action: string, filepath: string, watchTaskName: string) => {
	//		changedFiles[filepath] = action;
	//		//do stuff here
	//	});
	//}
	//loadExample();


	function loadContribWatch() {
		grunt.loadNpmTasks("grunt-contrib-watch"); //do work on changed files
		_.merge(config, { watch: {} });


	}
	loadContribWatch();

	function loadTsLint() {
		grunt.loadNpmTasks("grunt-tslint"); //linter on typescript save (used with watch)
		_.merge(config, {

			tslint: { //see https://www.npmjs.com/package/grunt-tslint
			
				options: {
					// Task-specific options go here.  see https://github.com/palantir/tslint
					configuration: json5.parse(grunt.file.read("tslint.json")),
				},
				default: {
					src: ["**/*.ts", "!**/node_modules/**"],
				},

			},
		});
	}
	loadTsLint();


	function loadTs() {
		grunt.loadNpmTasks("grunt-ts"); //compile typescript (used with watch)
		_.merge(config, {
			ts: { //see https://www.npmjs.com/package/grunt-ts
				default: {
					src: ["**/*.ts", "!**/*.d.ts", "!**/node_modules/**"],
					options: {
						module: "commonjs",
						comments: true,
						compiler: "./node_modules/typescript/bin/tsc",

					},
				},
			},
		});
	}
	loadTs();

	function loadTypeDoc() {
		grunt.loadNpmTasks("grunt-typedoc"); //autodoc typescript

		_.merge(config, {

			typedoc: { //see https://www.npmjs.com/package/grunt-typedoc
				build: {
					options: {
						module: "commonjs",
						out: "./docs",
						name: "test-docs",
						target: "es5",
					},
					src: ["**/*.ts", "!**/*.d.ts", "!**/node_modules*"],
				},
			},
		});
	}
	loadTypeDoc();

	function loadTsd() {
		grunt.loadNpmTasks("grunt-tsd"); //auto-update of tsd typings

		_.merge(config, {

			tsd: { //see https://www.npmjs.com/package/grunt-tsd
				refresh: {
					options: {
						// execute a command
						command: 'reinstall',

						//optional: always get from HEAD
						latest: true,

						// optional: specify config file
						config: './tsd.json',

						// experimental: options to pass to tsd.API
						opts: {
							// props from tsd.Options
						}
					}
				}
			},
		});
	}
	loadTsd();

	function loadContribClean() {
		grunt.loadNpmTasks("grunt-contrib-clean"); //delete files/folders

	}
	loadContribClean();

	function loadBrowserify() {
		grunt.loadNpmTasks("grunt-browserify"); //hook browserify compiler
		_.merge(config, {
			browserify: {}
		});
	}
	loadBrowserify();

	function loadBrowserifyTsify() {
		//no grunt task to load, this is a browserify plugin.
		_.merge(config, {
			browserify: {
				watch_target_ts: {
					options: {
						plugin: ["tsify"],
						watch: true, //in BUILD runs, set this to false to avoid full path in bundle.  see https://github.com/jmreidy/grunt-browserify/issues/245
						//banner: "", //DO NOT USE: causes source-mappings to be off by 1 line.
						//keepAlive: true,
						//preBundleCB: (b: BrowserifyObject) => { b.plugin("tsify"); },
						postBundleCB: (err: string, src: Buffer, next: (err: string, modifiedSrc: Buffer) => void) => {

							//fixup sourcemaps:  convert windows backslash dir seperators into unix style (chrome only supports unix)
							//and adjust the bundled script folder to be the same as the webpage (by default browserify assumes page is in the grunt root/baseDir cwd)
							{
								var files: _.Dictionary<string> = grunt.config("browserify.watch_target_ts.files");
								//console.log("keys= ", _.keys(files));
								var bundlePath = path.normalize(_.keys(files)[0]);
								var bundleDir = path.dirname(bundlePath); //"node-scratch/"

								var bundleFile = path.basename(bundlePath);

								//add "back dirs" equal to the bundleDir subdir depth, as our sourcemaps
								var bundleDirCount = bundleDir.split(path.sep).length;
								var pageBaseDirAdjust = new Array(bundleDirCount + 1).join(".." + path.sep);

								//convert windows relative-path source maps to linux style (backslash to slash)
								//logic inspired from https://github.com/smrq/gulp-fix-windows-source-maps/blob/master/index.js
								var contents = src.toString();
								var sourceMap = convertSourceMap.fromSource(contents);

								var sources: string[] = sourceMap.getProperty("sources");

								_.forEach(sources,(value, index, collection) => {
									var sourcePath = path.normalize(value);
									sourcePath = path.join(pageBaseDirAdjust, sourcePath);
									console.log("sourcePath=", sourcePath);
									sources[index] = sourcePath.replace(new RegExp("\\\\", "g"), "/");
								});
								sourceMap.setProperty("sources", sources);
							}

							//clean up the sourcemap and extract it to it's own file for uglify use
							{
								//try removing the source content to force loading original
								sourceMap.setProperty("sourcesContent", null);

								var sourceMapPath = bundlePath + ".map";
								grunt.file.write(sourceMapPath, sourceMap.toJSON());

								//var modifiedContents = contents.replace(convertSourceMap.commentRegex, sourceMap.toComment());
								var modifiedContents = contents.replace(convertSourceMap.commentRegex, "//# sourceMappingURL=" + path.basename(sourceMapPath));

							}

							var modifiedSrc = new Buffer(modifiedContents);
							next(err, modifiedSrc);
						},
						browserifyOptions: {
							debug: true,
						},
					},
					files: {
						//"./node-scratch/main.page.bundle.js": ["./node-scratch/main.page.ts"],
					},
				},

			},
		});
	}
	loadBrowserifyTsify();


	function loadUglify() {
		grunt.loadNpmTasks("grunt-contrib-uglify"); //minifier
		_.merge(config, {


			//     clean: { //see https://github.com/gruntjs/grunt-contrib-clean
			////tsd:["./typings/tsd.d.ts"],
			//     },
		


			uglify: { //see https://www.npmjs.com/package/grunt-contrib-uglify

				watch_target: {
					options: {
						mangle: false, //don't need, use gzip compression.  can use this for obfuscation purposes in production build.
						compress: true,
						sourceMap: true,
						sourceMapIn: null,
						sourceMapRoot: null, //set base path for sourcemap sources.
						maxLineLen: 255,
						ASCIIOnly: false,
						preserveComments: false,
						beautify: { beautify: true, },
						banner: "/* uglify.options.banner: <%= pkg.name %> <%= grunt.template.today(\"isoDateTime\") %> */", //yyyy-mm-ddtHH:mm:ss
						//footer: "/* uglify.options.footer */", //CAN NOT USE FOOTER!, messes up source mappings
					},
					files: {
						//'dest/output.min.js': ['src/input.js'],
					}

				},
			},

		});
	}
	loadUglify();

	/** es6 to 5 transpiler: https://babeljs.io/docs/using-babel/ */
	function loadBabel() {
		//grunt.loadNpmTasks("load-grunt-tasks");
		require("load-grunt-tasks")(grunt);
		_.merge(config, {
			babel: {
				options: {
					sourceMap: true, //"inline",
					//comments: false,
					//inputExtension:".js",
					//outputExtension: ".es5", //our custom hack
				},
				watch_target: {
					files: {}// {"source":"dest"}
				}
			}
		});
		//set input/output for watch tasks.  see https://github.com/gruntjs/grunt-contrib-watch
		grunt.event.on("watch",(action: string, filepath: string, watchTaskName: string) => {
			var outPath = filepath + ".es5";
			var fileMap = {};
			fileMap[outPath] = filepath;
			grunt.config("babel.watch_target.files", fileMap);
		});

	}
	loadBabel();

	/** custom watches that don't belong in other sections (or in multiple sections)*/
	function loadVNextCustomTasks() {

		function loadCustomWatch() {
			_.merge(config, {


				//     clean: { //see https://github.com/gruntjs/grunt-contrib-clean
				////tsd:["./typings/tsd.d.ts"],
				//     },
		


				watch: { //see https://www.npmjs.com/package/grunt-contrib-watch
					//full pipeline:  compile and other transforms
					typescriptCompile: {
						files: ["**/*.ts", "!**/*.d.ts", "!**/node_modules/**"],
						tasks: ["ts", "tslint"],
						options: {
							//if you need to dynamically modify your config, the spawn option must be disabled to keep the watch running under the same context.
							spawn: false,
						}
					},

					//don't compile, but do the other post-compile (downstream) processes
					typescriptDownstream: {
						files: ["**/*.ts", "!**/node_modules/**"],
						tasks: ["tslint"],
						options: {
							//if you need to dynamically modify your config, the spawn option must be disabled to keep the watch running under the same context.
							spawn: false,
						}
					},
					browserify: {
						files: ["www_**/*.page.ts", "!www_**/node_modules/**"], //["node-scratch/*.page.ts", "!**/node_modules/**"],
						tasks: ["browserify:watch_target_ts", "uglify:watch_target"],
						options: {
							//if you need to dynamically modify your config, the spawn option must be disabled to keep the watch running under the same context.
							spawn: false,
						}

					},
					jsBuild: {
						files: ["**/*.js", "!**/node_modules/**"],
						tasks: ["babel:watch_target"],
						options: {	//options here: https://www.npmjs.com/package/grunt-contrib-watch						
							spawn: false, //if you need to dynamically modify your config, the spawn option must be disabled to keep the watch running under the same context.
							debounceDelay: 500, //500 is the default
							event: ["all"], //all,changed,added,deleted
							atBegin: false, //the default.  set to true to run the task for all files at startup
						}
					}


				}
			});
		} loadCustomWatch();
		/** configuration to allow one-off multiwatch, taken from here: https://www.npmjs.com/package/grunt-contrib-watch */
		function loadCustomEvents() {
			/** buffer of pending files to trigger watch events for.  clears out after every exec of .onChange() */
			var changedFiles: _.Dictionary<string> = {};
			/** listener-worker, executes 200ms after the last changed file */
			var onChange = _.debounce(function (action: string, filepath: string, watchTaskName: string) {
				//see "Compiling Files As Needed" section of https://github.com/gruntjs/grunt-contrib-watch for details.
				var src: {} = grunt.config("tslint.default.src");
				src[0] = Object.keys(changedFiles);
				grunt.config("tslint.default.src", src);

				src = grunt.config("ts.default.src");
				src[0] = Object.keys(changedFiles);
				grunt.config("ts.default.src", src);

				var browserifyFiles: _.Dictionary<[string]> = {}
				var uglifyFiles: _.Dictionary<[string]> = {}
				_.forIn(changedFiles,(value, key, collection) => {
					var sourcePath = path.normalize(key);
					var sourceDir = path.dirname(sourcePath)
					var sourceFile = path.basename(sourcePath);
					var ext = path.extname(sourceFile);
					//var destFile = sourceFile.replace(ext, ".bundle.js");
					var bundlePath = sourcePath.replace(ext, ".bundle.js");
					var bundlePathSourceMap = bundlePath + ".map";
					browserifyFiles[bundlePath] = [sourcePath];

					//uglify
					ext = path.extname(bundlePath);
					var minBundlePath = bundlePath.replace(ext, ".min.js");
					uglifyFiles[minBundlePath] = [bundlePath];
					grunt.config("uglify.watch_target.options.sourceMapIn", bundlePathSourceMap);

					//console.log(destPath, sourceFile);
				});
				grunt.config("browserify.watch_target_ts.files", browserifyFiles);
				grunt.config("uglify.watch_target.files", uglifyFiles);


				//clear out our buffer
				changedFiles = {};
			}, 200);

			grunt.event.on("watch",(action: string, filepath: string, watchTaskName: string) => {
				changedFiles[filepath] = action;
				onChange(action, filepath, watchTaskName);
			});
		}
		loadCustomEvents();
	}
	loadVNextCustomTasks();



	grunt.initConfig(config);


	/** allow toggling of the grunt --force option.  
	usage:  grunt.registerTask('foo',['bar','force:on','baz','force:restore']);
	 * from:  https://github.com/gruntjs/grunt/issues/810#issuecomment-27363230 */
	function forceTaskHack() {
		var previous_force_state = grunt.option("force");

		grunt.registerTask("force", "allow toggling of the grunt --force option.  usage: grunt.registerTask('foo',['bar','force:on','baz','force:restore']);",(setting) => {
			if (setting === "on") {
				grunt.option("force", true);
			}
			else if (setting === "off") {
				grunt.option("force", false);
			}
			else if (setting === "restore") {
				grunt.option("force", previous_force_state);
			}
		});
	}
	forceTaskHack();



	function registerCustomTasks() {
		//grunt.registerTask("refresh-dependencies", ["clean:tsd", "tsd:refresh"]);
		grunt.registerTask("build-prod", ["tslint", "ts", "typedoc"]);
		grunt.registerTask("build-dev", ["force:on", "tslint", "force:restore", "ts", "typedoc"]);
	}
	registerCustomTasks();


};
export = __entryPoint;