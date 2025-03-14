import { defineConfig } from 'rolldown';
import Sonda from 'sonda/rolldown';

export default defineConfig( {
	input: 'src/index.ts',
	output: {
		file: 'dist/index.js',
		sourcemap: true,
		format: 'es',
		minify: true
	},
	plugins: [
		Sonda(),
	]
} );
