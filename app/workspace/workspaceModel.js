"use strict";

const Tab = require('./TabModel.js').Tab;
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const nodePath = require('path');
const fs = require('fs');
const watcher = require('../modules/watcher/watcher.js');

/**
 * Workspace model
 * @constructor
 */
function Workspace(){
    EventEmitter.call(this);

    const self = this;

    /**
     * Current pane
     * @type {string}
     */
    this._currentPane = 'main';

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
            name : 'main',
            currentTabId : null
        },


        /**
         * Secondary pane
         */
        second : {
            name : 'second',
            currentTabId : null
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

    /**
     * List all loaded tabs (the key is the id of the tabs)
     */
    this._wasLoaded = {};

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
    const self = this;

    if (this._watcher) {
        this._watcher.close();
    }

    /**
     * Instance of watcher
     * @private
     */
    this._watcher = watcher.create();
    this._watcher.on('change', function (event, filePath) {
        fs.stat(filePath, function (err) {
            let eventName = (!err) ? 'file-changed' : 'file-removed';
            self._propagateWatcherEvents(eventName, filePath);
        });
    });

    /**
     * Prevent the event on watcher
     * This is used when a file is saving or temporary unwatched
     */
    this._unwatched = {};
};

/**
 * Propagate the watcher events
 *
 * @param {String|'file-changed'|'file-deleted'|'file-renamed'} eventName Name of the event
 * @param {String} path Path of the file that has changed
 */
Workspace.prototype._propagateWatcherEvents = function _propagateWatcherEvents(eventName, path) {
    const self = this;
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
    this.panes.main.currentTabId = null;
    this.panes.second.currentTabId = null;
    this.panes.orientation = '';
    
    // Loads the config
    const self = this;
    if (config) {
        if (Array.isArray(config.tabs)) {
            const createdTabsByPath = {};
            config.tabs.forEach(function (tab) {
                if (tab.id && tab.pane) {
                    const tabConfig = {};
                    let lowerPathKey;
                    if (tab.path || (tab.config && tab.config.path)) { // Backwards compatibility
                        tabConfig.path = tab.path || (tab.config && tab.config.path);
                    }
                    if (tab.type || (tab.config && tab.config.type)) { // Backwards compatibility
                        tabConfig.type = tab.type || (tab.config && tab.config.type);
                    }
                    if (tab.name) { // Don't manage the backwards compatibility
                        tabConfig.name = tab.name;
                    }

                    // Now this is forbidden to have two tabs for projectSettings & config.xml
                    // For backwards compatibility, make sure the projectSettings have a good path
                    // and make sure there is no duplicate tab
                    if (tabConfig.type === 'projectSettings') {
                        if (!/config\.xml$/gi.test(tabConfig.path)) {
                            tabConfig.path = nodePath.join(tabConfig.path, 'config.xml');
                        }
                    }


                    // Avoid duplicate tab open on the same file
                    if (tabConfig.path) {
                        lowerPathKey = nodePath.resolve(tabConfig.path).toLowerCase();
                        if (createdTabsByPath[lowerPathKey]) {
                            return;
                        }

                        createdTabsByPath[lowerPathKey] = true;
                    }

                    self.createTab(tabConfig, tab.pane, function (err, tabCreated) {
                        if (tab.current) {
                            self.panes[tab.pane].currentTabId = tabCreated.id;
                        }
                    });
                }
            });
        }
    }

    if (typeof callback === 'function') { 
        callback(null);
    }
};

/**
 * Serialize the state of the workspace to a JSON representation
 * 
 *     {
 *       "tabs" : [
 *          {
 *            "id" : "xxxxxx-xxxxxx-xxxxxx",
 *            "pane" : "main"
 *            "config" : {
 *               "name" : "file_name"
 *               "path" : "path/to/the/file",
 *               "type" : "file"
 *            }
 *          }
 *       ]
 *     }
 *
 * @return {Object} Return the JSON representation of the workspace
 */
Workspace.prototype.toJSON = function toJSON() {
    const self = this;
    const obj = {};

    obj.tabs = [];
    for (let i = 0, l = this.tabs.length; i < l; i += 1) {
        let tab = this.tabs[i];
        let jsonTab = {
            id : tab.id,
            pane : self.panes.mapByTabId[tab.id]
        };
        
        if (tab.id === this.panes[jsonTab.pane].currentTabId) {
            jsonTab.current = true;
        }

        if (tab.path) {
            jsonTab.path = tab.path;
        }
        if (tab.type) {
            jsonTab.type = tab.type;
        }
        // Use the internal config
        if (tab.config && tab.config.name) {
            jsonTab.name = tab.config.name;
        }
        if (tab.mode) {
            jsonTab.mode = tab.mode;
        }
        
        obj.tabs.push(jsonTab);
    }

    return obj;
};

/**
 * Create a new instance of tab in the current pane
 *
 * @param {Object} config Configuration of tab
 * @param {String} [pane] Name of the pane in which to create the tabs
 * @param {Function} [callback] Callback function
 * @param {Error}  callback.error Error
 * @param {Tab} callback.Tab
 * @param {String} callback.paneName Name of the pane where the tab is associated
 */
Workspace.prototype.createTab = function createTab(config, pane, callback) {
    const tab = new Tab(config);
    const self = this;

    // Swap arguments
    if (typeof pane === 'function') {
        callback = pane;
        pane = null;
    }
    
    if (!pane) {
        pane = this._currentPane;
    }
    
    /**
     * When the tab is fully loaded, watch it
     */
    function onTabLoaded() {
        if (self._unwatched[tab.id]) {
            return;
        }
        self._wasLoaded[tab.id] = true;
        self._watcher.add(tab.path);
    }

    // Watch on load
    tab.on('loaded', onTabLoaded);

    // Unwatch it during the save
    tab.on('unwatch', function onTabSaving() {
        self._unwatched[tab.id] = true; // Prevent earlier listening
        self._watcher.remove(tab.path);
    });

    // Re-watch it after the save
    tab.on('watch', function onTabSaved() {
        delete self._unwatched[tab.id];
        onTabLoaded();
    });

    // Propagate event when the tab has been renamed
    tab.on('rename', function () {
        self.emit('change');
    });

    this.tabs.push(tab);
    this.panes.mapByTabId[tab.id] = pane;

    // Set the current tab if not defined
    if (this.panes[pane].currentTabId === null) {
        this.panes[pane].currentTabId = tab.id;
    }

    self.emit('change');
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
        }
        return;
    }

    const self = this;
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
        
		self.emit('change');
        callback(null, tab, pane);
    });
};

/**
 * Remove all tabs
 *
 * @param {Object} [options] Options
 * @param {String} [options.except] Close all except the specified one
 * @param {Function} [callback] Callback
 * @param {Error} callback.err Error
 * @param {Array} callback.removedTabs Array of tabs that has been removed
 * @param {Tab} callback.removedTabs[].tab Tab that has been removed
 * @param {String} callback.removedTabs[].pane Pane where the tab was
 */
Workspace.prototype.removeAllTabs = function removeAllTabs(options, callback) {
    // Swap arguments
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    const self = this;
    const result = [];
    // Collect the tab to remove
    self.tabs.forEach(function (tab) {
        // Keep the `except` tab open
        if (options && options.except && tab.id === options.except) {
            return;
        }
        // Keep the tabs mark as edited
        if (tab.edited) {
            return;
        }
        const info = {
            tab : tab,
            pane : self.panes.mapByTabId[tab.id]
        };
        result.push(info);
    });

    // Remove only now to avoid the iteration
    // and modification of the same array
    result.forEach(function (info) {
        self._watcher.remove(info.tab.path);

        const index = self.tabs.indexOf(info.tab);
        if (index > -1) {
            self.tabs.splice(index, 1);
        }
        delete self.panes.mapByTabId[info.tab.id];
    });

    self.emit('change');
    if (typeof  callback ==='function') {
        callback(null, result);
    }
};

/**
 * Move an existing tab into another pane
 * @param {Tab|Object|String} tab Tab, Id or path of the tab to move
 * @param {'main'|'second'} targetPane Name of the pane to target
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Tab that has been moved
 * @param {string} callback.paneName NAme of the pane where the tab is located
 */
Workspace.prototype.moveTab = function moveTab(tab, targetPane, callback) {
    if (!tab) {
        if (typeof callback === 'function') {
            callback(new Error("Expected the first argument `tab` to be a Tab or the id of an existing tab "), null, null);
        }
		return;
    }
    if (targetPane !== 'main' && targetPane !== 'second') {
        if (typeof callback === 'function') {
            callback(new Error("Expected the second argument `targetPane` to be the name of an existing pane ('main or 'second')"), null, null);
        }
		return;
    }
    const self = this;
    this.find(tab, function (err, tab, pane) {
        if (err) {
            if (typeof callback === 'function') {
				callback(err, null, null);
            }
            return;
        }
        if (!tab) {
            if (typeof callback === 'function') {
				callback(new Error("Could not find the tab specified."), null, null);
            }
            return;
        }
        
		self.panes.mapByTabId[tab.id] = targetPane;
        self.emit('change');
        
        if (typeof callback === 'function') {
			callback(null, tab, targetPane);
		}
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
    let tab  = null,
        path = null,
        id   = null,
        pane = null;

    if (criteria && criteria instanceof Tab) {
        id = criteria.id;
    } else if (criteria && typeof criteria === 'object' && typeof criteria.path === 'string') {
        path = nodePath.resolve(criteria.path);
    } else if (criteria && typeof criteria === 'string') {
        id   = criteria;
        path = nodePath.resolve(criteria);
    }

    if (id || path) {
        for (let i = 0, l = this.tabs.length; i < l; i += 1) {
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
 * Unwatch all tabs where the files are contains in specified path
 *
 *      workspace.unwatchTabsIn("/my/path/", function (err) {
 *          if (err) throw err;
 *			console.log('ok unwatched!');
 *      });
 *
 * @param {String} parentDir Path to unwatch (recursively)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 */
Workspace.prototype.unwatchTabsIn = function unwatchTabsIn(parentDir, callback) {
    const self = this;
    const lowerCaseDir = parentDir.toLowerCase();
	// Iterate through all tabs
    self.tabs.forEach(function (tab) {
        if (tab.path.toLowerCase().indexOf(lowerCaseDir) === 0) {
             self._watcher.remove(tab.path);
        }
    });
};

/**
 * Re-watch all tabs where the files are contains in specified path
 *
 *      workspace.rewatchTabsIn("/my/path/", function (err) {
 *          if (err) throw err;
 *			console.log('ok re-watched!');
 *      });
 *
 * @param {String} parentDir Path to re-watch (recursively)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 */
Workspace.prototype.rewatchTabsIn = function rewatchTabsIn(parentDir, callback) {
    const self = this;
    const lowerCaseDir = parentDir.toLowerCase();
	// Iterate through all tabs
    self.tabs.forEach(function (tab) {
        if (tab.path.toLowerCase().indexOf(lowerCaseDir) === 0 && self._wasLoaded[tab.id]) {
             self._watcher.add(tab.path);
        }
    });
};

/**
 * Find all tabs that could be re-watched and where the path contains specified path
 *
 *      workspace.findRewatchableTabsIn("/my/path/", function (err, tabs) {
 *          if (err) throw err;
 *			console.log(tabs);
 *      });
 *
 * @param {String} parentDir Path to re-watch (recursively)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Tab[]} callback.tabs Array or re-watchable tabs
 */
Workspace.prototype.findRewatchableTabsIn = function findRewatchableTabsIn(parentDir, callback) {
    if (typeof callback !== 'function') {
        return;
    }
    const self = this;
    const lowerCaseDir = parentDir.toLowerCase();
    const tabs = [];
	// Iterate through all tabs
    self.tabs.forEach(function (tab) {
        if (tab.path.toLowerCase().indexOf(lowerCaseDir) === 0 && self._wasLoaded[tab.id]) {
            tabs.push(tab);
        }
    });
    callback(null, tabs);
};


/**
 * Get or set the current tab
 * @param {Tab|String} [tabOrPane] Tab to set or Name of the pane from where to extract the current tab
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Current tab
 * @param {String} callback.pane Pane of the tab
 */
Workspace.prototype.currentTab = function getSetCurrentTab(tabOrPane, callback) {
    // Swap arguments
    const tab =  (tabOrPane instanceof Tab) ? tabOrPane : null;
    let pane = (typeof tabOrPane === 'string') ? tabOrPane : null;
    const cb = (typeof tabOrPane === 'function' && !callback) ? tabOrPane : callback;

    // Setter
    if (tab) {
        pane = this.panes.mapByTabId[tab.id];
        this.panes[pane].currentTabId = tab.id;
        if (tab.type !== 'preview') {
            this.panes.current(pane);
        }
        this.emit('change');
    }
	
    // Getter
    if (!pane) {
        pane = this.panes.current().name;
    }
        
    this.find(this.panes[pane].currentTabId, cb);    
};


module.exports = new Workspace();
