var ws      = require("nodejs-websocket");
var path    = require('path');
var serverUtil  = require('./adxServerUtil.js');
var getFixtures = serverUtil.getFixtures;
var Server      = serverUtil.Server;
var watcher = require('../watcher/watcher.js');

var that = {};

/**
 * When the resources folder or the config.xml has changed
 */
function onADCResourcesChanged(eventName, filepath) {
    var adc = global.project.adc;

    // For the Config xml: reload the config
    if (filepath.toLowerCase() === path.join(adc.path, 'config.xml').toLowerCase()) {
        adc.load(function (err) {
            getFixtures(function (fixtures) {
                broadcast(createMessage('reloadConfig', fixtures));
            });
        });
    }
    // For all other files only reload the preview
    else {
        broadcast(createMessage('reload'));
    }
}

/**
 * Watch the ADC
 */
function watchADC() {
    var adc = global.project.adc;
    if (that.watched === adc.path) {
        return;
    }
    if (that.watcher) {
        that.watcher.close();
    }
    that.watched = adc.path;
    that.watcher = watcher.create(path.join(adc.path, 'Resources/**/*'));
    that.watcher.add(path.join(adc.path, 'tests/**/*'));
    that.watcher.add(path.join(adc.path, 'config.xml'));
    that.watcher.on('all', onADCResourcesChanged);
}

/**
 * Throw an ws error
 * @param {Error} err Error
 * @param {Object} connection WS connection
 */
function throwError(err, connection) {
    var str = '500 Internal server error\n';
    if (err) {
        str +=  err.message + '\n';
    }
    connection.sendText(JSON.stringify({
        error : 1,
        message : str
    }));
}

/**
 * Return the config message to send to the websocket
 * @param {String} action Message
 * @param {Object} [fixtures]
 */
function createMessage(action, fixtures) {
    var adc = global.project.adc;
    var obj = {
        error : 0,
        action : action || 'getConfig',
        message : {
            config: adc.configurator.get()
        }
    };
    if (fixtures) {
        obj.message.fixtures = fixtures;
    }
    return JSON.stringify(obj);
}

/**
 * Serve the adc config
 * @param connection
 */
function serveADCConfig(err, connection, fixtures) {
    if (err) {
        throwError(err, connection);
        return;
    }

    var message = createMessage('getConfig', fixtures);
    connection.sendText(message);
    watchADC();
}

/**
 * Function that reply on the web socket
 * @param connection
 */
function reply(connection) {

    connection.on("text", function onReceiveMessage(message) {
        // Always reload to obtain the up-to-date info
        var adc = global.project.adc;
        var query = JSON.parse(message);
        adc.load(function (err) {
            if (query.action === 'getConfig') {
                getFixtures(function (fixtures) {
                    serveADCConfig(err, connection, fixtures);
                });
            }
        });
    });
    connection.on("close", function () {
        var ws = exports.server.innerServer;
        if (!ws.connections.length) {
            // Close the web-socket server
            // and close the watcher
            exports.server.close();
            that.watched = null;
            if (that.watcher) {
                that.watcher.close();
                that.watcher = null;
            }
        }
    });
}

/**
 * Broadcast message
 * @param {String} message Message to broadcast
 */
function broadcast(message) {
    var ws = exports.server.innerServer;
    ws.connections.forEach(function (connection) {
        connection.sendText(message)
    });
}


// Return an http server
exports.server =  new Server({
    factory : ws,
    port    : 0, // Auto-search port
    reply   : reply
});
