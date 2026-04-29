/*
 1. Creates a documentation
 */

import gulp from 'gulp';
import { deleteAsync } from 'del';
import shell from 'gulp-shell';
import jsdoc from 'gulp-jsdoc3';

// Destination files
const DEST_DOCS = 'docs/';

// Source files
const SRC = 'app/';

// Cleanup the documentation folder
export function cleanDocs(cb) {
    deleteAsync([DEST_DOCS + '**/*']).then(() => cb());
}

// Document
export function document(cb) {
    gulp.src(['readme.md', './app/**/*.js'], { read: false })
        .pipe(jsdoc(cb));
}

// Global cleaning
export const clean = gulp.series(cleanDocs);

// Default task
export default gulp.series(clean, document);

