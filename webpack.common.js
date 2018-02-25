const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/ts/background.ts'),
    content: path.join(__dirname, 'src/ts/content.ts'),
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
        loader: 'ts-loader',
        options: {
          transpileOnly: true
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
    /** todo: Use official repo to dl the plugin once Webpack 4 support is merged
        see https://github.com/TypeStrong/fork-ts-checker-webpack-plugin */
    new ForkTsCheckerWebpackPlugin({
      tslint: true
    })
  ]
};