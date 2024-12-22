import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';

// Remove old build folder
await rm( 'dist', { recursive: true, force: true } );

const sharedOptions = defineConfig( {
	input: 'src/index.ts',
	external: builtinModules,
	resolve: {
		extensionAlias: {
			'.js': [ '.ts', '.js' ],
		}
	}
} );

export default defineConfig( [
	{
		output: {
			file: 'index.mjs',
			format: 'esm',
			sourcemap: true,
		},
		...sharedOptions
	},
	{
		output: {
			file: 'index.cjs',
			format: 'cjs',
			sourcemap: true,
		},
		...sharedOptions
	}
] );
