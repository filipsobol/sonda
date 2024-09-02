import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { rollupPlugin as sourcemaps } from 'unplugin-detailed-sourcemaps';
import { rollupPlugin as sonar } from 'unplugin-sonar';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig( {
	input: 'src/index.js',
	output: {
		file: 'dist/index.js',
		sourcemap: true,
		format: 'es'
	},
	plugins: [
		commonjs( {
			sourceMap: true,
			defaultIsModuleExports: true
		} ),
		nodeResolve( {
			browser: true,
			preferBuiltins: false
		} ),
		terser(),
		// visualizer(),
		sonar(),
		sourcemaps(),
	]
} );
