import { SondaRollupPlugin } from './rollup.js';
import { Config, type UserOptions } from '../config.js';
import type { PluginOption } from 'vite';

export function SondaVitePlugin( userOptions: UserOptions = {} ): PluginOption {
  const options = new Config( userOptions, {
    integration: 'vite'
  } );

  if ( !options.enabled ) {
    return { name: 'sonda-vite' };
  }

  return {
    ...SondaRollupPlugin( options ),
    name: 'sonda-vite',
    enforce: 'pre',
    apply: 'build'
  };
}
