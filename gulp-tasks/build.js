const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

const crx = require('gulp-crx-pack');
const del = require('del');
const eslint = require('gulp-eslint');
const named = require('vinyl-named');
const pump = require('pump');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

const conf = require('../config/gulp.config.json');
const webpackConf = require(path.resolve(conf.files.webpackConf));
const manifest = require(path.resolve(conf.files.manifest));
const key = fs.readFileSync(path.resolve(conf.files.key), 'utf8');

gulp.task('clean:build', cleanBuild);
gulp.task('clean:dist', cleanDist);
gulp.task('clean', gulp.parallel('clean:build', 'clean:dist'));

gulp.task('build', gulp.series(
  'clean:build', gulp.parallel(copyAssets, buildJavascript)
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
      `!${src}/js{,/**}`,
    ]),
    gulp.dest(path.resolve(conf.paths.build)),
  ], cb);
}

function buildJavascript(cb) {
  const js = `${conf.paths.src}/js`;
  pump([
    gulp.src([
      `${js}/**/*`,
      `!${js}/common{,/**}`,
      `!${js}/lib{,/**}`,
    ]),
    eslint(path.resolve(conf.files.eslintrc)),
    eslint.format(),
    named(),
    webpack(webpackConf),
    uglify(),
    gulp.dest(path.join(path.resolve(conf.paths.build), 'js')),
  ], cb);
}

function buildExtension(cb) {
  pump([
    gulp.src(path.resolve(conf.paths.build)),
    crx({
      filename: manifest.name + '.crx',
      privateKey: key,
    }),
    gulp.dest(path.resolve(conf.paths.dist)),
  ], cb);
}
