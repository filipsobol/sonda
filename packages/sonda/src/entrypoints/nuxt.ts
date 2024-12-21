import Sonda from './rollup';
import type { NuxtModule, Nuxt } from '@nuxt/schema';
import type { FrameworkUserOptions } from '../types';

export default function SondaNuxtPlugin( options: Partial<FrameworkUserOptions> = {} ): NuxtModule {
  return function SondaNuxtPlugin( _, nuxt: Nuxt ): void {
    if ( options.enabled === false ) {
      return;
    }

    options.filename ??= `sonda-report-[env].html`;

    // Nuxt runs few builds and each must generate a separate report
    if ( !options.filename.includes( '[env]' ) ) {
      throw new Error( 'SondaNuxtPlugin: The "filename" option must include the "[env]" token.' );
    }

    nuxt.hook( 'vite:extendConfig', ( config, { isClient, isServer } ) => {
      const env = isClient ? 'client' : 'nitro';
      const generateForServer = options.server ?? false;

      // Do not generate report for the server build unless explicitly enabled
      if ( isServer && !generateForServer ) {
        return;
      }

      // Because this configuration is shared between multiple builds, we need to clone it
      const sondaOptions = Object.assign( {}, options );

      // Replace the "[env]" token with the current build type
      sondaOptions.filename = sondaOptions.filename!.replace( '[env]', env )

      // Add the Sonda plugin to the Vite configuration
      config.plugins = config.plugins || [];
      config.plugins.push( Sonda( sondaOptions ) );
    } )
  }
}
