import { SondaRollupPlugin, Config, type UserOptions } from 'sonda';
import type { Plugin } from 'rolldown';

export default function RolldownPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'rolldown'
	} );

	if ( !options.enabled ) {
		return { name: 'sonda/rolldown' };
	}

	return {
		...SondaRollupPlugin( options ) as any,
		name: 'sonda/rolldown'
	};
}
