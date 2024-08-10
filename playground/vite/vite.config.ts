import { defineConfig } from 'vite';
import { vitePlugin as pitbull } from 'pitbull';

export default defineConfig( {
  plugins: [
    pitbull()
  ],
  build: {
    sourcemap: true
  }
} );
