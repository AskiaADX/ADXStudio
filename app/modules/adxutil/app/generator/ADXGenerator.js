"use strict";

const fs          = require('fs');
const format      = require('util').format;
const pathHelper  = require('path');
const common      = require('../common/common.js');
const preferences = require('../preferences/ADXPreferences.js');
const ncp         = require('ncp').ncp;
const uuid        = require('uuid');
const errMsg      = common.messages.error;
const successMsg  = common.messages.success;


/**
 * Generate the file structure of an ADX using a template
 *
 * @class Generator
 * @private
 */
function Generator() {
    /**
     * Root dir of the current ADXUtil
     *
     * @name Generator#rootdir
     * @type {String}
     */
    this.rootdir = pathHelper.resolve(__dirname, "../../");

    /**
     * Type of the ADX
     *
     * @name Generator#adxType
     * @type {String|"adc"|"adp"}
     */
    this.adxType = '';

    /**
     * Name of the ADX
     *
     * @name Generator#adxName
     * @type {string}
     */
    this.adxName = '';

    /**
     * Description of the ADX
     *
     * @name Generator#adxDescription
     * @type {string}
     */
    this.adxDescription = '';

    /**
     * Author
     *
     * @name Generator#adxAuthor
     * @type {Object}
     */
    this.adxAuthor = {
        /**
         * Name of the author
         *
         * @name Generator#adxAuthor.name
         * @type {String}
         */
        name : '',
        /**
         * Email address of the author
         *
         * @name Generator#adxAuthor.email
         * @type {String}
         */
        email : '',
        /**
         * Company name of the author
         *
         * @name Generator#adxAuthor.company
         * @type {String}
         */
        company : '',
        /**
         * Web site of the author
         *
         * @name Generator#adxAuthor.website
         * @type {String}
         */
        website : ''
    };


    /**
     * Path of the template directory
     *
     * @name Generator#templateSrc
     * @type {string}
     */
    this.templateSrc = '';

    /**
     * Output directory
     *
     * @name Generator#outputDirectory
     * @type {string}
     */
    this.outputDirectory = '';

    /**
     * Name of the template to use
     *
     * @name Generator#template
     * @type {string}
     */
    this.template = common.DEFAULT_TEMPLATE_NAME;

    /**
     * Sequence of calls
     *
     * @name Generator#sequence
     * @type {Sequence}
     */
    this.sequence = new common.Sequence([
        this.verifyOutputDirExist,
        this.verifyADXDirNotAlreadyExist,
        this.copyFromTemplate,
        this.updateFiles
    ], this.done, this);

}

/**
 * Create a new instance of ADX Generator
 *
 * @ignore
 */
Generator.prototype.constructor = Generator;

/**
 * Write an error output in the console
 * @param {String} text Text to write in the console
 */
Generator.prototype.writeError = function writeError(text) {
    common.writeError.apply(common, arguments);
};

/**
 * Write a warning output in the console
 * @param {String} text Text to write in the console
 */
Generator.prototype.writeWarning = function writeWarning(text) {
    common.writeWarning.apply(common, arguments);
};

/**
 * Write a success output in the console
 * @param {String} text Text to write in the console
 */
Generator.prototype.writeSuccess = function writeSuccess(text) {
    common.writeSuccess.apply(common, arguments);
};

/**
 * Write an arbitrary message in the console without specific prefix
 * @param {String} text Text to write in the console
 */
Generator.prototype.writeMessage = function writeMessage(text) {
    common.writeMessage.apply(common, arguments);
};


/**
 * Generate a new ADX structure
 *
 * @param {"adc"|"adp"} type Type of the ADX project
 * @param {String} name Name of the ADX project to generate
 * @param {Object} [options] Options
 * @param {String} [options.output=process.cwd()] Path of the output director
 * @param {String} [options.description=''] Description of the ADX
 * @param {Object} [options.author] Author of the ADX
 * @param {String} [options.author.name=''] Author name
 * @param {String} [options.author.email=''] Author email
 * @param {String} [options.author.company=''] Author Company
 * @param {String} [options.author.website=''] Author web site
 * @param {String} [options.template="blank"] Name of the template to use
 * @param {Function} [callback]
 * @param {Error} [callback.err] Error
 * @param {String} [callback.outputDirectory] Path of the output directory
 */
Generator.prototype.generate = function generate(type, name, options, callback) {
    // Swap the options & callback
    if (typeof  options === 'function') {
        callback = options;
        options  = null;
    }

    this.generateCallback = callback;

    if (!type) {
        this.done(new Error(errMsg.missingTypeArgument));
        return;
    }
    if (type !== 'adc' && type !== 'adp') {
        this.done(new Error(errMsg.incorrectADXType));
        return;
    }

    if (!name) {
        this.done(new Error(errMsg.missingNameArgument));
        return;
    }

    if (!/^([a-z0-9_ .-]+)$/gi.test(name)) {
        this.done(new Error(errMsg.incorrectADXName));
        return;
    }

    this.outputDirectory = (options && options.output) || process.cwd();
    if (!this.outputDirectory) {
        this.done(new Error(errMsg.missingOutputArgument));
        return;
    }

    const self = this;
    preferences.read({silent : true}, (prefs) => {
        const prefAuthor = (prefs && prefs.author) || {};

        self.adxName = name;
        self.adxType = type;
        self.adxDescription = (options && options.description) || '';
        self.adxAuthor = (options && options.author) || {};
        self.adxAuthor.name = self.adxAuthor.name || prefAuthor.name || '';
        self.adxAuthor.email = self.adxAuthor.email || prefAuthor.email || '';
        self.adxAuthor.company = self.adxAuthor.company || prefAuthor.company || '';
        self.adxAuthor.website = self.adxAuthor.website || prefAuthor.website || '';

        self.template = (options && options.template) || common.DEFAULT_TEMPLATE_NAME;
        self.templateSrc = pathHelper.join(self.rootdir, common.TEMPLATES_PATH, self.template);

        common.getTemplatePath(self.adxType, self.template, (err, src) => {
            if (err) {
                return self.done(err);
            }
            self.templateSrc = src;
            return self.sequence.resume();
        });
    });
};

/**
 * End of the sequence chain
 * @param {Error} err Error
 */
Generator.prototype.done = function done(err) {
    if (err) {
        this.writeError(err.message);
        if (typeof this.generateCallback === 'function') {
            this.generateCallback(err, this.outputDirectory);
        }
        return;
    }
    const self = this;
    common.getDirStructure(self.outputDirectory, (err, structure) => {
        if (err) {
            self.writeError(err.message);
            if (typeof self.generateCallback === 'function') {
                self.generateCallback(err, self.outputDirectory);
            }
            return;
        }
        let   level = 0;
        const s     = [];

        function indent(text) {
            let str = '|--';
            for (let i = 0; i < level; i++) {
                str += '|--';
            }
            str += ' ' + text;
            return str;
        }

        structure.forEach(function write(o) {
            if (typeof o === 'string') {
                s.push(indent(o));
            } else {
                s.push(indent(o.name) + '\\');
                level++;
                if (o.sub) {
                    o.sub.forEach(write);
                }
                level--;
            }
        });

        const result  = s.join('\r\n');
        self.writeSuccess(successMsg.adxStructureGenerated, result, self.adxName, self.outputDirectory);

        if (typeof self.generateCallback === 'function') {
            self.generateCallback(err, self.outputDirectory);
        }
    });
};


/**
 * Verify that the output directory
 */
Generator.prototype.verifyOutputDirExist = function verifyOutputDirExist() {
    // Validate the existence of the specify the output directory
    const self = this;
    common.dirExists(self.outputDirectory, (err, exists) => {
        if (!exists || err) {
            return self.sequence.resume(new Error(format(errMsg.noSuchFileOrDirectory, self.outputDirectory)));
        }
        self.outputDirectory = pathHelper.join(self.outputDirectory, self.adxName);
        return self.sequence.resume();
    });
};

/**
 * Verify that the ADX directory doesn't exist
 */
Generator.prototype.verifyADXDirNotAlreadyExist = function verifyADXDirNotAlreadyExist() {
    const self = this;
    common.dirExists(self.outputDirectory, (err, exists) => {
        if (exists && !err) {
            return self.sequence.resume(new Error(format(errMsg.directoryAlreadyExist, self.outputDirectory)));
        }
        return self.sequence.resume();
    });
};

/**
 * Copy an ADC structure from the template
 */
Generator.prototype.copyFromTemplate =  function copyFromTemplate() {
    const self = this;
    ncp(self.templateSrc, self.outputDirectory, (err) => {
        self.sequence.resume(err);
    });
};

/**
 * Update the config.xml and the readme files with the name of the ADC, the GUID and the creation date
 */
Generator.prototype.updateFiles = function updateFiles() {
    const self  = this,
        files  = [
            pathHelper.join(self.outputDirectory, common.CONFIG_FILE_NAME),
            pathHelper.join(self.outputDirectory, common.README_FILE_NAME)
        ];
    let treat = 0;
    files.forEach((file) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                treat++;
                self.sequence.resume(err);
                return;
            }

            const result = common.evalTemplate(data, {
                info : {
                    name : self.adxName ,
                    type :	 self.adxType, 
                    description : self.adxDescription,
                    author : self.adxAuthor.name,
                    email : self.adxAuthor.email,
                    company : self.adxAuthor.company,
                    site : self.adxAuthor.website
                }
            });

            fs.writeFile(file, result, function writeFileCallback(err) {
                treat++;
                if (treat === files.length) {
                    return self.sequence.resume(err);
                }
            });
        });
    });
};

// Make it public
exports.Generator = Generator;

/**
 * Generate a new ADC structure
 *
 * @param {Command} program Commander object which hold the arguments pass to the program
 * @param {"adc"|"adp"} type Type of the ADX project
 * @param {String} name Name of the ADC to generate
 * @ignore
 */
exports.generate = function generate(program, type, name) {
    const generator = new Generator();
    generator.generate(type, name, program);
};