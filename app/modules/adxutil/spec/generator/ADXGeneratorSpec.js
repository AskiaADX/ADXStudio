"use strict";

describe('ADXGenerator', function () {

    const fs            = require('fs'),
        ncpLib          = require('ncp'),
        format          = require('util').format,
        uuid            = require('uuid'),
        pathHelper      = require('path'),
        spies           = {};

    let common,
        adxGenerator,
        Generator,
        generatorInstance,
        adxPreferences,
        errMsg,
        successMsg;

    beforeEach(() => {
        // !! Make sure to court-circuit   !!
        // !! it before to load the module !!
        spies.ncp = spyOn(ncpLib, 'ncp');

        // Clean the cache, obtain a fresh instance of the adxGenerator each time
        const adxGeneratorKey = require.resolve('../../app/generator/ADXGenerator.js'),
             commonKey       = require.resolve('../../app/common/common.js');

        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        delete require.cache[adxGeneratorKey];
        adxGenerator = require('../../app/generator/ADXGenerator.js');

        Generator = adxGenerator.Generator;
        const oldGenerate = Generator.prototype.generate;

        Generator.prototype.generate = function () {
            generatorInstance = this;
            oldGenerate.apply(this, arguments);
        };


        // Messages
        errMsg              = common.messages.error;
        successMsg          = common.messages.success;

        // Court-circuit the validation outputs
        spies.writeError   = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.dirExists    = spyOn(common, 'dirExists');
        spies.getDirStructure = spyOn(common, 'getDirStructure');
        spies.getTemplatePath = spyOn(common, 'getTemplatePath');
        spies.getTemplatePath.andCallFake(function (type, name, cb) {
            cb(null, pathHelper.join(common.TEMPLATES_PATH, type, name));
        });

        // Court-circuit the access of the filesystem
        spies.fs = {
            stat        : spyOn(fs, 'stat'),
            exists      : spyOn(fs, 'exists'),
            readdirSync : spyOn(fs, 'readdirSync'),
            readFile    : spyOn(fs, 'readFile'),
            writeFile   : spyOn(fs, 'writeFile')
        };


        // Court-circuit the uuid generator
        spyOn(uuid, 'v4').andReturn('guid');

        spies.cwd = spyOn(process, 'cwd').andReturn('adx/path/dir');

        adxPreferences  = require('../../app/preferences/ADXPreferences.js');

        spies.readPreferences = spyOn(adxPreferences, 'read');
        spies.readPreferences.andCallFake((opt, cb) => {
            cb({
                author : {
                    name : 'MyPrefName',
                    email : 'MyPrefEmail',
                    company : 'MyPrefCompany',
                    website : 'MyWebsite'
                }
            });
        });
    });

    describe('#generator', function () {

        it("should output an error when the `type` argument is not specified", function () {
            adxGenerator.generate({});
            expect(common.writeError).toHaveBeenCalledWith(errMsg.missingTypeArgument);
        });

        it("should output an error when the `type` argument is not `adc` or `adp`", function () {
            adxGenerator.generate({}, 'notadp_or_adc');
            expect(common.writeError).toHaveBeenCalledWith(errMsg.incorrectADXType);
        });

        it("should output an error when the `name` argument is empty", function () {
            adxGenerator.generate({
                output : 'adc/path/dir'
            }, 'adc', '');
            expect(common.writeError).toHaveBeenCalledWith(errMsg.missingNameArgument);
        });

        it("should output an error when the `name` argument is not correctly formatted", function () {
            adxGenerator.generate({}, 'adc', ':/\\#@!');
            expect(common.writeError).toHaveBeenCalledWith(errMsg.incorrectADXName);
        });

        it("should instantiate the generator with the specified `name` parameter", function () {
            adxGenerator.generate({}, 'adc', 'adxname');
            expect(generatorInstance.adxName).toBe('adxname');
        });

        it("should instantiate the generator with the specified `type` parameter", function () {
            adxGenerator.generate({}, 'adc', 'adxname');
            expect(generatorInstance.adxType).toBe('adc');

            adxGenerator.generate({}, 'adp', 'adxname');
            expect(generatorInstance.adxType).toBe('adp');
        });

        it("should use the current working directory when the `output` path is not specified", function () {
            spies.cwd.andReturn('/cwd');
            adxGenerator.generate({}, 'adc', 'adxname');
            expect(generatorInstance.outputDirectory).toBe('/cwd');
        });

        it("should use the `output` path when it's specified", function () {
            adxGenerator.generate({
                output : '/adx/path/dir'
            }, 'adc', 'adxname');
            expect(generatorInstance.outputDirectory).toBe('/adx/path/dir');
        });

        it("should use the `description` option when it's specified", function () {
            adxGenerator.generate({
                description : 'A description'
            }, 'adc', 'adxname');
            expect(generatorInstance.adxDescription).toBe('A description');
        });

        it("should use the template when the `program` argument has a template property", function () {
            adxGenerator.generate({
                template : 'test'
            }, 'adc', 'adxname');
            expect(generatorInstance.template).toBe('test');
        });

        it("should use the `blank` template when the `program` has no template property", function () {
            adxGenerator.generate({
            }, 'adc', 'adxname');
            expect(generatorInstance.template).toBe(common.DEFAULT_TEMPLATE_NAME);
        });

        it("should output an error when the specified template was not found", function () {
            spies.getTemplatePath.andCallFake(function (type, name, callback) {
                if (type === 'adc' && name === 'templatename') {
                    callback(new Error(format(errMsg.cannotFoundTemplate, 'templatename')));
                }
            });
            adxGenerator.generate({
                output   : 'output',
                template : 'templatename'
            }, 'adc', 'adxname');
            expect(common.writeError).toHaveBeenCalledWith(format(errMsg.cannotFoundTemplate, 'templatename'));
        });

        it("should use the `author` option when it's specified", function () {
            adxGenerator.generate({
                author : {
                    name : 'Auth name',
                    email : 'Auth Email',
                    company : 'Auth company',
                    website : 'Auth website'
                }
            }, 'adc', 'adxname');
            expect(generatorInstance.adxAuthor).toEqual({
                name : 'Auth name',
                email : 'Auth Email',
                company : 'Auth company',
                website : 'Auth website'
            });
        });

        it("should use the `author` from preference when the option is not specified", function () {
            adxGenerator.generate({}, 'adc', 'adxname');
            expect(generatorInstance.adxAuthor).toEqual({
                name : 'MyPrefName',
                email : 'MyPrefEmail',
                company : 'MyPrefCompany',
                website : 'MyWebsite'
            });
        });


        describe('#verifyOutputDirExist', function () {
            it("should output an error when the output directory path doesn't exist", function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    if (path === 'adx/path/dir') {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).toHaveBeenCalledWith(format(errMsg.noSuchFileOrDirectory, 'adx/path/dir'));
            });
        });

        describe("#verifyADXDirNotAlreadyExist", function () {
            it("should output an error when the output directory + adx name already exist", function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    callback(null, true);
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).toHaveBeenCalledWith(format(errMsg.directoryAlreadyExist, 'adx\\path\\dir\\adxname'));
            });

            it('should not output an error when the output directory and the adx name is valid', function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    if (path == 'adx\\path\\dir\\adxname') {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).not.toHaveBeenCalled();
            });
        });

        describe("#copyFromTemplate", function () {
            beforeEach(function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    if (path === 'adx\\path\\dir\\adxname') {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                });
            });

            function forEachADXType(type) {
                it("should copy the `default` " + type.toUpperCase() + " template directory in the ADX output directory", function () {
                    var source, destination;
                    spies.ncp.andCallFake(function (src, dest) {
                        source = src;
                        destination = dest;
                    });
                    adxGenerator.rootdir = '/src';
                    adxGenerator.generate({
                        output : 'adx/path/dir'
                    }, type, 'adxname');
                    expect(spies.ncp).toHaveBeenCalled();
                    expect(source).toBe('\\templates\\'+ type + '\\' + common.DEFAULT_TEMPLATE_NAME);
                    expect(destination).toBe('adx\\path\\dir\\adxname');
                });

                it("should search the path of the " + type.toUpperCase() + "'s template using `common.getTemplatePath` when the `templatePath` is not defined", function () {
                    var source;
                    spies.getTemplatePath.andCallFake(function (templateType, name, cb) {
                        expect(templateType).toEqual(type);
                        cb(null, 'template/path/test');
                    });
                    spies.ncp.andCallFake(function (src, dest) {
                        source = src;
                    });
                    adxGenerator.generate({
                        template : 'test',
                        output : 'adx/path/dir'
                    }, type, 'adxname');
                    expect(source).toBe('template/path/test');
                });
            }

            ['adc', 'adp'].forEach(forEachADXType);



            it("should output an error when the copy failed", function () {
                spies.ncp.andCallFake(function (src, dest, callback) {
                    callback(new Error('Fake error'));
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).toHaveBeenCalledWith('Fake error');
            });

            it("should not output an error when the copy doesn't failed", function () {
                spies.ncp.andCallFake(function (src, dest, callback) {
                    callback(null);
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).not.toHaveBeenCalled();
            });
        });

        describe("#updateFiles", function () {
            beforeEach(function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    if (path === 'adx\\path\\dir\\adxname') {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                });
                spies.ncp.andCallFake(function (src, dest, callback) {
                    callback(null);
                });
            });

            it("should read the config.xml and the readme.md files", function () {
                var paths = [];
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    paths.push(path);
                    callback(null, "");
                });
                adxGenerator.generate({
                   output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(paths).toEqual(['adx\\path\\dir\\adxname\\config.xml', 'adx\\path\\dir\\adxname\\readme.md']);
            });

            it("should output an error when an error occurred while reading the file", function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(new Error('fake error'));
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).toHaveBeenCalledWith('fake error');
            });

            it("should not output an error while reading the file succeed", function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, "");
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).not.toHaveBeenCalled();
            });

            it('should call the common#evalTemplate with an object that looks like a config', function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, 'the input');
                });
                var input, obj;
                var spy = spyOn(common, 'evalTemplate').andCallFake(function (a, b) {
                    input = a;
                    obj = b;
                });

                adxGenerator.generate({
                    output : 'adx/path/dir',
                    description : 'My description',
                    author : {
                        name : 'myname',
                        email : 'myemail',
                        company : 'mycompany',
                        website : 'mysite'
                    }
                }, 'adc', 'adxname');

                expect(spy).toHaveBeenCalled();
                expect(input).toEqual('the input');
                expect(obj).toEqual({
                    info : {
                        name : 'adxname' ,
                        type :	 'adc',
                        description : 'My description',
                        author : 'myname',
                        email : 'myemail',
                        company : 'mycompany',
                        site : 'mysite'
                    }
                });
            });

            it('should write the file with the result of the common#evalTemplate', function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, 'the input');
                });
                var result;
                spies.fs.writeFile.andCallFake(function (path, content) {
                    result = content;
                });
                spyOn(common, 'evalTemplate').andReturn('something');

                adxGenerator.generate({
                    output : 'adx/path/dir',
                    description : 'My description'
                }, 'adc', 'adxname');

                expect(result).toEqual('something');
            });

            it("should output an error when failing to rewrite the file", function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, "");
                });
                spies.fs.writeFile.andCallFake(function (path, content, callback) {
                    callback(new Error('fake error'));
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).toHaveBeenCalledWith('fake error');
            });

            it("should not output an error when rewrite the file succeed", function () {
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, "");
                });
                spies.fs.writeFile.andCallFake(function (path, content, callback) {
                    callback(null);
                });
                adxGenerator.generate({
                    output : 'adx/path/dir'
                }, 'adc', 'adxname');
                expect(common.writeError).not.toHaveBeenCalled();
            });
        });

        describe("#done", function () {
           it("should output the structure of the ADX directory and a success message", function () {
               spies.dirExists.andCallFake(function (path, callback) {
                   if (path === 'adx\\path\\dir\\adxname' || path === 'adx\\path\\dir\\tests\\units') {
                       callback(null, false);
                   } else {
                       callback(null, true);
                   }
               });
               spies.ncp.andCallFake(function (src, dest, callback) {
                   callback(null);
               });
               spies.fs.readFile.andCallFake(function (path, option, callback) {
                  callback(null, "");
               });
               spies.fs.writeFile.andCallFake(function (path, content, callback) {
                   callback(null);
               });
               spies.getDirStructure.andCallFake(function (path, callback) {
                    callback(null, [
                        {
                            name : 'resources',
                            sub  : [
                                {
                                    name : 'dynamic',
                                    sub  : ['default.html']
                                },
                                {
                                    name : 'share',
                                    sub  : []
                                },
                                {
                                    name : 'static',
                                    sub  : []
                                }
                            ]
                        },
                        {
                            name : 'tests',
                            sub  : [
                                {
                                    name : 'units',
                                    sub  : [
                                        'test.xml'
                                    ]
                                }
                            ]
                        },
                        'config.xml'
                    ]);
               });
               adxGenerator.generate({
                   output : 'adx/path/dir'
               }, 'adc', 'adxname');

               var d = [];
               d.push('|-- resources\\');
               d.push('|--|-- dynamic\\');
               d.push('|--|--|-- default.html');
               d.push('|--|-- share\\');
               d.push('|--|-- static\\');
               d.push('|-- tests\\');
               d.push('|--|-- units\\');
               d.push('|--|--|-- test.xml');
               d.push('|-- config.xml');
               d = d.join('\r\n');
               expect(common.writeSuccess).toHaveBeenCalledWith(successMsg.adxStructureGenerated, d, 'adxname', 'adx\\path\\dir\\adxname');
           });
        });

        describe("API `callback`", function () {
            beforeEach(function () {

                spies.dirExists.andCallFake(function (path, callback) {
                    if (path === 'adx\\path\\dir\\adcname' || path === 'adx\\path\\dir\\tests\\units') {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                });
                spies.ncp.andCallFake(function (src, dest, option, callback) {
                    callback(null);
                });
                spies.fs.readFile.andCallFake(function (path, option, callback) {
                    callback(null, "");
                });
                spies.fs.writeFile.andCallFake(function (path, content, callback) {
                    callback(null);
                });
                spies.getDirStructure.andCallFake(function (path, callback) {
                    callback(null, [
                        {
                            name : 'resources',
                            sub  : [
                                {
                                    name : 'dynamic',
                                    sub  : ['default.html']
                                },
                                {
                                    name : 'share',
                                    sub  : []
                                },
                                {
                                    name : 'static',
                                    sub  : []
                                }
                            ]
                        },
                        {
                            name : 'tests',
                            sub  : [
                                {
                                    name : 'units',
                                    sub  : [
                                        'test.xml'
                                    ]
                                }
                            ]
                        },
                        'config.xml'
                    ]);
                });
            });

            it("should be called when defined without `options` arg", function () {
                var generator = new Generator();
                var wasCalled = false;
                generator.generate('adc', 'myadx', function () {
                    wasCalled = true;
                });

                expect(wasCalled).toBe(true);
            });

            it("should be called when defined with the `options` arg", function () {
                var generator = new Generator();
                var wasCalled = false;
                generator.generate('adc', 'myadx', {}, function () {
                    wasCalled = true;
                });

                expect(wasCalled).toBe(true);
            });

            it("should be call with an err argument as an Error", function () {
                spies.dirExists.andCallFake(function (path, callback) {
                    callback(new Error("Fake error"));
                });
                var generator = new Generator();
                var callbackErr;
                generator.generate('adc', 'myadx', function (err) {
                    callbackErr = err;
                });
                expect(callbackErr instanceof Error).toBe(true);
            });

            it("should be call with the `outputDir` in arg", function () {
                var generator = new Generator();
                var callbackPath;
                generator.generate('adc', 'myadx', function (err, outputDir) {
                    callbackPath = outputDir;
                });

                expect(callbackPath).toEqual('adx\\path\\dir\\\myadx');
            });

        });
    });
});
