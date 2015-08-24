var gulp = require('gulp'),
	sass = require('gulp-sass');

gulp.task('sass', function () {
	gulp.src('./main.scss')
		.pipe(sass({
			indentType: 'tab',
			indentWidth: 1,
			outputStyle: 'expanded',
			sourceComments: true
		}))
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest('./'));
});

gulp.task('sass:watch', function () {
	gulp.watch('./main.scss', ['sass']);
});

gulp.task('default', ['sass:watch']);
