/* global describe, it, beforeEach, afterEach, spyOn, expect, runs, waitsFor */
describe("Tab", function () {
    "use strict";
    var Tab,
        uuid = require('uuid'),
        fs   = require('fs'),
        nodePath = require('path'),
        spies = {};


    beforeEach(function () {
        Tab = require('../../app/workspace/TabModel.js').Tab;

        spies.isTextOrBinary = spyOn(Tab, 'isTextOrBinaryFile');
        spies.isTextOrBinary.andCallFake(function (path, cb) {
            cb(null, 'text');
        });

        spies.uuid  = spyOn(uuid, "v4").andReturn("random-guid");


        spies.fs = {};

        spies.fs.rename =  spyOn(fs, 'rename');
        spies.fs.rename.andCallFake(function (oldpath, newpath, cb) {
            cb(null);
        });

        spies.fs.stat = spyOn(fs, 'stat');
        spies.fs.stat.andCallFake(function (path, cb) {
            cb(null, {});
        });

        spies.fs.readFile = spyOn(fs, 'readFile');
        spies.fs.readFile.andCallFake(function (path, cb) {
            cb(null, "Hello world!");
        });

        spies.fs.writeFile = spyOn(fs, 'writeFile');
        spies.fs.writeFile.andCallFake(function (path, content, cb) {
            cb(null);
        });

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

    describe("#constructor", function () {
        it("should assign a GUID as the identifier of the tab", function () {
            spies.uuid.andReturn("random-guid");
            var tab = new Tab();
            expect(tab.id).toBe('random-guid');
        });

        it("should set #type, #name, #path if it's on the `config` arg", function () {
            var tab = new Tab({
                name : 'file1',
                type : 'file',
                path : 'path/of/file1'
            });
            expect(tab.name).toBe('file1');
            expect(tab.type).toBe('file');
            expect(tab.path).toBe(nodePath.resolve('path/of/file1'));
        });

        it("should set #type, #name, #path when the argument is a string", function () {
            var tab = new Tab('path/of/file1.txt');
            expect(tab.name).toBe('file1.txt');
            expect(tab.path).toBe(nodePath.resolve('path/of/file1.txt'));
        });

        it("should set the name of the tab using the path when it's defined", function () {
            var tab = new Tab({
                type : 'file',
                path : 'path/of/file1.txt'
            });
            expect(tab.name).toBe('file1.txt');
        });

        it("should have a property #edited to false", function () {
            var tab = new Tab({
                type : 'file',
                path : 'path/of/file1.txt'
            });
            expect(tab.edited).toBe(false);
        });
    });

    describe("#loadFile", function () {
        it("should set the #fileType to `text` if the file is a text file", function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.fileType).toBe('text');
            });
        });

        it("should set the #fileType to `binary` if the file is a text file", function () {
            spies.isTextOrBinary.andCallFake(function (path, cb) {
                cb(null, 'binary');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.fileType).toBe('binary');
            });
        });

        it("should set the #fileType to `image` if the file extension is recognise as image", function () {
            spies.isTextOrBinary.andCallFake(function (path, cb) {
                cb(null, 'binary');
            });
            [
                'path/to/test.gif', 'path/to/test.jpeg', 'path/to/test.jpg',
                'path/to/test.tif', 'path/to/test.tiff', 'path/to/test.png',
                'path/to/test.bmp', 'path/to/test.pdf', 'path/to/test.ico',
                'path/to/test.cur'
            ].forEach(function (p) {
                    var tab = new Tab({
                        path : p
                    });

                    tab.loadFile(function () {
                        expect(tab.fileType).toBe('image');
                    });
                });
        });

        it("should not read the file, if the file is `image`", function () {
            spies.fs.readFile.andCallFake(function (path, cb) {
                cb(null, 'Should not be set');
            });

            var tab = new Tab({
                path : 'file/to/load/test.png'
            });

            tab.loadFile(function () {
                expect(tab.content).toBe(null);
            });
        });

        it("should, if the file is `text`, read the content and assign it to the #content property", function () {
            spies.fs.readFile.andCallFake(function (path, cb) {
                cb(null, 'Hello');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.content).toBe('Hello');
            });
        });

        it("should not read the file, if the file is `binary`", function () {
            spies.isTextOrBinary.andCallFake(function (path, cb) {
                cb(null, 'binary');
            });
            spies.fs.readFile.andCallFake(function (path, cb) {
                cb(null, 'Should not be set');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.content).toBe(null);
            });
        });

        it("should set the properties #statTimes an object with the keys `modified` and `change`", function () {
            spies.isTextOrBinary.andCallFake(function (path, cb) {
                cb(null, 'binary');
            });

            var mtime = new Date(2015, 6, 16, 15, 11, 9),
                ctime = new Date(2015, 6, 16, 15, 11, 9);

            spies.fs.stat.andCallFake(function (path, cb) {
                cb(null, {
                    mtime : mtime,
                    ctime : ctime
                });
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.statTimes.modified).toEqual(mtime);
                expect(tab.statTimes.change).toEqual(ctime);
            });
        });

    });

    describe('#saveFile', function () {


        it('should be a function', function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            expect(typeof tab.saveFile).toBe('function');
        });

        it("should return an error when the first argument is not an object nor a string", function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : 'file/to/load'
                });

                tab.saveFile(null, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return an error when the first argument is an object but don't contains the `content` or the `path` attribute", function () {
            runSync(function (done) {
                var tab = new Tab({
                    path: 'file/to/load'
                });

                tab.saveFile({}, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return an error when trying to save the content of a  binary file", function () {
            runSync(function (done) {
                var tab = new Tab({
                    path: 'file/to/load'
                });

                tab.fileType = 'binary';
                tab.saveFile({
                    content : 'Hello'
                }, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should not return an error when trying to save the path fo the binary file", function () {
            runSync(function (done) {
                var tab = new Tab({
                    path: 'file/to/load'
                });

                tab.fileType = 'binary';
                tab.saveFile({
                    path : 'new/file/path'
                }, function (err) {
                    expect(err).toBe(null);
                    done();
                });
            });
        });

        it("should return an error when the `file.path` and the `tab.path` is not defined", function () {
            runSync(function (done) {
                var tab = new Tab({});
                tab.saveFile({
                    content : 'Hello'
                }, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should rename the file when passing the `file.path` in arg", function () {
            var oldPath, newPath;
            spies.fs.rename.andCallFake(function (oldP, newP, cb) {
                oldPath = oldP;
                newPath = newP;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    path: 'file/to/load'
                });

                tab.fileType = 'binary';
                tab.saveFile({
                    path : 'new/file/path'
                }, function () {
                    expect(oldPath).toBe(nodePath.resolve('file/to/load'));
                    expect(newPath).toBe(nodePath.resolve('new/file/path'));
                    done();
                });
            });
        });

        it("should write a new file if the `file.path` is defined but not the `tab.path`", function () {
            var path, content;
            spies.fs.writeFile.andCallFake(function (p, c, cb) {
                path = p;
                content = c;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    name : 'test.txt'
                });
                tab.saveFile({
                    path    : '/the/path',
                    content : 'Hello'
                }, function () {
                    expect(path).toBe(nodePath.resolve('/the/path'));
                    expect(content).toBe('Hello');
                    done();
                });
            });
        });

        it("should write a new file when the content is defined", function () {
            var path, content;
            spies.fs.writeFile.andCallFake(function (p, c, cb) {
                path = p;
                content = c;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });
                tab.saveFile("Content to save", function () {
                    expect(path).toBe(nodePath.resolve('/the/path/'));
                    expect(content).toBe('Content to save');
                    done();
                });
            });
        });

        /*it("should return an error when trying to save a file that has already been changed", function () {
            spies.isTextOrBinary.andCallFake(function (path, cb) {
                cb(null, 'text');
            });

            var mtime = new Date(2015, 6, 16, 15, 11, 9),
                ctime = new Date(2015, 6, 16, 15, 11, 9);

            spies.fs.stat.andCallFake(function (path, cb) {
                cb(null, {
                    mtime : mtime,
                    ctime : ctime
                });
            });

            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });
                tab.loadFile(function () {
                    spies.fs.stat.andCallFake(function (path, cb) {
                        cb(null, {
                            mtime : new Date(2015, 6, 16, 15, 11, 10),
                            ctime : new Date(2015, 6, 16, 15, 11, 10)
                        });
                    });
                    tab.saveFile("Content to save", function (err) {
                        expect(err instanceof Error).toBe(true);
                        done();
                    });
                });
            });
        });*/

        it("should reload the file information after save", function () {

            var imtime = new Date(2015, 6, 16, 15, 11, 9),
                ictime = new Date(2015, 6, 16, 15, 11, 9),
                nmtime = new Date(2015, 6, 16, 15, 11, 10),
                nctime = new Date(2015, 6, 16, 15, 11, 10);

            spies.fs.stat.andCallFake(function (path, cb) {
                cb(null, {
                    mtime : imtime,
                    ctime : ictime
                });
            });
            spies.fs.readFile.andCallFake(function (path, cb) {
                cb(null, "No");
            });

            spies.fs.writeFile.andCallFake(function (path, content, cb) {
                spies.fs.readFile.andCallFake(function (path, cb) {
                    cb(null, content);
                });

                spies.fs.stat.andCallFake(function (path, cb) {
                    cb(null, {
                        mtime : nmtime,
                        ctime : nctime
                    });
                });

                cb(null);
            });

            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/oldName.txt'
                });
                tab.loadFile(function () {
                    tab.saveFile({
                        path : "/the/path/newName.txt",
                        content : "Yes"
                    }, function () {
                        expect(tab.path).toBe(nodePath.resolve('/the/path/newName.txt'));
                        expect(tab.name).toBe('newName.txt');
                        expect(tab.content).toBe('Yes');
                        expect(tab.statTimes.modified).toEqual(nmtime);
                        expect(tab.statTimes.change).toEqual(nctime);
                        done();
                    });
                });
            });
        });

        it("should reset #edited to false", function () {
            var path, content;
            spies.fs.writeFile.andCallFake(function (p, c, cb) {
                path = p;
                content = c;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });
                tab.edited = true;
                tab.saveFile("Content to save", function () {
                    expect( tab.edited).toBe(false);
                    done();
                });
            });
        });
    });

    describe('#fixName', function () {
        it('should be a function', function () {
            var tab = new Tab({
                path: 'file/to/load'
            });

            expect(typeof tab.fixName).toBe('function');
        });

        it('should use the name from the config when it\'s defined', function () {
            var tab = new Tab({
                name : 'test',
                path: '/the/path'
            });
            tab.name = 'another';
            tab.fixName();
            expect(tab.name).toEqual('test');
        });

        it('should use the basename of the path', function () {
            var tab = new Tab({
                path: '/the/path/filename'
            });
            tab.name = 'another';
            tab.fixName();
            expect(tab.name).toEqual('filename');
        });

        it('should use the not use the basename of the path when the name is define in the config', function () {
            var tab = new Tab({
                name : 'test',
                path: '/the/path/filename'
            });
            tab.name = 'another';
            tab.fixName();
            expect(tab.name).toEqual('test');
        });
    });

    describe('#changePath', function () {
        it('should be a function', function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            expect(typeof tab.changePath).toBe('function');
        });

        it('should change the #path when it\'s defined', function () {
            var tab = new Tab({
                path : '/the/path'
            });
            tab.changePath('new/path');
            expect(tab.path).toEqual(nodePath.resolve('new/path'));
        });

        it('should not change the #path when it\'s not defined', function () {
            var tab = new Tab({
                path : '/the/path'
            });
            tab.changePath();
            expect(tab.path).toEqual(nodePath.resolve('/the/path'));
        });

        it('should change the #name when newPath is defined', function () {
            var tab = new Tab({
                path : '/the/path/oldName'
            });
            tab.changePath('/the/path/newName');
            expect(tab.name).toEqual('newName');
        });

        it('should not change the #name when newPath is not defined', function () {
            var tab = new Tab({
                path : '/the/path/oldName'
            });
            tab.changePath();
            expect(tab.name).toEqual('oldName');
        });


        it('Should trigger the `unwatch` event before changing the path.', function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path'
                });

                tab.on('unwatch', function () {
                    expect(tab.path).toEqual(nodePath.resolve('/the/path'));
                    done();
                });

                tab.changePath('new/path');
            });
        });

        it('Should trigger the `watch` event after changing the path.', function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path'
                });

                tab.on('watch', function () {
                    expect(tab.path).toEqual(nodePath.resolve('new/path'));
                    done();
                });

                tab.changePath('new/path');
            });
        });

        it('Should trigger the `rename` event after changing the path.', function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path'
                });

                tab.on('rename', function () {
                    expect(tab.path).toEqual(nodePath.resolve('new/path'));
                    done();
                });

                tab.changePath('new/path');
            });
        });

    });

    describe('#unwatch', function () {
        it('should be a function', function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            expect(typeof tab.unwatch).toBe('function');
        });

        it('Should trigger the `unwatch` event.', function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });

                tab.on('unwatch', function () {
                    expect(true).toBe(true);
                    done();
                });

                tab.unwatch();
            });
        });
    });

    describe('#watch', function () {
        it('should be a function', function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            expect(typeof tab.watch).toBe('function');
        });

        it('Should trigger the `watch` event.', function () {
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });

                tab.on('watch', function () {
                    expect(true).toBe(true);
                    done();
                });

                tab.watch();
            });
        });
    });

    describe('events', function () {

        it('Should inherit of eventListener from nodeJS.', function () {
            expect(typeof Tab.prototype.on).toBe('function');
            expect(typeof Tab.prototype.addListener).toBe('function');
            expect(typeof Tab.prototype.removeListener).toBe('function');
            expect(typeof Tab.prototype.emit).toBe('function');
        });

        it('Should trigger the `loaded` event when loading the file.', function () {
            var tab = new Tab({
                path : 'file/to/load'
            });

            runSync(function (done) {
                tab.on('loaded', function () {
                    expect(true).toBe(true);
                    done();
                });

                tab.loadFile();
            });

        });

        it('Should trigger the `unwatch` event before saving the file.', function () {
            var path, content;
            spies.fs.writeFile.andCallFake(function (p, c, cb) {
                path = p;
                content = c;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });

                tab.on('unwatch', function () {
                    expect(true).toBe(true);
                    done();
                });

                tab.saveFile("Content to save");
            });
        });


        it('Should trigger the `watch` event after saving the file.', function () {
            var path, content;
            spies.fs.writeFile.andCallFake(function (p, c, cb) {
                path = p;
                content = c;
                cb(null);
            });
            runSync(function (done) {
                var tab = new Tab({
                    path : '/the/path/'
                });

                tab.on('watch', function () {
                    expect(true).toBe(true);
                    done();
                });

                tab.saveFile("Content to save");
            });
        });

    });
});