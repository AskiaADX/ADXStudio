"use strict";

describe('ADXBuilder', () => {

const fs   = require('fs');
let spies = {};
let common;
let adxValidator;
let Validator;
let Configurator;
let adxBuilder;
let Builder;
let errMsg;
let successMsg;

    beforeEach(() => {
        // Clean the cache, obtain a fresh instance of the adxBuilder each time
        const commonKey       = require.resolve('../../app/common/common.js');
        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        Configurator = require('../../app/configurator/ADXConfigurator.js').Configurator;

        const adxValidatorKey = require.resolve('../../app/validator/ADXValidator.js');
        delete require.cache[adxValidatorKey];
        adxValidator = require('../../app/validator/ADXValidator.js');

        Validator = adxValidator.Validator;
        spies.validateHook = function () {};

        Validator.prototype.validate = function () {
            spies.validateHook.apply(this, arguments);
        };

        const adxBuilderKey   = require.resolve('../../app/builder/ADXBuilder.js');
        delete require.cache[adxBuilderKey];
        adxBuilder = require('../../app/builder/ADXBuilder.js');

        Builder = adxBuilder.Builder;

        // Messages
        errMsg      = common.messages.error;
        successMsg  = common.messages.success;

        // Court-circuit the Configurator
        spyOn(Configurator.prototype, 'load');

        // Court-circuit the validation
        spies.validate    =  spyOn(spies, 'validateHook');

        // Court-circuit the validation outputs
        spies.writeError   = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.writeWarning = spyOn(common, 'writeWarning');
        spies.dirExists    = spyOn(common, 'dirExists');

        // Court-circuit the creation of the zip object
        spies.getNewZip   = spyOn(common, 'getNewZip');

        // Court-circuit the access of the filesystem
        spies.fs = {
            stat        : spyOn(fs, 'stat'),
            exists      : spyOn(fs, 'exists'),
            readdirSync : spyOn(fs, 'readdirSync'),
            readFile    : spyOn(fs, 'readFile'),
            readFileSync: spyOn(fs, 'readFileSync'),
            writeFile   : spyOn(fs, 'writeFile'),
            mkdirSync   : spyOn(fs, 'mkdirSync')
        };

        spyOn(common, 'isIgnoreFile').andCallFake((f) => {
            return (f === 'Thumbs.db' || f === '.DS_Store');
        });

    });

    describe('#build', () => {
        it("should run the validator", () => {
            adxBuilder.build();
            expect(spies.validateHook).toHaveBeenCalled();
        });

        it("should run the validator with xml validation, even if the flag --no-xml is true", () => {
            let p;
            spies.validateHook.andCallFake((options) => {
                p = options;
            });
            adxBuilder.build({
                xml : false
            });
            expect(p.xml).toBe(true);
        });

        it("should run the validator with auto-test validation, even if the flag --no-test is true", () => {
            let p;
            spies.validateHook.andCallFake(function (options) {
                p = options;
            });
            adxBuilder.build({
                test : false
            });
            expect(p.autoTest).toBe(true);
        });

        it("should output an error when the validation failed", () => {
            spies.validateHook.andCallFake((options, callback) => {
                callback(new Error("Fake error"));
            });
            const spy = spyOn(Builder.prototype, 'writeError');
            adxBuilder.build();
            expect(spy).toHaveBeenCalledWith(errMsg.validationFailed);
        });

        it("should set the #logger when it's defined in the options arg", () => {
            const builderInstance = new Builder('test');
            const logger = {
                key : "val"
            };
            builderInstance.build({
                logger : logger
            });
            expect(builderInstance.logger).toBe(logger);
        });

        it("should pass the #logger to the validator when it's defined in the options arg", () => {
            const builderInstance = new Builder('test');
            let p;
            spies.validateHook.andCallFake(function (options) {
                p = options;
            });
            const logger = {
                key : "val"
            };
            builderInstance.build({
                logger : logger
            });
            expect(p.logger).toBe(logger);
        });

        it("should set the #printMode when it's defined in the options arg", () => {
            const builderInstance = new Builder('test');
            builderInstance.build({
                printMode : 'html'
            });
            expect(builderInstance.printMode).toBe('html');
        });

        describe("create `bin` directory", () => {
            beforeEach(() => {
                spies.validateHook = function (options, callback) {
                    this.adxDirectoryPath = 'adx/path/dir/';
                    callback(null);
                };
            });

            it("should create a `bin` directory, if it doesn't exist", () => {
                spies.dirExists.andCallFake((path, callback) => {
                   callback(null, false);
                });
                adxBuilder.build();
                expect(fs.mkdirSync).toHaveBeenCalled();
            });

            it("should not create a `bin` directory, if it already exist", () => {
                spies.dirExists.andCallFake((path, callback) => {
                    callback(null, true);
                });
                adxBuilder.build();
                expect(fs.mkdirSync).not.toHaveBeenCalled();
            });

            it("should output an error when it cannot create the `bin` folder", () => {
                spies.dirExists.andCallFake((path, callback) => {
                    callback(null, false);
                });
                spies.fs.mkdirSync.andReturn(new Error("Fake error"));
                const spy = spyOn(Builder.prototype, 'writeError');
                adxBuilder.build();
                expect(spy).toHaveBeenCalledWith("Fake error");
            });
        });

        describe("compress the ADX directory", () => {
            let struct, newZip, files;
            beforeEach(() => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    callback(null, {});
                };

                spies.dirExists.andCallFake((path, callback) => {
                    callback(null, true);
                });

                struct =   [
                    {
                        name : 'resources',
                        sub  : [
                            {
                                name : 'dynamic',
                                sub  : [
                                    'default.html',
                                    'dynamic.css'
                                ]
                            },
                            {
                                name : 'static',
                                sub  : [
                                    'default.html',
                                    'static.css'
                                ]
                            },
                            {
                                name : 'share',
                                sub  : [
                                    'default.js',
                                    'share.js'
                                ]
                            }
                        ]
                    },
                    'config.xml',
                    'readme.txt'
                ];
                spyOn(common, 'getDirStructure').andCallFake((path, callback) => {
                    callback(null, struct);
                });


                newZip = {
                    file : function () {},
                    folder : function () {},
                    generate : function () {}
                };

                spies.getNewZip.andReturn(newZip);

                files = [];
                spyOn(newZip, 'file').andCallFake((filePath) => {
                    files.push(filePath);
                });
                spyOn(newZip, 'folder').andCallFake((folderName) => {
                    files.push(folderName);
                });
                spyOn(newZip, 'generate');
            });

            it("should add files and directories recursively in the zip",  () => {
                adxBuilder.build();
                expect(files).toEqual([
                    'resources\\',
                    'resources\\dynamic\\',
                    'resources\\dynamic\\default.html',
                    'resources\\dynamic\\dynamic.css',
                    'resources\\static\\',
                    'resources\\static\\default.html',
                    'resources\\static\\static.css',
                    'resources\\share\\',
                    'resources\\share\\default.js',
                    'resources\\share\\share.js',
                    'config.xml',
                    'readme.txt'
                ]);
            });

            it("should exclude the bin/ and the tests/ directory", () => {

                struct.push({
                    name : 'bin',
                    sub  : ['test.html']
                });
                struct.push({
                    name : 'tests',
                    sub  : ['test.html']
                });

                adxBuilder.build();
                expect(files).toEqual([
                    'resources\\',
                    'resources\\dynamic\\',
                    'resources\\dynamic\\default.html',
                    'resources\\dynamic\\dynamic.css',
                    'resources\\static\\',
                    'resources\\static\\default.html',
                    'resources\\static\\static.css',
                    'resources\\share\\',
                    'resources\\share\\default.js',
                    'resources\\share\\share.js',
                    'config.xml',
                    'readme.txt'
                ]);
            });

            it("should exclude empty directories", () => {
                const resources = struct[0].sub,
                    dynamic   = resources[0],
                    share     = resources[2];

                dynamic.sub = [];
                share.sub   = [];

                adxBuilder.build();
                expect(files).toEqual([
                    'resources\\',
                    'resources\\static\\',
                    'resources\\static\\default.html',
                    'resources\\static\\static.css',
                    'config.xml',
                    'readme.txt'
                ]);
            });

            it("should exclude all extra files and directories that will not be read by the ADX engine", () => {
                const resources = struct[0].sub,
                     dynamic   = resources[0].sub;

                struct.push('atroot.html');
                resources.push({
                    name : 'extra',
                    sub  : [
                        'test.html'
                    ]
                });
                resources.push('inroot.html');
                dynamic.push({
                    name : 'shouldbeinclude',
                    sub  : ['test.html', 'Thumbs.db', '.DS_Store']
                });
                struct.push({
                    name : 'anotherextra',
                    sub  : ['text.html']
                });

                adxBuilder.build();
                expect(files).toEqual([
                    'resources\\',
                    'resources\\dynamic\\',
                    'resources\\dynamic\\default.html',
                    'resources\\dynamic\\dynamic.css',
                    'resources\\dynamic\\shouldbeinclude\\',
                    'resources\\dynamic\\shouldbeinclude\\test.html',
                    'resources\\static\\',
                    'resources\\static\\default.html',
                    'resources\\static\\static.css',
                    'resources\\share\\',
                    'resources\\share\\default.js',
                    'resources\\share\\share.js',
                    'config.xml',
                    'readme.txt'
                ]);
            });

            it("should write the .adc file in the `bin` directory while using an ADC", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    callback(null, {});
                };
                let outputPath;
                spies.fs.writeFile.andCallFake((path) => {
                    outputPath = path;
                });
                adxBuilder.build(null, 'adx/path/dir');
                expect(outputPath).toEqual('adx\\path\\dir\\bin\\myadx.adc');
            });

            it("should write the .adp file in the `bin` directory while using an ADP", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<page></page>');
                    callback(null, {});
                };
                let outputPath;
                spies.fs.writeFile.andCallFake((path) => {
                    outputPath = path;
                });
                adxBuilder.build(null, 'adx/path/dir');
                expect(outputPath).toEqual('adx\\path\\dir\\bin\\myadx.adp');
            });

            it("should compress the .adx file in the `bin` directory with an appropriate compression level", () => {
                /* Arrange */
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    callback(null, {});
                };
                let zipArg;
                let zip = {
                    generate : (obj) => {
                        zipArg = obj;
                    },
                    folder : () => {},
                    file : () => {}
                };
                spies.getNewZip.andCallFake(() => {
                    return zip;
                });
                /* Act */
                adxBuilder.build(null, 'adx/path/dir');
                /* Assert */
                expect(zipArg).toEqual({
                    type: "nodebuffer",
                    compression: 'DEFLATE',
                    compressionOptions: {
                        level: 6
                    }
                }); 
            });

        });

        describe("done", () => {
            beforeEach(() => {
                spies.dirExists.andCallFake((path, callback) => {
                    callback(null, true);
                });

                spyOn(common, 'getDirStructure').andCallFake((path, callback) => {
                    callback(null, [
                        {
                            name : 'resources',
                            sub  : [
                                {
                                    name : 'dynamic',
                                    sub  : [
                                        'default.html',
                                        'dynamic.css'
                                    ]
                                },
                                {
                                    name : 'static',
                                    sub  : [
                                        'default.html',
                                        'static.css'
                                    ]
                                },
                                {
                                    name : 'share',
                                    sub  : [
                                        'default.js',
                                        'share.js'
                                    ]
                                }
                            ]
                        },
                        'config.xml',
                        'readme.txt'
                    ]);
                });

                spies.getNewZip.andReturn({
                    file : function () {},
                    folder: function () {},
                    generate : function () {}
                });
            });

            it("should output a success when the build succeed for ADC", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    this.report = {
                        warnings : 0,
                        errors : 0
                    };
                    callback(null, this.report);
                };
                const spy = spyOn(Builder.prototype, 'writeSuccess');
                adxBuilder.build(null, 'adx/path/dir');
                expect(spy).toHaveBeenCalledWith(successMsg.buildSucceed, 'adx\\path\\dir\\bin\\myadx.adc');
            });

            it("should output a with warning when the build succeed with warning for ADC", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    this.report = {
                        warnings : 1
                    };
                    callback(null, this.report);
                };
                const spy = spyOn(Builder.prototype, 'writeSuccess');
                adxBuilder.build(null, 'adx/path/dir');
                expect(spy).toHaveBeenCalledWith(successMsg.buildSucceedWithWarning, 1, 'adx\\path\\dir\\bin\\myadx.adc');
            });

            it("should output a success when the build succeed for ADP", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<page></page>');
                    this.report = {
                        warnings : 0,
                        errors : 0
                    };
                    callback(null, this.report);
                };
                const spy = spyOn(Builder.prototype, 'writeSuccess');
                adxBuilder.build(null, 'adx/path/dir');
                expect(spy).toHaveBeenCalledWith(successMsg.buildSucceed, 'adx\\path\\dir\\bin\\myadx.adp');
            });

            it("should output a with warning when the build succeed with warning for ADP", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<page></page>');
                    this.report = {
                        warnings : 1
                    };
                    callback(null, this.report);
                };
                const spy = spyOn(Builder.prototype, 'writeSuccess');
                adxBuilder.build(null, 'adx/path/dir');
                expect(spy).toHaveBeenCalledWith(successMsg.buildSucceedWithWarning, 1, 'adx\\path\\dir\\bin\\myadx.adp');
            });
        });

        describe("API `callback`", () => {
            beforeEach(() => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<control></control>');
                    callback(null, {
                        fakeReport : true
                    });
                };

                spies.dirExists.andCallFake((path, callback) => {
                    callback(null, true);
                });

                spyOn(common, 'getDirStructure').andCallFake((path, callback) => {
                    callback(null, [
                        {
                            name : 'resources',
                            sub  : [
                                {
                                    name : 'dynamic',
                                    sub  : [
                                        'default.html',
                                        'dynamic.css'
                                    ]
                                },
                                {
                                    name : 'static',
                                    sub  : [
                                        'default.html',
                                        'static.css'
                                    ]
                                },
                                {
                                    name : 'share',
                                    sub  : [
                                        'default.js',
                                        'share.js'
                                    ]
                                }
                            ]
                        },
                        'config.xml',
                        'readme.txt'
                    ]);
                });

                spies.getNewZip.andReturn({
                    file : function () {},
                    folder: function () {},
                    generate : function () {}
                });
            });

            it("should be called when defined without `options` arg", () => {
                const builder = new Builder('adx/path/dir/');
                let wasCalled = false;
                builder.build(() => {
                    wasCalled = true;
                });

                expect(wasCalled).toBe(true);
            });

            it("should be called when defined with the`options` arg", () => {
                const builder = new Builder('adx/path/dir/');
                let wasCalled = false;
                builder.build({}, () => {
                    wasCalled = true;
                });

                expect(wasCalled).toBe(true);
            });

            it("should be call with an err argument as an Error", () => {
                spies.validateHook = function (options, callback) {
                    callback(new Error("Fake error"));
                };
                const builder = new Builder('some/path');
                let callbackErr;
                builder.build((err) => {
                    callbackErr = err;
                });
                expect(callbackErr instanceof Error).toBe(true);
            });

            it("should be call with the `outputPath` (ADC) in arg", () => {
                const builder = new Builder('adx/path/dir/');
                let callbackPath;
                builder.build((err, outputPath) => {
                    callbackPath = outputPath;
                });

                expect(callbackPath).toEqual('adx\\path\\dir\\bin\\myadx.adc');
            });

            it("should be call with the `outputPath` (ADP) in arg", () => {
                spies.validateHook = function (options, callback) {
                    this.adxName = 'myadx';
                    this.adxDirectoryPath = 'adx/path/dir/';
                    this.adxConfigurator = new Configurator('/adx/path/dir');
                    this.adxConfigurator.fromXml('<page></page>');
                    callback(null, {
                        fakeReport : true
                    });
                };
                const builder = new Builder('adx/path/dir/');
                let callbackPath;
                builder.build((err, outputPath) => {
                    callbackPath = outputPath;
                });

                expect(callbackPath).toEqual('adx\\path\\dir\\bin\\myadx.adp');
            });

            it("should be call with the `report` in arg", () => {
                const builder = new Builder('adx/path/dir/');
                let callbackReport;
                builder.build((err, outputPath, report) => {
                    callbackReport = report;
                });

                expect(callbackReport).toEqual({
                    fakeReport : true
                });
            });
        });

    });

    function testLogger(method) {
        const className = method.toLowerCase().replace('write', '');
        describe('#'  + method, () => {
            it('should call the `common.' + method + '` when no #logger is defined', () => {
                const builderInstance = new Builder('test');
                builderInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should call the `common.' + method + '` when the #logger is defined but without the ' + method + ' method.', () => {
                const builderInstance = new Builder('test');
                builderInstance.logger = {};
                builderInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should not call the `common.' + method + '` when the #logger is defined with the ' + method + ' method.', () => {
                const builderInstance = new Builder('test');
                builderInstance.logger = {};
                builderInstance.logger[method] = function () {};
                builderInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).not.toHaveBeenCalled();
            });

            it('should call the `logger.' + method + '` when it\'s defined', () => {
                const builderInstance = new Builder('test');
                builderInstance.logger = {};
                builderInstance.logger[method] = function () {};
                const spy = spyOn(builderInstance.logger, method);
                builderInstance[method]('a message', 'arg 1', 'arg 2');
                expect(spy).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should wrap the message inside a div with the `' + className + '` when the printMode=html', () => {
                const builderInstance = new Builder('test');
                builderInstance.printMode = 'html';
                builderInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('<div class="' + className + '">a message</div>', 'arg 1', 'arg 2');
            });
        });
    }

    ['writeMessage', 'writeSuccess', 'writeWarning', 'writeError'].forEach(testLogger);
});

