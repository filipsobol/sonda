import type { FrameworkUserOptions } from '../types';
import Sonda from './rollup';
import type { AstroIntegration } from 'astro';

export default function SondaAstroPlugin( options: Partial<FrameworkUserOptions> = {} ): AstroIntegration {
  return {
    name: 'sonda/astro',
    hooks: {
      'astro:build:setup'( { vite, target } ) {
        if ( options.enabled === false ) {
          return;
        }

        options.filename ??= `sonda-report-[env].html`;

        // Nuxt runs few builds and each must generate a separate report
        if ( !options.filename.includes( '[env]' ) ) {
          throw new Error( 'SondaAstroPlugin: The "filename" option must include the "[env]" token.' );
        }

        const generateForServer = options.server ?? false;

        // Do not generate report for the server build unless explicitly enabled
        if ( target === 'server' && !generateForServer ) {
          return;
        }

        // Because this configuration is shared between multiple builds, we need to clone it
        const sondaOptions = Object.assign( {}, options );

        // Replace the "[env]" token with the current build type
        sondaOptions.filename = sondaOptions.filename!.replace( '[env]', target )

        vite.plugins ??= [];
        vite.plugins.push( Sonda( sondaOptions ) );
      }
    }
  };
}
