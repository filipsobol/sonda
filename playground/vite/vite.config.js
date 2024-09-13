import { defineConfig } from 'vite';
import virtual from 'vite-plugin-virtual'
import { vitePlugin as sonar } from 'sonar';

export default defineConfig( {
  plugins: [
    virtual( {
      'virtual:module': `export default { hello: 'world' }`,
      'virtual:config': { hello: 'world' }
    } ),
    sonar(),
  ],
  build: {
    sourcemap: true
  }
} );
