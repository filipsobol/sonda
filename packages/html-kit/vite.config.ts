import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

process.env.VITE_SONDA_REPORT_DATA = '__REPORT_DATA__';

if ( process.env.NODE_ENV !== 'production' ) {
	const sampleDataPath = resolve(
		process.cwd(),
		'sample_data.json'
	);

	process.env.VITE_SONDA_REPORT_DATA = encodeURIComponent(
		readFileSync( sampleDataPath, 'utf-8' )
	);
}

export default defineConfig({
	build: {
		modulePreload: false,
		// emptyOutDir: false,
		// outDir: resolve( import.meta.dirname, '../sonda/dist' )
	},
	plugins: [
		sveltekit(),
	]
});
