var gulp = require('gulp'),
	// Plugins:
	autoprefixer = require('gulp-autoprefixer')
	clean = require('gulp-clean'),
	connect = require('gulp-connect'),
	eslint = require('gulp-eslint'),
	minifyCss = require('gulp-minify-css'),
	nunjucksRender = require('gulp-nunjucks-render'),
	rev = require('gulp-rev'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	usemin = require('gulp-usemin');

function handleError (err) {
	console.log(err.toString());
	this.emit('end');
}

gulp.task('sass', function() {
	return gulp
		.src('app/assets/scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', handleError))
		.pipe(autoprefixer({
			browsers: ['last 3 versions'],
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('app/assets/css'))
		.pipe(connect.reload());
});

gulp.task('clean:build', function() {
	return gulp
		.src('build', {read: false})
		.pipe(clean());
});

gulp.task('copy:build', ['clean:build'], function() {
	return gulp
		.src([
			'app/**',
			'!app/assets/{css,scss}{,/**}',
			'!app/index.html'
		])
		.pipe(gulp.dest('build/'));
});

gulp.task('build:assets', ['clean:build', 'sass'], function() {
	return gulp
		.src('app/index.html')
		.pipe(usemin({
			css: [
				minifyCss(),
				rev()
			]
		}))
		.pipe(gulp.dest('build/'));
});

gulp.task('build:html', ['clean:build'], function() {
	nunjucksRender.nunjucks.configure(['app/'], {watch: false});
	return gulp
		.src([
			'app/{,*/}*.html',
			'!app/layouts/*'
		])
		.pipe(nunjucksRender())
		.pipe(gulp.dest('build/'));
});

gulp.task('build', ['copy:build', 'build:assets', 'build:html']);

gulp.task('lint', function() {
	return gulp
		.src([
			'gulpfile.js',
			'app/assets/js'
		])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('serve', function() {
	connect.server({
		root: 'app',
		port: 9000,
		livereload: true,
		middleware: function() {
			var nunjucksMiddleware = require('connect-nunjucks');
			return [nunjucksMiddleware({
				baseDir: 'app',
				// debug: 'console',
				ext: '.html'
			})];
		}
	});
});

gulp.task('reload', function() {
	return gulp
		.src('app/**/*.html')
		.pipe(connect.reload());
});

gulp.task('watch', ['sass'], function() {
	gulp.watch('app/assets/scss/**', ['sass']);
	gulp.watch('app/**/*.html', ['reload']);
});

gulp.task('default', ['serve', 'watch']);
