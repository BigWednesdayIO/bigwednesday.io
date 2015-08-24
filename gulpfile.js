var gulp = require('gulp'),
	runSequence = require('run-sequence'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	plugins = gulpLoadPlugins();

gulp.task('sass', function () {
	return gulp.src('app/assets/scss/*.scss')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass())
		.pipe(plugins.autoprefixer({
			browsers: ['last 3 versions'],
		}))
		.pipe(plugins.sourcemaps.write('.'))
		.pipe(gulp.dest('app/assets/css'));
});

gulp.task('clean:build', function () {
	return gulp.src('build', {read: false})
		.pipe(plugins.clean());
});

gulp.task('copy:build', function () {
	return gulp.src([
			'app/**',
			'!app/assets/{css,scss}{,/**}',
			'!app/index.html'
		])
		.pipe(gulp.dest('build/'));
});

gulp.task('build:assets', function () {
	return gulp.src('app/index.html')
		.pipe(plugins.usemin({
			css: [plugins.minifyCss(), plugins.rev()]
		}))
		.pipe(gulp.dest('build/'));
});

gulp.task('build', function(callback) {
	runSequence('clean:build',
		'sass',
		['copy:build', 'build:assets'],
	callback);
});

gulp.task('watch', function () {
	gulp.watch('app/main.scss', ['sass']);
});

gulp.task('default', ['watch']);
