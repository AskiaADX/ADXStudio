'use strict';

const portscanner = require('./portscanner.js');

/**
 * Create a new server
 * @param {Object} options Options to create the server
 * @param {Object} options.factory Factory to create the server (http or ws object)
 * @param {Function} options.reply Reply function to pass to the factory
 * @param {Number} [options.port=0] Port to listen (0 to search a free one)
 * @constructor
 */
function Server (options) {
  const factory = options.factory;
  const reply = options.reply;
  this.options = options;
  this.port = this.options.port || 0;

  this.innerServer = factory.createServer(reply);
  this.isStart = false;
}

/**
 * Listen
 * @param {Function} callback Callback when the listening has started
 * @param {Number} callback.port Port when the server is listening into
 */
Server.prototype.listen = function listen (callback) {
  // Already started
  if (this.isStart) {
    if (typeof callback === 'function') {
      callback(this.port);
    }
    return;
  }

  if (this.port) {
    this.listenOnPort(this.port, callback);
  } else {
    const self = this;
    portscanner.scan(function onPortFound (port) {
      self.listenOnPort(port, callback);
    });
  }
};

/**
 * Listen on a given port
 * @param {Number} port Port to listen
 * @param {Function} callback Callback when the listening has started
 */
Server.prototype.listenOnPort = function listenOnPort (port, callback) {
  const self = this;
  const innerServer = self.innerServer;

  self.port = port;

  innerServer.once('listening', () => {
    self.isStart = true;
    if (typeof callback === 'function') {
      callback(self.port);
    }
  })

  // Listen the port
  innerServer.listen(self.port);

  // Listen close event
  innerServer.on('close', function onClose () {
    self.isStart = false;
  });
};

/**
 * Close the connection
 * @param {Function} callback Callback when the listening has started
 */
Server.prototype.close = function close (callback) {
  const self = this;
  if (self.innerServer) {
    let innerServer = self.innerServer;
    if (typeof innerServer.close !== 'function' && innerServer.socket) {
      innerServer = innerServer.socket;
    }

    innerServer.close(function () {
      self.isStart = false;
      if (typeof callback === 'function') {
        callback();
      }
    });
    return;
  }
  if (typeof callback === 'function') {
    callback();
  }
};


/**
 * Return the ADC fixtures and emulations
 * @param {Function} callback
 * @param {Object} callback.result Result
 * @param {String[]} callback.result.fixtures List of fixtures
 * @param {String} callback.result.defaultFixture Default fixture
 * @param {String[]} callback.result.emulations List of emulations
 */
function getFixturesAndEmulations (callback) {
  const adx = global.project.getADX();

  adx.getFixtureList((err, fixtures) => {
    if (err) throw err;
    const result = {
      fixtures: fixtures || []
    };
    // Search the first allowed question type
    let defaultFixture = '';
    const constraints = adx.configurator.info.constraints();
    if (constraints && constraints.questions) {
      for (let constraint in constraints.questions) {
        if (constraints.questions.hasOwnProperty(constraint) && (constraints.questions[constraint])) {
          for (let i = 0, l = result.fixtures.length; i < l; i += 1) {
            if (result.fixtures[i].toLocaleLowerCase() === constraint.toLocaleLowerCase() + '.xml') {
              defaultFixture = result.fixtures[i];
              break;
            }
          }
          if (defaultFixture) {
            break;
          }
        }
      }
    }

    result.defaultFixture = defaultFixture;
    if (!result.defaultFixture && result.fixtures.length) {
      result.defaultFixture = result.fixtures[0];
    }


    adx.getEmulationList((err, emulations) => {
      if (err) throw err;
      result.emulations = emulations || [];
      callback(result);
    });
  });
}


exports.Server = Server;
exports.getFixturesAndEmulations = getFixturesAndEmulations;

