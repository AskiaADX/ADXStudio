describe("Tab", function () {
   var Tab,
       uuid = require('node-uuid'),
       fs   = require('fs');

    beforeEach(function () {
       Tab = require('../../src/workspace/Tab.js').Tab;
    });


    describe("#constructor", function () {
        it("should assign a GUID as the identifier of the tab", function () {
            spyOn(uuid, "v4").andReturn("random-guid");
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
            expect(tab.path).toBe('path/of/file1');
        });
    });

    describe("#loadFile", function () {
        it("should set the #fileType to `text` if the file is a text file", function () {
            spyOn(Tab, 'isTextOrBinaryFile').andCallFake(function (path, cb) {
                cb(null, 'text');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.fileType).toBe('text');
            });
        });


        it("should set the #fileType to `binary` if the file is a text file", function () {
            spyOn(Tab, 'isTextOrBinaryFile').andCallFake(function (path, cb) {
                cb(null, 'binary');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.fileType).toBe('binary');
            });
        });

        it("should, if the file is `text`, read the content and assign it to the #content property", function () {
            spyOn(Tab, 'isTextOrBinaryFile').andCallFake(function (path, cb) {
                cb(null, 'text');
            });
            spyOn(fs, 'readFile').andCallFake(function (path, cb) {
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
            spyOn(Tab, 'isTextOrBinaryFile').andCallFake(function (path, cb) {
                cb(null, 'binary');
            });
            spyOn(fs, 'readFile').andCallFake(function (path, cb) {
                cb(null, 'Should not be set');
            });

            var tab = new Tab({
                path : 'file/to/load'
            });

            tab.loadFile(function () {
                expect(tab.content).toBe(null);
            });
        });

    });
});