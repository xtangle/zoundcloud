const webpackConfig = require('./webpack.common');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chrome'],
    files: [
      'src/ts/**/*.ts'
    ],
    exclude: [
    ],
    preprocessors: {
      'src/ts/**/*.ts': ['webpack']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve
    },
    webpackMiddleware: {
      noInfo: true
    },
    client: {
      captureConsole: false,
      mocha: {
        timeout: 500
      }
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  })
};
