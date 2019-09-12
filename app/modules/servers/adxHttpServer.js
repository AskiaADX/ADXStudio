'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');
const mime = require('mime-types');
const serverUtil = require('./adxServerUtil.js');
const getFixturesAndEmulations = serverUtil.getFixturesAndEmulations;
const Server = serverUtil.Server;
const regularKey = 'regular';

/**
 * Throw an HTTP error
 * @param {Error} err Error
 * @param {Object} response HTTP Response
 */
function throwError (err, response) {
  console.log('500 Internal server error');
  console.log(err);
  response.writeHead(500, { 'Content-Type': 'text/plain' });
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
function queryToObj (query) {
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
 * Show the ADX output
 *
 * @param {Error} err Error
 * @param {Object} request HTTP Request
 * @param {Object} response HTTP Response
 * @param {Object} fixturesAndEmulations Fixtures and emulations
 */
function showADX (err, request, response, requestData, fixturesAndEmulations) {
  const adx = global.project.getADX();
  if (err) {
    throwError(err, response);
    return;
  }

  let command = 'show'; // 'restart',  'update' or 'show'
  const options = {};

  let fixtureName = fixturesAndEmulations.defaultFixture;
  let emulationName = fixturesAndEmulations.emulations[0];

  // Extract url data
  const uriParse = url.parse(request.url);
  const uri = decodeURIComponent(uriParse.pathname);
  const queryString = uriParse.query || '';
  const queryObj = queryToObj(queryString);

  // Extract information from the query string
  let id = (queryObj && queryObj.regular && queryObj.regular._id) || null;
  let properties = queryObj.prop || '';
  let themes = queryObj.theme || '';
  let interview;

  // Decrypt the url query
  // Search the fixture-name and the emulation-name
  // The url should look like that:
  // "/fixture/[fixture-name]/[emulation-name]/[action].html"
  const match = /\/fixture\/([^\/]+)?\/?([^\/]+)?\/?([^\/]+)?$/i.exec(uri);
  if (match) {
    fixtureName = match[1];
    if (match.length > 1 && match[2]) {
      emulationName = match[2];
    }
    if (match.length > 2 && match[3]) {
      command = match[3].replace(/\.html$/i, '');
    }
  }

  // Add .xml extension on the fixture name
  if (fixtureName && !/\.xml$/i.test(fixtureName)) {
    fixtureName += '.xml';
  }
  options.fixture = fixtureName;
  if (emulationName && !/\.xml$/i.test(emulationName)) {
    emulationName += '.xml';
  }
  options.emulation = emulationName;
  options.properties = properties;
  options.themes = themes;
  // Update on POST
  if (request.method === 'POST') {
    command = 'update';
    options.parameters = requestData;
  }

  if (!id && request.method === 'GET') {
    command = 'restart';
    interview = adx.interviews.create();
  } else {
    interview = adx.interviews.getById(id);
  }

  // Could not find or create an interview
  if (!interview) {
    if (request.method !== 'POST') {
      throwError(new Error('Cannot find the interview with the specified id `' + id + '`'), response);
    }
    return;
  }

  if (command === 'show') {
    saveTheme(themes);
  }

  interview.execCommand(command, options, (err, output) => {
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
        'Location': `http://localhost:${exports.server.port}/fixture/${fixtureName.replace(/\.xml$/i, '')}/${emulationName.replace(/\.xml$/i, '')}/show.html?${q}`
      });
      response.end();
    }    else {
      response.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      // Fix the output URL
      // For legacy ADC/ADP that uses the ../../../SurveyResources/
      // in the fixtures files, we just remove it!
      output = output.replace(/..\/resources\/survey\/..\/..\/..\/surveyresources\//gi,
        '../resources/survey/');
      response.write(output);
      response.end();
    }
  });
}

/**
 * Save the modified theme parameters in Theme.json file
 * @param {String} themeURI
 */
function saveTheme (themeURI) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    return;
  }

  if (!themeURI) {
    fs.unlink(path.join(adx.path, '.adxstudio', 'theme.json'), () => {
      //If not a callback function, nodejs throw an error
    });
    return;
  }
  const keyValuePair = themeURI.split('&');
  const theme = {};
  for (let i = 0, j = keyValuePair.length; i < j; i += 1) {
    const keyValue = keyValuePair[i].split('=');
    theme[decodeURIComponent(keyValue[0].toLowerCase())] = decodeURIComponent(keyValue[1]);
  }

  fs.mkdir(path.join(adx.path, '.adxstudio'), () => {
    fs.writeFile(path.join(adx.path, '.adxstudio', 'theme.json'), JSON.stringify(theme), { encoding: 'utf8' }, () => {
      //If not a callback function, nodejs throw an error
    });
  });

}

/**
 * Get the request data
 */
function getRequestData (request, callback) {
  if (request.method !== 'POST') {
    callback(null, '');
    return;
  }

  let queryData = '';
  request.on('data', (data) => {
    queryData += data.toString();
    if (queryData.length > 1e6) {
      queryData = '';
      request.connection.destroy();
      callback(new Error('Request data too long'), null);
    }
  });

  request.on('end', () => {
    callback(null, queryData.replace(/\+/g, '%20')); // Spaces are encoded with + instead of %20
  });
}

/**
 * Search the resource in the `controls` or `pages` directory
 * @param {ADX} adx ADX Project
 * @param {String} uri URL request
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {Object} callback.stats Stats of file
 * @param {String} callback.filepath Path of the file
 */
function findResource (adx, uri, callback) {
  // The share files are generated like that:
  // ../Resources/Survey/file_name
  const reShare = /(\/resources\/survey\/)([^\/]+)$/i;

  // The static files are generated like that:
  // ../Resources/Survey/ADXName/file_name
  const reStatic = /(\/resources\/survey\/([^\/]+)\/)(.+)$/i;

  // The survey resources are generated like that:
  // /SurveyResources/file_name
  const reSurveyResources = /(\/surveyresources\/)([^\/]+)$/i;

  let uriRewrite = uri.replace(/^(\/fixture\/(?:[^\/]+))/i, '')
    .replace(reShare, '/resources/share/$2')
    .replace(reStatic, '/resources/static/$3')
    .replace(reSurveyResources, '/tests/fixtures/Resources/$2');

  const filename = path.join(adx.path, uriRewrite);

  fs.stat(filename, (err, stats) => {
    if (!err) {
      callback(err, stats, filename);
      return;
    }

    function retryWithSubProject() {
      // Retry with the sub-project

      const subProjectType = (adx.configurator.projectType === 'adc') ? 'pages' : 'controls';
      const subProjectRootPath = path.join(adx.path, 'tests/' + subProjectType);
      let altUriRewrite = uri.replace(/^(\/fixture\/(?:[^\/]+))/i, '')
        .replace(reShare, '/resources/share/$2')
        .replace(reStatic, '/$2/resources/static/$3');

      if (!/^\/resources\/share\//i.test(altUriRewrite)) {
        const altFileStaticName = path.join(subProjectRootPath, altUriRewrite);
        fs.stat(altFileStaticName, (err, stats) => {
          callback(err, stats, altFileStaticName);
        });
        return;
      } 

      fs.readdir(subProjectRootPath, (err, files) => {
        if (err) {
          callback(err, stats, filename);
          return;
        }

        const directories = files.filter((file) => {
          return fs.statSync(path.join(subProjectRootPath, file)).isDirectory();
        });

        let current = 0;
        const length = directories.length;
        // Recursive function
        function findFirst () {
          const altFileName = path.join(subProjectRootPath, directories[current], altUriRewrite);

          fs.stat(altFileName, (err, stats) => {
            if (!err) {
              callback(err, stats, altFileName);
              return;
            }
            current++;
            if (current < length) {
              findFirst();
              return;
            }
            callback(err, stats, filename);
          });
        }
        //
        findFirst();
      });
    }

    // Retry with the resources of the fixtures
    if (/^\/resources\/share\//i.test(uriRewrite)) {
      const uriRewriteFixtures = uriRewrite.replace(/(\/resources\/share\/)([^\/]+)$/i, 
        '/tests/fixtures/Resources/$2');
      const altFileFixtures = path.join(adx.path, uriRewriteFixtures);
      fs.stat(altFileFixtures, (err, stats) => {
        if (!err) {
          callback(err, stats, altFileFixtures);
          return;
        }

        retryWithSubProject();
      });
      return;
    } 

    retryWithSubProject();
  });
}

/**
 * Reply on HTTP request
 */
function replyWithRequestData (request, response, requestData) {
  // Always reload to obtain the up-to-date info
  const adx = global.project.getADX();
  adx.load((err) => {
    const uri = decodeURIComponent(url.parse(request.url).pathname);
    if (/^\/fixture\/([^\/]+\/?){0,3}(\?.*)?$/i.test(uri)) {
      getFixturesAndEmulations((result) => {
        showADX(err, request, response, requestData, result);
      });
      return;
    }

    findResource(adx, uri, (err, stats, filepath) => {
      if (err) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('404 Not Found\n');
        response.end();
        return;
      }

      if (stats.isFile()) {
        // path exists, is a file

        response.writeHead(200, {
          'Content-Type': mime.lookup(filepath),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(response);

      } else if (stats.isDirectory()) {

        // path exists, is a directory

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('Index of ' + uri + '\n');
        response.write('TODO, show index?\n');
        response.end();

      } else {

        // Symbolic link, socket and other ...
        throwError(null, response);
      }
    });

  });
}

/**
 * Reply on HTTP request
 */
function reply (request, response) {
  getRequestData(request, (err, requestData) => {
    if (err) throw err;
    replyWithRequestData(request, response, requestData);
  });
}

// Return an http server
exports.server = new Server({
  factory: http,
  port: 0, // Auto-search
  reply: reply
});
