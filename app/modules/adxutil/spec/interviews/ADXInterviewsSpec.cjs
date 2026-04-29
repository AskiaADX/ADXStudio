describe('ADXInterviews', function () {

    var common,
        InteractiveADXShell,
        adxInterviews,
        InterviewsFactory,
        Interview,
        spies = {},
        errMsg,
        successMsg,
        uuid            = require('uuid');

    beforeEach(function () {
        // Clean the cache, obtain a fresh instance of the adxInterviews each time
        var adxInterviewsKey = require.resolve('../../app/interviews/ADXInterviews.js'),
            commonKey = require.resolve('../../app/common/common.js');

        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        delete require.cache[adxInterviewsKey];
        adxInterviews = require('../../app/interviews/ADXInterviews.js');

        InterviewsFactory = adxInterviews.InterviewsFactory;

        // Messages
        errMsg = common.messages.error;
        successMsg = common.messages.success;

        // Court-circuit the uuid generator
        spies.uuid = spyOn(uuid, 'v4');
        spies.uuid.andReturn('guid');

        // Court-circuit the validation outputs
        spies.writeError = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.dirExists = spyOn(common, 'dirExists');

        InteractiveADXShell = require('../../app/common/InteractiveADXShell.js').InteractiveADXShell;
        spies.interactiveExec = spyOn(InteractiveADXShell.prototype, 'exec');
        spies.interactiveDestroy = spyOn(InteractiveADXShell.prototype, 'destroy')
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

    describe('InterviewsFactory', function () {

        describe("#constructor", function () {

            it("should throw an exception when the `adxDirPath` argument of the constructor is a falsy", function () {
                expect(function () {
                    var factory = new InterviewsFactory();
                }).toThrow(errMsg.invalidPathArg);
            });

            it("should set the property #path to the object instance", function () {
                var factory = new InterviewsFactory("my/path");
                expect(factory.path).toEqual("my/path");
            });

        });

        describe('#create', function () {

            it('should be a function', function () {
                expect(typeof InterviewsFactory.prototype.create).toBe('function');
            });

            it("should return a new instance of Interview", function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                expect(inter.constructor.name).toBe('Interview');
            });

            it("should return a new instance of Interview with a new random id", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                var inter = factory.create();
                expect(inter.id).toBe('guid');
            });

            it("should return a new instance of Interview with a random and unique id", function () {
                var factory = new InterviewsFactory('my/path');
                var callCount = -1;
                var ret = ['guid', 'guid', 'another_guid'];
                spies.uuid.andCallFake(function () {
                    callCount++;
                    return ret[callCount];
                });
                var inter1 = factory.create();
                var inter2 = factory.create();
                expect(inter1.id).toBe('guid');
                expect(inter2.id).toBe('another_guid');
            });

            it("should return a new instance of Interview with the path of ADX", function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                expect(inter.path).toBe('my/path');
            });
        });

        describe('#getById', function () {
            it('should be a function', function () {
                expect(typeof InterviewsFactory.prototype.getById).toBe('function');
            });

            it("should return the instance of Interview using his id", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                var inter = factory.create();
                var foundInter = factory.getById('guid');
                expect(inter).toBe(foundInter);
            });

            it("should return undefined when the id is not found", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                var inter = factory.create();
                var foundInter = factory.getById('unknow_id');
                expect(foundInter).toBeUndefined();
            });
        });

        describe('#remove', function () {
            it('should be a function', function () {
                expect(typeof InterviewsFactory.prototype.remove).toBe('function');
            });

            it("should call the method #destroy of the specified interview id", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                factory.create();
                factory.remove('guid');
                expect(spies.interactiveDestroy).toHaveBeenCalled();
            });

            it("should remove the interview from the cache", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                factory.create();
                factory.remove('guid');
                var inter = factory.getById('guid');
                expect(inter).toBeUndefined();
            });
        });

        describe('#clear', function () {
            it('should be a function', function () {
                expect(typeof InterviewsFactory.prototype.clear).toBe('function');
            });

            it("should call the method #remove for each created interviews", function () {
                var factory = new InterviewsFactory('my/path');
                var count = -1;
                var ids = ['a', 'b', 'c', 'd', 'e'];
                spies.uuid.andCallFake(function () {
                    count++;
                    return ids[count];
                });

                for (var i = 0, l = ids.length; i < l; i += 1) {
                    factory.create();
                }
                var removeIds = [];
                factory.remove = function (id) {
                    removeIds.push(id);
                };
                factory.clear();
                expect(ids).toEqual(removeIds);
            });
        });
    });

    describe('Interview', function () {

        describe("#constructor", function () {

            it("should set the property #id to the object instance", function () {
                var factory = new InterviewsFactory('my/path');
                spies.uuid.andReturn('guid');
                var inter = factory.create();
                expect(inter.id).toBe('guid');
            });

            it("should set the property #path to the object instance", function () {
                var factory = new InterviewsFactory("my/path");
                var inter = factory.create();
                expect(inter.path).toEqual("my/path");
            });

            it("should set the property #shell with a new instance of InteractiveADXShell", function () {
                var factory = new InterviewsFactory("my/path");
                var inter = factory.create();
                expect(inter.shell instanceof InteractiveADXShell).toBe(true);
            });

            it("should set the property #shell with a new instance of InteractiveADXShell with the path of ADX", function () {
                var factory = new InterviewsFactory("my/path");
                var inter = factory.create();
                expect(inter.shell.path).toBe('my/path');
            });

            it("should set the property #shell with a new instance of InteractiveADXShell in interview mode", function () {
                var factory = new InterviewsFactory("my/path");
                var inter = factory.create();
                expect(inter.shell.mode).toBe('interview');
            });
        });

        describe('#execCommand', function () {

            it('should be a function', function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                expect(typeof inter.execCommand).toBe('function');
            });

            it('should call the #shell#exec method with the `command`, `emulation` and `callback` parameters', function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                function cb(){

                }
                inter.execCommand('command', {
                    fixture    : 'a_fixture',
                    emulation  : 'the_emulation',
                    properties : 'someproperties',
                    parameters : 'someparameters',
                    themes     : 'somethemesvariables'
                }, cb);

                expect(spies.interactiveExec).toHaveBeenCalledWith([
                    'command',
                    '"-fixture:a_fixture"',
                    '"-emulation:the_emulation"',
                    '"-properties:someproperties"',
                    '"-parameters:someparameters"',
                    '"-themes:somethemesvariables"'
                ], cb);
            });

        });

        describe('#destroy', function () {

            it('should be a function', function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                expect(typeof inter.destroy).toBe('function');
            });

            it('should call the #shell#destroy method', function () {
                var factory = new InterviewsFactory('my/path');
                var inter = factory.create();
                inter.destroy();
                expect(spies.interactiveDestroy).toHaveBeenCalled();
            });

        });
    });

});