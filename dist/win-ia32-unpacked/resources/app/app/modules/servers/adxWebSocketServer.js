'use strict';

const ws = require('nodejs-websocket');
const path = require('path');
const serverUtil = require('./adxServerUtil.js');
const getFixturesAndEmulations = serverUtil.getFixturesAndEmulations;
const Server = serverUtil.Server;
const watcher = require('../watcher/watcher.js');
const fs = require('fs');
const that = {};

/**
 * When the resources folder or the config.xml has changed
 */
function onADXResourcesChanged (eventName, filepath) {
  const adx = global.project.getADX();

  // For the Config xml: reload the config
  if (filepath.toLowerCase() === path.join(adx.path, 'config.xml').toLowerCase()) {
    adx.load(() => {
      getFixturesAndEmulations((results) => {
        createMessage('reloadConfig', results, function (message) {
          broadcast(message);
        });
      });
    });
  } else {
    // For all other files only reload the preview
    createMessage('reload', null, (message) => {
      broadcast(message);
    });
  }
}

/**
 * Watch the ADX
 */
function watchADX () {
  const adx = global.project.getADX();
  if (that.watched === adx.path) {
    return;
  }
  if (that.watcher) {
    that.watcher.close();
  }
  that.watched = adx.path;
  that.watcher = watcher.create(path.join(adx.path, 'resources'), { recursive: true });
  that.watcher.add(path.join(adx.path, 'tests'), { recursive: true });
  that.watcher.add(path.join(adx.path, 'config.xml'));
  that.watcher.on('change', onADXResourcesChanged);
}

/**
 * Throw an ws error
 * @param {Error} err Error
 * @param {Object} connection WS connection
 */
function throwError (err, connection) {
  let str = '500 Internal server error\n';
  if (err) {
    str += err.message + '\n';
  }
  connection.sendText(JSON.stringify({
    error: 1,
    message: str
  }));
}

/**
 * Return the config message to send to the websocket
 * @param {String} action Message
 * @param {Object} fixturesAndEmulations
 * @param {Function} cb
 */
function createMessage (action, fixturesAndEmulations, cb) {
  const adx = global.project.getADX();
  const obj = {
    error: 0,
    action: action || 'getConfig',
    message: {
      config: adx.configurator.get()
    }
  };

  if (fixturesAndEmulations) {
    obj.message.fixtures = fixturesAndEmulations.fixtures;
    obj.message.defaultFixture = fixturesAndEmulations.defaultFixture;
    obj.message.emulations = fixturesAndEmulations.emulations;
  }

  if (action === 'getConfig') {
    fs.readFile(path.join(adx.path, '.adxstudio', 'theme.json'), (err, data) => {
      if (!err) {
        obj.message.themes = JSON.parse(data.toString());
      }
      cb(JSON.stringify(obj));
    });
  } else {
    cb(JSON.stringify(obj));
  }
}

/**
 * Serve the adx config
 * @param connection
 */
function serveADXConfig (err, connection, fixturesAndEmulations) {
  if (err) {
    throwError(err, connection);
    return;
  }

  createMessage('getConfig', fixturesAndEmulations, (message) => {
    connection.sendText(message);
    watchADX();
  });
}

/**
 * Function that reply on the web socket
 * @param connection
 */
function reply (connection) {

  connection.on('text', (message) => {
    // Always reload to obtain the up-to-date info
    const adx = global.project.getADX();
    const query = JSON.parse(message);
    adx.load((err) => {
      if (query.action === 'getConfig') {
        getFixturesAndEmulations((results) => {
          serveADXConfig(err, connection, results);
        });
      }
    });
  });

  connection.on('error', (err) => {
    console.dir(err);
  });

  connection.on('close', () => {
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
function broadcast (message) {
  const ws = exports.server.innerServer;
  ws.connections.forEach((connection) => {
    connection.sendText(message);
  });
}


// Return an http server
exports.server = new Server({
  factory: ws,
  port: 0, // Auto-search port
  reply: reply
});
