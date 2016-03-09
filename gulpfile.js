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
    argv = require('yargs').argv,
    shuffle = require('./shuffle.js');


function showTime(){//hu3
    return (new Date()).toTimeString().substr(0, 8);
}

var paths = {
    buildPath: './build/'
};
paths.scripts = {
    buildPath: paths.buildPath+"js",
    srcFiles: './js/**/*.js',
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
        .pipe(argv.production? uglify({ mangle: true }) : gutil.noop())
        .pipe(gulp.dest(paths.scripts.buildPath))
        .pipe(notify({message: (argv.production ?
            'scripts merged o/'
            : '***ATENTION*** scripts merged in dev mode o/'
            )+'\nat '+showTime()
        }));
});

gulp.task('sass-compile-and-merge', function(){
    var streamCompileSass = gulp.src(paths.styles.srcFiles)
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest(paths.styles.destTempDir));
    var streamConcatCss = gulp.src(paths.styles.destTempDir);
    var streamVendorCss = gulp.src(paths.styles.vendorCss);
    return merge(streamCompileSass, streamConcatCss, streamVendorCss)
        .pipe(concat(paths.styles.destFile))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.styles.buildPath))
        .pipe(notify({message: 'sass compiled o/\nat '+showTime()}));
});

gulp.task('styles', ['clear-css', 'sass-compile-and-merge'], function(){
    return del([paths.styles.destTempDir]);
});

gulp.task('watch', function(){
    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('**/*.js', ['scripts']);
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

gulp.task('converte', function(){
    const SOURCE_FILE = 'assets/teste-texto-puro.txt';
    const OUTPUT_FILE = 'assets/test.json';
    var fs = require('fs');
    var testJSON = {
        questions: [],
        resultsMap  : {}
    };

    function newQuestion(id, text){
        return {
            id: id,
            text: text,
            answers: []
        };
    }

    function newAnswer(id, text, addTo){
        return {
            id: id,
            text: text,
            addTo: addTo
        };
    }

    function addAnswerToLastQuestion(text, letter){
        var question = testJSON.questions.pop();
        question.answers.push(newAnswer(question.id, text, letter));
        testJSON.questions.push(question);
    }

    // sort of states machine
    var startResults = false;
    var resultTitle = false;
    var resultText = false;
    var resultLetter = '';

    fs.readFileSync(SOURCE_FILE).toString().split('\n').forEach(function (line, index, lines) {
        function lineNotEmpty() {
            return line.length > 0;
        }

        if(index===0){
            testJSON.source = line;
        }
        else if(startResults && lineNotEmpty()){
            if(resultText){
                testJSON.resultsMap[resultLetter].text = line;
                resultText = false;
            }
            else if(resultTitle) {
                testJSON.resultsMap[resultLetter].title = line;
                resultTitle = false;
                resultText = true;
            }
            else{
                resultLetter = line.slice(-1).toLowerCase();
                testJSON.resultsMap[resultLetter] = {};
                resultTitle = true;
            }
        }
        else if(lineNotEmpty()) {
            if(line.match('\^[0-9]+.*\$')){
                testJSON.questions.push(
                    newQuestion(index, line.substring(3))
                );
            }
            else if(line.match('\^Resultado\$')){
                startResults = true;
            }
            else {
                var letter = line.substr(0,1);
                var text = line.substr(3);
                addAnswerToLastQuestion(text, letter);
            }
        }
    });

    var questions = testJSON.questions;
    for(var i=0; i<questions.length; i++){
        var question = questions[i];
        question.answers = shuffle(question.answers);
    }
    testJSON.questions = questions;

    fs.writeFile(OUTPUT_FILE, JSON.stringify(testJSON), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
});