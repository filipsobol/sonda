import { gzipSync } from 'zlib';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'url';

const REPORT_DATA = process.env.NODE_ENV === 'production'
	? '__REPORT_DATA__'
	: readFileSync( './sample_data.json', 'utf-8' );

// https://vite.dev/config/
export default defineConfig( {
	define: {
		SONDA_REPORT_DATA: JSON.stringify( gzipSync( REPORT_DATA ).toString('base64') )
	},
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
  ],
	build: {
		modulePreload: false,
		target: 'esnext',
		// emptyOutDir: false,
		// outDir: resolve( import.meta.dirname, '../sonda/dist' )
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
