var uuid = require('node-uuid');


/**
 * Tab in pane
 *
 * @constructor
 * @param {Object} [config] Configuratino
 * @param {String} [config.name] Name of tab or file
 * @param {String|'file'} [config.type] Type of tab
 * @param {String} [config.path] Path of the file associated with the tab
 */
function Tab(config) {
    this.id = uuid.v4();
    this.config = config || {};
    this.name = this.config.name || '';
    this.type = this.config.type || '';
    this.path = this.config.path || '';
}

exports.Tab = Tab;