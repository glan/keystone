'use strict';

var gulp = require('gulp'),
  es = require('event-stream'),
  browserify = require('gulp-browserify'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  less = require('gulp-less'),
  connect = require('gulp-connect'),
  jshint = require('gulp-jshint'),
  checkstyleFileReporter = require('jshint-checkstyle-file-reporter').reporter;

gulp.task('default', ['watch', 'connect', 'dev']);
gulp.task('dev', ['browserify-dev', 'less-dev']);

// JSHint task =================================================================

gulp.task('jshint', function () {
  //var hintResults = [];
  return gulp.src(['gulpfile.js', './src/js/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(es.through(function (data) {
      this.jshint = this.jshint || {
        results: []
      };
      if (data.jshint.results) {
        this.jshint.results = this.jshint.results.concat(data.jshint.results);
      }
    }, function () {
      this.queue(this.jshint);
    }))
    .pipe(es.through(function (data) {
      process.env.JSHINT_CHECKSTYLE_FILE = 'checkstyle.xml';
      checkstyleFileReporter(data.results);
    }));
});

// Browserify (dev) task =======================================================

gulp.task('browserify-dev', function () {
  return gulp.src('./src/js/main.js', {
      read: false
    })
    .pipe(browserify({
      debug: true
    }))
    .pipe(rename('app.dev.js'))
    .pipe(gulp.dest('./webapp/dist'));
});

// LESS (dev) task =============================================================

gulp.task('less-dev', function () {
  var a = gulp.src('./src/styles/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(rename('app.dev.css'))
    .pipe(gulp.dest('./webapp/dist'));
});

// Watch task ==================================================================

gulp.task('watch', function () {
  gulp.watch(['./src/**/*.js', './src/**/*.hbs', './src/**/*.json'], ['browserify-dev']);
  gulp.watch('./src/**/*.less', ['less-dev']);
  gulp.watch(['./webapp/index.html', './webapp/dist/*.*'], ['reload']);
});

// Live reload task ============================================================

gulp.task('reload', function () {
  gulp.src('./webapp/index.html')
    .pipe(connect.reload());
});

// Connect server task =========================================================

gulp.task('connect', function () {
  connect.server({
    root: './webapp',
    port: 9000,
    livereload: true
  });
});
