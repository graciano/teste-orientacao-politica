'use strict';
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    browserify = require('gulp-browserify'),
    notify = require('gulp-notify'),
    cssnano = require('gulp-cssnano'),
    merge = require('merge-stream'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    argv = require('yargs').argv;


function showTime(){//hu3
    return (new Date()).toTimeString().substr(0, 8);
}

var paths = {
    buildPath: './build/'
};
paths.scripts = {
    buildPath: paths.buildPath+"js",
    srcFiles: [
        './js/**/*.js',
        './bower_components/zepto/zepto.min.js'
    ],
    destFile: "main.min.js"
};
paths.styles = {
    buildPath: paths.buildPath+"css",
    srcFiles: './sass/**/*.scss',
    destFile: "main.min.css",
    vendorCss: "./node_modules/normalize.css/normalize.css",
    destTempDir: paths.buildPath+"sass-compiled-temp"
};

gulp.task('scripts', ['clear-js'], function() {
    return gulp.src(paths.scripts.srcFiles)
        .pipe(concat(paths.scripts.destFile))
        .pipe(browserify({
            debug: !argv.production
        }))
        .on('error', swallowError)
        .pipe(argv.production? uglify({ mangle: true }) : gutil.noop())
        .on('error', swallowError)
        .pipe(gulp.dest(paths.scripts.buildPath))
        .pipe(notify({
            title: "scripts",
            message: (argv.production ?
            'scripts merged o/'
            : '***ATENTION*** scripts merged in dev mode o/'
            )+'\nat '+showTime()
        }));
});

gulp.task('sass-compile-and-merge', function(){
    var streamCompileSass = gulp.src(paths.styles.srcFiles)
        .pipe(sass({errLogToConsole: true}))
        .on('error', swallowError)
        .pipe(gulp.dest(paths.styles.destTempDir));
    var streamConcatCss = gulp.src(paths.styles.destTempDir);
    var streamVendorCss = gulp.src(paths.styles.vendorCss);
    return merge(streamCompileSass, streamConcatCss, streamVendorCss)
        .pipe(concat(paths.styles.destFile))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.styles.buildPath))
        .pipe(notify({
            title: 'Styles',
            message: 'sass compiled o/\nat '+showTime()
        }));
});

gulp.task('styles', ['clear-css', 'sass-compile-and-merge'], function(){
    return del([paths.styles.destTempDir]);
});

gulp.task('watch', function(){
    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch(['**/*.js', '!build/**/*'], ['scripts']);
});

gulp.task('clear-js', function() {
    return del(['build/js']);
});

gulp.task('clear-css', function() {
    return del(['build/css', 'build/sass-compiled']);
});

gulp.task('clear', function(){
   gulp.start('clear-js');
   gulp.start('clear-sass');
});

gulp.task('default', function() {
    gulp.start('scripts');
    gulp.start('styles');
});

var swallowError = notify.onError({
    message: "Error: <%= error.message %>",
    title: "Error running something"
});

gulp.task('converte', require('./convert.js'));