import Sonda from 'sonda/next';
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda( {
  format: 'html',
  server: true,
  open: true
} );

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  }
};

export default withSondaAnalyzer( nextConfig );
