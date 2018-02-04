const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  plugins: [
    // minify
    new webpack.optimize.UglifyJsPlugin()
  ]
});
