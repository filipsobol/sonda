import { defineConfig } from '@rsbuild/core';
import { SondaWebpackPlugin } from 'sonda';

export default defineConfig( {
	tools: {
		rspack: {
			plugins: [ new SondaWebpackPlugin() ]
		}
	}
} );
