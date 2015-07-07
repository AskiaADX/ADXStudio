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

    describe("#find", function () {
       it("should be a function", function () {
            expect(typeof workspace.find).toBe('function');
       });

        it("should return null in callback when the criteria argument is null", function () {
           runSync(function (done) {
                workspace.find(null, function (err, data) {
                    expect(data).toBe(null);
                    done();
                });
            });
        });

        it("should find the tab using an object with the path property}", function () {
            runSync(function (done) {
                workspace.createTab({
                    path : 'my/file/path'
                }, function (err, tab) {
                    workspace.find({
                        path : "my/file/path"
                    }, function (err, resultTab)  {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });

        it("should find the tab using the path in arg", function () {
            runSync(function (done) {
                workspace.createTab({
                    path : 'my/file/path/2'
                }, function (err, tab) {
                    workspace.find("my/file/path/2", function (err, resultTab)  {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });

        it("should find the tab using the id of tha tab in arg", function () {
            runSync(function (done) {
                workspace.createTab({}, function (err, tab) {
                    workspace.find(tab.id, function (err, resultTab)  {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });

        it("should return the name of pane in arg", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab({}, function (err, tab) {
                    workspace.find(tab.id, function (err, tab, pane)  {
                        expect(pane).toBe('main');
                        done();
                    });
                });
            });
        });
    });

    describe("#currentTab", function () {
        it("should be a function", function () {
            expect(typeof workspace.currentTab).toBe("function");
        });

        it("should return the current used tab", function () {
            runSync(function (done) {
                workspace.currentTab(function(err, tab) {
                    expect(tab instanceof Tab).toBe(true);
                    done();
                });
            });
        });

        it("should return the pane of the current used tab in third arg", function () {
            runSync(function (done) {
                workspace.currentTab(function(err, tab, pane) {
                    expect(pane).toBe(workspace.where(tab));
                    done();
                });
            });
        });

        it("should set the current used tab", function () {
            runSync(function (done) {
                workspace.createTab({}, function (err, tab) {
                    workspace.currentTab(tab, function(err, resultTab) {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });


        it("should set the pane of the current tab used", function () {
            runSync(function (done) {
                // Set the second pane to create the tab on it
                workspace.panes.current('second');

                // Create the tab (on the second pane)
                workspace.createTab({}, function (err, tab) {

                    // Switch to the main pane
                    workspace.panes.current('main');

                    // Set the current tab
                    workspace.currentTab(tab, function() {

                        // The current pane should be the second
                        expect(workspace.panes.current().name).toBe('second');
                        done();
                    });
                });
            });
        });
    });
});





/*ipc.on('openFile', function (event, file) {
     workspace.find(file, function (err, tab) {
         if (tab) {
            workspace.currentTab(tab, function (err, tab, pane) {
                 ipc.send('focus-tab', tab, pane);
             });
         } else {
             workspace.createNewTab(file, function (err, tab) {
                 workspace.currentTab(tab, function (err, tab, pane                                                                                                         b7v) {
                     ipc.send('create-and-focus-tab', tab, pane);
                 });
             });
         }
     });
 });*/