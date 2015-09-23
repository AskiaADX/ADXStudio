describe('explorer', function () {
    var explorer, fs, fsExtra, chokidar, spies, fakeStats;
    var util        = require("util");
    var EventEmitter = require("events").EventEmitter;
    var pathHelper = require('path');
    function FakeWatcher(path) {
        EventEmitter.call(this);
        this.path = path;
    }

    util.inherits(FakeWatcher, EventEmitter);
    FakeWatcher.prototype.close = function () {};

    beforeEach(function () {
        var explorerCacheKey = require.resolve("../../app/explorer/explorerModel.js");
        delete require.cache[explorerCacheKey];

        explorer = require("../../app/explorer/explorerModel.js");

        fs = require('fs');
        fsExtra = require('fs.extra');
        chokidar = require('chokidar');
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
            chokidar: {
                watch: spyOn(chokidar, 'watch')
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
    });

    describe('#watch', function () {
        it("Should be a function", function () {
            expect(typeof explorer.watch).toBe('function');
        });

        it("Should throw an exception when no argument", function () {
            expect(function () {
                explorer.watch();
            }).toThrow(new Error('Invalid argument'));
        });

        it("Should watch the `path` specified in args", function () {
            runSync(function (done) {
                spies.chokidar.watch.andCallFake(function (path) {
                    var watcher = new FakeWatcher();
                    expect(path).toBe('path/to/watch');
                    done();
                    return watcher;
                });
                explorer.watch('path/to/watch');
            });
        });

        it("Should close the previous watcher", function () {
            runSync(function (done) {
                var oldWatcher;
                spies.chokidar.watch.andCallFake(function (path) {
                    var watcher = new FakeWatcher(path);
                    if (path === 'path/to/unwatch') {
                        oldWatcher = watcher;
                        oldWatcher.close = function () {
                            expect(true).toBe(true);
                            done();
                        };
                    }
                    return watcher;
                });

                explorer.watch('path/to/unwatch');
                explorer.watch('path/to/watch');
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


        ['add', 'addDir', 'unlink', 'unlinkDir'].forEach(function (eventName) {
            it('Should trigger the `change` event when the watcher raise `' + eventName + '`', function () {
                var watcher;
                spies.chokidar.watch.andCallFake(function (path) {
                    watcher = new FakeWatcher(path);
                    return watcher;
                });
                runSync(function (done) {
                    function onchange(dir, files) {
                        expect(dir).toBe(pathHelper.normalize('path/that/has'));
                        var arr = [];
                        files.forEach(function (f) {
                            arr.push(f.name);
                        });
                        expect(arr).toEqual(['afolder', 'bfolder', 'folder1', 'folder2', 'folder3', 'afile', 'file1', 'file2', 'file3']);
                        done();
                    }

                    explorer.on('change', onchange);
                    explorer.watch('path');
                    watcher.emit(eventName, 'path/that/has/changed');
                });
            });
        });

        /**
         * watcher
         .on('add', function(path) { log('File', path, 'has been added'); })
         .on('change', function(path) { log('File', path, 'has been changed'); })
         .on('unlink', function(path) { log('File', path, 'has been removed'); })
         // More events.
         .on('addDir', function(path) { log('Directory', path, 'has been added'); })
         .on('unlinkDir', function(path) { log('Directory', path, 'has been removed'); })
         .on('error', function(error) { log('Error happened', error); })
         .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
         .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })

         // 'add', 'addDir' and 'change' events also receive stat() results as second
         // argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
         watcher.on('change', function(path, stats) {
  if (stats) console.log('File', path, 'changed size to', stats.size);
});
         */

        it('Should trigger the `change`event after rename.', function () {

            spies.fs.rename.andCallFake(function (oldPath, newPath, callback) {
                callback(null);
            });

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
                explorer.rename('path/old', 'path/new');
            });

        });

        it('Should trigger the `change`event after remove.', function () {
            spies.fsExtra.rmrf.andCallFake(function (path, callback) {
                callback(null);

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
                    explorer.remove('path');
                });
            });
        });
    });
});
