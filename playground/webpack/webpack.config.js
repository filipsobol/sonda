const path = require('path');
const { webpackPlugin: pitbull } = require('pitbull');

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
    pitbull()
  ]
};
