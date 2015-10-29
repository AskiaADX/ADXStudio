/* global describe, it, beforeEach, afterEach, spyOn, expect, runs, waitsFor, process */
describe('appSettings', function () {
    var appSettings,  fs = require('fs'),  spies, fakeStats;
    var pathHelper = require('path');


    beforeEach(function () {
        var cacheKey = require.resolve("../../app/appSettings/appSettingsModel.js");
        delete require.cache[cacheKey];

        process.env.APPDATA = '/username.domain/AppData/Roaming';
        appSettings = require("../../app/appSettings/appSettingsModel.js");

        spies = {
            fs: {
                stat: spyOn(fs, 'stat'),
                statSync: spyOn(fs, 'statSync'),
                readFile : spyOn(fs, 'readFile'),
                writeFile : spyOn(fs, 'writeFile')
            }
        };

        fakeStats = {
            isDirectory: function () {
                return true;
            }
        };

        spies.fs.stat.andCallFake(function (dir, cb) {
            cb(null, fakeStats);
        });


        spies.fs.statSync.andCallFake(function (file) {
            var value = (/file/.test(file));
            return {
                isFile: function () {
                    return value;
                }
            };
        });
    });

    function runSync(fn) {
        var wasCalled = false;
        runs(function () {
            fn(function () {
                wasCalled = true;
            });
        });
        waitsFor(function () {
            return wasCalled;
        });
    }


    describe('#getAppDataPath', function () {
        it("Should be a function", function () {
            expect(typeof appSettings.getAppDataPath).toBe('function');
        });

        it('should return the path of the USER_DATA suffix with ADXStudio', function () {
            var appDataPath = appSettings.getAppDataPath();
            expect(appDataPath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio'));
        });
    });

    describe('#getMostRecentlyUsed', function () {
        it("Should be a function", function () {
            expect(typeof appSettings.getMostRecentlyUsed).toBe('function');
        });

        it('should read the MRU.json file under the APPDATA/ADXStudio', function () {
            var readPath;
            spies.fs.readFile.andCallFake(function (filePath) {
                readPath = filePath;
            });
            appSettings.getMostRecentlyUsed(function () {});
            expect(readPath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio', 'MRU.json'));
        });

        it('should not read the MRU.json file if it was already read (in cache)', function () {
            var callCount = 0;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                callCount++;
                cb(null, '[{"path" : "A"}, {"path" : "B"}]');
            });
            runSync(function (done) {
                appSettings.getMostRecentlyUsed(function () {
                    appSettings.getMostRecentlyUsed(function () {
                        expect(callCount).toEqual(1);
                        done();
                    });
                });
            });
        });

        it('should return an error when the MRU.json could not be accessible', function () {
            var sendError = new Error("ENOFILE"), returnError;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(sendError);
            });
            appSettings.getMostRecentlyUsed(function (err) {
                returnError = err;
            });
            expect(sendError).toBe(returnError);
        });

        it('should return an empty array  when the MRU.json could not be accessible', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(new Error("Error"));
            });
            appSettings.getMostRecentlyUsed(function (err, data) {
                result = data;
            });
            expect(result).toEqual([]);
        });

        it('should return an array with the deserialized content of the MRU.json file', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '[{"path" : "A"}, {"path" : "B"}]');
            });
            appSettings.getMostRecentlyUsed(function (err, data) {
                result = data;
            });
            expect(result).toEqual([{path : 'A'}, {path : 'B'}]);
        });
    });

    describe('#clearCache', function () {
        it('should be a function', function () {
            expect(typeof appSettings.clearCache).toEqual('function');
        });

        it('should clear the cache of the MRU', function () {
            var callCount = 0;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                callCount++;
                cb(null, '[{"path" : "A"}, {"path" : "B"}]');
            });
            runSync(function (done) {
                appSettings.getMostRecentlyUsed(function () {
                    appSettings.clearCache();
                    appSettings.getMostRecentlyUsed(function () {
                        expect(callCount).toEqual(2);
                        done();
                    });
                });
            });
        });
    });

    describe('#addMostRecentlyUsed', function () {
        it("Should be a function", function () {
            expect(typeof appSettings.addMostRecentlyUsed).toBe('function');
        });

        it('should get the most recently used items', function () {
            var spy = spyOn(appSettings, 'getMostRecentlyUsed');
            appSettings.addMostRecentlyUsed({ path : 'test'});
            expect(spy).toHaveBeenCalled();
        });

        it('should return append a new item on top of the MRU array and write it in the MRU.json', function () {
            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            runSync(function (done) {
                spies.fs.writeFile.andCallFake(function (filePath, data) {
                    expect(filePath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio', 'MRU.json'));
                    expect(data).toEqual(JSON.stringify([{
                        path : 'test'
                    }, {
                        path : 'A'
                    }, {
                        path : 'B'
                    }]));
                    done();
                });


                appSettings.addMostRecentlyUsed({ path : 'test'});
            });
        });

        it('should not append the item twice, but move it on top of the MRU array', function () {
            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            runSync(function (done) {
                spies.fs.writeFile.andCallFake(function (filePath, data) {
                    expect(data).toEqual(JSON.stringify([{
                        path : 'B'
                    }, {
                        path : 'A'
                    }]));
                    done();
                });


                appSettings.addMostRecentlyUsed({ path : 'B'});
            });
        });

        it('should update the MRU cache', function () {
            var callCount = 0;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                callCount++;
                cb(null, '[{"path" : "A"}, {"path" : "B"}]');
            });
            spies.fs.writeFile.andCallFake(function (filePath, data, options, cb) {
                cb(null);
            });
            runSync(function (done) {
                appSettings.addMostRecentlyUsed({ path : 'C'}, function () {
                    appSettings.getMostRecentlyUsed(function (err, mru) {
                        expect(callCount).toEqual(1);
                        expect(mru).toEqual([
                            {path : 'C'},
                            {path : 'A'},
                            {path : 'B'}
                        ]);
                        done();
                    });
                });
            });
        });

        it('should return an error when cannot write into the file', function () {
            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            runSync(function (done) {
                var theError = new Error("The error");
                spies.fs.writeFile.andCallFake(function (filePath, data, options,  cb) {
                    cb(theError);
                });

                appSettings.addMostRecentlyUsed({ path : 'B'}, function (err) {
                    expect(err).toBe(theError);
                    done();
                });
            });
        })

    });

    describe('#getInitialProject', function () {
        it("Should be a function", function () {
            expect(typeof appSettings.getInitialProject).toBe('function');
        });

        it('should return the path of the most recently used project', function () {

            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            runSync(function (done) {
                appSettings.getInitialProject(function (projectPath) {
                    expect(projectPath).toBe('A');
                    done();
                });
            });
        });

    });

});
