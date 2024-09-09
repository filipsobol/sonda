const { webpackPlugin: sonar } = require( 'unplugin-sonar' );
// const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    clean: true
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    sonar(),
  ]
};
