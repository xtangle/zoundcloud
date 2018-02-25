module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/ts/**/*.ts'
    ],
    exclude: [
      'src/ts/background.ts',
      'src/ts/content.ts'
    ],
    preprocessors: {
      'src/ts/**/*.ts': ['karma-typescript']
    },
    client: {
      captureConsole: false,
      mocha: {
        opts: 'mocha.opts'
      }
    },
    reporters: ['spec'],
    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/
      },
      compilerOptions: require('./tsconfig').compilerOptions,
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
