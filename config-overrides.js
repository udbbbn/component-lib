/* eslint-disable no-undef */
/* config-overrides.js */

const { override, fixBabelImports } = require('customize-cra')

module.exports = override(
	//do stuff with the webpack config...

	fixBabelImports('import', {
		//antd按需加载
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: 'css',
	})
)
