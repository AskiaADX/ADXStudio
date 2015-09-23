var app     = require('app');
var fs      = require('fs');
var http    = require("http");
var ws      = require("nodejs-websocket");
var url     = require("url");
var path    = require('path');
var shell   = require('shell');
var mime    = require('mime-types');

var servers = {
    // Web server
    web : new Server({
        factory : http,
        port    : 3500,
        reply   : reply
    }),

    // Web socket server
    webSocket : new Server({
        factory : ws,
        port    : 3501,
        reply   : wsReply
    })

};


/**
 * Create a new server
 * @param {Object} options Options to create the server
 * @param {Object} options.factory Factory to create the server (http or ws object)
 * @param {Function} options.reply Reply function to pass to the factory
 * @param {Number} [options.port=0] Port to listen (0 to search a free one)
 * @constructor
 */
function Server(options) {
    var factory  = options.factory;
    var reply    = options.reply;
    this.options = options;
    this.port    = this.options.port || 0;

    this.innerServer = factory.createServer(reply);
    this.isStart     = false;
}

/**
 * Listen
 * @param {Function} callback Callback when the listening has started
 * @param {Number} callback.port Port when the server is listening into
 */
Server.prototype.listen = function listen(callback) {
    var self        = this,
        innerServer = self.innerServer;

    // Already started
    if (self.isStart) {
        if (typeof callback === 'function') {
            callback(self.port);
        }
        return;
    }

    if (!self.port) {
        self.port = 3500; // TODO::Make stuff to search a free port
    }

    // Listen the port
    innerServer.listen(self.port, function () {
        self.isStart = true;
        console.log("Server is listening on port " + self.port);
        if (typeof  callback === 'function') {
            callback(self.port);
        }
    });

    // Listen close event
    innerServer.on('close', function () {
        self.isStart = false;
        console.log('Close the server connection');
    });
};

/**
 * Close the connection
 * @param {Function} callback Callback when the listening has started
 */
Server.prototype.close = function close(callback) {
    var self = this;
    if (self.innerServer) {
        self.innerServer.close(function () {
            self.isStart = false;
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
};


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
 * Return the ADC fixtures definition
 * @param {Function} callback
 * @param {Object} callback.fixtures Result
 * @param {String[]} callback.fixtures.list List of fixtures
 * @param {String} callback.fixtures.defaultFixture Default fixture
 */
function getFixtures(callback) {
    var adc = global.project.adc;

    adc.getFixtureList(function (err, fixtures) {
        var result = {
            list : fixtures  || []
        };
        // Search the first allowed question type
        var defaultFixture = '';
        var constraints = adc.configurator.info.constraints(),
            i, l;
        if (constraints.questions) {
            for (var constraint in constraints.questions) {
                if (constraints.questions.hasOwnProperty(constraint)) {
                    for (i  = 0, l = result.list.length; i < l; i += 1) {
                        if (result.list[i].toLocaleLowerCase() === constraint.toLocaleLowerCase() + '.xml') {
                            defaultFixture = result.list[i];
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
        if (!result.defaultFixture && result.list.length) {
            result.defaultFixture = result.list[0];
        }
        callback(result);
    });
}

/**
 * Serve the ADC output
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 * @param {Object} fixtures Fixtures
 */
function serveADCOutput(err, request, response, fixtures) {
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
    var fixtureName = fixtures.defaultFixture;
    var properties = uriParse.query || '';
    var arg = {};

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
 * @param {Object} fixtures Fixtures
 */
function serveADCConfig(err, request, response, fixtures) {
    var adc = global.project.adc;

    if (err) {
        throwHttpError(err, response);
        return;
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify({
        config    : adc.configurator.get(),
        fixtures  : fixtures
    }));
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
            getFixtures(function (fixtures) {
                serveADCOutput(err, request, response, fixtures);
            });
            return;
        }

        if (/^\/config\//i.test(uri)) {
            getFixtures(function (fixtures) {
                serveADCConfig(err, request, response, fixtures);
            });
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
 * Function that reply on the web socket
 * @param connection
 */
function wsReply(connection) {


    /**
     * Throw an ws error
     * @param {Error} err Error
     * @param {Object} connection WS connection
     */
    function throwWSError(err, connection) {
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
     * Serve the adc config
     * @param connection
     */
    function serveADCConfig(err, connection, fixtures) {
        if (err) {
            throwWSError(err, connection);
            return;
        }

        var adc = global.project.adc;
        connection.sendText(JSON.stringify({
            error : 0,
            action : 'getConfig',
            message : {
                config    : adc.configurator.get(),
                fixtures  : fixtures
            }
        }));
    }

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
        var ws = servers.webSocket.innerServer;
        console.log('the connection was closed, remaining connections: ' + ws.connections.length);
    });
}

/**
 * Broadcast message
 * @param {String} message Message to broadcast
 */
function broadcast(message) {
    var ws = servers.webSocket.innerServer;
    ws.connections.forEach(function (connection) {
        connection.sendText(message)
    });
}



exports.servers = servers;
