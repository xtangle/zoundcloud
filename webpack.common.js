const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/ts/background.ts'),
    'content-script': path.join(__dirname, 'src/ts/content-script.ts'),
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
          failOnHint: false,
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
    }),
    // set environment global variable
    new webpack.DefinePlugin({
      ENV: JSON.stringify(process !== undefined ? process.env.NODE_ENV : 'development')
    })
  ]
};