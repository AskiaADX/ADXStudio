describe('ADXImport', function () {

    var common,
        InteractiveADXShell,
        adxImport,
        Import,
        spies = {},
        errMsg,
        successMsg,
        pathHelper = require('path');

    beforeEach(function () {
        // Clean the cache, obtain a fresh instance of the adxImport each time
        var adxImportKey   = require.resolve('../../app/import/ADXImport.js'),
            commonKey       = require.resolve('../../app/common/common.js');

        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        delete require.cache[adxImportKey];
        adxImport = require('../../app/import/ADXImport.js');

        Import = adxImport.Import;

        // Messages
        errMsg      = common.messages.error;
        successMsg  = common.messages.success;

        // Court-circuit the validation outputs
        spies.writeError   = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.dirExists    = spyOn(common, 'dirExists');

        InteractiveADXShell  = require('../../app/common/InteractiveADXShell.js').InteractiveADXShell;
        spies.interactiveExec = spyOn(InteractiveADXShell.prototype, 'exec');
    });


    function runSync(fn) {
        var wasCalled = false;
        runs( function () {
            fn(function () {
                wasCalled = true;
            });
        });
        waitsFor(function () {
            return wasCalled;
        });
    }


    describe('#import', function () {
        it("should output an error when the `sourcePath` option is not defined", function () {
            adxImport.adxImport({});
            expect(common.writeError).toHaveBeenCalledWith(errMsg.noXMLPathDefinedForImport);
        });

        it("should output an error when the `targetName` option is not defined", function () {
            adxImport.adxImport({
                sourcePath : '\\adx\\file.xml'
            });
            expect(common.writeError).toHaveBeenCalledWith(errMsg.noFileDefinedForImport);
        });

        it("should output an error when the `currentQuestion` option is not defined", function () {
            adxImport.adxImport({
                sourcePath : '\\adx\\file.xml',
                targetName : 'fixture.xml'
            });
            expect(common.writeError).toHaveBeenCalledWith(errMsg.noQuestionDefinedForImport);
        });

        it("should call the program `ADXShell.exe` with the correct arguments", function () {
            var childProc = require('child_process'),
                spyExec   = spyOn(childProc, 'execFile');

            spyOn(process, 'cwd').andReturn('');

            spyExec.andCallFake(function (file, args, options) {
                expect(file).toBe('.\\ADXShell.exe');
                expect(args).toEqual(['import', '"-sourcePath:\\adx\\file.xml"', '"-targetName:fixture.xml"', '"-currentQuestion:something"', '"\\adx\\path\\dir"']);
                expect(options.env).toEqual(common.getChildProcessEnv());
                expect(options.cwd).toEqual(pathHelper.join(pathHelper.resolve(__dirname, "../../"), common.ADX_UNIT_DIR_PATH))
            });
            adxImport.adxImport({
                sourcePath : '\\adx\\file.xml',
                targetName : 'fixture.xml',
                currentQuestion : 'something'
            }, '/adx/path/dir');

            expect(childProc.execFile).toHaveBeenCalled();
        });

        it("should run the `ADXShell` process using the InteractiveADXShell when it's defined in the options", function () {
            spyOn(process, 'cwd').andReturn('');

            var mockCommand;
            spies.interactiveExec.andCallFake(function (command) {
                mockCommand = command;
            });
            adxImport.adxImport({
                sourcePath : '\\adx\\file.xml',
                targetName : 'fixture.xml',
                currentQuestion : 'something',
                adxShell : new InteractiveADXShell()
            }, '/adx/path/dir');
            expect(mockCommand).toBe('import "-sourcePath:\\adx\\file.xml" "-targetName:fixture.xml" "-currentQuestion:something" "\\adx\\path\\dir"');
        });

        describe("API `callback`", function () {

            it("should call the `callback` function with error when an error occurred", function () {
                var ImportObj = new Import('adx/path/dir');
                runSync(function (done) {
                    ImportObj.adxImport({}, function (err) {
                        expect(err instanceof  Error).toBe(true);
                        expect(err.message).toEqual(errMsg.noXMLPathDefinedForImport);
                        done();
                    });
                });
            });

            it("should write in the console when the `silent` option is not defined", function () {
                var childProc = require('child_process'),
                    spyExec = spyOn(childProc, 'execFile');

                spyOn(process, 'cwd').andReturn('');

                spyExec.andCallFake(function (file, args, options, cb) {
                    cb(null,null, new Error("ERROR"));
                });

                var ImportObj = new Import('adx/path/dir');
                var spyWriteError = spyOn(ImportObj, 'writeError');
                runSync(function (done) {
                    ImportObj.adxImport({
                        sourcePath : '\\adx\\file.xml',
                        targetName : 'fixture.xml',
                        currentQuestion : 'something'
                    }, function () {
                        expect(spyWriteError).toHaveBeenCalled();
                        done();
                    });
                });
            });

            it("should not write in the console when the `silent` option is defined", function () {
                var childProc = require('child_process'),
                    spyExec = spyOn(childProc, 'execFile');

                spyOn(process, 'cwd').andReturn('');

                spyExec.andCallFake(function (file, args, options, cb) {
                    cb(null,null, new Error("ERROR"));
                });

                var ImportObj = new Import('adx/path/dir');
                var spyWriteError = spyOn(ImportObj, 'writeError');
                runSync(function (done) {
                    ImportObj.adxImport({
                        sourcePath : '\\adx\\file.xml',
                        targetName : 'fixture.xml',
                        currentQuestion : 'something',
                        silent : true
                    }, function () {
                        expect(spyWriteError).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            it("should write in the console when `silent` option is not defined", function () {

                var childProc = require('child_process'),
                    spyExec = spyOn(childProc, 'execFile');

                spyOn(process, 'cwd').andReturn('');

                spyExec.andCallFake(function (file, args, options, cb) {
                    cb(null, 'TEST OUTPUT', null);
                });

                var ImportObj = new Import('adx/path/dir');
                var spyWriteMessage = spyOn(ImportObj, 'writeMessage');
                runSync(function (done) {
                    ImportObj.adxImport({
                        sourcePath : '\\adx\\file.xml',
                        targetName : 'fixture.xml',
                        currentQuestion : 'something'
                    }, function (err, output) {
                        expect(spyWriteMessage).toHaveBeenCalled();
                        done();
                    });
                });
            });

            it("should not write in the console when `silent` option is defined", function () {

                var childProc = require('child_process'),
                    spyExec = spyOn(childProc, 'execFile');

                spyOn(process, 'cwd').andReturn('');

                spyExec.andCallFake(function (file, args, options, cb) {
                    cb(null, 'TEST OUTPUT', null);
                });

                var ImportObj = new Import('adx/path/dir');
                var spyWriteMessage = spyOn(ImportObj, 'writeMessage');
                runSync(function (done) {
                    ImportObj.adxImport({
                        sourcePath : '\\adx\\file.xml',
                        targetName : 'fixture.xml',
                        currentQuestion : 'something',
                        silent : true
                    }, function (err, output) {
                        expect(spyWriteMessage).not.toHaveBeenCalled();
                        done();
                    });
                });
            });
        });
    });
});

