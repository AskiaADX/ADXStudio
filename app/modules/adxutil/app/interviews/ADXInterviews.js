"use strict";

const common = require('../common/common.js');
const errMsg = common.messages.error;
const uuid   = require('uuid');
const InteractiveADXShell = require('../common/InteractiveADXShell.js').InteractiveADXShell;

/**
 * Create a new instance of object to manipulate an interview
 *
 * @param {String} id Id of the interview
 * @param {String} adxDirPath Path of the ADX directory
 * @class Interview
 */
function Interview(id, adxDirPath) {
    /**
     * Id of the interview
     *
     * @name Interview#id
     * @type {String}
     */
    this.id     = id;

    /**
     * Path of the ADX directory
     *
     * @name Interview#path
     * @type {String}
     */
    this.path   = adxDirPath;

    /**
     * Interactive shell that is used to manipulate the interview
     *
     * @name Interview#shell
     * @type {InteractiveADXShell}
     */
    this.shell  = new InteractiveADXShell(this.path, { mode : 'interview' });
}

/**
 * Create a new instance of interview object
 * @ignore
 */
Interview.prototype.constructor = Interview;

/**
 * Execute a command to manipulate an interview
 *
 * @param {String|"show"|"update"|"restart"} command Command to execute
 * @param {Object} [options] Options of the command
 * @param {String} [options.fixture] Name of the fixture file to use
 * @param {String} [options.emulation] Name of the fixture file to use as emulation
 * @param {String} [options.properties] Properties of the ADX  (in url query string format: 'param1=value1&param2-value2')
 * @param {String} [options.parameters] Parameters to update the interview
 * @param {String} [options.themes] Themes variables to set
 * @param {Function} [callback] Callback function
 */
Interview.prototype.execCommand = function execCommand(command, options, callback) {
    const args = [];

    args.push(command);

    // Swap arguments
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    if ('fixture' in options) {
        args.push('"-fixture:' + options.fixture + '"');
    }
    if ('emulation' in options) {
        args.push('"-emulation:' + options.emulation + '"');
    }
    if ('properties' in options) {
        args.push('"-properties:' + options.properties + '"');
    }
    if ('parameters' in options) {
        args.push('"-parameters:' + options.parameters + '"')
    }
    if ('themes' in options) {
        args.push('"-themes:' + options.themes + '"');
    }

    this.shell.exec(args, callback);
};

/**
 * Destroy the interview
 */
Interview.prototype.destroy = function destroy() {
    this.shell.destroy();
};

/**
 * Create a new instance of interviews factory
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      const myAdx = new ADX('path/to/adx/');
 *      myAdx.load((err) => {
 *          if (err) {
 *              throw err;
 *          }
 *
 *          // Get the instance of the interviews
 *          const inter = myAdx.interviews.create();
 *
 *          console.log(inter.id);
 *
 *      });
 *
 * @class InterviewsFactory
 * @param {String} adxDirPath Path of the ADX directory
 */
function InterviewsFactory(adxDirPath) {
    if (!adxDirPath) {
        throw new Error(errMsg.invalidPathArg);
    }

    /**
     * Path of the ADX directory
     *
     * @name InterviewsFactory#path
     * @type {String}
     */
    this.path   = adxDirPath;

    /**
     * Interviews cache
     *
     * @name InterviewsFactory#_cache
     * @type {Object}
     * @private
     */
    this._cache = {};
}

/**
 * Create a new instance of interviews factory
 * @ignore
 */
InterviewsFactory.prototype.constructor = InterviewsFactory;

/**
 * Create a new instance of interview
 *
 * @return {Interview} Returns a new instance of interview
 */
InterviewsFactory.prototype.create = function createInterview() {
    let id = uuid.v4();
    while (this._cache[id]) {
        id = uuid.v4();
    }
    this._cache[id] = new Interview(id, this.path);
    return this._cache[id];
};

/**
 * Get the instance of interview using his id
 *
 * @param {String} id Id of the interview to retrieve
 * @return {undefined|Interview}
 */
InterviewsFactory.prototype.getById = function getById(id) {
    return this._cache[id];
};

/**
 * Remove the instance of interview using his id
 *
 * @param {String} id Id of the interview to remove
 */
InterviewsFactory.prototype.remove = function remove(id) {
    const interview = this._cache[id];
    if (!interview) {
        return;
    }
    interview.destroy();
    delete this._cache[id];
};

/**
 * Remove all instance of interviews
 */
InterviewsFactory.prototype.clear = function clear() {
    for (let id in this._cache) {
        if (this._cache.hasOwnProperty(id)) {
            this.remove(id);
        }
    }
};

// Make it public
exports.InterviewsFactory = InterviewsFactory;