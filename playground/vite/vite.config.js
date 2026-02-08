import { resolve } from 'path';
import { defineConfig } from 'vite';
import Sonda from 'sonda/vite';

export default defineConfig({
	plugins: [
		Sonda({
			format: 'html'
		})
	],
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
			formats: ['es', 'cjs']
		},
		sourcemap: true
	}
});
