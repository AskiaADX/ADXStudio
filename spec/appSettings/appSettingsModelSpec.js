/* global describe, it, beforeEach, afterEach, spyOn, expect, runs, waitsFor, process */
describe('appSettings', function () {
    var appSettings,  fs = require('fs'),  spies, fakeStats;
    var pathHelper = require('path');
    var ADX = require('../modules/adxutil').ADX;

    beforeEach(function () {
        var cacheKey = require.resolve("../../app/appSettings/appSettingsModel.js");
        delete require.cache[cacheKey];

        process.env.APPDATA = '/username.domain/AppData/Roaming';
        process.env.USERPROFILE = '/username.domain';
        appSettings = require("../../app/appSettings/appSettingsModel.js");

        spies = {
            ADXPref : {
                read : spyOn(ADX.preferences, 'read'),
                write : spyOn(ADX.preferences, 'write')
            },
            fs: {
                stat: spyOn(fs, 'stat'),
                statSync: spyOn(fs, 'statSync'),
                mkdir   : spyOn(fs, 'mkdir'),
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
                isDirectory : function () {
                    return true;
                },
                isFile: function () {
                    return value;
                }
            };
        });

        spies.fs.mkdir.andCallFake(function (dir, cb) {
            cb(null);
        });

        spies.ADXPref.read.andCallFake(function (options, cb) {
            cb({
                author : {
                    name : 'AuthName',
                    email : 'AuthEmail@domain.ext',
                    company : 'AuthCompany',
                    webSite : 'AuthWebSite'
                }
            });
        });

        spies.ADXPref.write.andCallFake(function (prefs, cb) {
            ADX.preferences.read({}, cb);
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

        it('should include only existing paths in the return array', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '[{"path" : "A"}, {"path" : "B"}]');
            });
            spies.fs.statSync.andCallFake(function (dir) {
                if (dir === 'A') {
                    throw new Error('no such file or directory');
                }
                return fakeStats;
            });
            appSettings.getMostRecentlyUsed(function (err, data) {
                result = data;
            });
            expect(result).toEqual([{path : 'B'}]);
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

        it('should try to create the AppData directory for ADXStudio', function () {
            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });
            runSync(function (done) {
                spies.fs.mkdir.andCallFake(function (dirPath) {
                    expect(dirPath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio'));
                    done();
                });

                appSettings.addMostRecentlyUsed({ path : 'test'});
            });
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

    describe('#getPreferences', function () {
        it("should be a function", function () {
            expect(typeof appSettings.getPreferences).toBe('function');
        });

        it('should read the Prefs.json file under the APPDATA/ADXStudio', function () {
            var readPath;
            spies.fs.readFile.andCallFake(function (filePath) {
                readPath = filePath;
            });
            appSettings.getPreferences(function () {});
            expect(readPath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio', 'Prefs.json'));
        });

        it('should read the preferences of ADXUtil', function () {
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here"}');
            });
            appSettings.getPreferences(function () {});
            expect(spies.ADXPref.read).toHaveBeenCalled();
        });


        it('should return the default preferences when the Prefs.json and the ADXUtil prefs are not accessible', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(new Error("Error"));
            });
            spies.ADXPref.read.andCallFake(function (options, cb) {
                cb(null);
            });
            appSettings.getPreferences(function (data) {
                result = data;
            });
            expect(result).toEqual({
                defaultProjectsLocation : pathHelper.join(process.env.USERPROFILE, 'Documents'),
                openLastProjectByDefault : true
            });
        });

        it('should return the preferences from the Prefs.json and the ADXUtil when it\'s accessible', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });
            appSettings.getPreferences(function (data) {
                result = data;
            });
            expect(result).toEqual({
                defaultProjectsLocation : "Here",
                openLastProjectByDefault : false,
                author : {
                    name : 'AuthName',
                    email : 'AuthEmail@domain.ext',
                    company : 'AuthCompany',
                    webSite : 'AuthWebSite'
                }
            });
        });

        it('should update the preferences with the default preferences when there are missing keys', function () {
            var result;
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"another_key": "Here"}');
            });
            appSettings.getPreferences(function (data) {
                result = data;
            });
            expect(result).toEqual({
                another_key : "Here",
                defaultProjectsLocation : pathHelper.join(process.env.USERPROFILE, 'Documents'),
                openLastProjectByDefault : true,
                author : {
                    name : 'AuthName',
                    email : 'AuthEmail@domain.ext',
                    company : 'AuthCompany',
                    webSite : 'AuthWebSite'
                }
            });
        });

    });

    describe('#setPreferences', function () {
        it("should be a function", function () {
            expect(typeof appSettings.setPreferences).toBe('function');
        });

        it("should re-read the preferences from the file, merge it with the preferences in args and write the final prefs in the Prefs.json", function () {
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });

            runSync(function (done) {
                spies.fs.writeFile.andCallFake(function (filePath,  data) {
                    expect(filePath).toEqual(pathHelper.join(process.env.APPDATA, 'ADXStudio', 'Prefs.json'));
                    expect(data).toEqual(JSON.stringify({
                        defaultProjectsLocation : "ElseWhere",
                        openLastProjectByDefault : true
                    }));
                    done();
                });

                appSettings.setPreferences({
                    defaultProjectsLocation : "ElseWhere",
                    openLastProjectByDefault : true
                });
            });
        });

        it("should return an error via the callback when writing in the Prefs.json file failed", function () {
            var throwError = new Error("Error");
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });
            spies.fs.writeFile.andCallFake(function (filePath,  data, options, cb) {
               cb(throwError);
            });

            runSync(function (done) {
                appSettings.setPreferences({
                    defaultProjectsLocation : "ElseWhere",
                    openLastProjectByDefault : true
                }, function (err) {
                    expect(err).toBe(throwError);
                    done();
                });
            });
        });

        it("should write the ADXUtil preferences when it's defined and when writing in Prefs.json succeed", function () {
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });
            spies.fs.writeFile.andCallFake(function (filePath,  data, options, cb) {
                cb(null);
            });

            runSync(function (done) {
                spies.ADXPref.write.andCallFake(function (prefs) {
                    expect(prefs).toEqual({
                        author : {
                            name : 'NewAuthName',
                            email : 'NewAuthEmail@domain.ext',
                            company : 'NwwAuthCompany',
                            webSite : 'NewAuthWebSite'
                        }
                    });
                    done();
                });
                appSettings.setPreferences({
                    defaultProjectsLocation : "ElseWhere",
                    openLastProjectByDefault : true,
                    author : {
                        name : 'NewAuthName',
                        email : 'NewAuthEmail@domain.ext',
                        company : 'NwwAuthCompany',
                        webSite : 'NewAuthWebSite'
                    }
                });
            });
        });

        it("should not write the ADXUtil preferences when it's not defined", function () {
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });
            spies.fs.writeFile.andCallFake(function (filePath,  data, options, cb) {
                cb(null);
            });

            runSync(function (done) {
                appSettings.setPreferences({
                    defaultProjectsLocation : "ElseWhere",
                    openLastProjectByDefault : true
                }, function () {
                    expect(spies.ADXPref.write).not.toHaveBeenCalled();
                    done();
                });
            });
        });

        it("should not return an error when the prefs.json succeed and the ADXUtil.preferences.write succeed", function () {
            spies.fs.readFile.andCallFake(function (filePath, cb) {
                cb(null, '{"defaultProjectsLocation": "Here", "openLastProjectByDefault" : false}');
            });
            spies.fs.writeFile.andCallFake(function (filePath,  data, options, cb) {
                cb(null);
            });

            runSync(function (done) {
                appSettings.setPreferences({
                    defaultProjectsLocation : "ElseWhere",
                    openLastProjectByDefault : true,
                    author : {
                        name : "NewName"
                    }
                }, function (err) {
                    expect(err).toEqual(null);
                    done();
                });
            });
        });


    });

    describe('#getInitialProject', function () {
        it("should be a function", function () {
            expect(typeof appSettings.getInitialProject).toBe('function');
        });

        it('should return the path of the most recently used project', function () {

            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            spyOn(appSettings, 'getPreferences').andCallFake(function (cb) {
                cb({
                    openLastProjectByDefault : true
                });
            });

            runSync(function (done) {
                appSettings.getInitialProject(function (projectPath) {
                    expect(projectPath).toBe('A');
                    done();
                });
            });
        });

        it('should return an empty string when there is not most recently used project', function () {
            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, []);
            });

            spyOn(appSettings, 'getPreferences').andCallFake(function (cb) {
                cb({
                    openLastProjectByDefault : true
                });
            });

            runSync(function (done) {
                appSettings.getInitialProject(function (projectPath) {
                    expect(projectPath).toEqual('');
                    done();
                });
            });
        });

        it('should return an empty string when the `openLastProjectByDefault` preference is false', function () {

            spyOn(appSettings, 'getMostRecentlyUsed').andCallFake(function (cb) {
                cb(null, [{"path" : "A"}, {"path" : "B"}]);
            });

            spyOn(appSettings, 'getPreferences').andCallFake(function (cb) {
                cb({
                    openLastProjectByDefault : false
                });
            });

            runSync(function (done) {
                appSettings.getInitialProject(function (projectPath) {
                    expect(projectPath).toEqual('');
                    done();
                });
            });
        });

    });

});
