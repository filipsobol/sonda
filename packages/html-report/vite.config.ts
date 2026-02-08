import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'url';

export default defineConfig({
	plugins: [vue(), tailwindcss(), viteSingleFile()],
	build: {
		modulePreload: false,
		target: 'esnext'
	},
	esbuild: {
		legalComments: 'none'
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@components': fileURLToPath(new URL('./src/components', import.meta.url)),
			'@icon': fileURLToPath(new URL('./src/components/icon', import.meta.url)),
			'@layout': fileURLToPath(new URL('./src/components/layout', import.meta.url))
		}
	}
});
