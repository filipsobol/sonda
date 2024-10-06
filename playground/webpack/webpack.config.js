const { SondaWebpackPlugin } = require( 'sonda' );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
// const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );

module.exports = {
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
        use: [ MiniCssExtractPlugin.loader, "css-loader" ],
      },
    ],
  },
};
