import { rm } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

// Remove old build folder
await rm('dist', { recursive: true, force: true });

export default defineConfig({
	output: {
		dir: 'dist',
		format: 'esm',
		entryFileNames: '[name].js',
		chunkFileNames: '[name].js'
	},
	input: 'src/index.ts',
	platform: 'node',
	external: builtinModules,
	resolve: {
		extensionAlias: {
			'.js': ['.ts', '.js']
		}
	},
	plugins: [dts()]
});
