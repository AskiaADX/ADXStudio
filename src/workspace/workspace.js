var Tab = require('./Tab.js').Tab;

/**
 * Current pane
 * @type {string}
 */
var currentPane = 'main';

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
        name : 'main',
        tabs : []
    },


    /**
     * Secondary pane
     */
    second : {
        name : 'second',
        tabs : []
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

    panes.mapByTabId[tab.id] = currentPane;

    if (typeof callback === 'function') {
        callback(null, tab,  panes.mapByTabId[tab.id]);
    }
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

exports.createTab = createTab;
exports.where = where;
exports.panes = panes;