
// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution")

require("json5/lib/register")
module.exports = require("./.eslintrc.json5")


