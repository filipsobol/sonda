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
		new Sonda()
	],
	experiments: {
		css: true
	},
} );
