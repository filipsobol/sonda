const { webpackPlugin: sourcemaps } = require( 'unplugin-detailed-sourcemaps' );
const { webpackPlugin: sonar } = require( 'unplugin-sonar' );

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    clean: true
  },
  plugins: [
    sourcemaps(),
    sonar(),
  ]
};
