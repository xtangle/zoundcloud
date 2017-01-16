const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const crx = require('gulp-crx-pack');
const del = require('del');
const pump = require('pump');
const conf = require('../config/gulp.config.json');

gulp.task('clean:build', cleanBuild);
gulp.task('clean:dist', cleanDist);
gulp.task('clean', gulp.parallel('clean:build', 'clean:dist'));

gulp.task('copy', copyAssets);
gulp.task('build', gulp.series(
  'clean:build', gulp.parallel('copy', buildJavascript)
));
gulp.task('build:dist', gulp.series(
  gulp.parallel('build', 'clean:dist'), buildExtension
));
gulp.task('dist', gulp.series('build:dist'));

function cleanBuild() {
  return del(path.resolve(conf.paths.build));
}

function cleanDist() {
  return del(path.resolve(conf.paths.dist));
}

function copyAssets(cb) {
  const src = conf.paths.src;
  pump([
    gulp.src([
      `${src}/**/*`,
      `!${src}/{js, js/**/*}`,
    ]),
    gulp.dest(path.resolve(conf.paths.build)),
  ], cb);
}

function buildJavascript(cb) {
  const js = `${conf.paths.src}/js`;
  pump([
    gulp.src([
      `${js}/**/*`,
      `!${js}/{common, common/**/*}`,
      `!${js}/{lib, lib/**/*}`,
    ]),
    gulp.dest(path.join(path.resolve(conf.paths.build), 'js')),
  ], cb);
}

function buildExtension(cb) {
  const manifest = require(path.resolve(conf.files.manifest));
  const key = fs.readFileSync(path.resolve(conf.files.key), 'utf8');
  pump([
    gulp.src(path.resolve(conf.paths.build)),
    crx({
      privateKey: key,
      filename: manifest.name + '.crx',
    }),
    gulp.dest(path.resolve(conf.paths.dist)),
  ], cb);
}
