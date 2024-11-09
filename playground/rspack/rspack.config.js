import { defineConfig } from '@rspack/cli';
import { SondaWebpackPlugin } from 'sonda';

export default defineConfig({
	entry: './src/index.js',
	devtool: 'source-map',
	output: {
		filename: 'index.js',
		clean: true
	},
	plugins: [
		new SondaWebpackPlugin( {
			gzip: true,
			brotli: true,
			detailed: true,
			sources: true,
		} )
	],
	experiments: {
		css: true
	},
} );
