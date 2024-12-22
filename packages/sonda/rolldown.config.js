import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import pkg from './package.json' with { type: 'json' };

// Remove old build folder
await rm( 'dist', { recursive: true, force: true } );

const sharedOptions = defineConfig( {
	input: {
		'index': 'src/index.ts',
		'entrypoints/astro': 'src/entrypoints/astro.ts',
		'entrypoints/esbuild': 'src/entrypoints/esbuild.ts',
		'entrypoints/next': 'src/entrypoints/next.ts',
		'entrypoints/nuxt': 'src/entrypoints/nuxt.ts',
		'entrypoints/parcel': 'src/entrypoints/parcel.ts',
		'entrypoints/rollup': 'src/entrypoints/rollup.ts',
		'entrypoints/webpack': 'src/entrypoints/webpack.ts',
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
