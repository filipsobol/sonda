import { SondaWebpackPlugin, Config, type UserOptions } from 'sonda';

export default class SondaRspackPlugin extends SondaWebpackPlugin {
	constructor(userOptions: UserOptions = {}) {
		super(userOptions);

		this.options = new Config(userOptions, {
			integration: 'rspack'
		});
	}
}
