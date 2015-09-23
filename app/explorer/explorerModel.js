var fs = require('fs');
var fsExtra = require('fs.extra');
var chokidar = require('chokidar');
var path = require("path");
var util = require("util");
var EventEmitter = require("events").EventEmitter;


/**
 * Sort the files with folder first
 * @param a
 * @param b
 * @returns {number}
 */
function sortFiles(a, b) {
    // Type (folder first)
    if (a.type !== b.type) {
        return (a.type === 'file') ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
}

/**
 * Create a new instance of the explorer object
 */
function Explorer() {
  EventEmitter.call(this);
}

util.inherits(Explorer, EventEmitter);

/**
 * load the specified directory and return all files and folders
 *
 *    var explorer=require('ADXStudio/src/explorer/explorer.js');
 *    explorer.load('C:/',function(err,files){
*       console.log(files); // [
*                               {name:"documents and settings", type:"folder", path:"C:/Document and settings/"}
*                               {name:"desktop.ini", type:"file", path:'C:/Desktop.ini/'}
*                              ]
*    });
 *
 * @param {String} dir The SpecifiedDirectory to load.
 * @param {Function} callback
 * @param {Error} callback.err Error
 * @param {Array} callback.files return an array of files/folders
 */
Explorer.prototype.load = function (dir, callback) {
    if (!callback) {
        throw new Error('Invalid argument, expected callback');
    }

    if (typeof dir !== 'string') {
        callback(new Error('Invalid argument, expected dir to be string.'), null);
        return;
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

            var stats;
            var finalFiles = [];
            var i, l = files.length;

            for (i = 0; i < l; i++) {
                try {
                    stats = fs.statSync(path.join(dir, files[i]));
                }
                catch (err2) {
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
 * Watch a directory
 * @param {String} dir Directory path to watch
 */
Explorer.prototype.watch = function watch(dir) {
    if (!dir || typeof dir !== 'string') {
        throw new Error('Invalid argument');
    }
    // Close the previous watcher first
    if (this.watcher) {
        this.watcher.close();
    }

    this.watcher = chokidar.watch(dir, {
        ignoreInitial : true,
        usePolling: true
    });

    /**
     * Event trigger when the structure of the directory has been changed
     * @param pathChanged
     */
    function onStructureChange(pathChanged) {
        //Part to reload parent folder when path have bben changed.
        var parentDir = path.join(pathChanged, '..');
        module.exports.load(parentDir, function(err, files) {
            if (err) {
                return;
            }
            module.exports.emit('change', parentDir, files);
        });
    }

    this.watcher.on('add', onStructureChange);
    this.watcher.on('addDir', onStructureChange);
    this.watcher.on('unlink', onStructureChange);
    this.watcher.on('unlinkDir', onStructureChange);
};

/**
 * Rename the file or directory.
 *
 *    var explorer=require('ADXStudio/src/explorer/explorer.js');
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

  callback = callback || function () {};
  fs.rename(oldPath, newPath, function(err) {

    if (err) {
      callback(err);
      return;
    }

    callback(null);

    //Part to reload parent folder when path have bben changed.
    var parentDir = path.join(newPath, '..');
    module.exports.load(parentDir, function(err, files) {
      if (err) {
          return;
      }
      module.exports.emit('change', parentDir, files);
    });

  });

};


/**
 * Remove the file or folder.
 *
 *    var explorer = require('ADXStudio/src/explorer/explorer.js');
 *    explorer.remove(pathToRemove, function(err) {
 *       console.log(err);
 *    });
 *
 * @param {String} pathToRemove Path of file or folder to remove.
 * @param {Function} callback
 * @param {Error} callback.err Error
 */
Explorer.prototype.remove = function(pathToRemove, callback) {

    if (!pathToRemove && !callback) {
        throw new Error('Invalid argument');
    }

    var parentDir = path.join(pathToRemove, '..');

    callback = callback || function () {};

    fsExtra.rmrf(pathToRemove, function(err) {

        if (err) {
            callback(err);
            return;
        }

        callback(null);

        //Part to reload parent folder when path have bben changed.

        module.exports.load(parentDir, function(err, files) {
            if (err) {
                return;
            }
            module.exports.emit('change', parentDir, files);
        });
    });
};

module.exports = new Explorer();

