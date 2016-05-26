"use strict";

const fs      = require('fs');
const http    = require("http");
const url     = require("url");
const path    = require('path');
const mime    = require('mime-types');
const serverUtil  = require('./adxServerUtil.js');
const getFixtures = serverUtil.getFixtures;
const Server      = serverUtil.Server;

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
 * Serve the ADX output
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 * @param {Object} fixtures Fixtures
 */
function serveADXOutput(err, request, response, fixtures) {
    const adx = global.project.adx;
    if (err) {
        throwError(err, response);
        return;
    }

    // Decrypt the url query
    // Search the output-name and the fixture-name
    // The url should look like that:
    // "/output/[output-name]/[fixture-name]/
    // The [fixture-name] is optional
    const uriParse = url.parse(request.url);
    const uri   = decodeURIComponent(uriParse.pathname);
    let outputName = adx.configurator.outputs.defaultOutput();
    let fixtureName = fixtures.defaultFixture;
    const properties = uriParse.query || '';
    const arg = {
        silent : true
    };

    const match = /\/output\/([^\/]+)\/?([^\/]+)?/i.exec(uri);
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
    arg.masterPage = path.join(__dirname, '../../../node_modules/adxutil/templates/master_page/default.html');
    if (properties) {
        arg.properties = properties;
    }
    adx.show(arg, function (err, output) {
        if (err) {
            throwError(err, response);
        } else {
            // Fix paths inside output:
            const rg = new RegExp("File:\\\\\\\\\\\\" + global.project.path.replace(/\\/g, "/"), "g");
            const html = output.replace(rg, "../Resources/Survey/");
            response.writeHead(200, {
                "Content-Type": "text/html",
                'Cache-Control' : 'no-cache, no-store, must-revalidate',
                'Pragma' : 'no-cache',
                'Expires': '0'
            });
            response.write(html);
            response.end();
        }
    });
}

/**
 * Serve the ADX configuration
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 * @param {Object} fixtures Fixtures
 */
function serveADXConfig(err, request, response, fixtures) {
    const adx = global.project.adx;

    if (err) {
        throwError(err, response);
        return;
    }
    response.writeHead(200, {
        "Content-Type": "application/json",
        'Cache-Control' : 'no-cache, no-store, must-revalidate',
        'Pragma' : 'no-cache',
        'Expires': '0'
    });
    response.write(JSON.stringify({
        config    : adx.configurator.get(),
        fixtures  : fixtures
    }));
    response.end();
}

/**
 * Reply on HTTP request
 */
function reply(request, response) {
    // Always reload to obtain the up-to-date info
    const adx = global.project.adx;
    adx.load(function (err) {
        const uri = decodeURIComponent(url.parse(request.url).pathname);

        if (/^\/output\/([^\/]+\/?){0,2}(\?.*)?$/i.test(uri)) {
            getFixtures(function (fixtures) {
                serveADXOutput(err, request, response, fixtures);
            });
            return;
        }

        if (/^\/config\//i.test(uri)) {
            getFixtures(function (fixtures) {
                serveADXConfig(err, request, response, fixtures);
            });
            return;
        }

        const adxname = adx.configurator.info.name();
        const pattern = new RegExp("\/survey\/" + adxname.toLocaleLowerCase() + "\/", "i");
        let uriRewrite = uri.replace(pattern, "/static/").replace(/\/survey\//i, "/share/");
        const match     = /(resources\/(?:.*))/i.exec(uriRewrite);
        if (match && match.length === 2) {
            uriRewrite = match[1];
        }

        const filename = path.join(adx.path, uriRewrite);
        let stats;

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

            response.writeHead(200, {
                'Content-Type': mime.lookup(filename),
                'Cache-Control' : 'no-cache, no-store, must-revalidate',
                'Pragma' : 'no-cache',
                'Expires': '0'
            });
            const fileStream = fs.createReadStream(filename);
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
    port    : 0, // Auto-search
    reply   : reply
});
