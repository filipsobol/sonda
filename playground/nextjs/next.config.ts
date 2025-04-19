import Sonda from 'sonda/next';
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda( {
  format: 'json',
  server: true
} );

const config: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  }
};

export default withSondaAnalyzer( config );
