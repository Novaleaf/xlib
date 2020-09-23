'use strict';

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
					use: ['source-map-loader'], //needed to chain sourcemaps.  see: https://webpack.js.org/loaders/source-map-loader/
				},
			]
		},
		entry: {
			app: path.join(__dirname, 'lib-esm', '_main.js'),

			// Put these libraries in a separate vendor bundle
			//vendor: ['react', 'react-dom']
		},
		output: {
			path: path.join(__dirname, 'dist'),
			filename: '[name]_[contenthash].js'
		},
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
