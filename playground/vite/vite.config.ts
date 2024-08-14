import { defineConfig } from 'vite';
import { vitePlugin as sourcemaps } from 'unplugin-detailed-sourcemaps';

export default defineConfig( {
  plugins: [
    sourcemaps()
  ],
  build: {
    sourcemap: true
  }
} );
