const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const del = require('del');
const crx = require('gulp-crx-pack');

const conf = require('../config/gulp.config.json');
const manifest = require(path.resolve(conf.files.manifest));
const key = fs.readFileSync(path.resolve(conf.files.key), 'utf8');

gulp.task('clean', gulp.parallel(cleanBuild, cleanDist));
gulp.task('clean:build', cleanBuild);
gulp.task('clean:dist', cleanDist);

gulp.task('build', gulp.series(cleanBuild, build));
gulp.task('build:dist', gulp.series(gulp.parallel(build, cleanDist), buildDist));
gulp.task('dist', gulp.series('build:dist'));

function build() {
  return gulp.src(path.join(path.resolve(conf.paths.src), '**', '*'))
    .pipe(gulp.dest(path.resolve(conf.paths.build)));
}

function buildDist() {
  return gulp.src(path.resolve(conf.paths.build))
    .pipe(crx({
      privateKey: key,
      filename: manifest.name + '.crx',
    }))
    .pipe(gulp.dest(path.resolve(conf.paths.dist)));
}

function cleanBuild() {
  return del(path.resolve(conf.paths.build));
}

function cleanDist() {
  return del(path.resolve(conf.paths.dist));
}
