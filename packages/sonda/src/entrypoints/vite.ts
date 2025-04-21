import RollupPlugin from './rollup.js';
import { Config, type UserOptions } from '../index.js';
import type { PluginOption } from 'vite';

export default function VitePlugin( userOptions: UserOptions = {} ): PluginOption {
  const options = new Config( userOptions, {
    integration: 'vite'
  } );

  if ( !options.enabled ) {
    return { name: 'sonda-vite' };
  }

  return {
    ...RollupPlugin( options ),
    name: 'sonda-vite',
    apply: 'build'
  };
}
