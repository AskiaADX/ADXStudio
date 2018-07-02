"use strict";

const path            = require('path');
const common          = require('../common/common.js');
const successMsg      = common.messages.success;
const errMsg          = common.messages.error;
const Configurator	= require('../configurator/ADXConfigurator.js').Configurator;
const preferences     = require('../preferences/ADXPreferences.js');
const Builder   		= require('../builder/ADXBuilder.js').Builder;

exports.platforms = {
    'ZenDesk'   :   require('./ADXPublisherZenDesk.js')
};

/**
 * Manage a publisher process
 *
 * @class Publisher
 * @param {String} [adxDirPath=process.cwd()] Path of the ADX Directory
 * @private
 */
function Publisher(adxDirPath) {
    /**
     * Path to the ADX directory
     *
     * @name Publisher#adxDirectoryPath
     * @type {string}
     */
    this.adxDirectoryPath = adxDirPath ? path.normalize(adxDirPath) : process.cwd();
}

Publisher.prototype.constructor = Publisher;

/**
 * Write an error output in the console
 *
 * @param {String} text Text to write in the console
 * @private
 */
Publisher.prototype.writeError = function writeError(text) {
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
 * Write a warning output in the console
 *
 * @param {String} text Text to write in the console
 * @private
 */
Publisher.prototype.writeWarning = function writeWarning(text) {
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
 * Write a success output in the console
 *
 * @param {String} text Text to write in the console
 * @private
 */
Publisher.prototype.writeSuccess = function writeSuccess(text) {
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
 * Write an arbitrary message in the console without specific prefix
 *
 * @param {String} text Text to write in the console
 * @private
 */
Publisher.prototype.writeMessage = function writeMessage(text) {
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
 * Publish to a platform
 *
 * @param {String} platform Name of the platform to where to push
 * @param {Object} options Options of the platform
 * @param {Boolean} [options.silent=false] Bypass the output
 * @param {Function} callback
 * @param {Error} [callback.err=null]
 */
Publisher.prototype.publish = function (platform, options, callback) {
    if (typeof callback !== 'function') {
        callback = function () {};
    }

    if (!platform) {
        callback(new Error(errMsg.missingPlatformArg));
        return;
    }

    if (!exports.platforms[platform]) {
        callback(new Error(errMsg.invalidPlatformArg));
        return;
    }

    this.builder = new Builder(this.adxDirectoryPath);
    
    const self = this;
    const configurator = new Configurator(this.adxDirectoryPath);
    if (options.logger) {
        this.logger = options.logger;
    }
    if (options.printMode) {
        this.printMode = options.printMode || 'default';
    }
    const config = {
        logger 		: this.logger,
        printMode 	: this.printMode
    };

    this.builder.build(config, (err) => {
        if (err) {
            self.writeError(errMsg.publishFailed, platform);
            callback(err);
            return;
        }

        configurator.load((err) => {
            if (err) {
                self.writeError(err.message);
                callback(err);
                return;
            }
            preferences.read( {silent: true}, (prefs) => {
                const SubPublisher = exports.platforms[platform]['Publisher' + platform];
                const subPublisher = new SubPublisher(configurator, prefs, options);
                subPublisher.publish((err) => {
                    if (!options.silent) {
                        if (err) {
                            self.writeError(err.message);
                            self.writeError(errMsg.publishFailed, platform);
                        } else {
                            self.writeSuccess(successMsg.publishSucceed, platform);
                        }
                    }
                    callback(err);
                });
            });
        });
    }); 
};


// MAke it public
exports.Publisher = Publisher;


/*
 * Show an ADX output
 *
 * @param {Command} program Commander object which hold the arguments pass to the program
 * @param {String} platform Platform where to publish
 * @param {String} adxDirectoryPath Path of the ADX to directory
 * @ignore
 */
exports.publish = function publish(program, platform, adxDirectoryPath) {
    const publisher = new Publisher(adxDirectoryPath);
    publisher.publish(platform, program);
    /*var options = {};
    if ('promoted' in program) {
        options.promoted = true;
    }
    options.comments_disabled = !('enableComments' in program);
    if ('sectionTitle' in program) {
        options.section_title = program.sectionTitle;
    }
    if ('username' in program) {
        options.username = program.username;
    }
    if ('remoteUri' in program) {
        options.remoteUri = program.remoteUri;
    }
    if ('pwd' in program) {
        options.password = program.pwd;
    }
    if ('surveyDemoUrl' in program) {
        options.surveyDemoUrl = program.surveyDemoUrl;
    }*/
};
