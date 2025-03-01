import { defineConfig } from 'vite';
import Sonda from 'sonda/vite';

export default defineConfig( {
  plugins: [
    Sonda(),
  ],
  build: {
    sourcemap: true
  }
} );
