// //import nodePolyfills from "rollup-plugin-node-polyfills"
// import resolve from "@rollup/plugin-node-resolve"
// import commonjs from "@rollup/plugin-commonjs"
// import sourcemaps from "rollup-plugin-sourcemaps"

// const pkg = require( "../package.json" )

// const outputDefaults: rollup.OutputOptions = {
// 	// 		//preserveModules: true,
// 	banner: "/* xlib by JasonS@Novaleaf.com : https://github.com/Novaleaf/xlib */",
// 	footer: "/* xlib by JasonS@Novaleaf.com : https://github.com/Novaleaf/xlib */",

// 	//optimize
// 	compact: false,
// 	minifyInternalExports: false,
// 	sourcemap: true,

// 	//huh?
// 	/**
// 	 * hoistTransitiveImports
// 	 * inlineDynamicImports
// 	 */
// 	//intro: "var global = typeof self !== undefined ? self : this;"
// }

// import * as rollup from "rollup"
// //! need help?  see this repo: https://github.com/rollup/rollup-starter-lib/blob/master/rollup.config.js
// const config: rollup.RollupOptions[] = [
// 	// browser-friendly UMD build
// 	{
// 		input: pkg.libEsmEntry,
// 		output: {
// 			name: pkg.name,
// 			file: pkg.browser,
// 			format: "umd",
// 			...outputDefaults
// 		},
// 		plugins: [
// 			resolve(), // so Rollup can find 3rd party modules
// 			commonjs(), // so Rollup can convert modules to an ES module
// 			sourcemaps(), //so rollup can chain sourcemaps to source .ts files. 
// 		],
// 		external: "ts-node"
// 	},
// 	// // CommonJS (for Node) and ES module (for bundlers) build.
// 	// // (We could have three entries in the configuration array
// 	// // instead of two, but it's quicker to generate multiple
// 	// // builds from a single configuration where possible, using
// 	// // an array for the `output` option, where we can specify
// 	// // `file` and `format` for each target)
// 	// {
// 	// 	input: pkg.libEsmEntry,
// 	// 	//external: [ "ms" ],
// 	// 	output: {
// 	// 		file: pkg.module,
// 	// 		format: "esm",
// 	// 		...outputDefaults
// 	// 	}
// 	// 	// 	[
// 	// 	// 	{ file: pkg.main, format: "cjs" },
// 	// 	// 	{ file: pkg.module, format: "es" }
// 	// 	// ]
// 	// }

// ]


// export default config

