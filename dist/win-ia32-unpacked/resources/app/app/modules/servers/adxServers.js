'use strict';

// Web server
exports.web = require('./adxHttpServer.js').server;
// Web socket server
exports.webSocket = require('./adxWebSocketServer.js').server;

/**
 * Listen both web and web server, return the both port inside an object
 * @param {Function} callback
 * @param {Object} callback.result
 * @param {Number} callback.result.httpPort Port of the HTTP server
 * @param {Number} callback.result.wsPort Port of the Web Socket server
 */
exports.listen = function listen (callback) {
  exports.web.listen(function onHttpListening (httpPort) {
    exports.webSocket.listen(function onWSListening (wsPort) {
      if (typeof callback === 'function') {
        callback({
          httpPort: httpPort,
          wsPort: wsPort
        });
      }
    });
  });
};