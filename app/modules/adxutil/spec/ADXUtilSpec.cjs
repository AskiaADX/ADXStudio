
describe('ADXUtil', function () {
    afterEach(function () {
        var adxUtil = require.resolve('../app/ADXUtil.cjs');
        if (adxUtil) {
            delete require.cache[adxUtil];
        }
    });


    describe('cmd `generate`', function () {
        it('should call the ADXGenerator#generate when the program args contains `generate`', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'generate',
                'adc',
                'adxname'
            ];

            var adxGenerator = require('../app/generator/ADXGenerator.cjs');
            spyOn(adxGenerator, 'generate');

            require("../app/ADXUtil.cjs");

            expect(adxGenerator.generate).toHaveBeenCalled();
        });

        it('should call the ADXGenerator#generate with the type and name arguments', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'generate',
                'adc',
                'adxname'
            ];

            var adxGenerator = require('../app/generator/ADXGenerator.cjs'),
                type, name;

            spyOn(adxGenerator, 'generate').and.callFake(function (program, t, n) {
                type = t;
                name = n;
            });

            require("../app/ADXUtil.cjs");

            expect(type).toBe('adc');
            expect(name).toBe('adxname');
        });

        it('should call the ADXGenerator#generate with the output property in `program` argument', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'generate',
                'adc',
                'adxname',
                '-o',
                'outputpath'
            ];

            var adxGenerator = require('../app/generator/ADXGenerator.cjs'),
                output;

            spyOn(adxGenerator, 'generate').and.callFake(function (program) {
                output = program.output;
            });

            require("../app/ADXUtil.cjs");

            expect(output).toBe('outputpath');
        });

        it('should call the ADXGenerator#generate with the template property in `program` argument', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'generate',
                'adc',
                'adxname',
                '-t',
                'templatename'
            ];

            var adxGenerator = require('../app/generator/ADXGenerator.cjs'),
                template;

            spyOn(adxGenerator, 'generate').and.callFake(function (program) {
                template = program.template;
            });

            require("../app/ADXUtil.cjs");

            expect(template).toBe('templatename');
        });

    });

    describe('cmd `validate`', function () {
        it('should call ADXValidator#validate when the program args contains `validate`', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'validate'
            ];

            var adxValidator = require('../app/validator/ADXValidator.cjs');
            spyOn(adxValidator, 'validate');

            require("../app/ADXUtil.cjs");

            expect(adxValidator.validate).toHaveBeenCalled();
        });

        describe('--no-test args', function () {
            function noTestArg(flag) {
                it("should call ADXValidator#validate with the `test=true` flag in `program` argument when argv doesn't contains " + flag, function () {
                    process.argv = [
                        'node',
                        'app/ADXUtil.js',
                        'validate'
                    ];

                    var adxValidator = require('../app/validator/ADXValidator.cjs');
                    spyOn(adxValidator, 'validate').and.callFake(function (program) {
                        expect(program.test).toBe(true);
                    });

                    require("../app/ADXUtil.cjs");
                });

                it("should call ADXValidator#validate with the `test=false` flag in `program` argument when argv contains " + flag, function () {
                    process.argv = [
                        'node',
                        'app/ADXUtil.js',
                        'validate',
                        flag
                    ];

                    var adxValidator = require('../app/validator/ADXValidator.cjs');
                    spyOn(adxValidator, 'validate').and.callFake(function (program) {
                        expect(program.test).toBe(false);
                    });

                    require("../app/ADXUtil.cjs");
                });
            }

            ['-T', '--no-test'].forEach(noTestArg);
        });

        describe('--no-xml  args', function () {
            function noXmlArg(flag) {
                it("should call ADXValidator#validate with the `xml=true` flag in `program` argument when argv doesn't contains " + flag, function () {
                    process.argv = [
                        'node',
                        'app/ADXUtil.js',
                        'validate'
                    ];

                    var adxValidator = require('../app/validator/ADXValidator.cjs');
                    spyOn(adxValidator, 'validate').and.callFake(function (program) {
                        expect(program.xml).toBe(true);
                    });

                    require("../app/ADXUtil.cjs");
                });

                it("should call ADXValidator#validate with the `xml=false` flag in `program` argument when argv contains " + flag, function () {
                    process.argv = [
                        'node',
                        'app/ADXUtil.js',
                        'validate',
                        flag
                    ];

                    var adxValidator = require('../app/validator/ADXValidator.cjs');
                    spyOn(adxValidator, 'validate').and.callFake(function (program) {
                        expect(program.xml).toBe(false);
                    });

                    require("../app/ADXUtil.cjs");
                });
            }

            ['-X', '--no-xml'].forEach(noXmlArg);
        });

    });

    describe('cmd `build`', function () {
        it('should call ADXBuilder#build when the program args contains `build`', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'build'
            ];

            var adxBuilder = require('../app/builder/ADXBuilder.cjs');
            spyOn(adxBuilder, 'build');

            require("../app/ADXUtil.cjs");

            expect(adxBuilder.build).toHaveBeenCalled();
        });
    });

    describe('cmd `show`', function () {
        it('should call ADXShow#show when the program args contains `show`', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'show',
                'output:fallback',
                'fixture:single.xml',
                'masterPage:masterPage.html',
                'properties:prop1=value1&prop2=value2'
            ];

            var adxShow = require('../app/show/ADXShow.cjs');
            spyOn(adxShow, 'show');

            require("../app/ADXUtil.cjs");

            expect(adxShow.show).toHaveBeenCalled();
        });
    });

    describe('cmd `publish`', function () {
        it('should call ADXPublish#publish when the program args contains `publish`', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'publish',
                'Platform'
            ];

            var adxPublish = require('../app/publisher/ADXPublisher.cjs');
            spyOn(adxPublish, 'publish');

            require("../app/ADXUtil.cjs");

            expect(adxPublish.publish).toHaveBeenCalled();
        });
    });

    describe('cmd `config`', function () {
        it('should call ADXPreferences#read when the program args contains `config` and nothing else', function () {
            process.argv = [
                'node',
                'app/ADXUtil.js',
                'config'
            ];

            var adxPreferences = require('../app/preferences/ADXPreferences.cjs');
            spyOn(adxPreferences, 'read');

            require("../app/ADXUtil.cjs");

            expect(adxPreferences.read).toHaveBeenCalled();
        });

        ['--authorName', '--authorEmail', '--authorCompany', '--authorWebsite'].forEach(function (flag) {
            it('should call ADXPreferences#write when the program args contains `config` and at least `' + flag + '`', function () {
                process.argv = [
                    'node',
                    'app/ADXUtil.js',
                    'config',
                    flag,
                    'AValue'
                ];

                var adxPreferences = require('../app/preferences/ADXPreferences.cjs');
                spyOn(adxPreferences, 'write');
                spyOn(adxPreferences, 'read');

                require("../app/ADXUtil.cjs");

                expect(adxPreferences.write).toHaveBeenCalled();
                expect(adxPreferences.read).not.toHaveBeenCalled();
            });

            it('should call ADXPreferences#write with the right option when the program args contains `config` and at least `' + flag + '`', function () {
                process.argv = [
                    'node',
                    'app/ADXUtil.js',
                    'config',
                    flag,
                    'AValue'
                ];

                var adxPreferences = require('../app/preferences/ADXPreferences.cjs');
                spyOn(adxPreferences, 'write');
                spyOn(adxPreferences, 'read');

                require("../app/ADXUtil.cjs");

                adxPreferences.write.and.callFake(function (obj) {
                    var expectation = {};
                    expectation[flag] = 'AValue';
                    expect(obj.author).toEqual(expectation);
                });
                expect(adxPreferences.write).toHaveBeenCalled();
                expect(adxPreferences.read).not.toHaveBeenCalled();
            });


        });

    });

});