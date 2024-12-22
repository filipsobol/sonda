import Sonda from 'sonda/next';
import type { NextConfig } from 'next';

const withSondaAnalyzer = Sonda();

const config: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  }
};

export default withSondaAnalyzer( config );
