describe('ADXPreferences', function () {
    var fs = require('fs');
    var path = require('path');
    var adxPreferences,
        msg,
        errMsg,
        spies = {},
        common;

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

    beforeEach(function () {
        var adxPreferencesKey = require.resolve('../../app/preferences/ADXPreferences.js');

        delete require.cache[adxPreferencesKey];
        adxPreferences = require('../../app/preferences/ADXPreferences.js');

        common = require('../../app/common/common.js');
        msg = common.messages.message;
        errMsg = common.messages.error;

        // Court-circuit the access of the filesystem
        spies.fs = {
            readFile: spyOn(fs, 'readFile'),
            writeFile: spyOn(fs, 'writeFile'),
            mkdir: spyOn(fs, 'mkdir')
        };

        spies.fs.mkdir.andCallFake(function (p, cb) {
            cb();
        });

        spies.writeError = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.dirExists = spyOn(common, 'dirExists');

        process.env.APPDATA = '\\username.domain\\AppData\\Roaming';
    });

    describe('#read', function () {
        it("should try to read the `preferences.json` file", function () {
            var fileRead;
            spies.fs.readFile.andCallFake(function (filePath, encoding, cb) {
                fileRead = filePath;
                cb(new Error('AN ERROR'));
            });
            adxPreferences.read();
            expect(fileRead).toEqual(path.join(process.env.APPDATA, common.APP_NAME, common.PREFERENCES_FILE_NAME));
        });
        it("should output the `No preferences defined` when the `preferences.json` file is not found", function () {
            spies.fs.readFile.andCallFake(function (filePath, encoding, cb) {
                cb(new Error('AN ERROR'));
            });
            adxPreferences.read();
            expect(spies.writeMessage).toHaveBeenCalledWith(msg.noPreferences);
        });
        it("should output the user preferences from preferences.json", function () {
            var obj = {
                author  : {
                    name : "the name",
                    email : "the@email.com",
                    company : "the company",
                    website : "the website"
                }
            };
            spies.fs.readFile.andCallFake(function (f, encoding, cb) {
                cb(null, JSON.stringify(obj));
            });
            adxPreferences.read();
            expect(spies.writeMessage).toHaveBeenCalledWith(JSON.stringify(obj, null, 2));
        });
        it("should return the preferences in the callback when it's defined", function () {
            var obj = {
                author  : {
                    name : "the name",
                    email : "the@email.com",
                    company : "the company",
                    website : "the website"
                }
            };
            spies.fs.readFile.andCallFake(function (f, encoding, cb) {
                cb(null, JSON.stringify(obj));
            });
            runSync(function (done) {
                adxPreferences.read(function (preferences) {
                    expect(preferences).toEqual(obj);
                    done();
                });
            });
        });
        it("should not output at all when the `options.silent` is true and the file is not found", function () {
            spies.fs.readFile.andCallFake(function (filePath, encoding, cb) {
                cb(new Error('AN ERROR'));
            });
            adxPreferences.read({silent : true});
            expect(spies.writeMessage).not.toHaveBeenCalled();
        });
        it("should not output at all when the `options.silent` is true and the file is found", function () {
            var obj = {
                author  : {
                    name : "the name",
                    email : "the@email.com",
                    company : "the company",
                    website : "the website"
                }
            };
            spies.fs.readFile.andCallFake(function (f, encoding, cb) {
                cb(null, JSON.stringify(obj));
            });
            adxPreferences.read({silent : true});
            expect(spies.writeMessage).not.toHaveBeenCalled();
        });
    });

    describe('#write', function () {
        it("should not try to write in the `preferences.json` file if no options is define", function () {
            runSync(function (done) {
                spies.fs.readFile.andCallFake(function (filePath, encoding, cb) {
                    cb(new Error('AN ERROR'));
                });
                adxPreferences.write(null, function () {
                    expect(spies.fs.writeFile).not.toHaveBeenCalled();
                    done();
                });
            });
        });

        it("should try to write the specified information in the `preferences.json` file", function () {
            var obj = {
                author  : {
                    name : "the name",
                    email : "the@email.com",
                    company : "the company",
                    website : "the website"
                }
            };
            spies.fs.readFile.andCallFake(function (p, encoding, cb) {
                cb(new Error("An error"), null);
            });
            runSync(function (done) {
                spies.fs.writeFile.andCallFake(function (filePath, content) {
                    expect(filePath).toEqual(path.join(process.env.APPDATA, common.APP_NAME, common.PREFERENCES_FILE_NAME));
                    expect(content).toEqual(JSON.stringify(obj));
                    done();
                });
                adxPreferences.write(obj);
            });
        });

        it("should update the existing preferences", function () {
            var objRead = {
                author  : {
                    name : "the name",
                    email : "the@email.com"
                }
            };
            var obj = {
                author  : {
                    email : "anew@email.com",
                    company : "add a company",
                    website : "add a website"
                }
            };
            var expectedObj = {
                author  : {
                    name : "the name",
                    email : "anew@email.com",
                    company : "add a company",
                    website : "add a website"
                }
            };
            spies.fs.readFile.andCallFake(function (p, encoding, cb) {
                cb(null, JSON.stringify(objRead));
            });
            runSync(function (done) {
                spies.fs.writeFile.andCallFake(function (p, content) {
                    expect(content).toEqual(JSON.stringify(expectedObj));
                    done();
                });
                adxPreferences.write(obj);
            });
        });

        it("should try to write the zendesk preferences when it's define", function () {
            spies.fs.readFile.andCallFake(function (p, encoding, cb) {
                cb(null, JSON.stringify({
                    author : {
                        email : "test@test.com"
                    }
                }));
            });

            spies.fs.writeFile.andCallFake(function (p, content, options, cbbWrite) {
                spies.fs.readFile.andCallFake(function (p, encoding, cbRead) {
                    cbRead(null, content);
                });
                cbbWrite();
            });
            var obj = {
                author : {
                    name : 'test'
                },
                ZenDesk : {
                    url              : 'http?//uri',
                    section          : 'the_section',
                    username         : "un",
                    password         : 'pwd',
                    promoted         : true,
                    disabledComments : false
                }
            };
            var expectedObj = {
                author : {
                    name : 'test',
                    email : "test@test.com"
                },
                ZenDesk : {
                    url              : 'http?//uri',
                    section          : 'the_section',
                    username         : "un",
                    password         : 'pwd',
                    promoted         : true,
                    disabledComments : false
                }
            };
            runSync(function (done) {
                adxPreferences.write(obj, function (result) {
                    expect(result).toEqual(expectedObj);
                    done();
                });
            });

        });
        
        /*
        DEPRECATED PUBLISHER
        it("should try to write the github preferences when it's define", function () {
            spies.fs.readFile.andCallFake(function (p, encoding, cb) {
                cb(null, JSON.stringify({
                    author : {
                        email : "test@test.com"
                    }
                }));
            });

            spies.fs.writeFile.andCallFake(function (p, content, options, cbbWrite) {
                spies.fs.readFile.andCallFake(function (p, encoding, cbRead) {
                    cbRead(null, content);
                });
                cbbWrite();
            });
            var obj = {
                author : {
                    name : 'test'
                },
                github : {
                    username : "un",
                    useremail : 'em',
                    remoteUri : "ru",
                    token : "050zf05grgz",
                    message : "a msg"
                }
            };
            var expectedObj = {
                author : {
                    name : 'test',
                    email : "test@test.com"
                },
                github : {
                    username : "un",
                    useremail :"em",
                    remoteUri : 'ru',
                    token : "050zf05grgz",
                    message : "a msg"
                }
            };
            runSync(function (done) {
                adxPreferences.write(obj, function (result) {
                    expect(result).toEqual(expectedObj);
                    done();
                });
            });

        });
        */

        it("should return the preferences in the callback when it's defined", function () {
            var objRead = {
                author  : {
                    name : "the name",
                    email : "the@email.com"
                }
            };
            var obj = {
                author  : {
                    email : "anew@email.com",
                    company : "add a company",
                    website : "add a website"
                }
            };
            var expectedObj = {
                author  : {
                    name : "the name",
                    email : "anew@email.com",
                    company : "add a company",
                    website : "add a website"
                }
            };
            spies.fs.readFile.andCallFake(function (p, encoding, cb) {
                cb(null, JSON.stringify(objRead));
            });

            spies.fs.writeFile.andCallFake(function (p, content, options, cbbWrite) {
                spies.fs.readFile.andCallFake(function (p, encoding, cbRead) {
                    cbRead(null, content);
                });
                cbbWrite();
            });
            runSync(function (done) {
                adxPreferences.write(obj, function (result) {
                    expect(result).toEqual(expectedObj);
                    done();
                });
            });
        });
    });

});