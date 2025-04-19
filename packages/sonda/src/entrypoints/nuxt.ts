import VitePlugin from './vite';
import { Config, type UserOptions } from '../index.js';
import type { NuxtModule, Nuxt } from '@nuxt/schema';

export default function SondaNuxtPlugin( userOptions: UserOptions = {} ): NuxtModule {
  return function SondaNuxtPlugin( _, nuxt: Nuxt ): void {
    const options = new Config( userOptions, {
      integration: 'nuxt',
      filename: 'sonda_[env]'
    } );

    if ( !options.enabled ) {
      return;
    }

    nuxt.hook( 'vite:extendConfig', ( config, { isClient, isServer } ) => {
      const env = isClient ? 'client' : 'nitro';

      // Do not generate report for the server build unless explicitly enabled
      if ( isServer && !options.server ) {
        return;
      }

      // Because this configuration is shared between multiple builds, we need to clone it
      const sondaOptions = options.clone();

      // Replace the "[env]" token with the current build type
      sondaOptions.filename = sondaOptions.filename.replace( '[env]', env )

      // Add the Sonda plugin to the Vite configuration
      config.plugins ??= [];
      config.plugins.push( VitePlugin( sondaOptions ) );
    } )
  }
}
