var ipc  = require('ipc');
var adcutil = require('adcutil');
var http = require("http");
var path = require('path');
var server;
var isStart = false;


/**
 * Create the server
 */
function createServer() {
    if (server) {
        return;
    }
    server = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        adcutil.show({
            output : 'default',
            fixture : 'open.xml',
            masterPage : 'node_modules/adcutil/templates/master_page/default.html'
        }, path.join(__dirname, '../../tmp/testPreview/'), function (err, output) {
            if (err) {
                response.write(err.message);
            } else {
                response.write(output);
            }
            response.end();
        });
    });

    server.on('close', function () {
        isStart = false;
       console.log('close the server connection');
    });
}

/**
 * Start the HTTP server
 * @param {Number} [port=3500] Port to listen
 * @param {Function} [callback]
 */
function startServer(port, callback) {
    if (isStart) {
        return;
    }
    port = port || 3500;

    createServer();
    server.listen(port, function () {
        isStart = true;
        console.log("Server is listening on port " + port);
        if (typeof  callback === 'function') {
            callback();
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

ipc.on('preview-start-server', function () {
    startServer();
});

ipc.on('preview-stop-server', function () {
    stopServer();
});

// startServer();

exports.startServer = startServer;
exports.stopServer = stopServer;