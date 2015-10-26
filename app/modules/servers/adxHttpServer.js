var fs      = require('fs');
var http    = require("http");
var url     = require("url");
var path    = require('path');
var mime    = require('mime-types');
var serverUtil  = require('./adxServerUtil.js');
var getFixtures = serverUtil.getFixtures;
var Server      = serverUtil.Server;

/**
 * Throw an HTTP error
 * @param {Error} err Error
 * @param {Object} response HTTP Response
 */
function throwError(err, response) {
    console.log('500 Internal server error');
    console.log(err);
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
 * @param {Object} fixtures Fixtures
 */
function serveADCOutput(err, request, response, fixtures) {
    var adc = global.project.adc;
    if (err) {
        throwError(err, response);
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
    var arg = {
        silent : true
    };

    var match = /\/output\/([^\/]+)\/?([^\/]+)?/i.exec(uri);
    if (match) {
        outputName = match[1];
        if (match.length > 1 && match[2]) {
            fixtureName =  match[2];
        }
    }

    // Add .xml extension on the fixture name
    if (fixtureName && !/\.xml$/i.test(fixtureName)) {
        fixtureName += '.xml';
    }
    if (outputName) {
        arg.output = outputName;
    }
    if (fixtureName) {
        arg.fixture = fixtureName;
    }
    arg.masterPage = path.join(__dirname, '../../../node_modules/adcutil/templates/master_page/default.html');
    if (properties) {
        arg.properties = properties;
    }

    adc.show(arg, function (err, output) {
        if (err) {
            throwError(err, response);
        } else {
            // Fix paths inside output:
            var rg = new RegExp("File:\\\\\\\\\\\\" + global.project.path.replace(/\\/g, "/"), "g");
            var html = output.replace(rg, "../Resources/Survey/");
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(html);
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
        throwError(err, response);
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
            throwError(null, response);
        }
    });
}

// Return an http server
exports.server = new Server({
    factory : http,
    port    : 3500,
    reply   : reply
});
