"use strict";

const fs      = require('fs');
const path    = require('path');
const common  = require('../common/common.js');
const msg     = common.messages.message;

/**
 * Manage the user preferences
 *
 * @class Preferences
 */
function Preferences(){}

/**
 * Create a new instance of ADX Preferences
 *
 * @ignore
 */
Preferences.prototype.constructor = Preferences;

/**
 * Write an error output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Preferences.prototype.writeError = function writeError(text) {
    common.writeError.apply(common, arguments);
};

/**
 * Write a warning output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Preferences.prototype.writeWarning = function writeWarning(text) {
    common.writeWarning.apply(common, arguments);
};

/**
 * Write a success output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Preferences.prototype.writeSuccess = function writeSuccess(text) {
    common.writeSuccess.apply(common, arguments);
};

/**
 * Write an arbitrary message in the console without specific prefix
 * @param {String} text Text to write in the console
 * @private
 */
Preferences.prototype.writeMessage = function writeMessage(text) {
    common.writeMessage.apply(common, arguments);
};

/**
 * Read the preferences
 *
 * @param {Object} [options]
 * @param {Boolean} [options.silent=false] By pass the output
 * @param {Function} [callback] Callback
 * @param {Object|null} [callback.preferences]
 * @param {Object} [callback.preferences.author] Default ADX author
 * @param {String} [callback.preferences.author.name] Default Name of the ADX author
 * @param {String} [callback.preferences.author.email] Default Email of the ADX author
 * @param {String} [callback.preferences.author.company] Default Company of the ADX author
 * @param {String} [callback.preferences.author.webSite] Default WebSite of the ADX author
 * @param {Object} [callback.preferences.ZenDesk] Default ZenDesk options
 * @param {String} [callback.preferences.ZenDesk.url] Default ZenDesk URL
 * @param {String} [callback.preferences.ZenDesk.section] Default ZenDesk section
 * @param {String} [callback.preferences.ZenDesk.username] Default ZenDesk username
 * @param {String} [callback.preferences.ZenDesk.password] Default ZenDesk password
 * @param {String} [callback.preferences.ZenDesk.promoted] ZenDesk: create promoted article on article by default
 * @param {String} [callback.preferences.ZenDesk.disabledComments] ZenDesk: disabled article comments by default
 */
Preferences.prototype.read = function read(options, callback) {
    // Swap arguments
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    const filePath = path.join(process.env.APPDATA, common.APP_NAME, common.PREFERENCES_FILE_NAME);
    const self = this;
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err || !data) {
            if (!options || !options.silent) {
                self.writeMessage(msg.noPreferences);
            }
            if (typeof callback === 'function') {
                callback(null);
            }
            return;
        }

        const json = JSON.parse(data.toString());
        if (!options || !options.silent) {
            self.writeMessage(JSON.stringify(json, null, 2));
        }
        if (typeof callback === 'function') {
            callback(json);
        }
    });
};


/**
 * Write the preferences
 *
 * @param {Object} preferences
 * @param {Object} [preferences.author] Default ADX author
 * @param {String} [preferences.author.name] Default Name of the ADX author
 * @param {String} [preferences.author.email] Default Email of the ADX author
 * @param {String} [preferences.author.company] Default Company of the ADX author
 * @param {String} [preferences.author.webSite] Default WebSite of the ADX author
 * @param {Function} [callback] Callback
 * @param {Object|null} [callback.preferences]
 * @param {Object} [callback.preferences.author] Default ADX author
 * @param {String} [callback.preferences.author.name] Default Name of the ADX author
 * @param {String} [callback.preferences.author.email] Default Email of the ADX author
 * @param {String} [callback.preferences.author.company] Default Company of the ADX author
 * @param {String} [callback.preferences.author.website] Default Website of the ADX author
 * @param {Object} [callback.preferences.ZenDesk] Default ZenDesk options
 * @param {String} [callback.preferences.ZenDesk.url] Default ZenDesk URL
 * @param {String} [callback.preferences.ZenDesk.section] Default ZenDesk section
 * @param {String} [callback.preferences.ZenDesk.username] Default ZenDesk username
 * @param {String} [callback.preferences.ZenDesk.password] Default ZenDesk password
 * @param {String} [callback.preferences.ZenDesk.promoted] ZenDesk: create promoted article on article by default
 * @param {String} [callback.preferences.ZenDesk.disabledComments] ZenDesk: disabled article comments by default
 */
Preferences.prototype.write = function write(preferences, callback) {
    if (!preferences || !preferences.author) {
        if (typeof callback === 'function') {
            this.read(callback);
        }
        return;
    }

    const self = this;
    this.read({silent : true}, (currentPrefs) => {
        currentPrefs = currentPrefs || {};
        currentPrefs.author = currentPrefs.author || {};
        if ("name" in preferences.author) {
            currentPrefs.author.name  = preferences.author.name;
        }
        if ("email" in preferences.author) {
            currentPrefs.author.email  = preferences.author.email;
        }
        if ("company" in preferences.author) {
            currentPrefs.author.company  = preferences.author.company;
        }
        if ("website" in preferences.author) {
            currentPrefs.author.website  = preferences.author.website;
        }

        if (preferences.ZenDesk) {
            currentPrefs.ZenDesk = currentPrefs.ZenDesk || {};
            if ("url" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.url = preferences.ZenDesk.url;
            }
            if ("section" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.section = preferences.ZenDesk.section;
            }
            if ("username" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.username = preferences.ZenDesk.username;
            }
            if ("password" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.password = preferences.ZenDesk.password;
            }
            if ("promoted" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.promoted = preferences.ZenDesk.promoted;
            }
            if ("disabledComments" in preferences.ZenDesk) {
                currentPrefs.ZenDesk.disabledComments = preferences.ZenDesk.disabledComments;
            }
        }

        /* DEPRECATED GITHUB PUBLISHER
         if (preferences.github) {
         currentPrefs.github = currentPrefs.github || {};
         if ("username" in preferences.github) {
         currentPrefs.github.username = preferences.github.username;
         }
         if ("remoteUri" in preferences.github) {
         currentPrefs.github.remoteUri = preferences.github.remoteUri;
         }
         if ("useremail" in preferences.github) {
         currentPrefs.github.useremail = preferences.github.useremail;
         }
         if ("message" in preferences.github) {
         currentPrefs.github.message = preferences.github.message;
         }
         if ("token" in preferences.github) {
         currentPrefs.github.token = preferences.github.token;
         }
         }*/

        const filePath = path.join(process.env.APPDATA, common.APP_NAME, common.PREFERENCES_FILE_NAME);
        // Make sure the directory exist
        fs.mkdir(path.join(filePath, '../'), () => {
            fs.writeFile(filePath, JSON.stringify(currentPrefs), {encoding : 'utf8'}, () => {
                self.read(callback);
            });
        })
    });
};

/**
 * Singleton instance of the preferences
 *
 * @static
 */
Preferences.getInstance = function getInstance() {
    if (!Preferences._instance) {
        Preferences._instance = new Preferences();
    }
    return Preferences._instance;
};

/**
 * Single instance of the preferences object
 * @type {Preferences}
 * @ignore
 */
exports.preferences = Preferences.getInstance();

/**
 * Read the user preferences and display it
 *
 * @param {Object} [options]
 * @param {Boolean} [options.silent=false] By pass the output
 * @param {Function} [callback] Callback
 * @param {Object|null} [callback.preferences]
 * @param {Object} [callback.preferences.author] Default ADX author
 * @param {String} [callback.preferences.author.name] Default Name of the ADX author
 * @param {String} [callback.preferences.author.email] Default Email of the ADX author
 * @param {String} [callback.preferences.author.company] Default Company of the ADX author
 * @param {String} [callback.preferences.author.website] Default Website of the ADX author
 * @param {Object} [callback.preferences.zendesk] Default zendesk options
 * @param {String} [callback.preferences.zendesk.username] Default zendesk username
 * @param {String} [callback.preferences.zendesk.remoteUri] Default zendesk uri
 * @param {String} [callback.preferences.zendesk.promoted] Default zendesk promoted
 * @param {String} [callback.preferences.zendesk.comments_disabled] Default zendesk comments_disabled
 * @ignore
 */
exports.read = function read(options, callback) {
    exports.preferences.read(options, callback);
};


/**
 * Write the preferences
 *
 * @param {Object} preferences
 * @param {Object} [preferences.author] Default ADX author
 * @param {String} [preferences.author.name] Default Name of the ADX author
 * @param {String} [preferences.author.email] Default Email of the ADX author
 * @param {String} [preferences.author.company] Default Company of the ADX author
 * @param {String} [preferences.author.webSite] Default WebSite of the ADX author
 * @param {Function} [callback] Callback
 * @param {Object|null} [callback.preferences]
 * @param {Object} [callback.preferences.author] Default ADX author
 * @param {String} [callback.preferences.author.name] Default Name of the ADX author
 * @param {String} [callback.preferences.author.email] Default Email of the ADX author
 * @param {String} [callback.preferences.author.company] Default Company of the ADX author
 * @param {String} [callback.preferences.author.webSite] Default WebSite of the ADX author
 * @param {Object} [callback.preferences.ZenDesk] Default ZenDesk options
 * @param {String} [callback.preferences.ZenDesk.url] Default ZenDesk URL
 * @param {String} [callback.preferences.ZenDesk.section] Default ZenDesk section
 * @param {String} [callback.preferences.ZenDesk.username] Default ZenDesk username
 * @param {String} [callback.preferences.ZenDesk.password] Default ZenDesk password
 * @param {String} [callback.preferences.ZenDesk.promoted] ZenDesk: create promoted article on article by default
 * @param {String} [callback.preferences.ZenDesk.disabledComments] ZenDesk: disabled article comments by default
 * @ignore
 */
exports.write = function write(preferences, callback) {
    exports.preferences.write(preferences, callback);
};

