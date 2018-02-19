module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chrome', 'karma-typescript'],
    files: [
      'src/ts/**/*.ts'
    ],
    exclude: [
      'src/ts/constants.ts'
    ],
    preprocessors: {
      'src/ts/**/*.ts': ['karma-typescript']
    },
    client: {
      captureConsole: false,
      mocha: {
        timeout: 500
      }
    },
    reporters: ['spec'],
    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/
      },
      compilerOptions: {
        target: 'es2015'
      },
      reports: {
        'html': 'coverage',
        'text': ''
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
};
