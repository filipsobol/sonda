import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import pkg from './package.json' with { type: 'json' };

// Remove old build folder
await rm( 'dist', { recursive: true, force: true } );

const sharedOptions = defineConfig( {
	input: 'src/index.ts',
	external: [
		...builtinModules,
		...Object.keys( pkg.dependencies ),
	]
} );

export default defineConfig( [
	{
		output: {
			file: 'index.js',
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
