import VitePlugin from './vite.js';
import { Config, type UserOptions } from '../index.js';
import type { AstroIntegration } from 'astro';

export default function SondaAstroPlugin( userOptions: UserOptions = {} ): AstroIntegration {
  const options = new Config( userOptions, {
    integration: 'astro',
    filename: 'sonda_[env]'
  } );

  if ( !options.enabled ) {
    return { name: 'sonda-astro', hooks: {} };
  }

  return {
    name: 'sonda-astro',
    hooks: {
      'astro:build:setup'( { vite, target } ) {
        // Do not generate report for the server build unless explicitly enabled
        if ( target === 'server' && !options.server ) {
          return;
        }

        // Because this configuration is shared between multiple builds, we need to clone it
        const sondaOptions = options.clone();

        // Replace the "[env]" token with the current build type
        sondaOptions.filename = sondaOptions.filename!.replace( '[env]', target );

        vite.plugins ??= [];
        vite.plugins.push( VitePlugin( sondaOptions ) );
      }
    }
  };
}
