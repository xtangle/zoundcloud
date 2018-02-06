const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    eventPage: path.join(__dirname, 'src/ts/event-page.ts'),
    contentTrack: path.join(__dirname, 'src/ts/content-track.ts'),
    vendor: ['jquery']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        loader: 'tslint-loader',
        enforce: 'pre',
        options: {
          failOnHint: true,
          typeCheck: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    // clean build directory
    new CleanWebpackPlugin(['dist']),
    // copy assets
    new CopyWebpackPlugin([{
      context: 'src',
      from: '*.*'
    }]),
    // pack common vender files
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    })
  ]
};