const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const argv = require('yargs').argv;

module.exports = merge(common, {
  devtool: 'eval-source-map',
  plugins: getPlugins()
});

function getPlugins() {
  const plugins = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true
    })
  ];
  // only add plugin if the --watch flag is set
  if (argv.watch) {
    plugins.push(
      // enables hot-reloading in the browser
      new ChromeExtensionReloader({
        entries: { //The entries used for the content/background scripts
          background: 'background', //Use the entry names, not the file name or the path
          contentScript: 'content' //Use the entry names, not the file name or the path
        }
      })
    );
  }
  return plugins;
}