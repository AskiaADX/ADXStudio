"use strict";

const common          = require('../common/common.js');
const InteractiveADXShell = require('../common/InteractiveADXShell.js').InteractiveADXShell;
const pathHelper      = require('path');
const errMsg          = common.messages.error;


/**
 * Import an askia xml
 *
 * @class Import
 * @param {String} adxDirPath Path of the ADX directory
 * @private
 */
function Import(adxDirPath) {
    /**
     * Root dir of the current ADXUtil
     *
     * @name Import#rootdir
     * @type {String}
     */
    this.rootdir    = pathHelper.resolve(__dirname, "../../");

    /**
     * Path to the ADX directory
     *
     * @name Import#adxDirectoryPath
     * @type {string}
     */
    this.adxDirectoryPath = adxDirPath ? pathHelper.normalize(adxDirPath) : process.cwd();
}

/**
 * Create a new instance of ADX Import
 *
 * @ignore
 */
Import.prototype.constructor = Import;

/**
 * Write an error output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Import.prototype.writeError = function writeError(text) {
    common.writeError.apply(common, arguments);
};

/**
 * Write a warning output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Import.prototype.writeWarning = function writeWarning(text) {
    common.writeWarning.apply(common, arguments);
};

/**
 * Write a success output in the console
 * @param {String} text Text to write in the console
 * @private
 */
Import.prototype.writeSuccess = function writeSuccess(text) {
    common.writeSuccess.apply(common, arguments);
};

/**
 * Write an arbitrary message in the console without specific prefix
 * @param {String} text Text to write in the console
 * @private
 */
Import.prototype.writeMessage = function writeMessage(text) {
    common.writeMessage.apply(common, arguments);
};

/**
 * Import an akia xml
 *
 * @param {Object} options Options
 * @param {String} options.sourcePath Path to the askia xml
 * @param {String} options.targetName Name of the new fixture
 * @param {String} options.currentQuestion Question to use in the fixture
 * @param {InteractiveADXShell} [options.adxShell] Interactive ADXShell process
 * @param {Boolean} [options.silent=false] Silent mode: Don't message in the console but only through the callback
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 */
Import.prototype.adxImport = function adxImport(options, callback) {
    if (!options || !options.sourcePath) {
        if (!options.silent) {
            this.writeError(errMsg.noXMLPathDefinedForImport);
        }
        if (typeof callback === 'function') {
            callback(new Error(errMsg.noXMLPathDefinedForImport));
        }
        return;
    }

    if (!options || !options.targetName) {
        if (!options.silent) {
            this.writeError(errMsg.noFileDefinedForImport);
        }
        if (typeof callback === 'function') {
            callback(new Error(errMsg.noFileDefinedForImport));
        }
        return;
    }

    if (!options || !options.currentQuestion) {
        if (!options.silent) {
            this.writeError(errMsg.noQuestionDefinedForImport);
        }
        if (typeof callback === 'function') {
            callback(new Error(errMsg.noQuestionDefinedForImport));
        }
        return;
    }

    const execFile = require('child_process').execFile;
    const args     = [
        'import',
        '"-sourcePath:' + options.sourcePath + '"',
        '"-targetName:' + options.targetName + '"',
        '"-currentQuestion:' + options.currentQuestion + '"'
    ];

    args.push('"' + this.adxDirectoryPath + '"');

    const self = this;
    function execCallback(err, stdout, stderr) {
        if (err && typeof callback === 'function') {
            callback(err, null);
            return;
        }

        if (!options.silent) {
            self.writeMessage(stdout);
        }

        if (!stderr && typeof  callback === 'function') {
            callback(null, stdout);
        }

        if (stderr) {
            if (!options.silent) {
                self.writeError("\r\n" + stderr);
            }
            if (typeof callback === 'function') {
                callback(new Error(stderr));
            }
        }
    }

    if (!options.adxShell) {
        execFile('.\\' + common.ADX_UNIT_PROCESS_NAME, args, {
            cwd   : pathHelper.join(self.rootdir, common.ADX_UNIT_DIR_PATH),
            env   : common.getChildProcessEnv()
        }, execCallback);
    } else {
        options.adxShell.exec(args.join(' '), execCallback);
    }
};

// Make it public
exports.Import = Import;

/**
 * Import an askia XML
 *
 * @param {Command} program Commander object which hold the arguments pass to the program
 * @param {String} path Path of the ADX to directory
 * @ignore
 */
exports.adxImport = function adxImport(program, path) {
    const adxImportInstance = new Import(path);
    adxImportInstance.adxImport(program);
};