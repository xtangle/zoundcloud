const gulp = require('gulp');
const del = require('del');
const path = require('path');
const conf = require('../config/gulp.config.json');

gulp.task('clean:build', cleanBuild);
gulp.task('clean:dist', cleanDist);
gulp.task('clean', gulp.parallel('clean:build', 'clean:dist'));

function cleanBuild() {
  return del(path.resolve(conf.paths.build));
}

function cleanDist() {
  return del(path.resolve(conf.paths.dist));
}