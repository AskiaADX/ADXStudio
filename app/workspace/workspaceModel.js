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

    /**
     * Instance of watcher
     * @private
     */
    this._watcher = watcher.create();
    this._watcher.on('changed', function (filePath) {
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
    this.panes.main.currentTabId = null;
    this.panes.second.currentTabId = null;
    this.panes.orientation = '';
    
    // Loads the config
    var self = this;
    if (config) {
        if (Array.isArray(config.tabs)) {
            config.tabs.forEach(function (tab) {
                if (tab.config && tab.id && tab.pane) {
                    self.createTab(tab.config, tab.pane, function (err, tabCreated) {
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
    var obj = {}, i, l, tab, jsonTab, 
        self = this;
    
    obj.tabs = [];
    for (i = 0, l = this.tabs.length; i < l; i += 1) {
        tab = this.tabs[i];
        jsonTab = {
            id : tab.id,
            pane : self.panes.mapByTabId[tab.id]
        };
        
        if (tab.id === this.panes[jsonTab.pane].currentTabId) {
            jsonTab.current = true;
        }
        
        jsonTab.config = {};
        if (tab.config) {
            if ('name' in tab.config)  {
                jsonTab.config.name = tab.config.name;
            }
            if ('path' in tab.config)  {
                jsonTab.config.path = tab.config.path;
            }
            if ('type' in tab.config)  {
                jsonTab.config.type = tab.config.type;
            }
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
    var tab = new Tab(config),
        self = this;

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
        
		self.emit('change');
        callback(null, tab, pane);
    });
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
    var self = this;
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
 * @param {Tab|String} [tabOrPane] Tab to set or Name of the pane from where to extract the current tab
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Current tab
 * @param {String} callback.pane Pane of the tab
 */
Workspace.prototype.currentTab = function getSetCurrentTab(tabOrPane, callback) {
    // Swap arguments
    var tab =  (tabOrPane instanceof Tab) ? tabOrPane : null;
    var pane = (typeof tabOrPane === 'string') ? tabOrPane : null;
    var cb = (typeof tabOrPane === 'function' && !callback) ? tabOrPane : callback;

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
