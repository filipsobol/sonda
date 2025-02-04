import { defineConfig } from '@rspack/cli';
import Sonda from 'sonda/rspack';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

export default defineConfig({
	entry: './src/index.js',
	devtool: 'source-map',
	output: {
		filename: 'index.js',
		clean: true
	},
	plugins: [
		new Sonda(),
		// new RsdoctorRspackPlugin( {
		// 	disableClientServer: true,
		// 	mode: 'brief',
		// 	brief: {
		// 		reportHtmlName: 'rsdoctor-report.html',
		// 		writeDataJson: true
		// 	},
		// 	supports: {
		// 		generateTileGraph: true
		// 	}
		// } )
	],
	experiments: {
		css: true
	},
} );
