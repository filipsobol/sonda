import type { NextConfig } from 'next';

const withSondaAnalyzer = require( 'sonda/next' )();

const config: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  }
};

module.exports = withSondaAnalyzer( config );
