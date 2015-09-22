describe('explorer', function () {
    var explorer, fs, spies, fakeStats;

    beforeEach(function () {
        explorer = require("../../app/explorer/explorerModel.js");
        fs = require('fs');

        spies = {
            fs: {
                stat: spyOn(fs, 'stat'),
                statSync: spyOn(fs, 'statSync'),
                readdir: spyOn(fs, 'readdir'),
                rename: spyOn(fs, 'rename'),
                unlink: spyOn(fs, 'unlink')
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
                isFile :function () {
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

    describe('#rename', function() {

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

            spies.fs.rename.andCallFake(function(oldPath, newPath, callback) {
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

    describe('events', function() {

      it('Should inherit of eventListener from nodeJS.', function () {
        expect(typeof explorer.on).toBe('function');
        expect(typeof explorer.addListener).toBe('function');
        expect(typeof explorer.removeListener).toBe('function');
        expect(typeof explorer.emit).toBe('function');
      });

      it('Should trigger the `change`event after rename.', function () {

        spies.fs.rename.andCallFake(function(oldPath, newPath, callback) {
           callback(null);
        });

        runSync(function(done) {
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

      it('Should trigger the `change`event after remove.', function() {

        spies.fs.unlink.andCallFake(function(path, callback) {
           callback(null);
           
           runSync(function(done) {
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
