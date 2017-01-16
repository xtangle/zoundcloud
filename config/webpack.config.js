const path = require('path');

module.exports = {
  context: path.resolve(__dirname, '..'),
  loaders: [
    {
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
      },
      test: /\.js$/,
    },
  ],
  output: {
    filename: '[name].js',
  },
};
