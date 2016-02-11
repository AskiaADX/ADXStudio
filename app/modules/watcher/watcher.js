"use strict";

const fs = require('fs');
const util = require("util");
const EventEmitter = require("events").EventEmitter;
const path = require('path');
const glob = require('glob');

/*
From http://stackoverflow.com/questions/33086985/how-to-obtain-case-exact-path-of-a-file-in-node-js-on-windows

 SYNOPSIS
 trueCasePathSync(<fileSystemPath>)
 DESCRIPTION
 Given a possibly case-variant version of an existing filesystem path, returns
 the case-exact, normalized version as stored in the filesystem.
 Note: If the input path is a globbing *pattern* as defined by the 'glob' npm
 package (see prerequisites below), only the 1st match, if any,
 is returned.
 Only a literal input path guarantees an unambiguous result.
 If no matching path exists, undefined is returned.
 On case-SENSITIVE filesystems, a match will also be found, but if case
 variations of a given path exist, it is undefined which match is returned.
 PLATFORMS
 Windows, OSX, and Linux (though note the limitations with case-insensitive
 filesystems).
 LIMITATIONS
 - Paths starting with './' are acceptable, but paths starting with '../'
 are not - when in doubt, resolve with fs.realPathSync() first.
 An initial '.' and *interior* '..' instances are normalized, but a relative
 input path still results in a relative output path. If you want to ensure
 an absolute output path, apply fs.realPathSync() to the result.
 - On Windows, no attempt is made to case-correct the drive letter or UNC-share
 component of the path.
 - Unicode support:
 - Be sure to use UTF8 source-code files (with a BOM on Windows)
 - On OSX, the input path is automatically converted to NFD Unicode form
 to match how the filesystem stores names, but note that the result will
 invariably be NFD too (which makes no difference for ASCII-characters-only
 names).
 PREREQUISITES
 npm install glob    # see https://www.npmjs.com/search?q=glob
 EXAMPLES
 trueCasePathSync('/users/guest') // OSX: -> '/Users/Guest'
 trueCasePathSync('c:\\users\\all users') // Windows: -> 'c:\Users\All Users'
 */
function trueCasePathSync(fsPath) {

    // Normalize the path so as to resolve . and .. components.
    // !! As of Node v4.1.1, a path starting with ../ is NOT resolved relative
    // !! to the current dir, and glob.sync() below then fails.
    // !! When in doubt, resolve with fs.realPathSync() *beforehand*.
    let fsPathNormalized = path.normalize(fsPath);

    // OSX: HFS+ stores filenames in NFD (decomposed normal form) Unicode format,
    // so we must ensure that the input path is in that format first.
    if (process.platform === 'darwin') {
        fsPathNormalized = fsPathNormalized.normalize('NFD');
    }

    // !! Windows: Curiously, the drive component mustn't be part of a glob,
    // !! otherwise glob.sync() will invariably match nothing.
    // !! Thus, we remove the drive component and instead pass it in as the 'cwd'
    // !! (working dir.) property below.
    const pathRoot = path.parse(fsPathNormalized).root;
    const noDrivePath = fsPathNormalized.slice(Math.max(pathRoot.length - 1, 0));

    // Perform case-insensitive globbing (on Windows, relative to the drive /
    // network share) and return the 1st match, if any.
    // Fortunately, glob() with nocase case-corrects the input even if it is
    // a *literal* path.
    return glob.sync(noDrivePath, { nocase: true, cwd: pathRoot })[0];
}


/**
 * Create a new instance of watcher
 * @param {String} [pattern] Initial path to watch
 * @param {Object} [options] Watch options
 * @param {Boolean} [options.recursive=false] Recursive watch on directories
 */
function Watcher(pattern, options) {
    EventEmitter.call(this);
    this._watchers = {};
    this._timeouts = {};
    if (pattern) {
        this.add(pattern, options);
    }
}

util.inherits(Watcher, EventEmitter);

/**
 * Add a new watcher on the specified pattern
 *
 * @param {String} pattern Path to watch
 * @param {Object} [options] Watch options
 * @param {Boolean} [options.recursive=false] Recursive watch on directories
 */
Watcher.prototype.add = function add(pattern, options) {
    const resolvedPath = trueCasePathSync(path.resolve(pattern));
    if (!resolvedPath) {
        return;
    }
    const key = pattern.toLocaleLowerCase();
    const self = this;
    this.remove(pattern);
    this._watchers[key] = fs.watch(resolvedPath, options);
    this._watchers[key].on('change', function (event, filename) {
        // The events are triggered several times, just filter it
        if (self._timeouts[key]) {
            return;
        }
        self._timeouts[key] = setTimeout(function () {
            delete self._timeouts[key];
        }, 500);
        self.emit('change', event, resolvedPath, filename);
    });
};

/**
 * Remove a watcher at the specified pattern
 * Do it recursively to also unwatch all sub-folders if any
 *
 * @param {String} pattern Path to unwatch
 */
Watcher.prototype.remove = function remove(pattern) {
    const key = pattern.toLocaleLowerCase();
    // Looks to all keys that start with the specified pattern
    // this is done to unwatch recursively all sub-folders
    for (const k in this._watchers) {
        if (this._watchers.hasOwnProperty(k)) {
            if (k.indexOf(key) === 0) { // Start with
                this._watchers[k].close();
                delete this._watchers[k];     
            }
        }
    }
};

/**
 * Close all sub-watchers and clear the list
 */
Watcher.prototype.close = function close() {
    for (const key in this._watchers) {
        if (this._watchers.hasOwnProperty(key)) {
            this._watchers[key].close();
            delete this._watchers[key];
        }
    }
};

/**
 * Create a watcher
 *
 * @param {String} [pattern] Initial path to watch
 * @param {Object} [options] Watch options
 * @param {Boolean} [options.recursive=false] Recursive watch on directories
 */
exports.create = function create(pattern, options) {
    return new Watcher(pattern, options);
};