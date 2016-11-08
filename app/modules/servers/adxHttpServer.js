"use strict";

const fs      = require('fs');
const http    = require("http");
const url     = require("url");
const path    = require('path');
const mime    = require('mime-types');
const serverUtil  = require('./adxServerUtil.js');
const getFixtures = serverUtil.getFixtures;
const Server      = serverUtil.Server;
const regularKey = 'regular';

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
 * Query like ?x=y&prop[a]=1&prop[b]=2&theme[a]=10&theme[b]=20 will be transform to:
 *
 * regular : {
 *   x : y
 * }
 * prop:   a=1&b=2
 * theme:  a=10&b=20
 *
 * @param query
 */
function queryToObj(query) {
    const obj = {};
    const params = query.split('&');

    for (let i = 0, l = params.length; i < l; i += 1) {
        if (!params[i]) continue;

        const keyVal = params[i].split('=');
        const key = keyVal[0];
        const value = keyVal[1] || '';
        if (!key) continue;

        const match = /([^\[]+)\[([^\]]+)\]/i.exec(key);
        const objKey = (match && match.length === 3) ? match[1] : regularKey;
        const objValue = (match && match.length === 3) ? match[2] : key;
        if (!obj[objKey]) {
            obj[objKey] = objKey !== regularKey ? [] : {};
        }
        if (objKey !== regularKey) {
            obj[objKey].push(objValue + '=' + value);
        } else {
            obj[objKey][objValue] = value;
        }
    }

    // Transform to string
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && key !== regularKey) {
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
function serveADXOutput(err, request, response, requestData, fixtures) {
    const adx = global.project.getADX();
    if (err) {
        throwError(err, response);
        return;
    }

    let command = 'show'; // 'restart',  'update' or 'show'
    const options = {};

    let fixtureName = fixtures.defaultFixture;
    let outputName = adx.configurator.outputs.defaultOutput();

    // Extract url data
    const uriParse = url.parse(request.url);
    const uri   = decodeURIComponent(uriParse.pathname);
    const queryString = uriParse.query || '';
    const queryObj = queryToObj(queryString);

    // Extract information from the query string
    let id = (queryObj && queryObj.regular && queryObj.regular._id) || null;
    let properties = queryObj.prop || '';
    let themes = queryObj.theme || '';
    let interview;


    // Decrypt the url query
    // Search the fixture-name and the output-name
    // The url should look like that:
    // "/fixture/[fixture-name]/[output-name]/[action].html"
    const match = /\/fixture\/([^\/]+)?\/?([^\/]+)?\/?([^\/]+)?$/i.exec(uri);
    if (match) {
        fixtureName = match[1];
        if (match.length > 1 && match[2]) {
            outputName =  match[2];
        }
        if (match.length > 2 && match[3]) {
            command = match[3].replace(/\.html$/i, '');
        }
    }

    // Add .xml extension on the fixture name
    if (fixtureName && !/\.xml$/i.test(fixtureName)) {
        fixtureName += '.xml';
    }

    options.output = outputName;
    options.fixture = fixtureName;
    // arg.masterPage = path.join(__dirname, '../../../node_modules/adxutil/templates/master_page/default.html');
    options.properties = properties;
    options.themes = themes;

    // Update on POST
    if (request.method === 'POST') {
        command = 'update';
        options.parameters = requestData;
    }

    if (id === null && request.method === 'GET') {
        command = 'restart';
        interview = adx.interviews.create();
    } else {
        interview = adx.interviews.getById(id);
    }

    // Could not find or create an interview
    if (!interview) {
        throwError(new Error("Cannot find the interview with the specified id `" + id + "`"), response);
        return;
    }

    interview.execCommand(command, options, function (err, output) {
        if (err) {
            throwError(err, response);
            return;
        }

        if (command !== 'show' && !/\s*ok\s*/i.test(output)) {
            throwError(new Error(output), response);
            return;
        }

        if (command !== 'show') { // By default use the redirection to display the page
            let q = '';
            if (!queryObj || !queryObj.regular || !queryObj.regular._id) {
                q = '_id=' + interview.id;
                if (queryString) {
                    q += '&' + queryString;
                }
            } else {
                q = queryString;
            }

            response.writeHead(302, {
                'Location': 'http://localhost:3500/fixture/' + fixtureName.replace(/\.xml$/i, '') + '/' + outputName + '/show.html?' + q
            });
            response.end();
        }
        else {
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


    /*adx.show(arg, function (err, output) {
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
    });*/
}

/**
 * Get the request data
 */
function getRequestData(request, callback) {
    if (request.method !== 'POST') {
        callback(null, '');
        return;
    }

    let queryData = '';
    request.on('data', function(data) {
        queryData += data;
        if (queryData.length > 1e6) {
            queryData = "";
            request.connection.destroy();
            callback(new Error("Request data too long"), null);
        }
    });

    request.on('end', function() {
        callback(null, queryData);
    });
}

/**
 * Reply on HTTP request
 */
function replyWithRequestData(request, response, requestData) {
    // Always reload to obtain the up-to-date info
    const adx = global.project.getADX();
    adx.load(function (err) {
        const uri = decodeURIComponent(url.parse(request.url).pathname);

        if (/^\/fixture\/([^\/]+\/?){0,3}(\?.*)?$/i.test(uri)) {
            getFixtures(function (fixtures) {
                serveADXOutput(err, request, response, requestData, fixtures);
            });
            return;
        }

        // The share files are generated like that:
        // ../Resources/Survey/file_name
        const reShare = /(\/resources\/survey\/)([^\/]+)$/i;

        // The static files are generated like that:
        // ../Resources/Survey/ADXName/file_name
        const reStatic = /(\/resources\/survey\/([^\/]+)\/)(.+)$/i;

        let uriRewrite = uri.replace(/^(\/fixture\/(?:[^\/]+))/i, '')
            .replace(reShare, '/resources/share/$2')
            .replace(reStatic, '/resources/static/$3');

        const filename = path.join(adx.path, uriRewrite);

        function statCallback(err, stats, filepath) {
            if (err) {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write('404 Not Found\n');
                response.end();
                return;
            }

            if (stats.isFile()) {
                // path exists, is a file

                response.writeHead(200, {
                    'Content-Type': mime.lookup(filepath),
                    'Cache-Control' : 'no-cache, no-store, must-revalidate',
                    'Pragma' : 'no-cache',
                    'Expires': '0'
                });
                const fileStream = fs.createReadStream(filepath);
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
        }

        fs.stat(filename, function (err, stats) {
            if (!err) {
                statCallback(err, stats, filename);
                return;
            }

            // Re-try with the alternative file
            let altUriRewrite = uri.replace(/^(\/fixture\/(?:[^\/]+))/i, '')
                .replace(reShare, '/resources/share/$2')
                .replace(reStatic, '/$2/resources/static/$3');

            const subProjectType = (adx.configurator.projectType === 'adc') ? 'adp' : 'adc';
            const altFileName = path.join(adx.path, 'tests/fixtures/' + subProjectType, altUriRewrite);

            fs.stat(altFileName, function (err, stats) {
                statCallback(err, stats, altFileName);
            });
        });
    });
}

/**
 * Reply on HTTP request
 */
function reply(request, response) {
    getRequestData(request, function (err, requestData) {
        replyWithRequestData(request, response, requestData);
    });
}

// Return an http server
exports.server = new Server({
    factory : http,
    port    : 0, // Auto-search
    reply   : reply
});
