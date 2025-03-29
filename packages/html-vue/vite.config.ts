import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
  ],
	build: {
		modulePreload: false,
		target: 'esnext',
		// emptyOutDir: false,
		// outDir: resolve( import.meta.dirname, '../sonda/dist' )
	},
	esbuild: {
		legalComments: 'none'
	},
	resolve: {
		alias: {
			'@components': fileURLToPath( new URL( './src/components', import.meta.url ) ),
			'@icon': fileURLToPath( new URL( './src/components/Icon', import.meta.url ) ),
			'@layout': fileURLToPath( new URL( './src/components/Layout', import.meta.url ) ),
			'@router': fileURLToPath( new URL( './src/router.js', import.meta.url ) )
		}
	}
});
