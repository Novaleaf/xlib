// babel.config.js

module.exports = api => {
	api.cache(false)
	return {
		plugins: [
			"@babel/plugin-proposal-nullish-coalescing-operator",
			"@babel/plugin-proposal-optional-chaining",
			"@babel/plugin-proposal-object-rest-spread",
			["@babel/plugin-proposal-decorators", { "decoratorsBeforeExport": true }],
			["@babel/plugin-proposal-class-properties"],
			["@babel/transform-runtime"],
		],

		presets: [
			[
				"@babel/preset-env",
				{
					"corejs": { "version": 3 },
					"useBuiltIns": "usage",
					"targets": {
						"edge": "17",
						"firefox": "60",
						"chrome": "67",
						"safari": "11.1",
						"ie": "11"
					}
				}
			]
		]
	}
}

