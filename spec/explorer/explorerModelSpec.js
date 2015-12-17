/* global describe, it, beforeEach, afterEach, spyOn, expect, runs, waitsFor */
describe('explorer', function () {
    "use strict";
    
    var explorer, watcher, fs, fsExtra,  spies, fakeStats;
    var util        = require("util");
    var EventEmitter = require("events").EventEmitter;
    var pathHelper = require('path');
    function FakeWatcher(path) {
        EventEmitter.call(this);
        this.path = path;
    }

    util.inherits(FakeWatcher, EventEmitter);
    FakeWatcher.prototype.add = function () {};
    FakeWatcher.prototype.remove = function () {};
    FakeWatcher.prototype.close = function () {};

    beforeEach(function () {
        var explorerCacheKey = require.resolve("../../app/explorer/explorerModel.js");
        delete require.cache[explorerCacheKey];

        explorer = require("../../app/explorer/explorerModel.js");
        watcher = require('../../app/modules/watcher/watcher.js');

        fs = require('fs');
        fsExtra = require('fs.extra');

        spies = {
            fs: {
                stat: spyOn(fs, 'stat'),
                statSync: spyOn(fs, 'statSync'),
                readdir: spyOn(fs, 'readdir'),
                rename: spyOn(fs, 'rename'),
                unlink: spyOn(fs, 'unlink')
            },
            fsExtra: {
                rmrf: spyOn(fsExtra, 'rmrf')
            },
            watcher : {
                create : spyOn(watcher, 'create')
            }
        };

        spies.fs.readdir.andCallFake(function (dir, cb) {
            cb(null, ['file2', 'file1', 'afile', 'folder2', 'bfolder', 'file3', 'afolder', 'folder1', 'folder3']);
        });

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

        spies.watcher.create.andCallFake(function (pattern) {
            return new FakeWatcher(pattern);
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


    describe('#getRootPath', function () {
        it("Should be a function", function () {
            expect(typeof explorer.getRootPath).toBe('function');
        });

        it("Should return the path of the root directory", function () {
            explorer.load('/root/path/', true, function () {});
            var root = explorer.getRootPath();
            expect(root).toEqual(pathHelper.resolve('/root/path/'));
        });
    });


    describe('#setRootPath', function () {
        it("Should be a function", function () {
            expect(typeof explorer.setRootPath).toBe('function');
        });

        it("Should set the path of the root directory", function () {
            explorer.load('/root/path/', true, function () {});
            explorer.setRootPath('another/root');
            var root = explorer.getRootPath();
            expect(root).toEqual(pathHelper.resolve('another/root'));

        });

        it("Should create a new instance of watcher", function () {
            explorer.setRootPath('path/to/root');
            expect(spies.watcher.create).toHaveBeenCalled();
        });

    });

    describe('#initWatcher', function () {
        it("Should be a function", function () {
            expect(typeof explorer.initWatcher).toBe('function');
        });

        it("Should create a new instance of watcher", function () {
            var before = explorer._watcher;
            expect(before).toBe(undefined);
            explorer.initWatcher();
            expect(explorer._watcher instanceof  FakeWatcher).toBe(true);
        });

        it("Should close the previous instance of the watcher", function () {
            explorer.initWatcher();
            var spy = spyOn(explorer._watcher, 'close');
            explorer.initWatcher();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('#load', function () {

        it("Should be a function", function () {
            expect(typeof explorer.load).toBe('function');
        });

        it("Should throw an exception when callback argument is undefined", function () {
            expect(function () {
                explorer.load();
            }).toThrow(new Error('Invalid argument, expected callback'));
        });

        it("Should return an exception when dir argument is not a string.", function () {
            runSync(function (done) {
                explorer.load(12345, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            })
        });

        it("Should return an error when it's not a valid directory path", function () {
            spies.fs.stat.andCallFake(function (dir, cb) {
                cb(new Error());
            });
            runSync(function (done) {
                explorer.load('joke', function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("Should not return an error when it's a valid directory path", function () {
            runSync(function (done) {
                explorer.load('C:\\', function (err) {
                    expect(err instanceof Error).toBe(false);
                    done();
                });
            });
        });

        it("should call `setRootPath` when the second argument is a boolean value set to true", function () {
            runSync(function (done) {
                var spy = spyOn(explorer, 'setRootPath');
                explorer.load('/root/path/', true, function () {});
                expect(spy).toHaveBeenCalled();
                done();
            });
        });

        it("should return an array", function () {
            runSync(function (done) {
                explorer.load('C:\\', function (err, files) {
                    expect(Array.isArray(files)).toBe(true);
                    done();
                });
            });
        });

        it("should return an array of objects.", function () {
            runSync(function (done) {
                explorer.load('C:\\', function (err, files) {
                    expect(typeof files[0] == 'object' && typeof files[files.length - 1] == 'object').toBe(true);
                    done();
                });
            });
        });

        it("should return an array of objects with property name, type and path.", function () {
            runSync(function (done) {
                explorer.load('C:\\', function (err, files) {
                    expect(typeof files[0].name).toBe('string');
                    expect(typeof files[0].type).toBe('string');
                    expect(typeof files[0].path).toBe('string');
                    done();
                });
            });
        });

        it("should return an array of objects sorted by type (folder first) and then by name", function () {
            runSync(function (done) {
                explorer.load('C:\\', function (err, files) {
                    var arr = [];
                    files.forEach(function (f) {
                        arr.push(f.name);
                    });
                    expect(arr).toEqual(['afolder', 'bfolder', 'folder1', 'folder2', 'folder3', 'afile', 'file1', 'file2', 'file3']);
                    done();
                });
            });
        });

        it("should add directory on watcher", function () {
            runSync(function (done) {
                explorer.load('root', true, function () {
                    var spy = spyOn(explorer._watcher, 'add');
                    explorer.load('root/subfolder', function () {
                        expect(spy).toHaveBeenCalledWith(pathHelper.resolve('root/subfolder'));
                        done();
                    });
                });
            });
        });
    });

    describe('#rename', function () {

        it("Should be a function", function () {
            expect(typeof explorer.rename).toBe('function');
        });

        it("Should throw an exception when no argument", function () {
            expect(function () {
                explorer.rename();
            }).toThrow(new Error('Invalid argument'));
        });

        it("Should rename the file or folder with specified arguments", function () {
            runSync(function (done) {
                var oldReceived,
                    newReceived;

                spies.fs.rename.andCallFake(function (oldPath, newPath, callback) {
                    oldReceived = oldPath;
                    newReceived = newPath;
                    callback();
                });
                explorer.rename('path/old', 'path/new', function () {
                    expect(oldReceived).toBe('path/old');
                    expect(newReceived).toBe('path/new');
                    done();
                });
            })
        });
    });

    describe('#remove', function () {
        it("Should be a function", function () {
            expect(typeof explorer.remove).toBe('function');
        });

        it("Should throw an exception when no argument", function () {
            expect(function () {
                explorer.remove();
            }).toThrow(new Error('Invalid argument'));
        });

        it("Should remove a file or a directory recursively", function () {
            runSync(function (done) {
                var pathReceived;

                spies.fsExtra.rmrf.andCallFake(function (path, callback) {
                    pathReceived = path;
                    callback();
                });
                explorer.remove('path/to/remove', function () {
                    expect(pathReceived).toBe('path/to/remove');
                    done();
                });
            })
        });

    });

    describe('events', function () {

        it('Should inherit of eventListener from nodeJS.', function () {
            expect(typeof explorer.on).toBe('function');
            expect(typeof explorer.addListener).toBe('function');
            expect(typeof explorer.removeListener).toBe('function');
            expect(typeof explorer.emit).toBe('function');
        });

        it('Should trigger the `change` event when the watcher notify.', function () {
            runSync(function (done) {
                function onchange(dir, files) {
                    expect(dir).toBe('path');
                    var arr = [];
                    files.forEach(function (f) {
                        arr.push(f.name);
                    });
                    expect(arr).toEqual(['afolder', 'bfolder', 'folder1', 'folder2', 'folder3', 'afile', 'file1', 'file2', 'file3']);
                    done();
                }

                explorer.on('change', onchange);
                explorer.load('path', true, function () {
                    explorer._watcher.emit('change', null, 'path');
                });
            });

        });

    });
});