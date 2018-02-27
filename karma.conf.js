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
          global: {
            statements: 90,
            branches: 80,
            functions: 80,
            lines: 90,
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
