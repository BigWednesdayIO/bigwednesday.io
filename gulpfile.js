var gulp = require('gulp'),
	// Plugins:
	autoprefixer = require('gulp-autoprefixer'),
	clean = require('gulp-clean'),
	eslint = require('gulp-eslint'),
	extend = require('gulp-extend'),
	minifyCss = require('gulp-minify-css'),
	rev = require('gulp-rev'),
	runWintersmith = require('run-wintersmith'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	svgSymbols = require('gulp-svg-symbols'),
	uglify = require('gulp-uglify'),
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
			browsers: ['last 3 versions', '> 1% in GB'],
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(assetsDir + '/css'));
});

gulp.task('build:preclean', function() {
	return gulp
		.src([
			'tmp',
			'build'
		], {read: false})
		.pipe(clean());
});

gulp.task('build:icons', function() {
	return gulp.src(assetsDir + '/images/icons/*.svg')
		.pipe(svgSymbols({
			templates: ['default-svg']
		}))
		.pipe(gulp.dest(assetsDir + '/images/'));
});

gulp.task('build:copy', ['sass', 'build:icons', 'build:preclean'], function() {
	return gulp
		.src('app/**')
		.pipe(gulp.dest('tmp'));
});

gulp.task('build:assets', ['build:copy'], function() {
	return gulp
		.src('tmp/templates/layouts/base.html')
		.pipe(usemin({
			css: [
				minifyCss(),
				rev()
			],
			js: [
				uglify(),
				rev()
			],
			headjs: [
				uglify(),
				rev()
			],
			assetsDir: 'tmp/contents/',
			outputRelativePath: '../../contents/'
		}))
		.pipe(gulp.dest('tmp/templates/layouts'));
});

gulp.task('build:config', function() {
	runWintersmith.settings.configFile = 'build.json';
	return gulp
		.src([
			'config.json',
			'config.build.json'
		])
		.pipe(extend('build.json', true, 2))
		.pipe(gulp.dest(''));
});

gulp.task('build:html', ['build:assets', 'build:config'], function(cb) {
	return runWintersmith.build(cb);
});

gulp.task('build', ['build:html'], function() {
	// Clean up once it's all done
	return gulp
		.src([
			'build.json',
			'tmp'
		], {read: false})
		.pipe(clean());
});

gulp.task('lint', function() {
	return gulp
		.src([
			'gulpfile.js',
			assetsDir + '/js/{,*/}*.js'
		])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('serve', function() {
	runWintersmith.settings.hostname = '0.0.0.0';
	runWintersmith.settings.port = 9000;
	runWintersmith.preview();
});

gulp.task('watch', ['sass'], function() {
	gulp.watch(assetsDir + '/scss/**', ['sass']);
	gulp.watch(assetsDir + '/images/icons/*.svg', ['build:icons']);
});

gulp.task('default', ['serve', 'watch']);
