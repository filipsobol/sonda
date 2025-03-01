import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

declare global {
	const SONDA_REPORT_DATA: string;
}

const SONDA_REPORT_DATA = process.env.NODE_ENV === 'production'
	? '__REPORT_DATA__'
	: readFileSync( './sample_data.json', 'utf-8' );

export default defineConfig({
	define: {
		SONDA_REPORT_DATA: JSON.stringify( encodeURIComponent( SONDA_REPORT_DATA ) )
	},
	build: {
		modulePreload: false,
		target: 'esnext',
		// emptyOutDir: false,
		// outDir: resolve( import.meta.dirname, '../sonda/dist' )
	},
	plugins: [
		sveltekit(),
		tailwindcss()
	],
	esbuild: {
		legalComments: 'none'
	}
});
