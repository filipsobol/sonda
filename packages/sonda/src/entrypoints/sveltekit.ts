import Sonda from './rollup';
import type { PluginOption } from 'vite';
import type { FrameworkUserOptions } from '../types';

export default function SondaSvelteKitPlugin( options: Partial<FrameworkUserOptions> = {} ): PluginOption {
  if ( options.enabled === false ) {
    return { name: 'sonda' };
  }

  options.format ??= 'html';
  options.filename ??= `sonda-report-[env].${ options.format }`;

  // SvelteKit runs few builds and each must generate a separate report
  if ( !options.filename.includes( '[env]' ) ) {
    throw new Error( 'SondaSvelteKitPlugin: The "filename" option must include the "[env]" token.' );
  }

  return {
    apply: 'build',

    configResolved( config ) {
      const env = config.build.ssr ? 'server' : 'client';
      const generateForServer = options.server ?? false;

      if ( env === 'server' && !generateForServer ) {
        options.enabled = false;
      }

      options.filename = options.filename!.replace( '[env]', env );
    },

    ...Sonda( options )
  };
}
