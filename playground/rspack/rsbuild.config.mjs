import { defineConfig } from '@rsbuild/core';
import { SondaRspackPlugin } from 'sonda';

export default defineConfig( {
	tools: {
		rspack: {
			devtool: 'source-map',
			plugins: [
				new SondaRspackPlugin( {
					gzip: true,
					brotli: true,
					detailed: true
				} )
			]
		}
	}
} );
