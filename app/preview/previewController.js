var app     = require('app');
var fs      = require('fs');
var http    = require("http");
var url     = require("url");
var path    = require('path');
var shell   = require('shell');
var mime    = require('mime-types');
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

/**
 * Throw an HTTP error
 * @param {Error} err Error
 * @param {Object} response HTTP Response
 */
function throwHttpError(err, response) {
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.write('500 Internal server error\n');
    if (err) {
        response.write(err.message + '\n');
    }
    response.end();
}

/**
 * Serve the ADC output
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 */
function serveADCOutput(err, request, response) {
    var adc = global.project.adc;
    if (err) {
        throwHttpError(err, response);
        return;
    }

    // Decrypt the url query
    // Search the output-name and the fixture-name
    // The url should look like that:
    // "/output/[output-name]/[fixture-name]/
    // The [fixture-name] is optional
    var uriParse = url.parse(request.url);
    var uri   = decodeURIComponent(uriParse.pathname);
    var outputName = adc.configurator.outputs.defaultOutput();
    var fixtureName = 'chapter.xml';
    var properties = uriParse.query || '';
    var arg = {};
    // Search the first allowed question type
    var constraints = adc.configurator.info.constraints();
    if (constraints.questions) {
        for (var constraint in constraints.questions) {
            if (constraints.questions.hasOwnProperty(constraint)) {
                fixtureName = constraint;
                break;
            }
        }
    }
    var match = /\/output\/([^\/]+)\/?([^\/]+)?/i.exec(uri);
    if (match) {
        outputName = match[1];
        if (match.length > 1 && match[2]) {
            fixtureName =  match[2];
        }
    }

    // Add .xml extension on the fixture name
    if (!/\.xml$/i.test(fixtureName)) {
        fixtureName += '.xml';
    }
    arg.output = outputName;
    arg.fixture = fixtureName;
    arg.masterPage = 'node_modules/adcutil/templates/master_page/default.html';
    if (properties) {
        arg.properties = properties;
    }
    adc.show(arg, function (err, output) {
        if (err) {
            throwHttpError(err, response);
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(output);
            response.end();
        }
    });
}


/**
 * Serve the ADC configuration
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 */
function serveADCConfig(err, request, response) {
    var adc = global.project.adc;
    if (err) {
        throwHttpError(err, response);
        return;
    }

    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(adc.configurator.get()));
    response.end();
}

/**
 * Reply on HTTP request
 */
function reply(request, response) {
    // Always reload to obtain the up-to-date info
    var adc = global.project.adc;
    adc.load(function (err) {
        var uri = decodeURIComponent(url.parse(request.url).pathname);

        if (/^\/output\/([^\/]+\/?){0,2}(\?.*)?$/i.test(uri)) {
            serveADCOutput(err, request, response);
            return;
        }

        if (/^\/config\//i.test(uri)) {
            serveADCConfig(err, request, response);
            return;
        }

        var adcname = adc.configurator.info.name();
        var pattern = new RegExp("\/survey\/" + adcname.toLocaleLowerCase() + "\/", "i");
        var uriRewrite = uri.replace(pattern, "/static/").replace(/\/survey\//i, "/share/");
        var match     = /(resources\/(?:.*))/i.exec(uriRewrite);
        if (match && match.length === 2) {
            uriRewrite = match[1];
        }
        var filename = path.join(adc.path, uriRewrite);
        var stats;

        try {
            stats = fs.lstatSync(filename); // throws if path doesn't exist
        } catch (e) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('404 Not Found\n');
            response.end();
            return;
        }

        if (stats.isFile()) {
            // path exists, is a file

            response.writeHead(200, {'Content-Type': mime.lookup(filename)});
            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(response);

        } else if (stats.isDirectory()) {

            // path exists, is a directory

            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.write('Index of ' + uri + '\n');
            response.write('TODO, show index?\n');
            response.end();

        } else {

            // Symbolic link, socket and other ...
            throwHttpError(null, response);
        }
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
        // TODO::Don't open it externally for the moment
        // shell.openExternal('http://localhost:' + port + '/output/');
    });
});

exports.startServer = startServer;
exports.stopServer = stopServer;