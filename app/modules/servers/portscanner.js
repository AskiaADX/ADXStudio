var net = require('net');
var host = 'localhost';
var start = 3500;
var end = 4000;
var timeout = 300;
var lastPort = start; // Last listen port

/**
 * Scan localhost ports from 3500 to 4000
 * And return the first free port
 *
 * It remember the latest free port and start scanning from it the next time it's call.
 * You can use scanner.reset(); to start scanning at the beginning of the range.
 * If not port is found the scanner.reset(); is automatically called
 *
 *      var scanner = require('portscanner.js');
 *      scanner.scan(function (port) {
 *          console.log("Available port: " + port);
 *      });
 *
 *
 * @param {Function} callback Callback
 * @param {Number} callback.port First free port found or null if none are open
 */
exports.scan = function scan(callback) {
    if (lastPort > end) {
        callback(null);
        return;
    }

    var socket = new net.Socket(),
        isFree = false,
        port   = lastPort;

    lastPort++;

    // Socket connection established, port is open
    socket.on('connect', function onConnect() {
        socket.destroy();
    });

    // Assuming the port is not open if an error.
    socket.on('error', function onError() {
        isFree = true;
    });

    // If no response, assume port is not listening
    socket.setTimeout(timeout);
    socket.on('timeout', function onTimeout() {
        isFree = true;
        socket.destroy();
    });

    // Return after the socket has closed
    socket.on('close', function onClose() {
        if (isFree) {
            callback(port)
        } else {
            if (lastPort <= end) {
                scan(callback);
                return;
            }
            exports.reset();
            callback(null);
        }
    });

    socket.connect(port, host);
};

/**
 * Reset the start of the scan
 */
exports.reset = function reset() {
    lastPort = start;
};