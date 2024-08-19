import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile( {
      removeViteModuleLoader: true
    } ),
    createHtmlPlugin()
  ],
})
