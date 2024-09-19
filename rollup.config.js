import { builtinModules } from 'module';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { rm } from 'fs/promises';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';

function cwdResolve ( name ) {
	return resolve( process.cwd(), name );
}

// Remove old build folder
await rm( cwdResolve( "dist" ), { recursive: true, force: true } );

const { default: pkg } = await import( pathToFileURL( cwdResolve( "./package.json" ) ), {
	with: { type: "json" },
} );

/** @type {import('rollup').RollupOptions} */
const sharedOptions = {
	input: cwdResolve( "src/index.ts" ),
	external: [
		...builtinModules,
		...Object.keys( pkg.dependencies || {} ),
		...Object.keys( pkg.peerDependencies || {} ),
	],
	plugins: [
		nodeResolve( {
			browser: false,
			extensions: [ '.ts', '.js', '.mts', '.mjs', '.json', '.node' ],
			preferBuiltins: true
		} ),
		swc()
	],
}

/** @type {import('rollup').RollupOptions} */
const options = [
	{
		output: {
			file: cwdResolve( "dist/index.js" ),
			format: "esm",
			sourcemap: true,
		},
		...sharedOptions
	},
	{
		output: {
			file: cwdResolve( "dist/index.cjs" ),
			format: "cjs",
			sourcemap: true,
		},
		...sharedOptions
	}
];

export default options;
