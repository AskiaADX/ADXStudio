describe("workspace", function () {

    var workspace, Tab;

    beforeEach(function () {
        workspace = require("../../src/workspace/workspace.js");
        Tab       = require("../../src/workspace/Tab.js").Tab;
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

    describe("#panes", function () {

       it("should be an object", function () {
           expect(typeof workspace.panes).toBe("object");
       });

       describe("#orientation", function () {
           it("should be a string", function () {
               expect(typeof workspace.panes.orientation).toBe("string");
           });

           it("should be empty ('') by default", function () {
               expect(workspace.panes.orientation).toBe("");
           });
       });

       describe("#current", function () {
           it("should be a function", function () {
                expect(typeof workspace.panes.current).toBe("function");
           });
           it("should return the current pane", function () {
               expect(workspace.panes.current()).toBe(workspace.panes.main);
           });
           it("should set the current pane when arg is defined", function () {
               workspace.panes.current("second");
               expect(workspace.panes.current()).toBe(workspace.panes.second);
           })
       });

        describe("#mapByTabId", function () {
            it("should be an object", function () {
                expect(typeof  workspace.panes.mapByTabId).toBe('object');
            })
        });


       ['main', 'second'].forEach(function (name) {

           describe("#" + name, function () {
               it ("should be an object", function () {
                   expect(typeof workspace.panes[name]).toBe("object");
               });

               it("should have a property #tabs as an array", function () {
                   expect(Array.isArray(workspace.panes[name].tabs)).toBe(true);
               });
           });
       });
   });


    describe("#createTab", function () {
       it("should be a function", function () {
           expect(typeof  workspace.createTab).toBe("function");
       });

        it("should return a new instance of Tab via his callback", function () {
            runSync(function (done) {
                workspace.createTab(null, function(err, tab) {
                    expect(tab instanceof  Tab).toBe(true);
                    done();
                });
            });
        });

        it("should return the name of pane his callback in third arg", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab, paneName) {
                    expect(paneName).toBe("main");
                    done();
                });
            });
        });


        it("should add the new tab in the mapByTabId and associate it with the current tab", function () {

            workspace.panes.current('second');

            runSync(function (done) {
                workspace.createTab(null, function(err, tab) {
                    expect(workspace.panes.mapByTabId[tab.id]).toBe('second');
                    done();
                });
            });
        });

    });

    describe("#where", function () {
        it("should be a function", function () {
           expect(typeof  workspace.where).toBe('function');
        });
        it("should return the name of the pane where the tab is located, using the instance of tab in arg", function () {
           runSync(function (done) {
               workspace.createTab(null, function (err, tab, paneName) {
                   expect(workspace.where(tab)).toBe(paneName);
               });
               done();
           });
        });
        it("should return the name of the pane where the tab is located, using the id of tab in arg", function () {
            runSync(function (done) {
                workspace.createTab(null, function (err, tab, paneName) {
                    expect(workspace.where(tab.id)).toBe(paneName);
                });
                done();
            });
        });
    });
});





/*ipc.on('openFile', function (event, file) {
     var tab = workspace.getTab(file);
     if (tab) {
         workspace.currentTab(tab, function (err, tab) {
            ipc.send('focus-tab', tab);
         });
     } else {
         workspace.createNewTab(file, function (err, tab) {
             workspace.currentTab(tab, function (err, tab) {
                 ipc.send('create-and-focus-tab', tab);
             })
         });
     }
 });*/