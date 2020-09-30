/** 
 * @packageDocumentation
 * webpack configured for:
 * - isomorphic library
 * - generating tests as a seperate bundle
 * - tweaks for 3rd party modules
 *   - gaxios
 *   - threads
 */


import * as webpack from "webpack" //using typescript with webpack configs: https://medium.com/webpack/unambiguous-webpack-config-with-typescript-8519def2cac7

import "webpack-dev-server"




const packageConfig = require( "../package.json" )

import path = require( "path" )
/** See here for documentation: https://github.com/jantimon/html-webpack-plugin 
 * will automatically inject the webpack bundles into this page
 */
import HtmlWebpackPlugin = require( "html-webpack-plugin" )
/** needed to support comlink: packs worker thread files into the bundle.
 * see: https://www.npmjs.com/package/worker-plugin
	 */
const WorkerPlugin = require( "worker-plugin" )


/**
 * If the "--production" command-line parameter is specified when invoking Heft, then the
 * "production" function parameter will be true.  You can use this to enable bundling optimizations.
 */
function createBaseConfig( { production = false } ): webpack.Configuration {


	//production = false
	const webpackConfig: webpack.Configuration = {
		// Documentation: https://webpack.js.org/configuration/mode/
		mode: production ? "production" : "development",
		resolve: {
			extensions: [ ".js", ".jsx", ".json" ],
		},


		module: {
			rules: [
				{
					test: /\.css$/,
					use: [ require.resolve( "style-loader" ), require.resolve( "css-loader" ) ]
				},
				{
					//from https://github.com/googleapis/gaxios/blob/master/webpack.config.js
					//needed to support gaxios
					test: [
						/node_modules\/https-proxy-agent\//,
						///worker_threads/,
						//require.resolve( "worker_threads" ),
					],
					use: "null-loader",
				},
				{
					test: /\.js$/,
					enforce: "pre",
					use: [
						{
							//needed to chain sourcemaps.  see: https://webpack.js.org/loaders/source-map-loader/
							loader: "source-map-loader",
							options: {

								filterSourceMappingUrl: ( url: string, resourcePath: string ) => {
									//	console.log({ url, resourcePath }) example:
									// {
									// 	url: 'index.js.map',
									// 	resourcePath: '/repos/xlib-wsl/common/temp/node_modules/.pnpm/https-proxy-agent@5.0.0/node_modules/https-proxy-agent/dist/index.js'
									// }

									if ( /.*\/node_modules\/.*/.test( resourcePath ) ) {
										return false
									}
									return true
								}

							}
						} ],
				},
				{
					// see: https://www.npmjs.com/package/worker-loader
					test: /\.worker\.(c|m)?js$/i,
					loader: "worker-loader",
					options: {
						//inline: "no-fallback", //inline BLOB only
					},
				},
				// {
				// 	//load up mocha tests: https://webpack.js.org/loaders/mocha-loader/
				// 	test: /\.test\.js$/,
				// 	use: "mocha-loader",
				// 	exclude: /node_modules/,
				// }
			]
		},
		// //! stats.warnings doesn't seem to work.   see: https://stackoverflow.com/questions/63195843/webpack-module-warning-failed-to-parse-source-map-from-data-url/64035413#64035413
		//devServer: {
		// 	stats: {
		// 		//ignore source-map failure warnings: https://webpack.js.org/loaders/source-map-loader/#ignoring-warnings
		// 		//warningsFilter: [/Failed to parse source map/],
		// 		warnings: false
		// 	},
		//stats: "errors-only",
		//},
		// stats: {
		// 	warnings: false
		// },
		//stats: 'errors-only',
		// //! entry is not configured by base (this fcn)
		// entry: {
		// 	// lib: path.join( __dirname, "lib-esm", "_main.js" ),
		// 	// tests: 

		// 	// Put these libraries in a separate vendor bundle
		// 	//vendor: ['react', 'react-dom']
		// },
		// //! output is not configured by base (this fcn)
		// output: {
		// 	path: path.join( __dirname, "lib-browser" ),
		// 	filename: `${ packageConfig.name }.bundle.js` //'[name]_[contenthash].js'
		// },
		// optimization: {
		// 	//puts external libraries in seperate bundle files. see https://webpack.js.org/guides/code-splitting/#prevent-duplication
		// 	splitChunks: {
		// 		cacheGroups: {
		// 			imports: {
		// 				chunks: 'all',
		// 				//				name: (module,chunks,cacheGroupKey),
		// 			}
		// 		}
		// 	}
		// },
		devtool: production ? undefined : "source-map",
		//! only used when running the WDS  (webpack dev server)
		//need @types/webpack-dev-server installed for this to work
		devServer: {
			//contentBase: path.join( __dirname, "../.." ),
			//watchContentBase: true,
			//hot: true,
			//open: true,
			//stats: "errors-only"
		},
		optimization: {
			/**  because modules can be initialized multiple times if webpack creates more than 1 chunk.
			 * similar issue here: https://github.com/webpack/webpack/issues/7375
			 * docs on optimizing here: https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
			 */
			runtimeChunk: "single"
		},
		plugins: [

			new HtmlWebpackPlugin( {
				template: "assets/lib-test-main.html" //useful if loadign react and pointing to a dom element, but can comment out if not

			} ),
			new WorkerPlugin( {
				//preserveTypeModule: true
			} )
		],


		node: {
			//from https://github.com/googleapis/gaxios/blob/master/webpack.config.js
			//needed to support gaxios
			child_process: "empty",
			fs: "empty",
			crypto: "empty",
			net: "empty",
			tls: "empty",
			//worker_threads: "mock",
		}


	}



	return webpackConfig
}


console.warn( `entryPath ${ path.normalize( path.join( __dirname, "..", packageConfig.module ) ) } , ${ ( path.join( __dirname, "..", packageConfig.module ) ) }` )
console.warn( `outputPath = ${ path.normalize( path.join( __dirname, "../lib-browser" ) ) } outName= ${ `${ packageConfig.name }.[name].js` }` )
module.exports = ( { production = false } = {} ) => {

	//standard lib build
	let webpackConfig = createBaseConfig( { production } )
	webpackConfig = {
		...webpackConfig,

		entry: {
			bundle: path.normalize( path.join( __dirname, "..", packageConfig.module ) ),
			tests: path.normalize( path.join( __dirname, "..", packageConfig.webpackBrowserTestEntry ) ),
		},
		output: {
			path: path.normalize( path.join( __dirname, "../lib-browser" ) ),
			filename: `${ packageConfig.name }.[name].js` //'[name]_[contenthash].js'
		},

		// devServer: {
		// }
	}

	return webpackConfig
}
