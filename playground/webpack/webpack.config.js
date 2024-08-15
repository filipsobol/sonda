const path = require( 'path' );
const { vitePlugin: sourcemaps } = require( 'unplugin-detailed-sourcemaps' );

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: []
  },
  plugins: [
    sourcemaps()
  ]
};
