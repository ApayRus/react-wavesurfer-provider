import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import url from '@rollup/plugin-url'
import { visualizer } from 'rollup-plugin-visualizer'

const packageJson = require('./package.json')

const rollupConfig = {
	input: 'src/components/index.ts',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
			name: 'react-wavesurfer-provider',
			globals: {
				react: 'React',
				'react-dom': 'ReactDOM',
				'wavesurfer.js': 'WaveSurfer'
			}
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true,
			globals: {
				react: 'React',
				'react-dom': 'ReactDOM',
				'wavesurfer.js': 'WaveSurfer'
			}
		}
	],
	external: [
		'react',
		'react-dom',
		'wavesurfer.js',
		'wavesurfer.js/src/plugin/regions',
		'wavesurfer.js/src/plugin/timeline'
	],
	plugins: [
		external(),
		resolve({
			browser: true,
			preferBuiltins: false
		}),
		commonjs({
			include: /node_modules/
		}),
		typescript({
			tsconfig: './tsconfig.json',
			sourceMap: true,
			inlineSources: true
		}),
		postcss({
			extensions: ['.css'],
			minimize: true,
			inject: {
				insertAt: 'top'
			}
		}),
		url(),
		terser(),
		visualizer({
			filename: 'bundle-analysis.html',
			open: true,
			gzipSize: true,
			brotliSize: true
		})
	]
}

export default rollupConfig
