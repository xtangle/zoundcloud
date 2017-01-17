const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const crx = require('gulp-crx-pack');
const pump = require('pump');

const conf = require('../config/gulp.config.json');
const manifest = require(path.resolve(conf.files.manifest));
const key = fs.readFileSync(path.resolve(conf.files.key), 'utf8');

gulp.task('pack', pack());

function pack() {
  return (cb) => {
    pump([
      gulp.src(conf.paths.build),
      crx({
        filename: manifest.name + '.crx',
        privateKey: key,
      }),
      gulp.dest(path.resolve(conf.paths.dist)),
    ], cb);
  };
}
