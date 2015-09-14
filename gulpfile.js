var gulp = require('gulp'),
	// Plugins:
	autoprefixer = require('gulp-autoprefixer'),
	eslint = require('gulp-eslint'),
	minifyCss = require('gulp-minify-css'),
	rev = require('gulp-rev'),
	runWintersmith = require('run-wintersmith'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	usemin = require('gulp-usemin');

var assetsDir = 'app/contents/assets';

function handleError (err) {
	console.log(err.toString());
	this.emit('end');
}

gulp.task('sass', function() {
	return gulp
		.src(assetsDir + '/scss/app.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', handleError))
		.pipe(autoprefixer({
			browsers: ['last 3 versions'],
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(assetsDir + '/css'));
});

gulp.task('clean:build', function() {
	return gulp
		.src('build', {read: false})
		.pipe(clean());
});

gulp.task('build:html', runWintersmith.build);

gulp.task('build:assets', ['build:html', 'sass'], function() {
	// TODO bring this back into the build
	return gulp
		.src('build/{,*/}*.html')
		.pipe(usemin({
			css: [
				minifyCss(),
				rev()
			],
			path: 'app'
		}))
		.pipe(gulp.dest('build/'));
});

gulp.task('build', ['build:html']);

gulp.task('lint', function() {
	return gulp
		.src([
			'gulpfile.js',
			assetsDir + '/js'
		])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('serve', runWintersmith.preview);

gulp.task('watch', ['sass'], function() {
	gulp.watch(assetsDir + '/scss/**', ['sass']);
	// gulp.watch('app/**/*.html', ['reload']);
});

gulp.task('default', ['serve', 'watch']);
