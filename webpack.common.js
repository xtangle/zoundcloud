const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/ts/background.ts'),
    content: path.join(__dirname, 'src/ts/content.ts')
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
    alias: {
      "@src": path.join(__dirname, 'src/ts')
    },
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    // linting
    new ForkTsCheckerWebpackPlugin({
      tslint: true
    }),
    // clean build directory
    new CleanWebpackPlugin(['dist']),
    // copy assets
    new CopyWebpackPlugin([{
      context: 'src/resources',
      from: '*.*'
    }])
  ],
};