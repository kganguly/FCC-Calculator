/*'use strict';

var gulp = require('gulp'),
    shell = require('gulp-shell');

gulp.task('server', ['node', 'karma']);

gulp.task('node', shell.task('node app.js'));
gulp.task('karma', shell.task('powershell -Command "./karma.ps1"'));*/

var gulp = require('gulp');
var Server = require('karma').Server;

// Run test once and exit
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'/*,
    singleRun: true */
  }, done).start();
});