"use strict";

const fs          = require('fs');
const pathHelper  = require('path');
const util        = require('util');
const clc         = require('cli-color');
const Zip         = require('jszip');
const uuid        = require('uuid');

// Application name
exports.APP_NAME = 'ADXUtil';

// Preferences
exports.PREFERENCES_FILE_NAME = 'preferences.json';

// Common
// File name of the config.xml
exports.CONFIG_FILE_NAME = 'config.xml';
// File name of the readme.md
exports.README_FILE_NAME = 'readme.md';
// Path of the unit tests directory
exports.UNIT_TEST_DIR_PATH = "tests/units";
// Path of the `fixtures` directory
exports.FIXTIRES_DIR_PATH = "tests/fixtures";
// Path of the `emulations` directory
exports.EMULATIONS_DIR_PATH = "tests/emulations";
// Path of the `controls` directory
exports.CONTROLS_DIR_PATH = "tests/controls";
// Path of the `pages` directory
exports.PAGES_DIR_PATH = "tests/pages";

// Validator
//  Path to the XML Lint program
exports.XML_LINT_PATH = '/lib/libxml/xmllint.exe';
// Path to the XSD schema file to validate the ADX config.xml
exports.SCHEMA_PATH = '/schema/';
// Name of the schema to validate the ADC config file
exports.SCHEMA_ADC = 'ADCSchema.xsd';
// Name of the schema to validate the ADC config file
exports.SCHEMA_ADP = 'ADPSchema.xsd';
// Name of the schema to validate the unit test file
exports.SCHEMA_TEST_UNIT = 'UnitTests.xsd';
// Path to the directory of the ADXShell program
exports.ADX_UNIT_DIR_PATH = '/lib/adxshell/';
// ADCUnit.exe
exports.ADX_UNIT_PROCESS_NAME = 'ADXShell.exe';
// Name of the `resources` directory
exports.RESOURCES_DIR_NAME = "resources";
// Name of the directory `dynamic`
exports.DYNAMIC_DIR_NAME = "dynamic";
// Name of the directory `static`
exports.STATIC_DIR_NAME = "static";
// Name of the directory `share`
exports.SHARE_DIR_NAME = "share";

// File name which contains the list of files to ignore
exports.ADX_IGNORE_FILE_NAME = "ADXIgnore";
// Ignore file list
exports.adxIgnoreFiles = "";
// Rules to ignore files
exports.adxIgnoreFilesRules = undefined;

// Generator
// Path of the templates directory
exports.TEMPLATES_PATH = '/templates/';
exports.DEFAULT_TEMPLATE_NAME = 'blank';


// Builder
// Path to the bin directory of an ADX
exports.ADX_BIN_PATH = '/bin/';


// Error messages
exports.messages = {
    error: {
        // Common
        noSuchFileOrDirectory: "No such file or directory `%s`",
        missingPropertiesArg: "Missing `properties` argument",

        // Validator
        missingArgPath: "Missing `path` argument",
        noConfigFile: "Cannot find the `Config.xml` file in the directory",
        fileExtensionForbidden: "File extension `%s` is forbidden",
        duplicateConstraints: "Duplicate constraints on `%s`",
        invalidConstraintAttribute: "The constraint on `%s` doesn't accept the `%s` attribute",
        noRuleOnConstraint: "The constraint on `%s` require at least one rule",
        requireConstraintOn: "A constraint on `%s` is required",
        tooManyEmptyCondition: "Too many outputs with empty condition: %s",
        noResourcesDirectory: "Cannot find the `resources` directory",
        dynamicFileRequire: "At least one dynamic file is required for the `%s` output, or set the attribute `defaultGeneration=true` in the output node",
        cannotFindDirectory: "Cannot find the `%s` directory",
        cannotFindFileInDirectory: "Output: `%s`. Cannot find the file `%s` in the `%s` directory",
        typeCouldNotBeDynamic: "Output: `%s`. Type `%s` could not be dynamic (`%s`)",
        attributeNotOverridable: "Output: `%s`. Attribute `%s` of the `%s` content could not be override",
        yieldRequireForBinary: "Output: `%s`. `yield` node required for the binary content `%s` or set his position to `none`",
        duplicateAttributeNode: "Output: `%s`. Duplicate `%s` attribute node in content `%s`",
        missingInfoNode: "The config.xml must contains the `info` node as a child of the xml root element",
        missingOrEmptyNameNode: "The node `name` in `info` doesn't exist or is empty",
        missingOrEmptyMasterPageAttr: "Output: `%s`. The `masterPage` attribute doesn't exist or is empty",
        masterPageRequireAskiaHeadTag: "The master page `%s` doesn't contains the `askia-head`  tag",
        masterPageRequireOnlyOneAskiaHeadTag: "The master page `%s` contains more than one `askia-head` tag",
        masterPageRequireAskiaFootTag: "The master page `%s` doesn't contains the `askia-foot`  tag",
        masterPageRequireOnlyOneAskiaFootTag: "The master page `%s` contains more than one `askia-foot` tag",
        masterPageRequireAskiaFormTag: "The master page `%s` doesn't contains the `askia-form` tag",
        masterPageRequireOnlyOneAskiaFormTag: "The master page `%s` contains more than one `askia-form` tag`",
        masterPageRequireAskiaFormCloseTag: "In the master page `%s` the `askia-form` tag is not close",
        masterPageRequireOnlyOneAskiaFormCloseTag: "In the master page `%s` the `askia-form` tag seems closed twice`",
        masterPageRequireAskiaQuestionsTag: "The master page `%s` doesn't contains the `askia-questions` tag",
        masterPageRequireOnlyOneAskiaQuestionsTag: "The master page `%s` contains more than one `askia-questions` tag`",
        masterPageRequireAskiaQuestionsTagInsideAskiaFormTag: "In the master page `%s` the `askia-questions` tag seems not inside the `askia-form` tag",

        // Generator
        missingTypeArgument: "The `type` parameter is required",
        incorrectADXType: "Incorrect ADX type. Expected `adc` or `adp`.",
        missingNameArgument: "The `name` parameter is required",
        missingOutputArgument: "The --output path is required",
        directoryAlreadyExist: "The directory `%s` already exists.",
        incorrectADXName: "Incorrect ADX name. The name of the ADX should only contains letters, digits, spaces, `_,-,.` characters",
        cannotFoundTemplate: "Cannot found the `%s` template",

        // Builder
        validationFailed: "Validation failed",
        buildFailed: "Build failed with errors.",

        // Show
        noOutputDefinedForShow: "Please specify the name of the output you want to show, using the option -o or --output.",
        noFixtureDefinedForShow: "Please specify the name of the fixture you want to use, using the option -f or --fixture.",

        // Import
        noXMLPathDefinedForImport: "Please specify the path of the xml file you want to import, using the option --sourcePath.",
        noFileDefinedForImport: "Please specify the path of the name of the fixture you want to create, using the option --targetName.",
        noQuestionDefinedForImport: "Please specify the path of the question you want to import, using the option --currentQuestion.",

        // Configurator
        invalidPathArg: "Invalid `path` argument",
        invalidConfigFile: "Invalid `config.xml` file",

        // Publish
        invalidPlatformArg: "Invalid `platform` argument",
        missingPlatformArg: "Missing `platform` argument",
        invalidConfiguratorArg: "Invalid `configurator` argument",
        invalidOptionsArg: "Invalid `options` argument",
        invalidSectionArg: "Invalid `title` argument",
        missingSectionArg: "Missing `title` arg",
        nonExistingSection: "Non-existing section. Please check the section title or your logins",
        missingConfiguratorArg: "Missing `configurator` argument",
        badNumberOfADXFiles: "The number of .adx files is incorrect",
        tooManyArticlesExisting: "Error when updating or creating this article : There are already at least two instances of this article on ZenDesk (Check in draft mode if you don't see them in help_center mode)",
        missingPublishArgs: "Arguments are missing. Check the arguments in command line or your personal preferences file",
        publishFailed   : "Publish on %s failed with errors."
    },
    warning: {
        // Validator
        untrustExtension: "Un-trust extension of the file `%s`",
        duplicateOutputCondition: "Duplicate conditions in outputs `%s` and `%s`",
        attributeNodeWillBeIgnored: "Output: `%s`. `attribute` nodes will be ignored for the `%s` content (`%s`)",
        attributeNodeAndDynamicContent: "Output: `%s`. `attribute` nodes will be ignored for dynamic content (`%s`)",
        attributeNodeAndYieldNode: "Output: `%s`. `attribute` nodes will be ignored when using `yield` (`%s`)",
        javascriptUseWithoutBrowserCheck: "Output: `%s`. It's recommended to test the `Browser.Support(\"Javascript\") in the condition node, before to use `javascript` content.",
        flashUseWithoutBrowserCheck: "Output: `%s`. It's recommended to test the `Browser.Support(\"Flash\") in the condition node, before to use `flash` content.",
        noHTMLFallBack: "It's recommended to have at least one fallback with HTML only",
        noProperties: "It's recommended to define at least one properties",
        deprecatedInfoStyleTag: "[Deprecated]: The `info > style` tag is mark as deprecated in 2.1.0, it will not longer be supported in the next ADX version.\r\nPlease avoid it's usage",
        deprecatedInfoCategoriesTag: "[Deprecated]: The `info > categories` tag is mark as deprecated in 2.1.0, it will not longer be supported in the next ADX version.\r\nPlease avoid it's usage",
        deprecatedDefaultGenerationAttr: "[Deprecated]: The `output > defaultGeneration` attribute is mark as deprecated in 2.1.0, it will not longer be supported in the next ADX version.\r\nPlease avoid it's usage"
    },
    success: {
        // Validator
        pathValidate: "ADX path validation done",
        directoryStructureValidate: "ADX directory structure validation done",
        fileExtensionValidate: "File extension validation done",
        xsdValidate: "XSD validation done",
        xmlInitialize: "Config.xml parsing done",
        xmlInfoValidate: "Config#info validation done",
        xmlInfoConstraintsValidate: "Config#info#constraints validation done",
        xmlOutputsValidate: "Config#outputs validation done",
        xmlPropertiesValidate: "Config#properties validation done",
        masterPageAskiaTagsValidate: "Master page with Askia tags validation done",
        adxUnitSucceed: "ADX Unit tests succeeded",

        // Generator
        adxStructureGenerated: "Project structure\r\n\r\n%s\r\n\r\nADX `%s` was successfully generated in `%s`\r\n",

        // Builder
        buildSucceed: "ADX file was successfully generated.\r\nOutput: file:///%s",
        buildSucceedWithWarning: "ADX file was successfully generated with %d warnings.\r\nOutput: file:///%s",

        // Publisher
        publishSucceed : "ADX file was successfully published on %s",
        zenDeskSectionFound : "The ZenDesk section as successfully found...",
        zenDeskArticleCreated : "The ZenDesk article successfully created...",
        zenDeskAttachmentsUploaded :"The ZenDesk attachments were successfully uploaded...",
        zenDeskTranslationUpdated :"The ZenDesk translation successfully updated...",
        zenDeskArticleUpdated   : "The ZenDesk article successfully updated..."
    },
    message: {
        // Validator
        runningADXUnit: 'Running ADX Unit tests',
        runningAutoUnit: 'Running the auto-generated ADX Unit tests',
        validationFinishedIn: "\r\nValidations finished in %d milliseconds",
        validationReport: "\r\n%d/%d validations runs, %d success, %d warnings, %d failures, %d skipped",

        // Preferences
        noPreferences: 'No preferences defined'
    }
};

//Publish

exports.ZENDESK_ADC_ARTICLE_TEMPLATE_PATH = exports.TEMPLATES_PATH + 'publish/zendesk/adc.html';
exports.ZENDESK_ADP_ARTICLE_TEMPLATE_PATH = exports.TEMPLATES_PATH + 'publish/zendesk/adp.html';
exports.QEX_PATH = '/example';


/**
 * Write an error output in the console
 *
 * @param {String} text Text to write in the console
 * @ignore
 */
exports.writeError = function writeError(text) {
    console.error(clc.red.bold("[ERROR]: " + text));
};

/**
 * Write a warning output in the console
 * @param {String} text Text to write in the console
 * @ignore
 */
exports.writeWarning = function writeWarning(text) {
    console.log(clc.yellowBright("[WARNING]: " + util.format.apply(null, arguments)));
};

/**
 * Write a success output in the console
 * @param {String} text Text to write in the console
 * @ignore
 */
exports.writeSuccess = function writeSuccess(text) {
    console.log(clc.greenBright("[SUCCESS]: " + util.format.apply(null, arguments)));
};

/**
 * Write an arbitrary message in the console without specific prefix
 * @param {String} text Text to write in the console
 * @ignore
 */
exports.writeMessage = function writeMessage(text) {
    console.log(util.format.apply(null, arguments));
};

/**
 * Return the environment variables for the child process execution
 * It mostly used to target the sys64/, sys32/ folders
 * @ignore
 */
exports.getChildProcessEnv = function getChildProcessEnv() {
    const root = pathHelper.resolve(__dirname, "../../");
    const arch = (process.arch === 'x64') ? '64' : '32';
    const adxShellSysPath = pathHelper.join(root, exports.ADX_UNIT_DIR_PATH, 'sys' + arch);

    let env = JSON.parse(JSON.stringify(process.env));
    env.Path = env.Path || '';
    env.Path += ';' + adxShellSysPath;

    return env;
};

/**
 * Get a new zip object
 * @ignore
 */
exports.getNewZip = function getNewZip() {
    return new Zip();
};

/**
 * Format the date for xml.
 * If no date in arg, use the current date
 * @param {Date} [date] Date to format
 * @ignore
 */
exports.formatXmlDate = function formatXmlDate(date) {
    (date = date || new Date());
    return padStr(date.getFullYear()) + '-' + padStr(1 + date.getMonth()) + '-' + padStr(date.getDate());
};

/**
 * Pad the number with one 0 when < 10
 * @param {Number} i Number to pad
 * @return {String}
 * @ignore
 */
function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

/**
 * Test if a directory exists
 * @param {String} path Path of the directory
 * @param {Function} callback Callback function with err, exists arguments
 * @ignore
 */
exports.dirExists = function dirExists(path, callback) {
    fs.stat(path, (err) => {
        // errno 2 -- ENOENT, No such file or directory
        if (err && err.errno === 2) {
            callback(null, false);
        } else {
            callback(err, err ? false : true);
        }
    });
};

/**
 * Indicates if the file should be ignore
 *
 * @param {String} filename Name of the file
 * @return {Boolean} True when should be ignored
 * @ignore
 */
exports.isIgnoreFile = function isIgnoreFile(filename) {
    if (!exports.adxIgnoreFiles) {
        exports.adxIgnoreFiles = fs.readFileSync(pathHelper.resolve(__dirname, "../" + exports.ADX_IGNORE_FILE_NAME), 'utf8');
    }

    // Export the rules
    if (!exports.adxIgnoreFilesRules) {
        const lines = exports.adxIgnoreFiles.split('\n');
        const rgExp = [];
        lines.forEach((line) => {
            line = line.replace(/(#.*)/g, '');
            line = line.replace(/\s/g, '');
            line = line.replace(/\r/g, '');
            if (!line) return;
            line = line.replace(/\./g, "\\.");
            line = line.replace(/-/g, "\\-");
            line = line.replace(/\*/g, ".*");
            rgExp.push(line);
        });

        exports.adxIgnoreFilesRules = new RegExp("(" + rgExp.join("|") + ")$", "gi");
    }

    return exports.adxIgnoreFilesRules.test(filename);
};

/**
 * Return the entire directory structure
 *
 *  [
 *      {
 *          name : 'folder',
 *          sub  : [
 *              {
 *                  name : 'sub folder',
 *                  sub  : []
 *              },
 *              {
 *                  name : 'sub folder 2'
 *                  sub  : [
 *                      'file',
 *                      'file2'
 *                  ]
 *              }
 *          ]
 *      }
 * ]
 *
 * @param {String} path Path of the root directory
 * @param {Function} callback Callback function
 * @ignore
 */
exports.getDirStructure = function getDirStructure(path, callback) {
    fs.stat(path, (err, stat) => {
        if (err) {
            return callback(err);
        }
        if (!stat.isDirectory()) {
            return callback(new Error("path: " + path + " is not a directory"));
        }

        function record(root, file, struct, cb) {
            const fullPath = root + '/' + file;
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (err) {
                if (cb) cb();
                return;
            }

            if (!stat.isDirectory()) {
                struct.push(file);
            } else {
                struct.push({
                    name: file,
                    sub: []
                });

                // Recurse
                const files = fs.readdirSync(fullPath);
                const lastStruct = struct[struct.length - 1].sub;
                if (files && Array.isArray(files)) {
                    files.forEach((f) => {
                        record(fullPath, f, lastStruct);
                    });
                }
            }
            if (cb) cb();
        }

        // Read through all the files in this directory
        const structure = [];
        const files = fs.readdirSync(path);
        let treat = 0;
        const rootLength = files && files.length;

        if (!files || !Array.isArray(files) || !rootLength) {
            callback(null, structure);
        }

        function incrementTreat() {
            treat++;
            if (treat === rootLength) {
                callback(null, structure);
            }
        }
        files.forEach((file) => {
            record(path, file, structure, incrementTreat);
        });
    });
};

/**
 * Returns the list of templates directory
 *
 * It searches in the user data folder, the program data folder and the installation program folder
 *
 * @param {"adc"|"adp"} type Type of the template list to obtain (`adc` or `adp`)
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {Object[]} callback.dirs List of template
 * @param {String} callback.dirs[].name Name of the template
 * @param {String} callback.dirs[].path Path of the template directory
 * @ignore
 */
exports.getTemplateList = function getTemplateList(type, callback) {
    if (!type && typeof callback !== 'function') {
        throw new Error(exports.messages.error.missingTypeArgument);
    }

    if (typeof callback === 'function' && type !== 'adc' && type !== 'adp') {
        callback(new Error(exports.messages.error.incorrectADXType));
        return;
    }

    // 1. Get the templates from the application path
    // 2. Get the templates from the PROGRAM_DATA path
    // 3. Get the templates from the USER_DATA path
    const result = [];
    const map = {};

    function addFiles(parent, files) {
        for (let i = 0, l = files.length; i < l; i++) {
            let fullPath = pathHelper.join(parent, files[i]);
            let stat = fs.statSync(fullPath);
            let name, lowerName, dir;
            if (stat.isDirectory()) {
                name = pathHelper.basename(files[i]);
                lowerName = name.toLowerCase();
                dir = {
                    name: name,
                    path: fullPath
                };
                if (lowerName in map) {
                    result[map[lowerName]] = dir;
                } else {
                    map[lowerName] = result.length;
                    result.push(dir);
                }
            }
        }
    }

    // 1.
    let sysTemplatePath = pathHelper.resolve(__dirname, '../../');
    sysTemplatePath = pathHelper.join(sysTemplatePath, exports.TEMPLATES_PATH, type);
    fs.readdir(sysTemplatePath, (err, files) => {
        if (!err) {
            addFiles(sysTemplatePath, files);
        }

        // 2.
        let programDataPath = process.env.ALLUSERSPROFILE || process.env.ProgramData || '';
        programDataPath = pathHelper.join(programDataPath, exports.APP_NAME, exports.TEMPLATES_PATH, type);
        fs.readdir(programDataPath, (err, files) => {
            if (!err) {
                addFiles(programDataPath, files);
            }

            // 3.
            let userDataPath = process.env.APPDATA || '';
            userDataPath = pathHelper.join(userDataPath, exports.APP_NAME, exports.TEMPLATES_PATH, type);
            fs.readdir(userDataPath, (err, files) => {
                if (!err) {
                    addFiles(userDataPath, files);
                }

                callback(null, result);
            });
        });
    });
};

/**
 * Returns the path of the template according to his name
 *
 * It searches in the user data folder, the program data folder and the installation program folder
 *
 * @param {"adc"|"adp"} type Type of the template list to obtain (`adc` or `adp`)
 * @param {String} name Name of the template to search
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {String} callback.path Path of the template
 * @ignore
 */
exports.getTemplatePath = function getTemplatePath(type, name, callback) {
    if (!type && typeof callback !== 'function') {
        throw new Error(exports.messages.error.missingTypeArgument);
    }

    if (typeof name === 'function') {
        name(new Error(exports.messages.error.missingNameArgument));
        return;
    }

    if (typeof callback === 'function' && type !== 'adc' && type !== 'adp') {
        callback(new Error(exports.messages.error.incorrectADXType));
        return;
    }

    // 1. Search in the USER_DATA path
    // 2. Search in the PROGRAM_DATA path
    // 3. Search in the installation path

    // 1.
    let userDataPath = process.env.APPDATA || '';
    userDataPath = pathHelper.join(userDataPath, exports.APP_NAME, exports.TEMPLATES_PATH, type, name);
    exports.dirExists(userDataPath,  (err, exist) => {
        if (exist) {
            callback(null, userDataPath);
            return;
        }

        // 2.
        let programDataPath = process.env.ALLUSERSPROFILE || process.env.ProgramData || '';
        programDataPath = pathHelper.join(programDataPath, exports.APP_NAME, exports.TEMPLATES_PATH, type, name);
        exports.dirExists(programDataPath, (err, exist) => {
            if (exist) {
                callback(null, programDataPath);
                return;
            }

            // 3.
            let sysTemplatePath = pathHelper.resolve(__dirname, '../../');
            sysTemplatePath = pathHelper.join(sysTemplatePath, exports.TEMPLATES_PATH, type, name);
            exports.dirExists(sysTemplatePath,  (err, exist) => {
                if (exist) {
                    callback(null, sysTemplatePath);
                    return;
                }

                callback(new Error(util.format(exports.messages.error.cannotFoundTemplate, name)), null);
            });
        });
    });
};

/**
 * Transform the patterns of a string by their real values which are in a config
 * @param {String} input The text to be replaced
 * @param {Object} config The result of a call to method get of a configurator
 * @param {Array} additionalReplacements Additional replacement. Array of object with `pattern` key as regex and `replacement` key as string
 * @ignore
 */
exports.evalTemplate = function evalTemplate(input, config, additionalReplacements) {

    let replacements = [
        {
            pattern : /\{\{ADXName\}\}/gi,
            replacement : (config.info && config.info.name) || ""
        },
        {
            pattern : /\{\{ADXGuid\}\}/gi,
            replacement : (config.info && config.info.guid) || uuid.v4()
        },
        {
            pattern : /\{\{ADXDescription\}\}/gi,
            replacement : (config.info && config.info.description) || ""
        },
        {
            pattern : /\{\{ADXAuthor.Name\}\}/gi,
            replacement : (config.info && config.info.author) || ""
        },
        {
            pattern : /\{\{ADXAuthor.Email\}\}/gi,
            replacement : (config.info && config.info.email) || ""
        },
        {
            pattern : /\{\{ADXAuthor.Company\}\}/gi,
            replacement : (config.info && config.info.company) || ""
        },
        {
            pattern : /\{\{ADXAuthor.website\}\}/gi,
            replacement : (config.info && config.info.site) || ""
        },
        {
            pattern : /\{\{ADXVersion\}\}/gi,
            replacement : (config.info && config.info.version) || ""
        },
        {
            pattern : /2000-01-01/,
            replacement : exports.formatXmlDate()
        },
        {
            pattern : '\ufeff',  // Remove the BOM characters (Marker of the UTF-8 in the string)
            replacement : ''
        }
    ];

    let authorFullName = (config.info && config.info.author) || "";
    if (config.info && config.info.email) {
        authorFullName += ' <' + config.info.email + '>';
    }
    replacements.push({
        pattern: /\{\{ADXAuthor\}\}/gi,
        replacement: authorFullName
    });

    if (additionalReplacements) {
        replacements = replacements.concat(additionalReplacements);
    }

    let result = input;
    for(let i = 0, l = replacements.length; i < l; i += 1) {
        result = result.replace(replacements[i].pattern, replacements[i].replacement);
    }

    return result;
};



/**
 * Create a new sequence of function to call
 *
 * @class Sequence
 * @ignore
 */
function Sequence(sequence, callback, scope) {
    this.current = -1;
    this.sequence = sequence;
    this.callback = callback;
    this.scope = scope;
}

/**
 * Creates a new instance of sequence
 *
 * @param {Array} sequence Array of function to call one by one
 * @param {Function} callback Callback function to execute at the end of the sequence
 * @param {Object} [scope] Scope of function to execute (this)
 * @constructor
 * @ignore
 */
Sequence.prototype.constructor = Sequence;

/**
 * Return the index of the next function to execute
 * @return {Number}
 * @ignore
 */
Sequence.prototype.nextIndex = function nextIndex() {
    if (!this.sequence || !Array.isArray(this.sequence) || !this.sequence.length) {
        return -1;
    }
    let i = (this.current + 1);
    const l = this.sequence.length;
    for (; i < l; i++) {
        if (typeof this.sequence[i] === 'function') {
            return i;
        }
    }
    return -1;
};

/**
 * Indicates if there is another function to call in the sequence stack
 * @returns {boolean}
 * @ignore
 */
Sequence.prototype.hasNext = function hasNext() {
    return (this.nextIndex() !== -1);
};

/**
 * Execute the next function
 * @param {Error} err Error
 * @ignore
 */
Sequence.prototype.resume = function resume(err) {
    const index = this.nextIndex();
    if (index === -1 || err) {
        if (typeof this.callback === 'function') {
            this.callback.call(this.scope, err);
        }
        return;
    }
    this.current = index;
    this.sequence[this.current].call(this.scope);
};

exports.Sequence = Sequence;
