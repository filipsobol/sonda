import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  webpack: ( config, options ) => {
    const { SondaWebpackPlugin } = require( 'sonda' );

    if ( options.isServer ) {
      config.devtool = 'source-map';
    }

    config.plugins.push(
      new SondaWebpackPlugin( {
        sources: true,
        detailed: true,
        filename: options.nextRuntime
          ? `sonda-report-runtime-${ options.nextRuntime }.html`
          : 'sonda-report-client.html',
      } )
    );

    return config;
  },
};

module.exports = nextConfig;
