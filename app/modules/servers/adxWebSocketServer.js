"use strict";

const ws      = require("nodejs-websocket");
const path    = require('path');
const serverUtil  = require('./adxServerUtil.js');
const getFixtures = serverUtil.getFixtures;
const Server      = serverUtil.Server;
const watcher = require('../watcher/watcher.js');

const that = {};

/**
 * When the resources folder or the config.xml has changed
 */
function onADXResourcesChanged(eventName, filepath) {
    const adx = global.project.getADX();

    // For the Config xml: reload the config
    if (filepath.toLowerCase() === path.join(adx.path, 'config.xml').toLowerCase()) {
        adx.load(function (err) {
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
 * Watch the ADX
 */
function watchADX() {
    const adx = global.project.getADX();
    if (that.watched === adx.path) {
        return;
    }
    if (that.watcher) {
        that.watcher.close();
    }
    that.watched = adx.path;
    that.watcher = watcher.create(path.join(adx.path, 'resources'), {recursive : true});
    that.watcher.add(path.join(adx.path, 'tests'), {recursive : true});
    that.watcher.add(path.join(adx.path, 'config.xml'));
    that.watcher.on('change', onADXResourcesChanged);
}

/**
 * Throw an ws error
 * @param {Error} err Error
 * @param {Object} connection WS connection
 */
function throwError(err, connection) {
    let str = '500 Internal server error\n';
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
    const adx = global.project.getADX();
    const obj = {
        error : 0,
        action : action || 'getConfig',
        message : {
            config : adx.configurator.get()
        }
    };
    if (fixtures) {
        obj.message.fixtures = fixtures;
    }
    return JSON.stringify(obj);
}

/**
 * Serve the adx config
 * @param connection
 */
function serveADXConfig(err, connection, fixtures) {
    if (err) {
        throwError(err, connection);
        return;
    }

    const message = createMessage('getConfig', fixtures);
    connection.sendText(message);
    watchADX();
}

/**
 * Function that reply on the web socket
 * @param connection
 */
function reply(connection) {

    connection.on("text", function onReceiveMessage(message) {
        // Always reload to obtain the up-to-date info
        const adx = global.project.getADX();
        const query = JSON.parse(message);
        adx.load(function (err) {
            if (query.action === 'getConfig') {
                getFixtures(function (fixtures) {
                    serveADXConfig(err, connection, fixtures);
                });
            }
        });
    });
    connection.on("close", function () {
        const ws = exports.server.innerServer;
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
    const ws = exports.server.innerServer;
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
