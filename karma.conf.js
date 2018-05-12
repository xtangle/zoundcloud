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
          // TODO: increase threshold back to 95 for all categories
          global: {
            statements: 85,
            branches: 85,
            functions: 85,
            lines: 85
          }
        }
      },
      reports: {
        'html': reportDestinationConfig,
        'lcovonly': reportDestinationConfig,
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

const reportDestinationConfig = {
  'directory': 'coverage',
  'subdirectory': 'HeadlessChrome'
};
