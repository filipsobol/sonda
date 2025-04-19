import SondaWebpack from './webpack';
import { Config, type UserOptions } from '../index.js';
import type { NextConfig } from 'next';

export default function SondaNextPlugin( userOptions: UserOptions = {} ) {
  return function Sonda( nextConfig: NextConfig = {} ): NextConfig {
    const options = new Config( userOptions, {
      integration: 'next',
      filename: 'sonda_[env]'
    } );

    if ( !options.enabled ) {
      return nextConfig;
    }

    return Object.assign( {}, nextConfig, {
      webpack( config, { nextRuntime, isServer } ) {
        const env = nextRuntime || 'client';

        // Do not generate report for...
        if (
          // ... the `edge` build because none of its files have source maps
          env === 'edge'

          // ... the server build unless explicitly enabled
          || ( isServer && !options.server )
        ) {
          return config;
        }

        // Because this configuration is shared between multiple builds, we need to clone it
        const sondaOptions = options.clone();

        // Replace the "[env]" token with the current build type
        sondaOptions.filename = sondaOptions.filename!.replace( '[env]', env );

        // Add the Sonda plugin to the Webpack configuration
        config.plugins.push( new SondaWebpack( sondaOptions ) );

        return config;
      }
    } satisfies NextConfig );
  }
}
