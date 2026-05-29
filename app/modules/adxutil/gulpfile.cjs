/*
 1. Creates a documentation
 */

import gulp from 'gulp';
import { deleteAsync } from 'del';
import { exec } from 'child_process';

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
export const clean = gulp.series(cleanDocs);

// Default task
export default gulp.series(clean, document);

