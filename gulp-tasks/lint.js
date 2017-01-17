const gulp = require('gulp');
const path = require('path');
const eslint = require('gulp-eslint');
const pump = require('pump');
const conf = require('../config/gulp.config.json');

gulp.task('lint', lint());
gulp.task('lint:strict', lint({strict: true}));

function lint(options) {
  return (cb) => {
    let steps = [
      gulp.src(`${conf.paths.src}/js/**/*`),
      eslint(path.resolve(conf.files.eslintrc)),
      eslint.format(),
    ];
    if (options && options.strict) {
      steps.push(eslint.failAfterError());
    }
    pump(steps, cb);
  };
}
