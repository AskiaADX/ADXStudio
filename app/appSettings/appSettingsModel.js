var path = require('path');
var fs = require('fs');

var PREF_FILENAME = "Prefs.json";
var MRU_FILENAME = "MRU.json";

/**
 * Merge two object together (recursively)
 * @param {Object} destination Destination object (where the data will be append)
 * @param {Object} source Source object (where the data will be read)
 * @return {Object} Merged object
 */
function merge(destination, source) {
    var k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            if (!destination.hasOwnProperty(k)) {
                if (Array.isArray(source[k])) {
                    destination[k] = source[k].slice();
                } else if (typeof source[k] === 'object') {
                    destination[k] = {};
                    merge(destination[k], source[k]);
                } else {
                    destination[k] = source[k];
                }
            }
        }
    }

    return destination;
}


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
 * Get the user application preferences
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {Object} callback.preferences
 * @param {String} callback.preferences.defaultProjectsLocation Default path to create projects
 */
AppDataSettings.prototype.getPreferences = function getPreferences(callback) {
    // No callback
    if (typeof callback !== 'function') {
        return;
    }
    var filePath = path.join(this.rootPath, PREF_FILENAME);
    var self = this;
    var defaultPreferences = {
        defaultProjectsLocation  : path.join(process.env.USERPROFILE, 'Documents')
    };

    fs.readFile(filePath, function onReadPrefs(err, data) {
        if (err) {
            callback(err, defaultPreferences);
            return;
        }

        var prefs = merge(data ? JSON.parse(data) : {}, defaultPreferences);
        callback(null, prefs);
    });
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
    var filePath = path.join(this.rootPath, MRU_FILENAME);
    var self = this;
    fs.readFile(filePath, function onReadMRU(err, data) {
        if (err) {
           callback(err, []);
           return;
        }

        var directories = data ? JSON.parse(data) : [];
        var stat;
        var mru = [];
        var i, l;
        for (i = 0, l = directories.length; i < l; i += 1) {
            try {
                stat = fs.statSync(directories[i].path);
                if (stat.isDirectory()) {
                    mru.push(directories[i]);
                }
            } catch (ex) {
                /* Do nothing */
            }
        }

        // Push in cache
        self._cache.mru = mru;
        // Return a copy
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
        // Make sure the directory exist
        fs.mkdir(self.rootPath, function () {
            fs.writeFile(path.join(self.rootPath, MRU_FILENAME),  JSON.stringify(mru), {encoding: 'utf8'}, function onWriteMRU(err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
            });
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