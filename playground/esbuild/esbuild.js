import { build } from 'esbuild';
import { SondaEsbuildPlugin } from 'sonda';

build( {
	entryPoints: [
		'src/index.js'
	],
	outdir: 'dist',
	format: 'esm',
	bundle: true,
	sourcemap: true,
	minify: true,
	metafile: true,
	plugins: [
		SondaEsbuildPlugin( {
			gzip: true,
			brotli: true,
			detailed: true,
			sources: true,
		} )
	]
} );
