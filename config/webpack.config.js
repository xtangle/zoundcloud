const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, '..'),
  module: {
    rules: [
      {
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: [
            ['es2015', {'modules': false}],
          ],
        },
        test: /\.js$/,
      },
    ],
  },
  output: {
    filename: '[name].js',
  },
  plugins: [
    new BabiliPlugin(),
  ],
};
