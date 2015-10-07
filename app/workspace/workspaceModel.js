var Tab = require('./TabModel.js').Tab;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var nodePath = require('path');
var watcher = require('../modules/watcher/watcher.js');


/**
 * Workspace model
 * @constructor
 */
function Workspace(){
    EventEmitter.call(this);

    var self = this;

    /**
     * Current pane
     * @type {string}
     */
    this._currentPane = 'main';

    /**
     * Current tab
     * @type {Tab}
     */
    this._currentTab = null;

    /**
     * List of available panes
     * @type {{main: {}, second: {}}}
     */
    this.panes = {

        /**
         * Orientation of panes
         * @type {"vertical"|"horizontal"}
         */
        orientation : "",

        /**
         * Map with tab id as key and panel name as value
         */
        mapByTabId : {},

        /**
         * Main pane
         */
        main : {
            name : 'main'
        },


        /**
         * Secondary pane
         */
        second : {
            name : 'second'
        },

        /**
         * Get or set the current pane
         * @param {String} name Name of the pane to set by default
         */
        current : function (name) {
            if (name && self.panes[name]) {
                self._currentPane = name;
            }
            return self.panes[self._currentPane];
        }
    };

    /**
     * Collection of tabs
     * @type {Array}
     */
    this.tabs = [];


    this._initWatcher();
}

/**
 * Inherits event emitter
 */
util.inherits(Workspace, EventEmitter);

/**
 * Initialize the watcher
 * @private
 */
Workspace.prototype._initWatcher = function _initWatcher() {
    var self = this;

    if (this._watcher) {
        this._watcher.close();
    }

    /***
     * Instance of watcher
     * @private
     */
    this._watcher = watcher.create();
    this._watcher.on('changed', function (filePath) {
        console.log('CHANGED ON WORKSPACE, ' + filePath);
        self._propagateWatcherEvents('file-changed', filePath);
    });
    this._watcher.on('deleted', function (filePath) {
        self._propagateWatcherEvents('file-deleted', filePath);
    });
    this._watcher.on('renamed', function (newPath, oldPath) {
        self._propagateWatcherEvents('file-renamed', oldPath, newPath);
    });

    /**
     * Temporary information that indicates if the tab is currently saving
     */
    this._saving = {};
};

/**
 * Propagate the watcher events
 *
 * @param {String|'file-changed'|'file-deleted'|'file-renamed'} eventName Name of the event
 * @param {String} path Path of the file that has changed
 * @param {String} [newPath] New path of the file (when renamed)
 */
Workspace.prototype._propagateWatcherEvents = function _propagateWatcherEvents(eventName, path, newPath) {
    var self = this;
    this.find(path, function onFind(err, tab, pane) {
        if (err || !tab) {
            return;
        }
        self.emit(eventName, tab, pane);
    });
};

/**
 * Initialize the workspace
 *
 * @param {Object} [config] Config (TODO::To be defined)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 */
Workspace.prototype.init = function init(config, callback) {
    // Swap arguments
    if (typeof config === 'function') {
        callback = config;
        config   = null;
    }

    this._initWatcher();

    // Clean up first
    this.tabs = [];
    this.panes.mapByTabId = {};
    this._currentPane = 'main';
    this._currentTab = null;
    this.panes.orientation = '';



    callback(null);
};

/**
 * Create a new instance of tab in the current pane
 *
 * @param {Object} config Configuration of tab
 * @param {Function} callback Callback function
 * @param {Error}  callback.error Error
 * @param {Tab} callback.Tab
 * @param {String} callback.paneName Name of the pane where the tab is associated
 */
Workspace.prototype.createTab = function createTab(config, callback) {
    var tab = new Tab(config),
        self = this;

    /**
     * When the tab is fully loaded, watch it
     */
    function onTabLoaded() {
        if (self._saving[tab.id]) {
            return;
        }
        self._watcher.remove(tab.path);
        self._watcher.add(tab.path);
    }

    // Watch on load
    tab.on('loaded', onTabLoaded);

    // Unwatch it during the save
    tab.on('saving', function onTabSaving() {
        self._saving[tab.id] = true; // Prevent earlier listening
        self._watcher.remove(tab.path);
    });

    // Re-watch it after the save
    tab.on('saved', function onTabSaved() {
        delete self._saving[tab.id];
        onTabLoaded();
    });

    this.tabs.push(tab);
    this.panes.mapByTabId[tab.id] = this._currentPane;

    // Set the current tab if not defined
    if (this._currentTab === null) {
        this._currentTab = tab;
    }

    if (typeof callback === 'function') {
        callback(null, tab,  this.panes.mapByTabId[tab.id]);
    }
};

/**
 * Remove a tab
 * @param {Tab|Object|String} tab Tab, Id or path of the tab to remove
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Tab that has been removed
 * @param {string} callback.paneName Name of the pane where then tab were located
 */
Workspace.prototype.removeTab = function removeTab(tab, callback) {

    if (!tab) {
        if (typeof callback === 'function') {
            callback(new Error("Expected the first argument `tab` to be a Tab or the id of an existing tab "), null);
            return;
        }
    }

    var self = this;
    this.find(tab, function (err, tab, pane) {
        if (err) {
            callback(err);
            return;
        }
        if (!tab) {
            callback(new Error("Could not find the tab specified."), null, null);
            return;
        }

        self._watcher.remove(tab.path);

        var index = self.tabs.indexOf(tab);
        if (index > -1) {
            self.tabs.splice(index, 1);
        }
        delete self.panes.mapByTabId[tab.id];

        callback(null, tab, pane);
    });
};

/**
 * Indicates in which pane the tab is located
 * @param {String|Tab} tab Tab or id of the tab to locate
 * @return {String} Name of the pane
 */
Workspace.prototype.where = function where(tab) {
    if (typeof tab === 'string') {
        return this.panes.mapByTabId[tab] || "";
    } else if (tab instanceof Tab) {
        return this.panes.mapByTabId[tab.id] || "";
    } else {
        return "";
    }
};

/**
 * Try to find the tab using the specified criteria
 *
 *      // Search with the file object
 *      workspace.find({file : "MyFile.txt", path : "/my/path/MyFile.txt", type : "file" }, function (err, tab, pane) {
 *          if (err) throw err;
 *          if (!tab) return;
 *          console.log(tab.id + ' in ' + pane);
 *      });
 *
 *      // Search with the tab object
 *      workspace.find({id : "1er35q3-15edca3-58a1rg12-512d3w2', file : "MyFile.txt", path : "/my/path/MyFile.txt", type : "file" }, function (err, tab, pane) {
 *          if (err) throw err;
 *          if (!tab) return;
 *          console.log(tab.id + ' in ' + pane);
 *      });
 *
 *      // Search with the path of file
 *      workspace.find("/my/path/MyFile.txt", function (err, tab, pane) {
 *          if (err) throw err;
 *          if (!tab) return;
 *          console.log(tab,id + ' in ' + pane);
 *      });
 *
 *      // Search with the id of the tab
 *      workspace.find("1er35q3-15edca3-58a1rg12-512d3w2", function (err, tab, pane) {
 *          if (err) throw err;
 *          if (!tab) return;
 *          console.log(tab,id + ' in ' + pane);
 *      });
 *
 *
 *
 * @param {String|Object|Tab} criteria Criteria of search
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Tab
 * @param {String} callback.pane Name of the pane
 */
Workspace.prototype.find = function find(criteria, callback) {
    var tab  = null,
        path = null,
        id   = null,
        pane = null,
        i, l;

    if (criteria && criteria instanceof Tab) {
        id = criteria.id;
    } else if (criteria && typeof criteria === 'object' && typeof criteria.path === 'string') {
        path = nodePath.resolve(criteria.path);
    } else if (criteria && typeof criteria === 'string') {
        id   = criteria;
        path = nodePath.resolve(criteria);
    }

    if (id || path) {
        for (i = 0, l = this.tabs.length; i < l; i += 1) {
            if ((id && this.tabs[i].id === id) || (path && this.tabs[i].path === path)) {
                tab = this.tabs[i];
                break;
            }
        }
    }

    if (tab) {
        pane = this.panes.mapByTabId[tab.id];
    }

    if (typeof callback === 'function') {
        callback(null, tab, pane);
    }
};

/**
 * Get or set the current tab
 * @param {Tab} [tab] Tab to set
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Current tab
 * @param {String} callback.pane Pane of the tab
 */
Workspace.prototype.currentTab = function getSetCurrentTab(tab, callback) {
    var cb = (typeof tab === 'function' && !callback) ? tab : callback,
        pane;

    if (tab instanceof Tab) {
        this._currentTab = tab;
        if (this._currentTab.fileType !== 'preview') {
            this.panes.current(this.panes.mapByTabId[this._currentTab.id]);
        }
    }

    if (this._currentTab) {
        pane = this.panes.mapByTabId[this._currentTab.id];
    }

    if (typeof  cb === 'function') {
        cb (null, this._currentTab, pane);
    }
};


module.exports = new Workspace();
