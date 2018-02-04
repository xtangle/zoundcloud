const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/ts/app.ts'),
    background: path.join(__dirname, 'src/ts/background.ts'),
    vendor: ['jquery']
    //popup: path.join(__dirname, 'src/popup.ts'),
    //options: path.join(__dirname, 'src/options.ts'),
    //content_script: path.join(__dirname, 'src/content_script.ts'),
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