'use strict';

const fs = require('fs');
const fsExtra = require('fs.extra');
const watcher = require('../modules/watcher/watcher.js');
const path = require('path');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-js');

/**
 * Sort the files with folder first
 * @param a
 * @param b
 * @returns {number}
 */
function sortFiles (a, b) {
  // Type (folder first)
  if (a.type !== b.type) {
    return (a.type === 'file') ? 1 : -1;
  }
  return a.name.localeCompare(b.name);
}

/**
 * Create a new instance of the explorer object
 */
function Explorer () {
  this._root = '';
  EventEmitter.call(this);
}

util.inherits(Explorer, EventEmitter);

/**
 * Return the path of the root folder
 *
 * @returns {string}
 */
Explorer.prototype.getRootPath = function getRootPath () {
  return this._root;
};

/**
 * Set the path of the root folder
 *
 * @param {string} rootPath
 */
Explorer.prototype.setRootPath = function setRootPath (rootPath) {
  this._root = path.resolve(rootPath);
  this.rootPath = rootPath;
  this.initWatcher();
};


/**
 * Set the path of the root folder
 */
Explorer.prototype.initWatcher = function initWatcher () {
  // Close the previous instance first
  if (this._watcher && this._watcher.close) {
    this._watcher.close();
  }

  this._watcher = watcher.create(this._root);

  const self = this;
  /**
   * Event trigger when the structure of the directory has been changed
   * @param {String} event Name of event
   * @param {String} pathChanged Path of file that has changed
   */
  function onRootChange (event, pathChanged) {
    //Part to reload parent folder when path has been changed.
    //let parentDir = pathChanged === self._root ? pathChanged : path.join(pathChanged, '..');
    module.exports.load(pathChanged, function (err, files) {
      if (err) {
        return;
      }
      self.emit('change', pathChanged, files);
    });
  }

  this._watcher.on('change', onRootChange);
};


/**
 * load the specified directory and return all files and folders
 *
 *    let explorer=require('ADXStudio/src/explorer/explorer.js');
 *    explorer.load('C:/', true, function(err,files){
 *       console.log(files); // [
 *                               {name:"documents and settings", type:"folder", path:"C:/Document and settings/"}
 *                               {name:"desktop.ini", type:"file", path:'C:/Desktop.ini/'}
 *                              ]
 *    });
 *
 * @param {String} dir The SpecifiedDirectory to load.
 * @param {Boolean} [isRoot=false] Indicates if the directory to load is a root directory
 * @param {Function} callback
 * @param {Error} callback.err Error
 * @param {Array} callback.files return an array of files/folders
 */
Explorer.prototype.load = function (dir, isRoot, callback) {
  // Swap arguments
  if (typeof isRoot === 'function') {
    callback = isRoot;
    isRoot = false;
  }

  if (!callback) {
    throw new Error('Invalid argument, expected callback');
  }

  if (typeof dir !== 'string') {
    callback(new Error('Invalid argument, expected dir to be string.'), null);
    return;
  }

  if (isRoot) {
    this.setRootPath(dir);
  } else {
    if (this._watcher && this._watcher.add) {
      this._watcher.add(path.resolve(dir));
    }
  }

  fs.stat(dir, function (err, stats) {
    if (err) {
      callback(err, null);
      return;
    }

    if (!stats.isDirectory()) {
      callback(new Error('Invalid dir path.'), null);
      return;
    }

    fs.readdir(dir, function (err1, files) {

      if (err1) {
        callback(err1, null);
        return;
      }

      let stats;
      const finalFiles = [];

      for (let i = 0, l = files.length; i < l; i++) {
        try {
          stats = fs.statSync(path.join(dir, files[i]));
        }        catch (err2) {
          continue;
        }
        finalFiles.push({
          name: files[i],
          path: path.join(dir, files[i]),
          type: (stats.isFile()) ? 'file' : 'folder'
        });
      }
      callback(null, finalFiles.sort(sortFiles));
    });
  });
};

/**
 * Rename the file or directory.
 *
 *    let explorer=require('ADXStudio/src/explorer/explorer.js');
 *    explorer.rename('old/path', 'path/new', function(err) {
 *       console.log(err);
 *    });
 *
 * @param {String} oldPath Path of file or folder to change.
 * @param {String} newPath Path of new file or folder changed.
 * @param {Function} callback
 * @param {Error} callback.err Error
 */
Explorer.prototype.rename = function (oldPath, newPath, callback) {

  if ((!oldPath || !newPath) && !callback) {
    throw new Error('Invalid argument');
  }

  callback = callback || function () { };
  fs.rename(oldPath, newPath, function (err) {

    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });

};

/**
 * Minify the file
 *
 *    let explorer=require('ADXStudio/src/explorer/explorer.js');
 *    explorer.minify('old/path', 'path/new', function(err) {
 *       console.log(err);
 *    });
 *
 * @param {String} oldPath Path of file to change.
 * @param {String} newPath Path of new file.
 * @param {Function} callback
 * @param {Error} callback.err Error
 */
Explorer.prototype.minify = function (oldPath, newPath, callback) {

  if ((!oldPath || !newPath) && !callback) {
    throw new Error('Invalid argument');
  }

  callback = callback || function () { };


  minify({
    compressor: uglifyjs,
    input: oldPath,
    output: newPath,
    callback: function(err, min){
      if (err) {
        callback(err);
        return;
      }
  
      callback(null);
    }
  });
};

/**
 * Remove the file or folder.
 *
 *    let explorer = require('ADXStudio/src/explorer/explorer.js');
 *    explorer.remove(pathToRemove, function(err) {
 *       console.log(err);
 *    });
 *
 * @param {String} pathToRemove Path of file or folder to remove.
 * @param {Function} callback
 * @param {Error} callback.err Error
 */
Explorer.prototype.remove = function (pathToRemove, callback) {

  if (!pathToRemove && !callback) {
    throw new Error('Invalid argument');
  }

  callback = callback || function () { };

  // Remove watcher before to remove the directory
  const stats = fs.statSync(pathToRemove);
  if (stats.isDirectory() && this._watcher && this._watcher.remove) {
    this._watcher.remove(pathToRemove);
  }

  fsExtra.rmrf(pathToRemove, function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });
};

module.exports = new Explorer();

