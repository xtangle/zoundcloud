const gulp = require('gulp');
const path = require('path');

const named = require('vinyl-named');
const pump = require('pump');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const conf = require('../config/gulp.config.json');
const webpackConf = require(path.resolve(conf.files.webpackConf));

gulp.task('webpack', webpackTask());

function webpackTask() {
  return (cb) => {
    const js = `${conf.paths.src}/js`;
    pump([
      gulp.src([
        `${js}/**/*`,
        `!${js}/common{,/**}`,
        `!${js}/lib{,/**}`,
      ]),
      named(),
      webpackStream(webpackConf, webpack),
      gulp.dest(path.join(path.resolve(conf.paths.build), 'js')),
    ], cb);
  };
}
