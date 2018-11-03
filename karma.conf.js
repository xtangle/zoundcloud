const tsconfig = require('./tsconfig');

const reportDestinationConfig = {
  directory: 'coverage',
  subdirectory: 'HeadlessChrome',
};

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/ts/**/*.ts',
      'src/resources/*.html',
      'test/ts/**/*.ts',
    ],
    exclude: [
      'src/ts/background.ts',
      'src/ts/content.ts',
      'src/ts/options.ts',
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
      '**/*.html': ['html2js'],
    },
    client: {
      captureConsole: false,
      mocha: {
        opts: 'mocha.opts',
      },
    },
    reporters: ['mocha'],
    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/,
      },
      compilerOptions: tsconfig.compilerOptions,
      coverageOptions: {
        threshold: {
          global: {
            statements: 95,
            branches: 95,
            functions: 95,
            lines: 95,
          },
        },
      },
      reports: {
        html: reportDestinationConfig,
        lcovonly: reportDestinationConfig,
        text: '',
      },
    },
    html2JsPreprocessor: {
      stripPrefix: 'src/resources/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
  });
};
