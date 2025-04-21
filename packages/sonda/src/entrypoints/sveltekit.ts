import VitePlugin from './vite.js';
import { Config, type UserOptions } from '../index.js';
import type { PluginOption } from 'vite';

export default function SondaSvelteKitPlugin( userOptions: UserOptions = {} ): PluginOption {
  const options = new Config( userOptions, {
    integration: 'sveltekit',
    filename: 'sonda_[env]'
  } );

  if ( !options.enabled ) {
    return { name: 'sonda-sveltekit' };
  }

  return {
    ...VitePlugin( options ),
    name: 'sonda-sveltekit',
    configResolved( config ) {
      const env = config.build.ssr ? 'server' : 'client';
      const generateForServer = userOptions.server ?? false;

      if ( env === 'server' && !generateForServer ) {
        userOptions.enabled = false;
      }

      options.filename = options.filename.replace( '[env]', env );
    }
  };
}
