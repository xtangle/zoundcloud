const path = require('path');
const parser = require('yargs-parser');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

function getChromeReloaderPlugin() {
  const plugins = [];
  // only add plugin if the --watch flag is set
  if (parser(process.argv).watch) {
    plugins.push(
      new ChromeExtensionReloader({
        // The entries used for the content/background scripts; use entry names, not the file name or path
        entries: {
          background: 'background',
          contentScript: 'content',
        },
      }),
    );
  }
  return plugins;
}

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/ts/background.ts'),
    content: path.join(__dirname, 'src/ts/content.ts'),
    options: path.join(__dirname, 'src/ts/options.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    modules: [
      __dirname,
      'node_modules',
    ],
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    // clean build directory
    new CleanWebpackPlugin(),
    // copy assets
    new CopyWebpackPlugin([
      {
        context: 'src/resources',
        from: '**/*.*',
      },
    ]),
    ...getChromeReloaderPlugin(),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
        },
      },
    },
  },
};
