var ipc  = require('ipc');
var adcShow = require('adcutil/app/show/ADCShow.js');
var http = require("http");
var path = require('path');
var server;


/**
 * Create the server
 */
function createServer() {
    if (server) {
        return;
    }
    server = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        adcShow.show({
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
}

/**
 * Start the HTTP server
 * @param {Number} [port=3500] Port to listen
 * @param {Function} [callback]
 */
function startServer(port, callback) {
    port = port || 3500;
    createServer();
    server.listen(port, function () {
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