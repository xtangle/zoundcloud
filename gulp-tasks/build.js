const gulp = require('gulp');
const HubRegistry = require('gulp-hub');

gulp.registry(new HubRegistry([
  'clean.js', 'copy.js', 'lint.js', 'pack.js', 'webpack.js',
]));

gulp.task('build', gulp.series(
  'clean:build',
  gulp.parallel(
    'copy',
    // TODO: change to lint:strict when refactor is complete
    gulp.series('lint', 'webpack')
  )
));

gulp.task('build:dist', gulp.series(
  gulp.parallel(
    'build',
    'clean:dist'
  ),
  'pack'
));
