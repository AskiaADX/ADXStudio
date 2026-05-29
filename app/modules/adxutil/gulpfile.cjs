/*
 1. Creates a documentation
 */

const gulp = require('gulp');
const { deleteAsync } = require('del');
const { exec } = require('child_process');

// Destination files
const DEST_DOCS = 'docs/';

// Source files
const SRC = 'app/';

// Cleanup the documentation folder
function cleanDocs(cb) {
    deleteAsync([DEST_DOCS + '**/*']).then(() => cb());
}

// Document
function document(cb) {
    exec('npx jsdoc -c jsdoc.json', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error generating documentation: ${stderr}`);
            cb(err);
        } else {
            console.log(stdout);
            cb();
        }
    });
}

// Global cleaning
const clean = gulp.series(cleanDocs);

// Default task
const defaultTask = gulp.series(clean, document);

exports.cleanDocs = cleanDocs;
exports.document = document;
exports.clean = clean;
exports.default = defaultTask;

