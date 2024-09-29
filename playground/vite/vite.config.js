import { defineConfig } from 'vite';
import virtual from 'vite-plugin-virtual'
import { SondaRollupPlugin } from 'sonda';

export default defineConfig( {
  plugins: [
    virtual( {
      'virtual:module': `export default { hello: 'world' }`,
      'virtual:config': { hello: 'world' }
    } ),
    SondaRollupPlugin(),
  ],
  build: {
    sourcemap: true
  }
} );
