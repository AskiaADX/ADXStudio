"use strict";

describe('ADXUtilAPI', () => {
    const fs = require('fs');
    const pathHelper = require('path');
    const InteractiveADXShell = require('../app/common/InteractiveADXShell.js').InteractiveADXShell;
    const ncpLib = require('ncp');
    let ADX,
        adxUtilApi,
        errMsg,
        adxValidator,
        Validator,
        adxBuilder,
        Builder,
        adxPublisher,
        Publisher,
        adxShow,
        Show,
        adxGenerator,
        Generator,
        adxConfigurator,
        Configurator,
        adxInterviews,
        InterviewsFactory,
        adxPreferences,
        preferences,
        spies = {},
        common;

    function runSync(fn) {
        let wasCalled = false;
        runs(() => {
            fn(() => {
                wasCalled = true;
            });
        });
        waitsFor(() => {
            return wasCalled;
        });
    }

    beforeEach(() => {
        // !! Make sure to court-circuit   !!
        // !! it before to load the module !!
        spies.ncp = spyOn(ncpLib, 'ncp');

        adxUtilApi = require.resolve('../app/ADXUtilAPI.js');
        if (adxUtilApi) {
            delete require.cache[adxUtilApi];
        }

        adxUtilApi = require('../app/ADXUtilAPI.js');
        ADX = adxUtilApi.ADX;

        common = require('../app/common/common.js');
        errMsg     = common.messages.error;
        spies.getTemplateList = spyOn(common, 'getTemplateList');

        // Court-circuit the access of the filesystem
        spies.fs = {
            stat        : spyOn(fs, 'stat'),
            exists      : spyOn(fs, 'exists'),
            readdirSync : spyOn(fs, 'readdirSync'),
            readdir     : spyOn(fs, 'readdir'),
            readFile    : spyOn(fs, 'readFile'),
            mkdir       : spyOn(fs, 'mkdir')
        };

        adxValidator = require('../app/validator/ADXValidator.js');
        Validator = adxValidator.Validator;
        spies.validate = spyOn(Validator.prototype, 'validate');

        adxBuilder = require('../app/builder/ADXBuilder.js');
        Builder = adxBuilder.Builder;
        spies.build = spyOn(Builder.prototype, 'build');
        
        adxPublisher = require('../app/publisher/ADXPublisher.js');
        Publisher = adxPublisher.Publisher;
        spies.publish = spyOn(Publisher.prototype, 'publish');
        
        adxShow = require('../app/show/ADXShow.js');
        Show = adxShow.Show;
        spies.show = spyOn(Show.prototype, 'show');

        adxGenerator = require('../app/generator/ADXGenerator.js');
        Generator = adxGenerator.Generator;
        spies.generate = spyOn(Generator.prototype, 'generate');

        adxConfigurator = require('../app/configurator/ADXConfigurator.js');
        Configurator = adxConfigurator.Configurator;
        spies.load = spyOn(Configurator.prototype, 'load');

        adxInterviews = require('../app/interviews/ADXInterviews.js');
        InterviewsFactory = adxInterviews.InterviewsFactory;

        adxPreferences = require('../app/preferences/ADXPreferences.js');
        preferences = adxPreferences.preferences;

        spies.getTemplatePath = spyOn(common, 'getTemplatePath');
        spies.getTemplatePath.andCallFake(function (type, name, cb) {
            cb(null, pathHelper.join(common.TEMPLATES_PATH, type, name));
        });
    });

    describe(".ADX", function () {
        beforeEach(function () {
            spies.fs.statSync = spyOn(fs, 'statSync');
        });

        describe("#constructor", function () {
            it("should be a function", function () {
                expect(typeof ADX).toBe('function');
            });

            it("should initialize the #path property with the value in `arg`", function () {
                var adx = new ADX('some/path');
                expect(adx.path).toBe('some\\path');
            });

            it("should throw an exception when the `adxDir` argument is not defined", function () {
                expect(function () {
                    var adx = new ADX();
                }).toThrow(errMsg.invalidPathArg);
            });

            it("should throw an exception when the `adxdir` is invalid path", function () {
                spies.fs.statSync.andThrow("No such file or directory");
                expect(function () {
                    var adx = new ADX('/invalid/path');
                }).toThrow("No such file or directory");
            });

            it("should initialize a new instance of the InteractiveADXShell in #_adxShell", function () {
                var adx = new ADX('some/path');
                expect(adx._adxShell instanceof InteractiveADXShell).toBe(true);
            });

            it("should initialize a new instance of InterviewsFactory in #interviews", function () {
                var adx = new ADX('some/path');
                expect(adx.interviews instanceof InterviewsFactory).toBe(true);
            });
        });

        describe("#load", function () {
            it("should instantiate a new Configurator object with the path of the ADX", function () {
                var firstInstance, firstInstancePath, secondInstance, secondInstancePath;
                spies.load.andCallFake(function () {
                    firstInstance = this;
                    firstInstancePath = this.path;
                });
                var first = new ADX('first/path');
                first.load();

                spies.load.andCallFake(function () {
                    secondInstance= this;
                    secondInstancePath = this.path;
                });

                var second = new ADX('second/path');
                second.load();


                expect(firstInstance).not.toBe(secondInstance);
                expect(firstInstancePath).toEqual('first\\path');
                expect(secondInstancePath).toEqual('second\\path');
            });
            it("should call the Configurator#load", function () {
                var adx = new ADX('some/path');
                adx.load();
                expect(spies.load).toHaveBeenCalled();
            });
            it("should call the `callback` with Error when the configurator#load failed", function () {
                var err = new Error("fake");
                spies.load.andCallFake(function (cb) {
                    cb(err);
                });
                var adx = new ADX('some/path');
                var callbackErr;
                adx.load(function (e) {
                    callbackErr = e;
                });
                expect(callbackErr).toBe(err);
            });

            it("should call the `callback` after initializing the #configurator", function () {
                var conf, hasBeenCalled = false;
                spies.load.andCallFake(function (cb) {
                    conf = this;
                    cb(null);
                });
                var adx = new ADX('some/path');
                adx.load(function (e) {
                    expect(adx.configurator).toBe(conf);
                    hasBeenCalled = true;
                });
                expect(hasBeenCalled).toBe(true);
            });
        });

        describe("#validate", function () {
            it("should instantiate a new Validator object with the path of the ADX", function () {
                var firstInstance, firstInstancePath, secondInstance, secondInstancePath;
                spies.validate.andCallFake(function () {
                    firstInstance = this;
                    firstInstancePath = this.adxDirectoryPath;
                });
                var first = new ADX('first/path');
                first.validate();

                spies.validate.andCallFake(function () {
                    secondInstance= this;
                    secondInstancePath = this.adxDirectoryPath;
                });

                var second = new ADX('second/path');
                second.validate();


                expect(firstInstance).not.toBe(secondInstance);
                expect(firstInstancePath).toEqual('first\\path');
                expect(secondInstancePath).toEqual('second\\path');
            });
            it("should call the Validator#validate with the arguments", function () {
                var adx = new ADX('some/path');
                var cb = function () {};
                adx.validate({}, cb);
                expect(spies.validate).toHaveBeenCalledWith({
                    adxShell : adx._adxShell
                }, cb);
            });
        });

        describe("#build", function () {
            it("should instantiate a new Builder object with the path of the ADX", function () {
                var firstInstance, firstInstancePath, secondInstance, secondInstancePath;
                spies.build.andCallFake(function () {
                    firstInstance = this;
                    firstInstancePath = this.adxDirectoryPath;
                });
                var first = new ADX('first/path');
                first.build();

                spies.build.andCallFake(function () {
                    secondInstance= this;
                    secondInstancePath = this.adxDirectoryPath;
                });

                var second = new ADX('second/path');
                second.build();


                expect(firstInstance).not.toBe(secondInstance);
                expect(firstInstancePath).toEqual('first\\path');
                expect(secondInstancePath).toEqual('second\\path');
            });
            it("should call the Builder#build with the arguments", function () {
                var adx = new ADX('some/path');
                var cb = function () {};
                adx.build({}, cb);
                expect(spies.build).toHaveBeenCalledWith({
                    adxShell : adx._adxShell
                }, cb);
            });
        });
        
        describe("#publish", function () {
            it("should instantiate a new Publisher object with the path of the ADX", function () {
                var firstInstance, firstInstancePath, secondInstance, secondInstancePath;
                spies.publish.andCallFake(function () {
                    firstInstance = this;
                    firstInstancePath = this.adxDirectoryPath;
                });
                var first = new ADX('first/path');
                first.publish();

                spies.publish.andCallFake(function () {
                    secondInstance= this;
                    secondInstancePath = this.adxDirectoryPath;
                });

                var second = new ADX('second/path');
                second.publish();


                expect(firstInstance).not.toBe(secondInstance);
                expect(firstInstancePath).toEqual('first\\path');
                expect(secondInstancePath).toEqual('second\\path');
            });
            it("should call the Publisher#publish with the arguments", function () {
                var adx = new ADX('some/path');
                var cb = function () {};
                adx.publish("platform", {}, cb);
                expect(spies.publish).toHaveBeenCalledWith("platform", {
                    adxShell : adx._adxShell
                }, cb);
            });
        });

        describe("#show", function () {
            it("should instantiate a new Show object with the path of the ADX", function () {
                var firstInstance, firstInstancePath, secondInstance, secondInstancePath;
                spies.show.andCallFake(function () {
                    firstInstance = this;
                    firstInstancePath = this.adxDirectoryPath;
                });
                var first = new ADX('first/path');
                first.show();

                spies.show.andCallFake(function () {
                    secondInstance= this;
                    secondInstancePath = this.adxDirectoryPath;
                });

                var second = new ADX('second/path');
                second.show();


                expect(firstInstance).not.toBe(secondInstance);
                expect(firstInstancePath).toEqual('first\\path');
                expect(secondInstancePath).toEqual('second\\path');
            });
            it("should call the Show#show with the arguments", function () {
                var adx = new ADX('some/path');
                var cb = function () {};
                adx.show({}, cb);
                expect(spies.show).toHaveBeenCalledWith({
                    adxShell : adx._adxShell
                }, cb);
            });
        });

        describe('#getFixtureList', function () {
            it('should return the names of xml file under the `tests/fixtures` path', function () {
                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join('some/path', common.FIXTIRES_DIR_PATH)) {
                        cb(null, ['no-fixture.doc', 'fixture1.xml', 'fixture2.xml', 'fixture3.xml', 'no-fixture', 'no-fixture.txt', 'fixture4.xml']);
                    } else {
                        cb(new Error('No such file or directory'));
                    }
                });
                var adx = new ADX('some/path');
                var wasCalled = false;
                adx.getFixtureList(function (err, list) {
                    wasCalled = true;
                    expect(list).toEqual(['fixture1.xml', 'fixture2.xml', 'fixture3.xml','fixture4.xml'])
                });
                expect(wasCalled).toBe(true);
            });
        });

        describe('#checkTestsDirectory', function () {
            beforeEach(function () {
                spies.load.andCallFake(function (cb) {
                    cb();
                });
            });

            it("should init the #configurator using the #load method when the #configurator is not defined", function () {
                var adx = new ADX('adx/path');
                adx.checkTestsDirectory();
                expect(spies.load).toHaveBeenCalled();
            });

            it("should call the callback with an error when the #load return an error", function () {
                var adx = new ADX('adx/path');
                spies.load.andCallFake(function (cb) {
                    cb(new Error('Fake error'));
                });
                runSync(function (done) {
                    adx.checkTestsDirectory(function (err) {
                        expect(err).toEqual(new Error('Fake error'));
                        done();
                    });
                });
            });

            it("should not init the #configurator using the #load method when the #configurator is not defined", function () {
                var adx = new ADX('adx/path');
                adx.configurator = new Configurator('adx/path');
                adx.checkTestsDirectory();
                expect(spies.load).not.toHaveBeenCalled();
            });

            it("should call the callback with an error when the #configurator#projectType is not define", function () {
                var adx = new ADX('adx/path');
                adx.configurator = new Configurator('adx/path');
                runSync(function (done) {
                    adx.checkTestsDirectory(function (err) {
                        expect(err).toEqual(new Error(errMsg.incorrectADXType));
                        done();
                    });
                });
            });

            it("should copy `tests/fixtures` directory of the `blank` ADC template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adc/path', common.FIXTIRES_DIR_PATH)) {
                        cb(null, false);
                    } else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adc', common.DEFAULT_TEMPLATE_NAME, common.FIXTIRES_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adc/path', common.FIXTIRES_DIR_PATH));
                        done();
                    });

                    var adc = new ADX('adc/path');
                    adc.configurator = new Configurator('adc/path');
                    adc.configurator.projectType = 'adc';
                    adc.checkTestsDirectory();
                });
            });

            it("should copy `tests/fixtures` directory of the `blank` ADP template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adp/path', common.FIXTIRES_DIR_PATH)) {
                        cb(null, false);
                    } else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adp', common.DEFAULT_TEMPLATE_NAME, common.FIXTIRES_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adp/path', common.FIXTIRES_DIR_PATH));
                        done();
                    });

                    var adp = new ADX('adp/path');
                    adp.configurator = new Configurator('adp/path');
                    adp.configurator.projectType = 'adp';
                    adp.checkTestsDirectory();
                });
            });

            it("should copy `tests/emulations` directory of the `blank` ADC template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adc/path', common.EMULATIONS_DIR_PATH)) {
                        cb(null, false);
                    }
                    else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adc', common.DEFAULT_TEMPLATE_NAME, common.EMULATIONS_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adc/path', common.EMULATIONS_DIR_PATH));
                        done();
                    });

                    var adc = new ADX('adc/path');
                    adc.configurator = new Configurator('adc/path');
                    adc.configurator.projectType = 'adc';
                    adc.checkTestsDirectory();
                });
            });

            it("should copy `tests/emulations` directory of the `blank` ADP template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adp/path', common.EMULATIONS_DIR_PATH)) {
                        cb(null, false);
                    }
                    else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adp', common.DEFAULT_TEMPLATE_NAME, common.EMULATIONS_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adp/path', common.EMULATIONS_DIR_PATH));
                        done();
                    });

                    var adp = new ADX('adp/path');
                    adp.configurator = new Configurator('adp/path');
                    adp.configurator.projectType = 'adp';
                    adp.checkTestsDirectory();
                });
            });

            it("should copy `tests/pages` directory of the `blank` ADC template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adc/path', common.PAGES_DIR_PATH)) {
                        cb(null, false);
                    }
                    else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adc', common.DEFAULT_TEMPLATE_NAME, common.PAGES_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adc/path', common.PAGES_DIR_PATH));
                        done();
                    });

                    var adc = new ADX('adc/path');
                    adc.configurator = new Configurator('adc/path');
                    adc.configurator.projectType = 'adc';
                    adc.checkTestsDirectory();
                });
            });

            it("should copy `tests/controls` directory of the `blank` ADP template if it  doesn't exist", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    if (p === pathHelper.join('adp/path', common.CONTROLS_DIR_PATH)) {
                        cb(null, false);
                    }
                    else {
                        cb(null, true);
                    }
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });

                runSync(function (done) {
                    spies.ncp.andCallFake(function (source, dest) {
                        expect(source).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../"), common.TEMPLATES_PATH, 'adp', common.DEFAULT_TEMPLATE_NAME, common.CONTROLS_DIR_PATH));
                        expect(dest).toEqual(pathHelper.join('adp/path', common.CONTROLS_DIR_PATH));
                        done();
                    });

                    var adp = new ADX('adp/path');
                    adp.configurator = new Configurator('adp/path');
                    adp.configurator.projectType = 'adp';
                    adp.checkTestsDirectory();
                });
            });

            it("should call the callback arg when the copy is finish", function () {
                spyOn(common, 'dirExists').andCallFake(function (p, cb) {
                    cb(null, false);
                });
                spies.fs.mkdir.andCallFake(function (p, cb) {
                    cb();
                });
                spies.ncp.andCallFake(function (source, dest, cb) {
                    cb();
                });


                runSync(function (done) {
                    var adx = new ADX('adx/path');
                    adx.configurator = new Configurator('adx/path');
                    adx.configurator.projectType = 'adc';
                    adx.checkTestsDirectory(function () {
                        expect(true).toBe(true);
                        done();
                    });
                });
            });
        });

        describe('#getEmulationList', function () {
            it('should return the names of xml file under the `tests/fixtures/emulation` path', function () {
                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join('some/path', common.EMULATIONS_DIR_PATH)) {
                        cb(null, ['no-emulation.doc', 'emulation1.xml', 'emulation2.xml', 'emulation3.xml', 'no-emulation', 'no-emulation.txt', 'emulation4.xml']);
                    } else {
                        cb(new Error('No such file or directory'));
                    }
                });
                var adx = new ADX('some/path');
                var wasCalled = false;
                adx.getEmulationList(function (err, list) {
                    wasCalled = true;
                    expect(list).toEqual(['emulation1.xml', 'emulation2.xml', 'emulation3.xml','emulation4.xml'])
                });
                expect(wasCalled).toBe(true);
            });
        });

        describe('#destroy', function () {

            it('should call the #destroy method of the #_adxShell', function () {
                var adx = new ADX('some/path');
                var spy = spyOn(adx._adxShell, 'destroy');
                adx.destroy();
                expect(spy).toHaveBeenCalled();
            });

            it('should call the #clear method of the #interviews', function () {
                var adx = new ADX('some/path');
                var spy = spyOn(adx.interviews, 'clear');
                adx.destroy();
                expect(spy).toHaveBeenCalled();
            });

        });

        describe(".generate", function () {

            it("should be a static function", function () {
               expect(typeof ADX.generate).toBe('function');
            });

            it("should call the Generator#generate with the `type`, `name` and `options` arguments", function () {
                var opt = {}, t = 'adc', n = 'test', options, name, type;
                spies.generate.andCallFake(function (a, b, c) {
                    type = a;
                    name = b;
                    options = c;
                });
                ADX.generate(t, n, opt);
                expect(type).toBe(t);
                expect(name).toBe(n);
                expect(options).toBe(opt);
            });

            it("should not call the Generator#generate with the `callback` when  the `options` is not defined", function () {
                var cb = function () {}, t = 'adc', n = 'test', callback, name, type;
                spies.generate.andCallFake(function (a, b, c) {
                    type = a;
                    name = b;
                    callback = c;
                });
                ADX.generate(t, n, cb);
                expect(type).toBe(t);
                expect(name).toBe(n);
                expect(callback).not.toBe(cb);
            });

            it("should call the Generator#generate with different `callback` arguments", function () {
                var cb = function (){}, callback;
                spies.generate.andCallFake(function (a, b, c, d) {
                    callback = d;
                });
                ADX.generate('', '', {}, cb);
                expect(typeof callback).toBe('function');
                expect(callback).not.toBe(cb);
            });

            it("should call the callback with a Error from the generator", function () {
                var err = new Error("fake");
                spies.generate.andCallFake(function (a, b, c, d) {
                    d(err);
                });
                var callbackErr;
                ADX.generate('', '', {}, function (e) {
                    callbackErr = e;
                });
                expect(err).toBe(callbackErr);
            });

            it("should call the callback with a new instance of the ADX initialize with the outputPath", function () {
                spies.generate.andCallFake(function (a, b, c, d) {
                    d(null, '/output/path');
                });
                var adx;
                ADX.generate('', '', {}, function (err, inst) {
                    adx = inst;
                });
                expect(adx instanceof ADX).toBe(true);
                expect(adx.path).toBe('\\output\\path');
            });
        });

        describe(".getTemplateList", function () {
           it("should return the list of template", function () {
               spies.getTemplateList.andCallFake(function (type, cb) {
                  cb(null, [{
                      name : 'template1',
                      path : 'path/of/template1'
                  },{
                      name : 'template2',
                      path : 'path/of/template2'
                  }]);
               });
               ADX.getTemplateList('adc', function (err, dirs) {
                  expect(dirs).toEqual([{
                      name : 'template1',
                      path : 'path/of/template1'
                  },{
                      name : 'template2',
                      path : 'path/of/template2'
                  }]);
               });
           });
        });

        describe('.preferences', function () {
            it("should be an instance of the Preferences object", function () {
                expect(ADX.preferences).toBe(preferences);
            });
        });

    });
});