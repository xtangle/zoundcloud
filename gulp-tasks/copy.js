const gulp = require('gulp');
const path = require('path');
const pump = require('pump');
const conf = require('../config/gulp.config.json');

gulp.task('copy', copy());

function copy() {
  return (cb) => {
    const src = conf.paths.src;
    pump([
      gulp.src([
        `${src}/**/*`,
        `!${src}/js{,/**}`,
      ]),
      gulp.dest(path.resolve(conf.paths.build)),
    ], cb);
  };
}
