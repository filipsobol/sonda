import { defineConfig } from 'vite';
import virtual from 'vite-plugin-virtual'
import { vitePlugin as sonda } from 'sonda';

export default defineConfig( {
  plugins: [
    virtual( {
      'virtual:module': `export default { hello: 'world' }`,
      'virtual:config': { hello: 'world' }
    } ),
    sonda(),
  ],
  build: {
    sourcemap: true
  }
} );
