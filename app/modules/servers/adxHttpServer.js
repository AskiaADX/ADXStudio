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
 * Parse the query part of the URI and return an object that represent it
 *
 * Query like ?prop[a]=1&prop[b]=2&theme[a]=10&theme[b]=20 will be transform to:
 *
 * prop:   a=1&b=2
 * theme:  a=10&b=20
 *
 * @param query
 */
function parseUriQuery(query) {
    const obj = {};
    const params = query.split('&');

    for (let i = 0, l = params.length; i < l; i += 1) {
        if (!params[i]) continue;

        const keyVal = params[i].split('=');
        const key = keyVal[0];
        const value = keyVal[1] || '';
        if (!key) continue;

        const match = /([^\[]+)\[([^\]]+)\]/i.exec(key);
        if (!match || match.length !== 3) continue;
        const objKey = match[1];
        const objValue = match[2];
        if (!obj[objKey]) {
            obj[objKey] = [];
        }
        obj[objKey].push(objValue + '=' + value);
    }

    // Transform to string
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key] = obj[key].join('&');
        }
    }

    return obj;
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
    // Search the fixture-name and the output-name
    // The url should look like that:
    // "/fixture/[fixture-name]/[output-name]/"
    const uriParse = url.parse(request.url);
    const uri   = decodeURIComponent(uriParse.pathname);
    let outputName = adx.configurator.outputs.defaultOutput();
    let fixtureName = fixtures.defaultFixture;
    const uriQuery = parseUriQuery(uriParse.query || '');
    let properties = uriQuery.prop || '';
    let themes = uriQuery.theme || '';
    const arg = {
        silent : true
    };

    const match = /\/fixture\/([^\/]+)\/?([^\/]+)?/i.exec(uri);
    if (match) {
        fixtureName = match[1];
        if (match.length > 1 && match[2]) {
            outputName =  match[2];
        }
    }

    // Add .xml extension on the fixture name
    if (fixtureName && !/\.xml$/i.test(fixtureName)) {
        fixtureName += '.xml';
    }

    if (outputName) {
        outputName = outputName.replace(/\.html$/i, '');
        arg.output = outputName;
    }
    if (fixtureName) {
        arg.fixture = fixtureName;
    }
    arg.masterPage = path.join(__dirname, '../../../node_modules/adxutil/templates/master_page/default.html');

    if (properties) {
        arg.properties = properties;
    }
    if (themes) {
        arg.themes = themes;
    }
    adx.show(arg, function (err, output) {
        if (err) {
            throwError(err, response);
        } else {
            response.writeHead(200, {
                "Content-Type": "text/html",
                'Cache-Control' : 'no-cache, no-store, must-revalidate',
                'Pragma' : 'no-cache',
                'Expires': '0'
            });
            response.write(output);
            response.end();
        }
    });
}

/**
 * Reply on HTTP request
 */
function reply(request, response) {
    // Always reload to obtain the up-to-date info
    const adx = global.project.adx;
    adx.load(function (err) {
        const uri = decodeURIComponent(url.parse(request.url).pathname);

        if (/^\/fixture\/([^\/]+\/?){0,2}(\?.*)?$/i.test(uri)) {
            getFixtures(function (fixtures) {
                serveADXOutput(err, request, response, fixtures);
            });
            return;
        }

        // The share files are generated like that:
        // ../Resources/Survey/file_name
        const reShare = /(\/resources\/survey\/)([^\/]+)$/i;

        // The static files are generated like that:
        // ../Resources/Survey/ADXName/file_name
        const reStatic = /(\/resources\/survey\/([^\/]+)\/)(.+)$/i;

        let uriRewrite = uri.replace(/^(\/fixture)/i, '')
                            .replace(reShare, '/resources/share/$2')
                            .replace(reStatic, '/resources/static/$3');
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
