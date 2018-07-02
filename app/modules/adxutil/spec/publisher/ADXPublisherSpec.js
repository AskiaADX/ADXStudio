describe('ADXPublisher', function(){
    var fs					= require('fs'),
        path                = require('path'),
        spies               = {},
        ADXPublisher 		= require("../../app/publisher/ADXPublisher.js"),
        Publisher           = ADXPublisher.Publisher,
        platforms           = ADXPublisher.platforms,
        common				= require('../../app/common/common.js'),
        successMsg          = common.messages.success,
        errMsg				= common.messages.error,
        Configurator 		= require('../../app/configurator/ADXConfigurator.js').Configurator,
        preferences         = require('../../app/preferences/ADXPreferences.js'),
        Builder   			= require('../../app//builder/ADXBuilder.js').Builder;


    function PublisherFake(configurator, preferences, options) {
        this.configurator = configurator;
        this.preferences = preferences;
        this.options = options;
        this.afterConstructor.apply(this, arguments);
    }
    
    PublisherFake.prototype.afterConstructor = function () {};
    PublisherFake.prototype.publish = function (callback) {};

    beforeEach(function() {
        platforms['Fake'] = {
            PublisherFake : PublisherFake
        };
        spies.subPublisher = {
            constructor : spyOn(PublisherFake.prototype, 'afterConstructor'),
            publish : spyOn(PublisherFake.prototype, 'publish')
        };

        spies.subPublisher.publish.andCallFake(function (cb) {cb();});

        spies.readPreferences = spyOn(preferences, 'read');

        spies.readPreferences.andCallFake(function(a, cb) {
            cb({});
        });
        spies.configurator = {
            load : spyOn(Configurator.prototype, 'load')
        };
        spies.configurator.load.andCallFake(function (cb) {
            cb(null);
        });
        
        spies.builder = {
            build : spyOn(Builder.prototype, 'build')
        };
        spies.builder.build.andCallFake(function (opts, cb){
            cb(null);
        });

        // Court-circuit the validation outputs
        spies.writeError   = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.writeWarning = spyOn(common, 'writeWarning');
    });

    function runSync(fn) {
        var wasCalled = false;
        runs( function () {
            fn(function () {
                wasCalled = true;
            });
        });
        waitsFor( function () {
            return wasCalled;
        });
    }
    
    describe("#constructor", function() {

        it("should set the property #adxDirectoryPath with the path in arg", function () {
            var publisher = new Publisher("my/path");
            expect(publisher.adxDirectoryPath).toEqual(path.normalize("my/path"));
        });

        it("should set the property #adxDirectoryPath with the process.cwd if the path is not defined", function () {
            spyOn(process, 'cwd').andReturn('cwd/');

            var publisher = new Publisher();
            expect(publisher.adxDirectoryPath).toEqual("cwd/");
        });
    });

    describe("#publish", function() {


        it("should return an error when the platform argument is unknown", function() {
            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish("unknown publisher", null, function (err) {
                    expect(err.message).toEqual(errMsg.invalidPlatformArg);
                    done();
                });
            });
        });

        it("should return an error when the `platform` argument is not specified", function() {
            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish(undefined, null, function (err) {
                    expect(err.message).toEqual(errMsg.missingPlatformArg);
                    done();
                });
            });
        });

        it("should build the project before publish it", function () {
            runSync(function (done) {

                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', {} , function (err) {
                    expect(spies.builder.build).toHaveBeenCalled();
                    done();
                });
            });
        });

        it("should return the builder error when failed to build the project", function () {
            runSync(function (done) {
                var error = new Error("an error");
                spies.builder.build.andCallFake(function (opts, cb) {
                    cb(error);
                });

                var publisher = new Publisher("/my/path");
                publisher.publish("Fake", {}, function (err) {
                    expect(err).toBe(error);
                    done();
                });
            });
        });

        it("should try to load the configuration with the adx directory path", function () {
            runSync(function (done) {
                spies.configurator.load.andCallFake(function () {
                    expect(this.path).toEqual(path.normalize("/my/path"));
                    done();
                });

                var publisher = new Publisher("/my/path");
                publisher.publish("Fake", {});
            });
        });

        it("should return the configuration error when failed to load the configuration", function () {
            runSync(function (done) {
                var error = new Error("an error");
                spies.configurator.load.andCallFake(function (cb) {
                    cb(error);
                });

                var publisher = new Publisher("/my/path");
                publisher.publish("Fake", {}, function (err) {
                    expect(err).toBe(error);
                    done();
                });
            });
        });


        it("should instantiate the right `platform`", function() {
            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', {}, function (err) {
                    expect(spies.subPublisher.constructor).toHaveBeenCalled();
                    done();
                });
            });
        });

        it("should instantiate the right `platform` with configurator, preferences and options", function() {
            var prefs = {'key' : 'value'};
            spies.readPreferences.andCallFake(function(a, cb) {
                cb(prefs);
            });
            var conf;
            spies.configurator.load.andCallFake(function (cb) {
                conf = this;
                cb(null);
            });
            runSync(function (done) {
                var opts = {opt1 : 'value1'};
                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', opts , function (err) {
                    expect(spies.subPublisher.constructor).toHaveBeenCalledWith(conf, prefs, opts);
                    done();
                });
            });
        });

        it("should return an error when the `platform` return an error", function () {
            var subPublisherError = new Error("SOMETHING WRONG");
            spies.subPublisher.publish.andCallFake(function (cb) {
                cb(subPublisherError);
            });

            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', {}, function (err) {
                    expect(err).toBe(subPublisherError);
                    done();
                });
            });
        });

        it("should write the error message using common#writeError when the publish failed", function () {
            var subPublisherError = new Error("SOMETHING WRONG");
            spies.subPublisher.publish.andCallFake(function (cb) {
                cb(subPublisherError);
            });

            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', {}, function (err) {
                    expect(spies.writeError).toHaveBeenCalledWith(errMsg.publishFailed, "Fake");
                    done();
                });
            });
        });

        it("should write the success message using common#writeSuccess when the publish succeed", function () {
            spies.subPublisher.publish.andCallFake(function (cb) {
                cb(null);
            });

            runSync(function (done) {
                var publisher = new Publisher("/my/path");
                publisher.publish('Fake', {}, function (err) {
                    expect(spies.writeSuccess).toHaveBeenCalledWith(successMsg.publishSucceed, "Fake");
                    done();
                });
            });
        });
    });

    describe("static .publish", function () {
        it("should call the #publish method a new publisher instance with the right `path` arg", function () {
            runSync(function (done) {
                spies.subPublisher.constructor.andCallFake(function (conf, prefs, opts) {
                    expect(conf.path).toEqual(path.normalize("my/path"));
                    done();
                });

                ADXPublisher.publish({}, "Fake", "my/path");
            });
        });
    });

    function testLogger(method) {
        var className = method.toLowerCase().replace('write', '');
        describe('#'  + method, function () {
            it('should call the `common.' + method + '` when no #logger is defined', function () {
                var publisherInstance = new Publisher("/my/path");
                publisherInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should call the `common.' + method + '` when the #logger is defined but without the ' + method + ' method.', function () {
                var publisherInstance = new Publisher("/my/path");
                publisherInstance.logger = {};
                publisherInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should not call the `common.' + method + '` when the #logger is defined with the ' + method + ' method.', function () {
                var publisherInstance = new Publisher("/my/path");
                publisherInstance.logger = {};
                publisherInstance.logger[method] = function () {};
                publisherInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).not.toHaveBeenCalled();
            });

            it('should call the `logger.' + method + '` when it\'s defined', function () {
                var publisherInstance = new Publisher("/my/path");
                publisherInstance.logger = {};
                publisherInstance.logger[method] = function () {};
                var spy = spyOn(publisherInstance.logger, method);
                publisherInstance[method]('a message', 'arg 1', 'arg 2');
                expect(spy).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should wrap the message inside a div with the `' + className + '` when the printMode=html', function () {
                var publisherInstance = new Publisher("/my/path");
                publisherInstance.printMode = 'html';
                publisherInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('<div class="' + className + '">a message</div>', 'arg 1', 'arg 2');
            });
        });
    }

    ['writeMessage', 'writeSuccess', 'writeWarning', 'writeError'].forEach(testLogger);
});