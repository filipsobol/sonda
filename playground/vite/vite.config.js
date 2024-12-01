import { defineConfig } from 'vite';
import virtual from 'vite-plugin-virtual'
import Sonda from 'sonda/vite';

export default defineConfig( {
  plugins: [
    virtual( {
      'virtual:module': `export default { hello: 'world' }`,
      'virtual:config': { hello: 'world' }
    } ),
    Sonda( {
      gzip: true,
      brotli: true,
      detailed: true,
      sources: true,
    } ),
  ],
  build: {
    sourcemap: true
  }
} );
