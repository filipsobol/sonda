import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import pkg from './package.json' with { type: 'json' };

// Remove old build folder
await rm( 'dist', { recursive: true, force: true } );

export default defineConfig( {
	output: {
		dir: 'dist',
		format: 'esm',
		entryFileNames: '[name].js',
		chunkFileNames: '[name].js',
	},
	input: {
		'index': 'src/index.ts',
		'entrypoints/angular': 'src/entrypoints/angular.ts',
		'entrypoints/astro': 'src/entrypoints/astro.ts',
		'entrypoints/esbuild': 'src/entrypoints/esbuild.ts',
		'entrypoints/next': 'src/entrypoints/next.ts',
		'entrypoints/nuxt': 'src/entrypoints/nuxt.ts',
		'entrypoints/rolldown': 'src/entrypoints/rolldown.ts',
		'entrypoints/rollup': 'src/entrypoints/rollup.ts',
		'entrypoints/rspack': 'src/entrypoints/rspack.ts',
		'entrypoints/sveltekit': 'src/entrypoints/sveltekit.ts',
		'entrypoints/vite': 'src/entrypoints/vite.ts',
		'entrypoints/webpack': 'src/entrypoints/webpack.ts',
	},
	external: [
		...builtinModules,
		...Object.keys( pkg.dependencies ),
		'sonda'
	],
	platform: 'node',
	resolve: {
		extensionAlias: {
			'.js': [ '.ts', '.js' ],
		}
	},
	plugins: [
		dts()
	]
} );
