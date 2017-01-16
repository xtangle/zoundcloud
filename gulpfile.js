const gulp = require('gulp');
const path = require('path');
const HubRegistry = require('gulp-hub');
const conf = require('./config/gulp.config.json');

let hub = new HubRegistry(path.join(conf.paths.tasks, '**', '*.js'));

gulp.registry(hub);

gulp.task('default', gulp.series('build:dist'));
