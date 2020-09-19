/** config file for npm-check-updates.   https://github.com/raineorshine/npm-check-updates
 * used by the ```rush dep-check``` task
 * for additional configuration of that task, see ""./common/config/rush/command-line.json"
*/
module.exports = {
	//"upgrade": false,
	packageFile: "package.json",
	/** Remove version ranges from the final package version. 
	 * best to do this for everything, so we explicitly choose upgrades
	 */
	removeRange: true,
	errorLevel: 2,
	/** ignore certain packages */
	"reject": [
		"@types/node", // works: 14.0.27.  14.10.0 has a bug that doesn't work with webpack.
		"@microsoft/api-extractor", //7.8.2-pr1796.0 works.   →  7.9.15   has bug that doesn't work with local ```import * as X```
	],
	//target: "greatest"

}