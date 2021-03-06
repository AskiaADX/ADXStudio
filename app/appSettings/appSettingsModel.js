'use strict';

const app = require('electron').app;
const path = require('path');
const fs = require('fs');
const ADX = require('../modules/adxutil').ADX;

const prefFileName = 'Prefs.json';
const mruFileName = 'MRU.json';

/**
 * Merge two object together (recursively)
 * @param {Object} destination Destination object (where the data will be append)
 * @param {Object} source Source object (where the data will be read)
 * @return {Object} Merged object
 */
function merge (destination, source) {
  for (const k in source) {
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
function AppDataSettings () {
  this.rootPath = path.join(process.env.APPDATA, 'ADXStudio');
  this._cache = {};
}

/**
 * Return the path of the app data folder
 */
AppDataSettings.prototype.getAppDataPath = function getAppDataPath () {
  return this.rootPath;
};

/**
 * Get the user application preferences
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {Object} callback.preferences
 * @param {String} callback.preferences.defaultProjectsLocation Default path to create projects
 * @param {Boolean} callback.preferences.openLastProjectByDefault Open the last project by default
 * @param {Object} [callback.preferences.author] Default ADC author (from ADCUtil)
 * @param {String} [callback.preferences.author.name] Default Name of the ADC author (from ADCUtil)
 * @param {String} [callback.preferences.author.email] Default Email of the ADC author (from ADCUtil)
 * @param {String} [callback.preferences.author.company] Default Company of the ADC author (from ADCUtil)
 * @param {String} [callback.preferences.author.webSite] Default WebSite of the ADC author (from ADCUtil)
 */
AppDataSettings.prototype.getPreferences = function getPreferences (callback) {
  // No callback
  if (typeof callback !== 'function') {
    return;
  }
  const defaultPreferences = {
    defaultProjectsLocation: path.join(process.env.USERPROFILE, 'Documents'),
    openLastProjectByDefault: true
  };

  // Read the ADXUtil preferences
  ADX.preferences.read({ silent: true }, (adxprefs) => {
    let finalPrerences = adxprefs || {};
    finalPrerences = merge(defaultPreferences, finalPrerences);
    // Read the ADXStudio preferences
    const filePath = path.join(this.rootPath, prefFileName);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        callback(finalPrerences);
        return;
      }
      finalPrerences = merge(data ? JSON.parse(data) : {}, finalPrerences);
      callback(finalPrerences);
    });
  });
};

/**
 * Set the user application preferences
 * @param {Object} preferences Preferences to set
 * @param {String} [preferences.defaultProjectsLocation] Default path to create projects
 * @param {Boolean} [preferences.openLastProjectByDefault] Open the last project by default
 * @param {Object} [preferences.author] Default ADX author (from ADXUtil)
 * @param {String} [preferences.author.name] Default Name of the ADX author (from ADXUtil)
 * @param {String} [preferences.author.email] Default Email of the ADX author (from ADXUtil)
 * @param {String} [preferences.author.company] Default Company of the ADX author (from ADXUtil)
 * @param {String} [preferences.author.webSite] Default WebSite of the ADX author (from ADXUtil)
 * @param {Function} callback
 * @param {Error} callback.err
 */
AppDataSettings.prototype.setPreferences = function setPreferences (preferences, callback) {
  const self = this;

  // Read the current user preferences
  this.getPreferences(function (currentPrefs) {
    // Merge the current user preferences with the preferences in the args
    let finalPreferences = merge({}, preferences);
    finalPreferences = merge(finalPreferences, currentPrefs);

    // Extract the preferences from ADXUtil to store it using ADXUtil
    let adxUtilPref = null;
    if (finalPreferences.author) {
      // Author could come from currentPrefs
      // If it's not define in the `preferences` in args, don't treat it
      if (preferences.author) {
        adxUtilPref = adxUtilPref || {};
        adxUtilPref.author = finalPreferences.author;
      }
      delete finalPreferences.author;
    }

    // Save the merged preferences
    // Make sure the directory exist
    fs.mkdir(self.rootPath, function () {
      fs.writeFile(path.join(self.rootPath, prefFileName), JSON.stringify(finalPreferences), { encoding: 'utf8' }, function onWritePrefs (err) {
        if (err) {
          if (typeof callback === 'function') {
            callback(err);
          }
          return;
        }

        //if preferences changed, send an event to the app
        if (currentPrefs.theme !== finalPreferences.theme) {
          app.emit('preference-switch-theme', finalPreferences.theme);
        }

        //if preferences changed, send an event to the app
        if (currentPrefs.useDblClickByDefault !== finalPreferences.useDblClickByDefault) {
          app.emit('preference-switch-click', finalPreferences.useDblClickByDefault);
        }

        //if preferences changed, send an event to the app
        if (currentPrefs.useZendesk !== finalPreferences.useZendesk) {
          app.emit('preference-switch-zendesk', finalPreferences.useZendesk);
        }

        //if preferences changed, send an event to the app
        if (currentPrefs.editorFontSize !== finalPreferences.editorFontSize) {
          app.emit('preference-switch-size', finalPreferences.editorFontSize);
        }

        //if preferences changed, send an event to the app
        if (currentPrefs.devtools !== finalPreferences.devtools) {
          app.emit('preference-switch-devtools', finalPreferences.devtools);
        }

        if (!adxUtilPref) {
          if (typeof callback === 'function') {
            callback(null);
          }
          return;
        }

        ADX.preferences.write(adxUtilPref, function onADXUtilWritePref () {
          if (typeof callback === 'function') {
            callback(null);
          }
        });
      });
    });
  });
};

/**
 * Get the list of most recently used project
 * @param {Function} callback
 * @param {Error} callback.err
 * @param {Array} callback.mru
 */
AppDataSettings.prototype.getMostRecentlyUsed = function getMostRecentlyUsed (callback) {
  // No callback
  if (typeof callback !== 'function') {
    return;
  }
  if (this._cache.mru) {
    callback(null, this._cache.mru);
    return;
  }
  const self = this;
  const filePath = path.join(this.rootPath, mruFileName);
  fs.readFile(filePath, function onReadMRU (err, data) {
    if (err && err.code !== 'ENOENT') {
      callback(err, []);
      return;
    }

    const directories = data ? JSON.parse(data) : [];
    const mru = [];
    for (let i = 0, l = directories.length; i < l; i += 1) {
      try {
        let stat = fs.statSync(directories[i].path);
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
AppDataSettings.prototype.clearCache = function clearCache () {
  this._cache = {};
};

/**
 * Add a new entry or move the entry on top of the most recently used
 * @param {Object} item Item to add
 * @param {String} item.path Path of the entry
 * @param {Function} callback
 * @param {Error} callback.err
 */
AppDataSettings.prototype.addMostRecentlyUsed = function addMostRecentlyUsed (item, callback) {
  const self = this;
  this.getMostRecentlyUsed(function onGetMRU (err, mru) {
    if (err) throw err;
    let indexFound = -1;

    for (let i = 0, l = mru.length; i < l; i += 1) {
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
      fs.writeFile(path.join(self.rootPath, mruFileName), JSON.stringify(mru), { encoding: 'utf8' }, function onWriteMRU (err) {
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
AppDataSettings.prototype.getInitialProject = function getInitialProject (callback) {
  if (typeof callback !== 'function') {
    return;
  }
  const self = this;
  this.getPreferences(function (preferences) {
    if (!preferences.openLastProjectByDefault) {
      callback('');
      return;
    }

    self.getMostRecentlyUsed(function onGetMRU (err, mru) {
      if (err) throw err;
      callback((mru.length) ? mru[0].path : '');
    });
  });

};

module.exports = new AppDataSettings();
