import Sonda from 'sonda/webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    clean: true
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new Sonda( {
			format: 'json'
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
