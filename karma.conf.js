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
          global: {
            statements: 95,
            branches: 95,
            functions: 95,
            lines: 95,
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
