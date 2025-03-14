import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import url from '@rollup/plugin-url'

const packageJson = require('./package.json')

const rollupConfig = {
	input: 'src/components/index.ts',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
			name: 'react-component-library'
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true
		}
	],
	plugins: [
		external(),
		resolve(),
		commonjs(),
		typescript({ tsconfig: './tsconfig.json' }),
		postcss({
			extensions: ['.css'],
			minimize: true,
			inject: {
				insertAt: 'top'
			}
		}),
		url(),
		terser()
	]
}

export default rollupConfig
