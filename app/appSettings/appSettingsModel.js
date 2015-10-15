var path = require('path');
var fs = require('fs');

/**
 * Manage the settings of the application
 * @constructor
 */
function AppDataSettings(){
    this.rootPath = path.join(process.env.APPDATA, 'ADXStudio');
    this._cache  = {};
}

/**
 * Return the path of the app data folder
 */
AppDataSettings.prototype.getAppDataPath = function getAppDataPath() {
    return this.rootPath;
};

/**
 * Get the list of most recently used project
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {Array} callback.mru
 */
AppDataSettings.prototype.getMostRecentlyUsed = function getMostRecentlyUsed(callback) {
    // No callback
    if (typeof callback !== 'function') {
        return;
    }
    if (this._cache.mru) {
        callback(null, this._cache.mru);
        return;
    }
    var filePath = path.join(this.rootPath, 'MRU.json');
    var self = this;
    fs.readFile(filePath, function onReadMRU(err, data) {
        if (err) {
           callback(err, []);
           return;
        }

        var mru = data ? JSON.parse(data) : [];
        self._cache.mru = mru || [];
        callback(null, self._cache.mru.slice());
    });
};

/**
 * Clear the cache
 */
AppDataSettings.prototype.clearCache = function clearCache() {
    this._cache = {};
};

/**
 * Add a new entry or move the entry on top of the most recently used
 * @param {Object} item Item to add
 * @param {String} item.path Path of the entry
 * @param {Function} callback
 * @param {Error} callback.err
 */
AppDataSettings.prototype.addMostRecentlyUsed = function addMostRecentlyUsed(item, callback) {
    var self = this;
    this.getMostRecentlyUsed(function onGetMRU(err, mru) {
        var i, l, indexFound = -1;

        for (i = 0, l = mru.length; i < l; i += 1) {
            if (mru[i].path === item.path) {
                indexFound = i;
                break;
            }
        }

        if (indexFound > -1) {
            mru.splice(indexFound, 1);
        }
        mru.unshift(item);
        self._cache.mru = mru;
        fs.writeFile(path.join(self.rootPath, 'MRU.json'),  JSON.stringify(mru), {encoding: 'utf8'}, function onWriteMRU(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    });
};

/**
 * Return the initial project to open
 * @param {Function} callback
 * @param {String} callback.projectPath
 */
AppDataSettings.prototype.getInitialProject = function getInitialProject(callback) {
    if (typeof callback !== 'function') {
        return;
    }
    this.getMostRecentlyUsed(function onGetMRU(err, mru) {
       callback((mru.length)  ? mru[0].path : '');
    });
};

module.exports = new AppDataSettings();