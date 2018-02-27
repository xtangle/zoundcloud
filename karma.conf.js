module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
    ],
    exclude: [
      'src/background.ts',
      'src/content.ts'
    ],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      'test/**/*.ts': ['karma-typescript']
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
      coverageOptions: {
        threshold: {
          // todo: raise these values higher once rest of the tests are implemented
          global: {
            statements: 79,
            branches: 60,
            functions: 60,
            lines: 79,
          }
        },
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
