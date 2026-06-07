import { defineConfig } from 'rollup';
import styles from 'rollup-plugin-styles';
import Sonda from 'sonda/rollup';

export default defineConfig({
	input: 'src/index.js',
	output: [
		{
			dir: 'dist/es',
			sourcemap: true,
			format: 'es',
			minify: true
		},
		{
			dir: 'dist/cjs',
			sourcemap: true,
			format: 'cjs',
			minify: true
		}
	],
	plugins: [
		Sonda({
			format: [ 'html', 'json' ]
		}),
		styles({
			mode: 'extract',
			sourceMap: true
			// minimize: true
		}),
	]
});
