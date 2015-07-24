var fs = require('fs');
var path = require("path");

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
 * load.SpecifiedDirectory and return all files and folders
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
exports.load = function (dir, callback) {
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
