import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import styles from 'rollup-plugin-styles';
import { SondaRollupPlugin } from 'sonda';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig( {
	input: 'src/index.js',
	output: {
		file: 'dist/index.js',
		sourcemap: true,
		format: 'es'
	},
	external: ['open', 'fs', 'path', 'url', 'zlib'],
	plugins: [
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
		terser( {
			// format: {
			// 	comments: false
			// }
		} ),
		// visualizer( {
		// 	open: true,
		// 	sourcemap: true,
		// 	gzipSize: true,
		// 	brotliSize: true
		// } ),
		SondaRollupPlugin({
			gzip: true,
			brotli: true,
			// detailed: true,
			sources: true
		}),
	]
} );
