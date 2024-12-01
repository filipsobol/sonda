import { defineConfig } from '@rspack/cli';
import Sonda from 'sonda/rspack';

export default defineConfig({
	entry: './src/index.js',
	devtool: 'source-map',
	output: {
		filename: 'index.js',
		clean: true
	},
	plugins: [
		new Sonda( {
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
