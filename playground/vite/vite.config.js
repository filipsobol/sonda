import { defineConfig } from 'vite';
import { vitePlugin as sourcemaps } from 'unplugin-detailed-sourcemaps';
import { vitePlugin as sonar } from 'unplugin-sonar';

export default defineConfig( {
  plugins: [
    sourcemaps(),
    sonar(),
  ],
  build: {
    sourcemap: true
  }
} );
