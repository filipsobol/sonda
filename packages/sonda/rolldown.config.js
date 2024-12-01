import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import pkg from './package.json' with { type: 'json' };

// Remove old build folder
await rm( 'dist', { recursive: true, force: true } );

const sharedOptions = defineConfig( {
	input: {
		'index': 'src/index.ts',
		'bundlers/esbuild': 'src/bundlers/esbuild.ts',
		'bundlers/parcel': 'src/bundlers/parcel.ts',
		'bundlers/rollup': 'src/bundlers/rollup.ts',
		'bundlers/webpack': 'src/bundlers/webpack.ts',
	},
	external: [
		...builtinModules,
		...Object.keys( pkg.dependencies ),
		'sonda',
	],
	resolve: {
		extensionAlias: {
			'.js': [ '.ts', '.js' ],
		}
	}
} );

export default defineConfig( [
	{
		output: {
			dir: 'dist',
			format: 'esm',
			platform: 'node',
			sourcemap: true,
			entryFileNames: '[name].mjs',
			chunkFileNames: '[name].mjs',
		},
		...sharedOptions
	},
	{
		output: {
			dir: 'dist',
			format: 'cjs',
			platform: 'node',
			sourcemap: true,
			entryFileNames: '[name].cjs',
			chunkFileNames: '[name].cjs',
		},
		...sharedOptions
	}
] );
