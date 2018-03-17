module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/ts/**/*.ts',
      'test/ts/**/*.ts'
    ],
    exclude: [
      'src/ts/background.ts',
      'src/ts/content.ts'
    ],
    preprocessors: {
      'src/ts/**/*.ts': ['karma-typescript'],
      'test/ts/**/*.ts': ['karma-typescript']
    },
    client: {
      captureConsole: true,
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
          // todo: Add more tests and bump coverage back to 95%
          global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60
          }
        }
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
