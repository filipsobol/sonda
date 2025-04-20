import { build } from 'esbuild';
import Sonda from 'sonda/esbuild';

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
	logLevel: 'info',
	plugins: [
		Sonda( {
			format: 'json'
		} )
	]
} );
