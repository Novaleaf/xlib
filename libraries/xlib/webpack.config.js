'use strict';

const config = require("./package.json")

const path = require('path');
/** See here for documentation: https://github.com/jantimon/html-webpack-plugin 
 * will automatically inject the webpack bundles into this page
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
/**
 * ```npm threads``` requires a lot of annoyances to get working.    see: https://threads.js.org/getting-started#when-using-typescript and https://threads.js.org/usage#typescript-workers-in-nodejs
 * 
 * If you have problems, be sure to read webpack warning outputs.
 * 
 * pretty annoying, probably need to switch with a web-worker shim
 */
const ThreadsPlugin = require('threads-plugin');

/**
 * If the "--production" command-line parameter is specified when invoking Heft, then the
 * "production" function parameter will be true.  You can use this to enable bundling optimizations.
 */
function createWebpackConfig({ production }) {
	production = false
	const webpackConfig = {
		// Documentation: https://webpack.js.org/configuration/mode/
		mode: production ? 'production' : 'development',
		resolve: {
			extensions: ['.js', '.jsx', '.json'],
		},

		module: {
			rules: [
				{
					test: /\.css$/,
					use: [require.resolve('style-loader'), require.resolve('css-loader')]
				},
				{
					//from https://github.com/googleapis/gaxios/blob/master/webpack.config.js
					//needed to support gaxios
					test: /node_modules\/https-proxy-agent\//,
					use: "null-loader",
				},
				{
					test: /\.js$/,
					enforce: 'pre',
					use: [
						{
							//needed to chain sourcemaps.  see: https://webpack.js.org/loaders/source-map-loader/
							loader: 'source-map-loader',
							options: {

								filterSourceMappingUrl: (url, resourcePath) => {
									//	console.log({ url, resourcePath }) example:
									// {
									// 	url: 'index.js.map',
									// 	resourcePath: '/repos/xlib-wsl/common/temp/node_modules/.pnpm/https-proxy-agent@5.0.0/node_modules/https-proxy-agent/dist/index.js'
									// }

									if (/.*\/node_modules\/.*/.test(resourcePath)) {
										return false
									}
									return true
								}

							}
						}],
				},
			]
		},
		// //! stats.warnings doesn't seem to work.   see: https://stackoverflow.com/questions/63195843/webpack-module-warning-failed-to-parse-source-map-from-data-url/64035413#64035413
		//devServer: {
		// 	stats: {
		// 		//ignore source-map failure warnings: https://webpack.js.org/loaders/source-map-loader/#ignoring-warnings
		// 		//warningsFilter: [/Failed to parse source map/],
		// 		warnings: false
		// 	},
		//stats: 'errors-only'
		//},
		// stats: {
		// 	warnings: false
		// },
		//stats: 'errors-only',
		entry: {
			app: path.join(__dirname, 'lib-esm', '_main.js'),

			// Put these libraries in a separate vendor bundle
			//vendor: ['react', 'react-dom']
		},
		output: {
			path: path.join(__dirname, 'lib-browser'),
			filename: `${config.name}.bundle.js` //'[name]_[contenthash].js'
		},
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
		devtool: production ? undefined : 'source-map',
		// // not needed:
		// devServer: {
		//   contentBase: path.join(__dirname, "../.."),
		//   watchContentBase: true,
		// },
		plugins: [

			new HtmlWebpackPlugin({
				//	template: 'assets/lib-test-main.html' //useful if loadign react and pointing to a dom element, but can comment out if not
			}),
			new ThreadsPlugin(),
		],


		node: {
			//from https://github.com/googleapis/gaxios/blob/master/webpack.config.js
			//needed to support gaxios
			child_process: 'empty',
			fs: 'empty',
			crypto: 'empty',
			net: 'empty',
			tls: 'empty',

			//"ts-node": "empty", thought needed for ```threads```, but it's not
		}

	};

	return webpackConfig;
}

module.exports = createWebpackConfig;
