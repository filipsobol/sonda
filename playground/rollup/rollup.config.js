import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import styles from 'rollup-plugin-styles';
import Sonda from 'sonda/rollup';

export default defineConfig( {
	input: 'src/index.js',
	output: {
		file: 'dist/index.js',
		sourcemap: true,
		format: 'es'
	},
	plugins: [
		Sonda( {
			format: 'html'
		} ),
		commonjs( {
			sourceMap: true,
			defaultIsModuleExports: true
		} ),
		nodeResolve( {
			browser: true,
			preferBuiltins: false
		} ),
		styles( {
			mode: 'extract',
			sourceMap: true,
			// minimize: true
		} ),
		terser()
	]
} );
