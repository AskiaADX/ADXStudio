var Tab = require('./Tab.js').Tab;

/**
 * Current pane
 * @type {string}
 */
var currentPane = 'main';

/**
 * Current tab
 * @type {Tab}
 */
var currentTab = null;

/**
 * List of available panes
 * @type {{main: {}, second: {}}}
 */
var panes = {

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
        if (name && panes[name]) {
            currentPane = name;
        }
        return panes[currentPane];
    }
};


/**
 * Collection of tabs
 * @type {Array}
 */
var tabs  = [];

/**
 * Initialize the workspace
 *
 * @param {Object} [config] Config (TODO::To be defined)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 */
function init(config, callback) {
    // Swap arguments
    if (typeof config === 'function') {
        callback = config;
        config   = null;
    }

    // Clean up first
    tabs = [];
    panes.mapByTabId = {};
    currentPane = 'main';
    currentTab = null;
    panes.orientation = '';


    callback(null);
}

/**
 * Create a new instance of tab in the current pane
 *
 * @param {Object} config Configuration of tab
 * @param {Function} callback Callback function
 * @param {Error}  callback.error Error
 * @param {Tab} callback.Tab
 * @param {String} callback.paneName Name of the pane where the tab is associated
 */
function createTab(config, callback) {
    var tab = new Tab(config);

    tabs.push(tab);
    panes.mapByTabId[tab.id] = currentPane;

    // Set the current tab if not defined
    if (currentTab === null) {
        currentTab = tab;
    }

    if (typeof callback === 'function') {
        callback(null, tab,  panes.mapByTabId[tab.id]);
    }
}

/**
 * Remove a tab
 * @param {Tab|Object|String} tab Tab, Id or path of the tab to remove
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Tab that has been removed
 * @param {string} callback.paneName Name of the pane where then tab were located
 */
function removeTab(tab, callback) {

    if (!tab) {
        if (typeof callback === 'function') {
            callback(new Error("Expected the first argument `tab` to be a Tab or the id of an existing tab "), null);
        }
    }

    find(tab, function (err, tab, pane) {
        if (err) {
           callback(err);
           return;
        }
        if (!tab) {
            callback(new Error("Could not find the tab specified."), null, null);
            return;
        }

        var index = tabs.indexOf(tab);
        if (index > -1) {
            tabs.splice(index, 1);
        }
        delete panes.mapByTabId[tab.id];

        callback(null, tab, pane);
    });
}


/**
 * Indicates in which pane the tab is located
 * @param {String|Tab} tab Tab or id of the tab to locate
 * @return {String} Name of the pane
 */
function where(tab) {
    if (typeof tab === 'string') {
        return panes.mapByTabId[tab] || "";
    } else if (tab instanceof Tab) {
        return panes.mapByTabId[tab.id] || "";
    } else {
        return "";
    }
}

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
function find(criteria, callback) {
    var tab  = null,
        path = null,
        id   = null,
        pane = null,
        i, l;

    if (criteria && criteria instanceof Tab) {
        id = criteria.id;
    } else if (criteria && typeof criteria === 'object' && typeof criteria.path === 'string') {
            path = criteria.path;
    } else if (criteria && typeof criteria === 'string') {
        id   = criteria;
        path = criteria;
    }

    if (id || path) {
        for (i = 0, l = tabs.length; i < l; i += 1) {
            if ((id && tabs[i].id === id) || (path && tabs[i].path === path)) {
                tab = tabs[i];
                break;
            }
        }
    }

    if (tab) {
        pane = panes.mapByTabId[tab.id];
    }

    if (typeof callback === 'function') {
        callback(null, tab, pane);
    }
}


/**
 * Get or set the current tab
 * @param {Tab} [tab] Tab to set
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {Tab} callback.tab Current tab
 * @param {String} callback.pane Pane of the tab
 */
function getSetCurrentTab(tab, callback) {
    var cb = (typeof tab === 'function' && !callback) ? tab : callback,
        pane;

    if (tab instanceof Tab) {
        currentTab = tab;
        if (currentTab.fileType !== 'preview') {
            panes.current(panes.mapByTabId[currentTab.id]);
        }
    }

    if (currentTab) {
        pane = panes.mapByTabId[currentTab.id];
    }

    if (typeof  cb === 'function') {
        cb (null, currentTab, pane);
    }
}

exports.init = init;
exports.createTab = createTab;
exports.removeTab = removeTab;
exports.where = where;
exports.find  = find;
exports.panes = panes;
exports.currentTab = getSetCurrentTab;
