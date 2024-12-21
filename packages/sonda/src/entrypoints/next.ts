import SondaWebpack from './webpack';
import type { NextConfig } from 'next';
import type { UserOptions } from '../types.js';

interface NextUserOptions extends UserOptions {
  /**
   * Determines whether the plugin should generate report for the server build.
   * 
   * @default false
   */
  server: boolean;
}

export default function SondaNextPlugin( options: Partial<NextUserOptions> = {} ) {
  return function withSondaAnalyzer( nextConfig: NextConfig = {} ): NextConfig {
    if ( options.enabled === false ) {
      return nextConfig;
    }

    options.filename ??= `sonda-report-[env].html`;

    // Next.js runs few builds and each must generate a separate report
    if ( !options.filename.includes( '[env]' ) ) {
      throw new Error( 'SondaNextPlugin: The "filename" option must include the "[env]" token.' );
    }

    const generateForServer = options.server ?? false;

    return Object.assign( {}, nextConfig, {
      webpack( config, { nextRuntime, isServer } ) {
        const env = nextRuntime || 'client';

        // Do not generate report for...
        if (
          // ... the `edge` build because none of its files have source maps
          env === 'edge'

          // ... the server build unless explicitly enabled
          || ( isServer && !generateForServer )
        ) {
          return config;
        }

        // Because this configuration is shared between multiple builds, we need to clone it
        const sondaOptions = Object.assign( {}, options );

        // Replace the "[env]" token with the current build type
        sondaOptions.filename = sondaOptions.filename!.replaceAll( '[env]', env );

        // Add the Sonda plugin to the Webpack configuration
        config.plugins.push(
          new SondaWebpack( sondaOptions )
        );

        return config;
      }
    } satisfies NextConfig );
  }
}
