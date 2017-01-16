const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const conf = require('./config/gulp.config.json');

let hub = new HubRegistry(`${conf.paths.tasks}/**/*.js`);
gulp.registry(hub);

gulp.task('default', gulp.series('build:dist'));
