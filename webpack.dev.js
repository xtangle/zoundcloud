const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const argv = require('yargs').argv;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: getPlugins()
});

function getPlugins() {
  const plugins = [];
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