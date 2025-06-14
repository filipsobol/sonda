import { defineConfig } from 'vite';
import Sonda from 'sonda/vite';

export default defineConfig( {
  plugins: [
    Sonda( {
			format: 'html'
    } )
  ],
  build: {
    sourcemap: true
  }
} );
