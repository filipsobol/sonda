import { builtinModules } from 'module';
import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
	output: {
		dir: 'dist',
		format: 'esm',
		cleanDir: true
	},
	input: 'src/index.ts',
	platform: 'node',
	external: builtinModules as string[],
	resolve: {
		extensionAlias: {
			'.js': ['.ts', '.js']
		}
	},
	plugins: [dts()]
}) as any;
