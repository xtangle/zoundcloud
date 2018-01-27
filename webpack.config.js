const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/ts/app.ts'),
    vendor: ['jquery']
    //popup: path.join(__dirname, 'src/popup.ts'),
    //options: path.join(__dirname, 'src/options.ts'),
    //content_script: path.join(__dirname, 'src/content_script.ts'),
    //background: path.join(__dirname, 'src/background.ts'),
    //vendor: ['moment', 'jquery']
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    // pack common vender files
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    })
  ]
};