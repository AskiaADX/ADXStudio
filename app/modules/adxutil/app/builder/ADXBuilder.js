"use strict";

const fs          = require('fs');
const pathHelper  = require('path');
const common      = require('../common/common.js');
const errMsg      = common.messages.error;
const successMsg  = common.messages.success;
const Validator   = require('../validator/ADXValidator.js').Validator;

/**
 * Validate and compress the ADX directory to an `.adc` or `.adp` file
 *
 * @class Builder
 * @param {String} adxDirPath Path of the ADX directory
 * @private
 */
function Builder(adxDirPath) {
    /**
     * Root dir of the current ADXUtil
     *
     * @name Builder#rootdir
     * @type {String}
     */
    this.rootdir = pathHelper.resolve(__dirname, "../../");

    /**
     * Name of the ADX
     *
     * @name Builder#adxName
     * @type {string}
     */
    this.adxName = '';

    /**
     * Path to the ADX directory
     *
     * @name Builder#adxDirectoryPath
     * @type {string}
     */
    this.adxDirectoryPath = adxDirPath ? pathHelper.normalize(adxDirPath) : process.cwd();

    /**
     * Configurator of the ADX
     *
     * @name Builder#adxConfigurator
     * @type {ADX.Configurator}
     */
    this.adxConfigurator = null;

    /**
     * Bin path of the ADX
     *
     * @name Builder#binPath
     * @type {string}
     */
    this.binPath = '';

    /**
     * Path of the output file
     *
     * @name Builder#outputPath
     * @type {string}
     */
    this.outputPath = '';

    /**
     * Sequence of calls
     *
     * @name Builder#sequence
     * @type {Sequence}
     */
    this.sequence = new common.Sequence([
        this.createBinDir,
        this.compressADX
    ], this.done, this);

    /**
     * Report of the validation
     *
     * @name Builder#validationReport
     * @type {{startTime: null, endTime: null, runs: number, total: number, success: number, warnings: number, errors: number}}
     */
    this.validationReport = null;

    /**
     * Logger to override with an object
     *
     * @name Builder#logger
     * @type {{writeMessage : Function, writeSuccess : Function, writeWarning: Function, writeError : Function}}
     */
    this.logger = null;

    /**
     * Print mode
     *
     * @name Builder#printMode
     * @type {String|"default"|"html"}
     */
    this.printMode = 'default';
}

/**
 * Create a new instance of ADX Builder
 * @ignore
 */
Builder.prototype.constructor = Builder;

/**
 * Build the ADX
 *
 * @param {Object} [options] Options of validation
 * @param {String|'default'|'html'} [options.printMode='default'] Print mode (default console or html)
 * @param {Boolean} [options.test=true] Run unit tests
 * @param {Boolean} [options.autoTest=true] Run auto unit tests
 * @param {Boolean} [options.xml=true] Validate the config.xml file
 * @param {InteractiveADXShell} [options.adxShell] Interactive ADXShell process
 * @param {Object} [options.logger] Logger
 * @param {Function} [options.writeMessage] Function where regular messages will be print
 * @param {Function} [options.writeSuccess] Function where success messages will be print
 * @param {Function} [options.writeWarning] Function where warning messages will be print
 * @param {Function} [options.writeError] Function where error messages will be print
 * @param {Function} [callback] Callback function
 * @param {Error} [callback.err] Error
 * @param {String} [callback.outputPath] Path of the output
 * @param {Object} [callback.report] Validation report
 */
Builder.prototype.build = function build(options, callback) {

    // Reset the print mode
    this.printMode = 'default';

    // Swap the options
    if (typeof  options === 'function') {
        callback = options;
        options = null;
    }

    this.buildCallback = callback;

    this.validator = new Validator(this.adxDirectoryPath);

    const self = this;
    options = options || {};
    options.xml = true;
    options.autoTest = true;
    if (options.logger) {
        this.logger = options.logger;
    }
    if (options.printMode) {
        this.printMode = options.printMode || 'default';
    }

    this.validator.validate(options, (err, report) => {
        if (err) {
            return self.sequence.resume(new Error(errMsg.validationFailed));
        }

        self.adxName          = self.validator.adxName;
        self.adxConfigurator  = self.validator.adxConfigurator;
        self.binPath          = pathHelper.join(self.adxDirectoryPath, common.ADX_BIN_PATH);
        self.validationReport = report;

        return self.sequence.resume();
    });
};

/**
 * Write an error output in the console or in the logger
 * @param {String} text Text to write in the console
 */
Builder.prototype.writeError = function writeError(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="error">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeError === 'function') {
        this.logger.writeError.apply(this.logger, args);
    } else {
        common.writeError.apply(common, args);
    }
};

/**
 * Write a warning output in the console or in the logger
 * @param {String} text Text to write in the console
 */
Builder.prototype.writeWarning = function writeWarning(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="warning">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeWarning === 'function') {
        this.logger.writeWarning.apply(this.logger, args);
    } else {
        common.writeWarning.apply(common, args);
    }
};

/**
 * Write a success output in the console or in the logger
 * @param {String} text Text to write in the console
 */
Builder.prototype.writeSuccess = function writeSuccess(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="success">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeSuccess === 'function') {
        this.logger.writeSuccess.apply(this.logger, args);
    } else {
        common.writeSuccess.apply(common, args);
    }
};

/**
 * Write an arbitrary message in the console  or in the logger without specific prefix or in the  logger
 * @param {String} text Text to write in the console
 */
Builder.prototype.writeMessage = function writeMessage(text) {
    const args = Array.prototype.slice.call(arguments);
    if (this.printMode === 'html' && args.length) {
        args[0] = '<div class="message">' + args[0] + '</div>';
    }
    if (this.logger && typeof this.logger.writeMessage === 'function') {
        this.logger.writeMessage.apply(this.logger, args);
    } else {
        common.writeMessage.apply(common, args);
    }
};


/**
 * End of the sequence chain
 * @param {Error} err Error
 */
Builder.prototype.done = function done(err) {
    if (err) {
        this.writeError(err.message);
        if (typeof this.buildCallback === 'function') {
            this.buildCallback(err, this.outputPath, this.validationReport);
        }
        return;
    }

    const fileExt = '.' + this.adxConfigurator.projectType.toLowerCase();
    const output = pathHelper.join(this.binPath, this.adxName + fileExt);

    if (!this.validationReport.warnings) {
        this.writeSuccess(successMsg.buildSucceed, output);
    } else {
        this.writeSuccess(successMsg.buildSucceedWithWarning, this.validationReport.warnings, output);
    }
    if (typeof this.buildCallback === 'function') {
        this.buildCallback(err, this.outputPath, this.validationReport);
    }
};


/**
 * Create a bin directory
 */
Builder.prototype.createBinDir =  function createBinDir() {
    const self = this;
    common.dirExists(this.binPath, (err, exist) => {
        if (!exist || err) {
            const er = fs.mkdirSync(self.binPath);
            if (er) {
                return self.sequence.resume(er);
            }
        }
        return self.sequence.resume();
    });
};

/**
 * Compress the ADX directory
 */
Builder.prototype.compressADX =  function compressADX() {
    const self = this;
    common.getDirStructure(self.adxDirectoryPath, (err, structure) => {
        if (err) {
            return self.sequence.resume(err);
        }

        const zip   = common.getNewZip();
        let zipDir  = '';

        structure.forEach(function appendInZip(file) {
            let prevDir,
                folderLower,
                zipDirLower = zipDir.toLowerCase();

            if (typeof file === 'string') {  // File
                if (zipDirLower === 'resources\\') return; // Exclude extra files
                if (zipDirLower === '' && !/^(config\.xml|readme|changelog)/i.test(file)) return; // Exclude extra files
                if (common.isIgnoreFile(file)) return; // Ignore files
                zip.file(
                    pathHelper.join(zipDir, file),
                    fs.readFileSync(pathHelper.join(self.adxDirectoryPath, zipDir, file))
                );
            } else { // Directory
                if (!file.sub || !file.sub.length) return;        // Exclude empty folder

                folderLower = file.name.toLowerCase();

                if (folderLower === 'bin') return;   // Exclude the bin folder
                if (folderLower === 'tests') return; // Exclude tests folder
                if (zipDirLower === 'resources\\' &&  !/^(dynamic|static|share)$/i.test(folderLower)) return; // Exclude extra directories
                if (zipDirLower === '' && !/^(resources)$/.test(folderLower)) return; // Exclude extra directories

                prevDir = zipDir;
                zipDir += file.name + '\\';
                zip.folder(zipDir);
                file.sub.forEach(appendInZip);
                zipDir = prevDir;
            }
        });

        const buffer = zip.generate({
            type: "nodebuffer",
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });
        const fileExt = '.' + self.adxConfigurator.projectType.toLowerCase();

        self.outputPath = pathHelper.join(self.binPath, self.adxName + fileExt);
        fs.writeFile(self.outputPath, buffer, (err) => {
            if (err) {
                throw err;
            }
        });

        self.sequence.resume();
    });
};


// Export the Builder object
exports.Builder = Builder;


/*
 * Build the ADX file
 *
 * @param {Command} program Commander object which hold the arguments pass to the program
 * @param {String} path Path of the ADX to directory
 * @ignore
 */
exports.build = function build(program, path) {
    const builder = new Builder(path);
    builder.build(program);
};





