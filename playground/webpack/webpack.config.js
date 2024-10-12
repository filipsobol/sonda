import { SondaWebpackPlugin } from 'sonda';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    clean: true
  },
  plugins: [
    new MiniCssExtractPlugin(),
    // new BundleAnalyzerPlugin(),
    new SondaWebpackPlugin( {
      gzip: true,
      brotli: true,
      detailed: true
    } ),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
      },
    ],
  },
};
