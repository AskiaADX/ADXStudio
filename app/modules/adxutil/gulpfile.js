"use strict";

/*
 1. Creates a documentation
 */


const gulp      = require('gulp');
const del       = require('del');
const shell     = require('gulp-shell');

// Destination files
const DEST_DOCS   = 'docs/';

// Source files
const SRC         = 'app/';

// Default task
gulp.task('default', ['clean', 'document']);

// Global cleaning
gulp.task('clean', ['clean:docs']);

// Cleanup the documentation folder
gulp.task('clean:docs',  (cb) => {
    del([DEST_DOCS + '**/*'], cb);
});

// Document
const jsdoc = require('gulp-jsdoc3');

gulp.task('document', ['clean:docs'], (cb) => {
    gulp.src(['readme.md', './app/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});

