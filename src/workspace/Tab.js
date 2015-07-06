var uuid = require('node-uuid');
var detector = require('charset-detector');
var fs = require('fs');

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
    this.fileType = '';
    this.content  = null;
}

/**
 * Load the file and initialize additional properties in the tab object
 *
 * @param callback
 */
Tab.prototype.loadFile = function loadFile(callback) {
    var self = this;
    Tab.isTextOrBinaryFile(this.path, function (err, type) {
        self.fileType = type;
        if (type === 'text') {
            fs.readFile(self.path, function (err, data) {
                self.content = data.toString();
                if (typeof  callback === 'function') {
                    callback();
                }
            });
        } else {
            if (typeof  callback === 'function') {
                callback();
            }
        }
    });
};

/**
 * Test if the file at the specified path is text or binary
 * @param {String} path Path of the file to test
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {String} callback.err Error
 */
Tab.isTextOrBinaryFile = function (path, callback) {

    fs.open(path, 'r', function(err, fd) {
        if (err) {
            callback(err, "");
            return;
        }
        var bufferSize  = 16000,
            buffer      = new Buffer(bufferSize);

        fs.read(fd, buffer, 0, bufferSize, 0);
        fs.close(fd);

        var charsets = detector(buffer);
        var fileType = (charsets[0].confidence < 10) ? 'binary' : 'text';
        if (typeof callback === 'function') {
            callback(null, fileType);
        }
    });

};

exports.Tab = Tab;