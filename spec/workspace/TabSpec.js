describe("Tab", function () {
   var Tab,
       uuid = require('node-uuid');

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

});