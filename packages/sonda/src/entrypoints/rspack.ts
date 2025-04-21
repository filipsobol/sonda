import { Config, type UserOptions } from '../index.js';
import WebpackPlugin from './webpack.js';

export default class SondaRspackPlugin extends WebpackPlugin {
	constructor ( userOptions: UserOptions = {} ) {
		super( userOptions );

		this.options = new Config( userOptions, {
			integration: 'rspack'
		} );
	}
}
