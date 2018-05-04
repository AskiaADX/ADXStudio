/* global describe, it, beforeEach, afterEach, spyOn, expect, runs, waitsFor */
describe("workspace", function () {
    "use strict";
    
    var workspace, Tab,
        spies = {},
        EventEmitter = require('events').EventEmitter,
        nodePath = require('path'),
        util = require('util'),
        uuid = require('uuid'),
        fs   = require('fs'),
        watcher,
        fakeWatcherInstance;

    function FakeWatcher(path) {
        EventEmitter.call(this);
        this.path = path;
    }

    util.inherits(FakeWatcher, EventEmitter);
    FakeWatcher.prototype.add = function () {};
    FakeWatcher.prototype.remove = function () {};
    FakeWatcher.prototype.close = function () {};

    beforeEach(function () {
        spies.fs = {};
        spies.fs.stat = spyOn(fs, 'stat');
        spies.fs.stat.andCallFake(function (path, cb) {
            cb(null, {});
        });

        watcher = require('../../app/modules/watcher/watcher.js');

        spies.watcher = {};
        spies.watcher.create = spyOn(watcher, 'create');
        spies.watcher.create.andCallFake(function (pattern) {
            fakeWatcherInstance = new FakeWatcher(pattern);
            return fakeWatcherInstance;
        });

        var tabCacheKey = require.resolve("../../app/workspace/TabModel.js");
        delete require.cache[tabCacheKey];
        Tab       = require("../../app/workspace/TabModel.js").Tab;

        var workspaceCacheKey = require.resolve("../../app/workspace/workspaceModel.js");
        delete require.cache[workspaceCacheKey];
        workspace = require("../../app/workspace/workspaceModel.js");


        
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

    describe('#watchers', function () {
        it("Should be a function", function () {
            expect(typeof workspace.unwatchTabsIn).toBe("function");
        });
        
        it("Should be a function", function () {
            expect(typeof workspace.rewatchTabsIn).toBe("function");
        });
        
        it("Should be a function", function () {
            expect(typeof workspace.findRewatchableTabsIn).toBe("function");
        });
    });

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
            });
        });

        describe("#mapByTabId", function () {
            it("should be an object", function () {
                expect(typeof  workspace.panes.mapByTabId).toBe('object');
            });
        });


        ['main', 'second'].forEach(function (name) {

            describe("#" + name, function () {
                it("should be an object", function () {
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

        it("should use the second argument as the name of pane if it's a string", function () {

            workspace.panes.current('main');

            runSync(function (done) {
                workspace.createTab(null, 'second', function(err, tab) {
                    expect(workspace.panes.mapByTabId[tab.id]).toBe('second');
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
        
        it("should watch file path associated with the tab when the tab is `loaded` (event)", function () {
            runSync(function (done) {
                spyOn(fakeWatcherInstance, 'add').andCallFake(function (pattern) {
                    expect(pattern).toBe(nodePath.resolve('path/of/file'));
                    done();
                });
                workspace.createTab({
                    path : 'path/of/file'
                }, function(err, tab) {
                    tab.emit('loaded');
                });
            });
        });

        it("should unwatch file while `unwatch` (event)", function () {
            runSync(function (done) {
                spyOn(fakeWatcherInstance, 'remove').andCallFake(function (pattern) {
                    expect(pattern).toBe(nodePath.resolve('path/of/file'));
                    done();
                });
                workspace.createTab({
                    path : 'path/of/file'
                }, function(err, tab) {
                    tab.emit('unwatch');
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
                }, function (err1, tab) {
                    workspace.find({
                        path : "my/file/path"
                    }, function (err2, resultTab)  {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });

        it("should find the tab using an instance of Tab in arg", function () {
            runSync(function (done) {
                workspace.createTab({}, function (err1, tab) {
                    workspace.find(tab, function (err2, resultTab)  {
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
                }, function (err1, tab) {
                    workspace.find("my/file/path/2", function (err2, resultTab)  {
                        expect(resultTab).toBe(tab);
                        done();
                    });
                });
            });
        });

        it("should find the tab using the id of tha tab in arg", function () {
            runSync(function (done) {
                workspace.createTab({}, function (err, tab) {
                    workspace.find(tab.id, function (e, resultTab)  {
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
                    workspace.find(tab.id, function (e, t, pane)  {
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
        
        it("should return the current used tab of the specified pane", function () {
         	runSync(function (done) {
                workspace.createTab({}, 'main', function (err1, tab1) {
                    workspace.createTab({}, 'second', function (err2, tab2) {
                    	workspace.currentTab('main', function (err3, theTab1) {
                        	expect(theTab1).toBe(tab1);
                            workspace.currentTab('second', function (err4, theTab2) {
                            	expect(theTab2).toBe(tab2);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("should return the current used tab", function () {
            runSync(function (done) {
                workspace.createTab({}, function () {
                    workspace.currentTab(function (err, tab) {
                        expect(tab instanceof Tab).toBe(true);
                        done();
                    });
                });
            });
        });

        it("should return the pane of the current used tab in third arg", function () {
            runSync(function (done) {
                workspace.createTab({}, function () {
                    workspace.currentTab(function (err, tab, pane) {
                        expect(pane).toBe(workspace.where(tab));
                        done();
                    });
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

        it("should not set the pane of the current tab if his the type is `preview`", function () {
            runSync(function (done) {
                // Create the tab (on the second pane)
                workspace.createTab({path : '::preview', type : 'preview'}, 'second', function (err, tab) {
                    
                    // Switch to the main pane
                    workspace.panes.current('main');

                    // Set the current tab
                    workspace.currentTab(tab, function() {

                        // The current pane should be the second
                        expect(workspace.panes.current().name).toBe('main');
                        done();
                    });
                });
            });
        });
    });

    describe("#removeTab", function () {
        it("should be a function", function () {
            expect(typeof workspace.removeTab).toBe("function");
        });

        it("should return an error when the first arg is a falsy", function () {
            runSync(function (done) {
                workspace.removeTab(null, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return an error when the tab is not found", function () {
            runSync(function (done) {
                workspace.removeTab("undefined-tab", function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should remove the tab when it's found", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab) {
                    workspace.removeTab(tab, function () {
                        workspace.find(tab.id, function (er, findTab) {
                            expect(findTab).toBe(null);
                            expect(workspace.where(tab.id)).toEqual("");
                            done();
                        });
                    });
                });
            });
        });

        it("should return the tab that has been removed, when passing the id of the tab", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab) {
                    var tabId = tab.id;
                    workspace.removeTab(tabId, function (er, removedTab) {
                        expect(removedTab instanceof  Tab).toBe(true);
                        expect(removedTab.id).toEqual(tabId);
                        done();
                    });
                });
            });
        });

    });

    describe("#removeAllTabs", function () {
        it("should be a function", function () {
            expect(typeof workspace.removeAllTabs).toBe("function");
        });

        it("should return the array of tab that has been removed", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err1, tab1) {
                    workspace.createTab(null, function(err2, tab2) {
                        workspace.createTab(null, 'second', function(err3, tab3) {
                            workspace.removeAllTabs(function (err, removedTabs) {
                                expect(removedTabs).toEqual([
                                    {pane : 'main', tab : tab1},
                                    {pane : 'main', tab : tab2},
                                    {pane : 'second', tab : tab3}
                                ]);
                                expect(workspace.where(tab1.id)).toEqual('');
                                expect(workspace.where(tab2.id)).toEqual('');
                                expect(workspace.where(tab3.id)).toEqual('');
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("should remove all except the one specified by the first `option` argument", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err1, tab1) {
                    workspace.createTab(null, function(err2, tab2) {
                        workspace.createTab(null, 'second', function(err3, tab3) {
                            workspace.removeAllTabs({ except : tab2.id }, function (err, removedTabs) {
                                expect(removedTabs).toEqual([
                                    {pane : 'main', tab : tab1},
                                    {pane : 'second', tab : tab3}
                                ]);
                                expect(workspace.where(tab1.id)).toEqual('');
                                expect(workspace.where(tab2.id)).toEqual('main');
                                expect(workspace.where(tab3.id)).toEqual('');
                                done();
                            });
                        });
                    });
                });
            });
        });

        it("should remove all except the ones mark as `edited`", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err1, tab1) {
                    workspace.createTab(null, function(err2, tab2) {
                        workspace.createTab(null, 'second', function(err3, tab3) {
                            workspace.createTab(null, 'second', function (err4, tab4) {
                                tab2.edited = true;
                                tab4.edited = true;
                                workspace.removeAllTabs(function (err, removedTabs) {
                                    expect(removedTabs).toEqual([
                                        {pane: 'main', tab: tab1},
                                        {pane: 'second', tab: tab3}
                                    ]);
                                    expect(workspace.where(tab1.id)).toEqual('');
                                    expect(workspace.where(tab2.id)).toEqual('main');
                                    expect(workspace.where(tab3.id)).toEqual('');
                                    expect(workspace.where(tab4.id)).toEqual('second');
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

    });

    describe("#moveTab", function () {
        it("should be a function", function () {
            expect(typeof  workspace.moveTab).toBe("function");
        });

        it("should return an error when the first arg is a falsy", function () {
            runSync(function (done) {
                workspace.moveTab(null, null, function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return an error when the second arg is a different to 'main' or 'second'", function () {
            runSync(function (done) {
                workspace.moveTab(null, 'another unknown pane', function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return an error when the tab is not found", function () {
            runSync(function (done) {
                workspace.moveTab("undefined-tab", 'main', function (err) {
                    expect(err instanceof Error).toBe(true);
                    done();
                });
            });
        });

        it("should return moved tab via his callback", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab) {
                    workspace.moveTab(tab, 'main', function (err, movedTab) {
                        expect(tab).toBe(movedTab);
                        done();
                    });
                });
            });
        });

        it("should return the name of the pane where the tab is now located via his callback in third arg", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab) {
                    workspace.moveTab(tab, 'second', function (err, movedTab, pane) {
                        expect(pane).toBe('second');
                        done();
                    });
                });
            });
        });

        it("should move the tab in to the specified pane", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function(err, tab) {
                    workspace.moveTab(tab, 'second', function () {
                        expect(workspace.where(tab)).toEqual('second');
                        done();
                    });
                });
            });
        });

    });

    describe('#toJSON', function () {
        it("should be a function", function () {
            expect(typeof workspace.toJSON).toBe("function");
        });

        it("should return an object", function () {
            var json = workspace.toJSON();
            expect(typeof json).toBe('object');
        });
        
        it("should return an object with a `tabs` as array", function () {
            var json = workspace.toJSON();
            expect(Array.isArray(json.tabs)).toBe(true);
        });

        it("should return an object with an array of all tabs (id, pane, current, path, type, name)", function () {
            var fakeGuid = spyOn(uuid, 'v4');
            workspace.panes.current('main');
            fakeGuid.andReturn('aaaaaa-aaaaaa-aaaaaa-aaaaaa');
            workspace.createTab({ name : 'first', path : 'path/of/first/file', type : 'file'});
            fakeGuid.andReturn('bbbbbbb-bbbbbbb-bbbbbbb-bbbbbbb');
            workspace.createTab({ name : 'second', path : 'path/of/second/file', type : 'file'});
            workspace.panes.current('second');
            fakeGuid.andReturn('cccccc-cccccc-cccccc-cccccc');
            workspace.createTab({  path : 'path/of/third/file', type : 'file'});
            fakeGuid.andReturn('dddddd-dddddd-dddddd-dddddd');
            workspace.createTab({ path : 'path/of/fourth/file', type : 'file'});
            
            var json = workspace.toJSON();
            
            expect(json.tabs).toEqual([
                {
                    id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                    pane : 'main',
                    current : true,
                    name : 'first',
                    path : nodePath.resolve('path/of/first/file'),
                    type : 'file'
                },
                {
                    id : 'bbbbbbb-bbbbbbb-bbbbbbb-bbbbbbb',
                    pane : 'main',
                    name : 'second',
                    path : nodePath.resolve('path/of/second/file'),
                    type : 'file'
                },
                {
                    id : 'cccccc-cccccc-cccccc-cccccc',
                    pane : 'second',
                    current : true,
                    path : nodePath.resolve('path/of/third/file'),
                    type : 'file'
                },
                {
                    id : 'dddddd-dddddd-dddddd-dddddd',
                    pane : 'second',
                    path : nodePath.resolve('path/of/fourth/file'),
                    type : 'file'
                }
            ]);
        });
    });

    describe("#init", function () {
        it("should clean up the collection when called without `config` argument", function () {
            runSync(function (done) {
                workspace.panes.current("main");
                workspace.createTab(null, function (err) {
                    workspace.panes.current("second");
                    workspace.init(function () {
                        expect(workspace.panes.orientation).toEqual('');
                        expect(workspace.panes.mapByTabId).toEqual({});
                        expect(workspace.panes.current().name).toEqual('main');
                        workspace.currentTab(function (err, tab) {
                            expect(tab).toBe(null);
                            done();
                        });
                    });
                });
            });
        });
        
        it("should close the watcher and recreate a new instance", function () {
            runSync(function (done) {
                var spyClose = spyOn(fakeWatcherInstance, 'close');
                workspace.init(function () {
                    expect(spyClose).toHaveBeenCalled();
                    expect(spies.watcher.create).toHaveBeenCalled();
                    done();
                });
            });
        });
        
        it("should initialize the workspace with the `config` in argument", function () {
            var conf = {
                    tabs : [
                        {
                            id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                            pane : 'main',
                            current : true,
                            path : 'path/of/first/file',
                            type : 'file'
                        },
                        {
                            id : 'bbbbbbb-bbbbbbb-bbbbbbb-bbbbbbb',
                            pane : 'main',
                            path : 'path/of/second/file',
                            type : 'file'
                        },
                        {
                            id : 'cccccc-cccccc-cccccc-cccccc',
                            pane : 'second',
                            current : true,
                            path : 'path/of/third/file',
                            type : 'file'
                        },
                        {
                            id : 'dddddd-dddddd-dddddd-dddddd',
                            pane : 'second',
                            name : 'testWithName',
                            // Backwards-compatibility
                            config : {
                                path : 'path/of/fourth/file',
                                type : 'file'
                            }
                        }
                    ]
                }, 
                output = [];
            
            spyOn(workspace, 'createTab').andCallFake(function (config, pane) {
                output.push({
                    pane : pane,
                    config : config
                });
            });
            
            runSync(function (done) {
                workspace.init(conf, function () {
                    expect(output).toEqual([
                        {
                            pane : 'main',
                            config : {
                                path : 'path/of/first/file',
                                type : 'file'
                            }
                        },
                        {
                            pane : 'main',
                            config : {
                                path : 'path/of/second/file',
                                type : 'file'
                            }
                        },
                        {
                            pane : 'second',
                            config : {
                                path : 'path/of/third/file',
                                type : 'file'
                            }
                        },
                        {
                            pane : 'second',
                            config : {
                                name : 'testWithName',
                                path : 'path/of/fourth/file',
                                type : 'file'
                            }
                        }
                    ]);
                    done();
                });
            });
        });
        
        it("should initialize the currentTabs using the `config` in argument", function () {
            var conf = {
                    tabs : [
                        {
                            id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                            pane : 'main',
                            current : true,
                            name : 'first',
                            path : 'path/of/first/file',
                            type : 'file'
                        },
                        {
                            id : 'bbbbbbb-bbbbbbb-bbbbbbb-bbbbbbb',
                            pane : 'main',
                            path : 'path/of/second/file',
                            type : 'file'
                        },
                        {
                            id : 'cccccc-cccccc-cccccc-cccccc',
                            pane : 'second',
                            current : true,
                            name : 'third',
                            path : 'path/of/third/file',
                            type : 'file'
                        },
                        {
                            id : 'dddddd-dddddd-dddddd-dddddd',
                            pane : 'second',
                            path : 'path/of/fourth/file',
                            type : 'file'
                        }
                    ]
                };
            
            runSync(function (done) {
                workspace.init(conf, function () {
                    workspace.currentTab('main', function (err, mainPaneTab) {
                    	expect(mainPaneTab.name).toEqual('first');
                        workspace.currentTab('second', function (err, secondPaneTab) {
                            expect(secondPaneTab.name).toEqual('third');
                            done();
                        });
                    });
                });
            });
        });

        it("should fix the path of the tab when the type is 'projectSettings' and the path doesn't contains 'config.xml'", function () {
            var conf = {
                tabs : [
                    {
                        id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                        pane : 'main',
                        current : true,
                        name : 'first',
                        path : 'path/of/adc/',
                        type : 'projectSettings'
                    }
                ]
            };

            runSync(function (done) {
                workspace.init(conf, function () {
                    workspace.currentTab('main', function (err, mainPaneTab) {
                        expect(mainPaneTab.path).toEqual(nodePath.resolve(nodePath.join('path/of/adc/', 'config.xml')));
                        done();
                    });
                });
            });
        });

        it("should not create duplicate tabs (opened with the same path)", function () {
            var conf = {
                tabs : [
                    {
                        id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                        pane : 'main',
                        current : true,
                        name : 'first',
                        path : 'path/of/adc/file1',
                        type : 'file'
                    },
                    {
                        id : 'bbbbbb-bbbbbb-bbbbbb-bbbbbb',
                        pane : 'main',
                        name : 'second',
                        path : 'path/of/adc/file1',
                        type : 'file'
                    }
                ]
            };

            runSync(function (done) {
                workspace.init(conf, function () {
                    expect(workspace.tabs.length).toEqual(1);
                    done();
                });
            });
        });

        it("should not open the 'config.xml' and the 'projectSettings' at the same time", function () {
            var conf = {
                tabs : [
                    {
                        id : 'aaaaaa-aaaaaa-aaaaaa-aaaaaa',
                        pane : 'main',
                        current : true,
                        name : 'first',
                        path : 'path/of/adc/config.xml',
                        type : 'file'
                    },
                    {
                        id : 'bbbbbb-bbbbbb-bbbbbb-bbbbbb',
                        pane : 'main',
                        name : 'second',
                        path : 'path/of/adc/',
                        type : 'projectSettings'
                    }
                ]
            };

            runSync(function (done) {
                workspace.init(conf, function () {
                    expect(workspace.tabs.length).toEqual(1);
                    done();
                });
            });
        });
    });

    describe('events', function () {

        it('Should inherit of eventListener from nodeJS.', function () {
            expect(typeof workspace.on).toBe('function');
            expect(typeof workspace.addListener).toBe('function');
            expect(typeof workspace.removeListener).toBe('function');
            expect(typeof workspace.emit).toBe('function');
        });

        describe('@file-changed', function () {

            it('should be triggered when the watcher trigger `changed` and the file still exist.', function () {
                runSync(function (done) {

                    workspace.on('file-changed', function () {
                        expect(true).toBe(true);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab) {
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

            it('should be triggered with the tab as a first arg', function () {
                runSync(function (done) {
                    var tabId;

                    workspace.on('file-changed', function (tab) {
                        expect(tab.id).toBe(tabId);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab) {
                        tabId = tab.id;
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

            it('should be triggered with the pane as a second arg', function () {
                runSync(function (done) {
                    var currentPane;

                    workspace.on('file-changed', function (tab, pane) {
                        expect(currentPane).toBe(pane);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab, pane) {
                        currentPane = pane;
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

        });


        describe('@file-removed', function () {
            beforeEach(function () {
                spies.fs.stat.andCallFake(function (p, cb) {
                    cb(new Error());
                });
            });

            it('should be triggered when the watcher trigger `changed` and when the file no longer exist.', function () {
                runSync(function (done) {

                    workspace.on('file-removed', function () {
                        expect(true).toBe(true);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab) {
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

            it('should be triggered with the tab as a first arg', function () {
                runSync(function (done) {
                    var tabId;

                    workspace.on('file-removed', function (tab) {
                        expect(tab.id).toBe(tabId);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab) {
                        tabId = tab.id;
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

            it('should be triggered with the pane as a second arg', function () {
                runSync(function (done) {
                    var currentPane;

                    workspace.on('file-removed', function (tab, pane) {
                        expect(currentPane).toBe(pane);
                        done();
                    });

                    workspace.createTab({
                        path : 'path/of/file'
                    }, function(err, tab, pane) {
                        currentPane = pane;
                        tab.emit('loaded');
                        var args = ['change', null, nodePath.resolve('path/of/file')];
                        fakeWatcherInstance.emit.apply(fakeWatcherInstance, args);
                    });
                });
            });

        });
        
        describe('@change', function () {
            it('should be triggered when a tab was created', function () {
                runSync(function (done) {
                    workspace.panes.current("main");
                    workspace.on('change', function () {
                        expect(true).toBe(true);
                        done();
                    });
                    workspace.createTab(null, function() {});
                });
            });
            
            it('should be triggered when a tab was moved', function () {
                runSync(function (done) {
                    workspace.panes.current("main");
                    workspace.createTab(null, function(err, tab) {
                        workspace.on('change', function () {
                            expect(true).toBe(true);
                            done();
                        });
                        
                        workspace.moveTab(tab, 'second', function () {});
                    });
                });
            });
            
            it('should be triggered when a tab was removed', function () {
                runSync(function (done) {
                    workspace.panes.current("main");
                    workspace.createTab(null, function(err, tab) {
                        workspace.on('change', function () {
                            expect(true).toBe(true);
                            done();
                        });
                        
                        workspace.removeTab(tab, function () {});
                    });
                });
            });

            it('should be triggered when a tab was renamed', function () {
                runSync(function (done) {
                    workspace.panes.current("main");
                    workspace.createTab({
                        path : 'old/path'
                    }, function(err, tab) {
                        workspace.on('change', function () {
                            expect(true).toBe(true);
                            done();
                        });

                        tab.changePath('new/path');
                    });
                });
            });

            it("should be triggered whan all tabs were removed", function () {
                runSync(function (done) {
                    workspace.panes.current("main");
                    workspace.createTab(null, function(err1, tab1) {
                        workspace.createTab(null, function(err2, tab2) {
                            workspace.createTab(null, 'second', function(err3, tab3) {
                                workspace.on('change', function () {
                                    expect(true).toBe(true);
                                    done();
                                });

                                workspace.removeAllTabs();
                            });
                        });
                    });
                });
            });
            
            it('should be triggered when change the current tab', function () {
                runSync(function (done) {
                    workspace.createTab({}, function (err, tab) {
                        workspace.on('change', function () {
                            expect(true).toBe(true);
                            done();
                        });

                        workspace.currentTab(tab, function() {});
                    });
                });
            });
                        
        });

    });
});
