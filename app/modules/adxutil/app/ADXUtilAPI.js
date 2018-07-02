"use strict";

const fs                    = require('fs');
const path                  = require('path');
const ncp                   = require('ncp').ncp; // copy recursive
const common                = require('./common/common.js');
const errMsg                = common.messages.error;
const Validator             = require('./validator/ADXValidator.js').Validator;
const Builder               = require('./builder/ADXBuilder.js').Builder;
const Publisher             = require('./publisher/ADXPublisher.js').Publisher;
const Show                  = require('./show/ADXShow.js').Show;
const Import                  = require('./import/ADXImport.js').Import;
const Generator             = require('./generator/ADXGenerator.js').Generator;
const Configurator          = require('./configurator/ADXConfigurator.js').Configurator;
const InteractiveADXShell   = require('./common/InteractiveADXShell.js').InteractiveADXShell;
const InterviewsFactory     = require('./interviews/ADXInterviews.js').InterviewsFactory;
const preferences           = require('./preferences/ADXPreferences.js').preferences;

/**
 * Object used to generate, validate, show and build an ADX
 *
 *
 * Example of usage of existing ADX
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Validate an ADX
 *      const validationConfig = {
 *          test : false,
 *          autoTest : false
 *      };
 *
 *      myAdx.validate(validationConfig, (err, report) => {
 *          // Callback when the ADX structure has been validated
 *      });
 *
 *
 *      // Show the output of an ADX
 *      const showConfig = {
 *          output : 'fallback',
 *          fixture : 'single.xml'
 *      };
 *
 *      myAdx.show(showConfig, (err, output) => {
 *          // Callback with the output of the ADX
 *      });
 *
 *      // Build the ADX (package it)
 *      const buildConfig = {
 *          test : false,
 *          autoTest : false
 *      };
 *
 *      myAdx.build(buildConfig, (err, path, report) => {
 *          // Callback when the ADX has been built
 *      });
 *
 * Generate and use the new ADX instance
 *
 *
 *      const config = {
 *          output : '/path/of/parent/dir',
 *          template : 'blank'
 *      };
 *
 *      ADX.generate('adc', 'myNewADC', config, (err, adc) => {
 *          console.log(adc.path);
 *          adc.load((err) =>{
 *              if (err) {
 *                  console.log(err);
 *                  return;
 *              }
 *              console.log(adc.configurator.info.get());
 *          });
 *      });
 *
 *
 * @class ADX
 * @param {String} adxDirPath Path of the ADX directory
 */
function ADX(adxDirPath) {
    if (!adxDirPath) {
        throw new Error(errMsg.invalidPathArg);
    }

    // Let it throw an exception
    fs.statSync(adxDirPath);

    /**
     * Path to the ADX directory
     *
     * @name ADX#path
     * @type {string}
     */
    this.path = path.normalize(adxDirPath);

    /**
     * Configurator of the ADX
     * Expose the object to manipulate the config.xml
     *
     * @name ADX#configurator
     * @type {Configurator}
     */
    this.configurator = null;

    /**
     * Interactive ADX Shell
     *
     * @name ADX#_adxShell
     * @type {InteractiveADXShell}
     * @private
     */
    this._adxShell = new InteractiveADXShell(this.path);

    /**
     * Factory of interviews
     *
     * @name ADX#interviews
     * @type {InterviewsFactory}
     */
    this.interviews = new InterviewsFactory(this.path);
}

/**
 * Create a new instance of ADX object
 * @ignore
 */
ADX.prototype.constructor = ADX;

/**
 * Load the config of the current ADX instance
 *
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Load an ADX
 *      myAdx.load((err) => {
 *          // Callback when the ADX has been loaded
 *      });
 *
 * @param {Function} [callback] Callback function
 * @param {Error} [callback.err] Error
 */
ADX.prototype.load = function load(callback) {
    const configurator = new Configurator(this.path),
          self         = this;
    callback = callback || function () {};
    configurator.load((err) => {
        if (err) {
            callback(err);
            return;
        }
        self.configurator = configurator;
        callback(null);
    });
};

/**
 * Validate the current ADX instance
 *
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Validate an ADX
 *      const config = {
 *          test : false,
 *          autoTest : false
 *      };
 *
 *      myAdx.validate(config, (err, report) => {
 *          // Callback when the ADX structure has been validated
 *      });
 *
 * @param {Object} [options] Options of validation
 * @param {String|'default'|'html'} [options.printMode='default'] Print mode (default console or html)
 * @param {Boolean} [options.test=true] Run unit tests
 * @param {Boolean} [options.autoTest=true] Run auto unit tests
 * @param {Boolean} [options.xml=true] Validate the config.xml file
 * @param {Object} [options.logger] Logger
 * @param {Function} [options.writeMessage] Function where regular messages will be print
 * @param {Function} [options.writeSuccess] Function where success messages will be print
 * @param {Function} [options.writeWarning] Function where warning messages will be print
 * @param {Function} [options.writeError] Function where error messages will be print
 * @param {Function} [callback] Callback function
 * @param {Error} [callback.err] Error
 * @param {Object} [callback.report] Validation report
 */
ADX.prototype.validate = function validate(options, callback) {
    const validator = new Validator(this.path);
    options = options || {};
    options.adxShell = this._adxShell;
    validator.validate(options, callback);
};

/**
 * Build the ADX
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Build the ADX (package it)
 *      const config = {
 *          test : false,
 *          autoTest : false
 *      };
 *
 *      myAdx.build(config, (err, path, report) => {
 *          // Callback when the ADX has been built
 *      });
 *
 * @param {Object} [options] Options of validation
 * @param {String|'default'|'html'} [options.printMode='default'] Print mode (default console or html)
 * @param {Boolean} [options.test=true] Run unit tests
 * @param {Boolean} [options.autoTest=true] Run auto unit tests
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
ADX.prototype.build = function build(options, callback){
    const builder = new Builder(this.path);
    options = options || {};
    options.adxShell = this._adxShell;
    builder.build(options, callback);
};


/**
 * Publish to publisher
 *
 *		const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Publish the ADC
 *      const config = {
 *          username : "MyUserName",
 *          password : "secret",
 *          url : "https://...",
 *          demoUrl : "https://..."
 *      };
 *
 *      myAdx.publish(platform, config, (err) => {
 *          // Callback when the ADC has been published
 *      });
 *
 * @param {String} platform Name of the platform to push
 * @param {Object} options Options of the platform
 * @param {Boolean} [options.silent=false] By pass the output
 * @param {Function} callback
 * @param {Error} [callback.err=null]
 */
ADX.prototype.publish = function publish(platform, options, callback){
    const publisher = new Publisher(this.path);
    options = options || {};
    options.adxShell = this._adxShell;
    publisher.publish(platform, options, callback);
};

/**
 * Show the ADX output
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Show the output of an ADX
 *      const config = {
 *          output : 'fallback',
 *          fixture : 'single.xml'
 *      };
 *
 *      myAdx.show(config, (err, output) => {
 *          // Callback with the output of the ADX
 *      });
 *
 * @param {Object} options Options
 * @param {String} options.output Name of the ADX Output to use
 * @param {String} options.fixture FileName of the ADX fixture to use
 * @param {String} [options.masterPage] Path of the master page to use (ADC Only)
 * @param {String} [options.properties] ADX properties (in url query string format: 'param1=value1&param2-value2')
 * @param {String} [options.themes] ADX theme properties (in url query string format: 'param1=value1&param2-value2')
 * @param {Boolean} [options.silent=false] Silent mode: Don't message in the console but only through the callback
 * @param {Function} callback Callback function
 * @param {Error} callback.err Error
 * @param {String} callback.output Output string
 */
ADX.prototype.show = function show(options, callback) {
    const show = new Show(this.path);
    options = options || {};
    options.adxShell = this._adxShell;
    show.show(options, callback);
};

/**
 * Import an akia xml
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Show the output of an ADX
 *      const config = {
 *          sourcePath : '\\adx\\file.xml',
 *          targetName : 'fixture.xml',
 *          currentQuestion : 'something'
 *      };
 *
 *      myAdx.import(config, (err, output) => {
 *          // Callback with the output of the ADX
 *      });
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
ADX.prototype.adxImport = function adxImport(options, callback) {
    const adximp = new Import(this.path);
    options = options || {};
    options.adxShell = this._adxShell;
    adximp.adxImport(options, callback);
};

/**
 * Returns the list of xml files within a directory
 *
 * @param {String} directory Path of the directory to browse
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {String[]} callback.list List of fixtures
 * @ignore
 */
function getXmlListFiles(directory, callback) {
    fs.readdir(directory,  (err, files) => {
        if (err) {
            callback(err, null);
            return;
        }
        const results = [];
        for (let i = 0, l  = files.length; i < l; i += 1) {
            if (/\.xml$/.test(files[i])) {
                results.push(files[i]);
            }
        }
        callback(null, results);
    });
}

/**
 * Returns the list of fixtures
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // List all fixtures on the ADX
 *      myAdx.getFixtureList((err, list) => {
 *          console.log(list[0]); // -> "Single.xml"
 *      });
 *
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {String[]} callback.list List of fixtures
 */
ADX.prototype.getFixtureList = function getFixtureList(callback) {
    const fixturePath = path.join(this.path, common.FIXTIRES_DIR_PATH);
    getXmlListFiles(fixturePath, callback);
};

/**
 * Returns the list of emulations
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // List all emulations on the ADX
 *      myAdx.getEmulationList((err, list) => {
 *          console.log(list[0]); // -> "Javascript_Enable.xml"
 *      });
 *
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {String[]} callback.list List of emulations
 */
ADX.prototype.getEmulationList = function getEmulationList(callback) {
    const emulationPath = path.join(this.path, common.EMULATIONS_DIR_PATH);
    getXmlListFiles(emulationPath, callback);
};

/**
 * Verify if the `fixtures`, `emulations`, `controls` or `pages` exist and create it if it doesn't.
 *
 *      const ADX = require('adxutil').ADX;
 *      const myAdx = new ADX('path/to/adx/dir');
 *
 *      // Check the `tests` directory
 *      myAdx.checkTestsDirectory((err) => {
 *          if (err) {
 *              console.warn(err);
 *          }
 *      });
 *
 * @param {Function} callback Callback when the operation is complete
 * @param {Error} callback.err Error that occurred during the operation
 */
ADX.prototype.checkTestsDirectory = function checkTestsDirectory(callback) {
    const self = this;
    let projectType = null;

    function checkDirectory(relPath, cb) {
        const fullPath = path.join(self.path, relPath);
        common.dirExists(fullPath, (err, isExist) => {
            if (isExist) {
                cb();
                return;
            }
            const targetPath =  path.join(fullPath, '../');
            const sourcePath = path.join(
                path.resolve(__dirname, "../"),
                common.TEMPLATES_PATH, projectType,
                common.DEFAULT_TEMPLATE_NAME,
                relPath
            );

            fs.mkdir(targetPath, () => {
                ncp(sourcePath, fullPath, cb);
            });
        });
    }

    function check(loadErr) {
        if (loadErr) {
            if (typeof callback === 'function') {
                callback(loadErr);
            }
            return;
        }
        projectType = self.configurator.projectType;
        if (projectType !== 'adc' && projectType !== 'adp') {
            if (typeof callback === 'function') {
                callback(new Error(errMsg.incorrectADXType));
            }
            return;
        }

        let callEnd = 3; // 3 calls
        function onCheckDirectory(){
            callEnd--;
            if (callEnd) return;
            if (typeof callback === 'function') {
                callback(null);
            }
        }

        // Check the fixtures directory
        checkDirectory(common.FIXTIRES_DIR_PATH, onCheckDirectory);

        // Check the emulations directory
        checkDirectory(common.EMULATIONS_DIR_PATH, onCheckDirectory);

        // Check the controls or pages directory
        checkDirectory(projectType === 'adp' ?
            common.CONTROLS_DIR_PATH : common.PAGES_DIR_PATH, onCheckDirectory);
    }

    // If the adx was not loaded, load it now
    if (!this.configurator) {
        this.load(check);
    } else {
        check(null);
    }
};


/**
 * Release all resources
 */
ADX.prototype.destroy = function destroy() {
    this._adxShell.destroy();
    this.interviews.clear();
};

/**
 * Generate a new ADX structure
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      // Generate the ADC structure in '/path/of/parent/dir/myNewADC'
 *      const config = {
 *          output : '/path/of/parent/dir',
 *          template : 'blank'
 *      };
 *      ADX.generate('adc', 'myNewADC', config, (err, adc) => {
 *          console.log(adc.path);
 *      });
 *
 *      // Generate the ADP structure in '/path/of/parent/dir/myMewADP'
 *      const config = {
 *          output : '/path/of/parent/dir',
 *          template : 'blank'
 *      };
 *      ADX.generate('adp', 'myNewADP', config, (err, adp) => {
 *          console.log(adp.path);
 *      });
 *
 * @param {'adc'|'adp'} type Type of the ADX ('adc' or 'adp')
 * @param {String} name Name of the ADX to generate
 * @param {Object} [options] Options
 * @param {String} [options.description=''] Description of the ADX
 * @param {Object} [options.author] Author of the ADX
 * @param {String} [options.author.name=''] Author name
 * @param {String} [options.author.email=''] Author email
 * @param {String} [options.author.company=''] Author Company
 * @param {String} [options.author.website=''] Author web site
 * @param {String} [options.output=process.cwd()] Path of the output director
 * @param {String} [options.template="blank"] Name of the template to use
 * @param {Function} [callback]
 * @param {Error} [callback.err] Error
 * @param {ADX} [callback.adx] Instance of the new generated ADX
 * @static
 */
ADX.generate = function generate(type, name, options, callback) {
    const generator = new Generator();
    // Swap the options
    if (typeof  options === 'function') {
        callback = options;
        options  = null;
    }
    callback = callback || function () {};

    generator.generate(type, name, options, (err, outputPath) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, new ADX(outputPath));
    });
};

/**
 * Returns the list of templates directory
 *
 *      const ADX = require('adxutil').ADX;
 *
 *      // Get the list of the ADC templates
 *      ADX.getTemplateList('adc', (err, dirs) => {
 *          console.log(dirs[0].name); // -> "blank"
 *      });
 *
 *
 *      // Get the list of the ADP templates
 *      ADX.getTemplateList('adp', (err, dirs) => {
 *          console.log(dirs[0].name); // -> "blank"
 *      });
 *
 * @param {"adc"|"adp"} type Type of the template list to obtain (`adc` or `adp`)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Object[]} callback.dirs List of template
 * @param {String} callback.dirs[].name Name of the template
 * @param {String} callback.dirs[].path Path of the template directory
 * @static
 */
ADX.getTemplateList = function getTemplateList(type, callback) {
    common.getTemplateList(type, callback);
};

/**
 * Instance of the object to manage the preferences
 *
 * @type {Preferences}
 * @static
 */
ADX.preferences = preferences;


// Make it public
exports.ADX = ADX;
exports.Configurator = Configurator;
exports.InteractiveADXShell = InteractiveADXShell;
