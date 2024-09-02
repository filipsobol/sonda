import { defineConfig } from 'vite';
import virtual from 'vite-plugin-virtual'
import { vitePlugin as sourcemaps } from 'unplugin-detailed-sourcemaps';
import { vitePlugin as sonar } from 'unplugin-sonar';

export default defineConfig( {
  plugins: [
    virtual( {
      'virtual:module': `export default { hello: 'world' }`,
      'virtual:config': { hello: 'world' }
    } ),
    sonar(),
    sourcemaps(),
  ],
  build: {
    sourcemap: true
  }
} );
