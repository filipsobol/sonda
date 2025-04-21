import RollupPlugin from './rollup.js';
import { Config, type UserOptions } from '../index.js';
import type { Plugin } from 'rolldown';

export default function RolldownPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'rolldown'
	} );

	if ( !options.enabled ) {
		return { name: 'sonda-rolldown' };
	}

	return {
		...RollupPlugin( options ) as any,
		name: 'sonda-rolldown'
	};
}
