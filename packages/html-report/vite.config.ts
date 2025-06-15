import { resolve } from 'path';
import { gzipSync } from 'zlib';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'url';

const SONDA_REPORT_DATA = process.env.NODE_ENV === 'production'
	? '__REPORT_DATA__'
	: gzipSync( readFileSync( './sample_data.json', 'utf-8' ) ).toString('base64');

export default defineConfig( {
	define: {
		SONDA_REPORT_DATA: JSON.stringify( SONDA_REPORT_DATA ),
	},
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
  ],
	build: {
		modulePreload: false,
		target: 'esnext',
		emptyOutDir: false,
		outDir: resolve( import.meta.dirname, '../sonda/dist' )
	},
	esbuild: {
		legalComments: 'none'
	},
	resolve: {
		alias: {
			'@': fileURLToPath( new URL( './src', import.meta.url ) ),
			'@components': fileURLToPath( new URL( './src/components', import.meta.url ) ),
			'@icon': fileURLToPath( new URL( './src/components/icon', import.meta.url ) ),
			'@layout': fileURLToPath( new URL( './src/components/layout', import.meta.url ) )
		}
	}
} );
