const path = require('path');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/app.ts')
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
};