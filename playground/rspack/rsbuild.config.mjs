import { defineConfig } from '@rsbuild/core';
import { SondaWebpackPlugin } from 'sonda';

export default defineConfig( {
	tools: {
		rspack: {
			devtool: 'source-map',
			plugins: [
				new SondaWebpackPlugin( {
					gzip: true,
					brotli: true,
					detailed: true
				} )
			]
		}
	}
} );
