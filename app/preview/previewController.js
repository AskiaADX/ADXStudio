var app     = require('app');
var adcutil = require('adcutil');
var http    = require("http");
var path    = require('path');
var shell   = require('shell');
var server;
var isStart = false;
var lastPort = 0;

/**
 * Create the server
 */
function createServer() {
    if (server) {
        return;
    }

    server = http.createServer(reply);

    server.on('close', function () {
        isStart = false;
        console.log('close the server connection');
    });
}

// Reply on HTTP request
function reply(request, response) {
    var adcPath = (global.project && global.project.path);
    response.writeHead(200, {"Content-Type": "text/html"});
    adcutil.show({
        output : 'default',
        fixture : 'single.xml',
        masterPage : 'node_modules/adcutil/templates/master_page/default.html'
    }, adcPath, function (err, output) {
        if (err) {
            response.write(err.message);
        } else {
            response.write(output);
        }
        response.end();
    });
}

/**
 * Start the HTTP server
 * @param {Number} [port=3500] Port to listen
 * @param {Function} [callback]
 * @param {Number} [callback.port] Port listen
 */
function startServer(port, callback) {
    // Swap arguments
    if (typeof  port === 'function') {
        callback = port;
        port = null;
    }

    // Already started
    if (isStart) {
        if (typeof  callback === 'function') {
            callback(lastPort);
        }
        return;
    }

    // Initialize the port
    lastPort = port || 3500;

    // Create teh server
    createServer();

    // Listen the port
    server.listen(lastPort, function () {
        isStart = true;
        console.log("Server is listening on port " + lastPort);
        if (typeof  callback === 'function') {
            callback(lastPort);
        }
    });
}

/**
 * Stop the HTTP server
 * @param {Function} [callback]
 */
function stopServer(callback) {
    if (server) {
        server.close(function () {
            isStart = false;
            console.log("Server was stopped");
            if (typeof  callback === 'function') {
                callback();
            }
        });
        return;
    }
    if (typeof  callback === 'function') {
        callback();
    }
}

app.on('menu-preview', function () {
    startServer(function (port) {
        shell.openExternal('http://localhost:' + port);
    });
});

exports.startServer = startServer;
exports.stopServer = stopServer;