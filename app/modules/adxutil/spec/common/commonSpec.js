/*
 // process.arch is read-only use the propertyDescriptor to override it's value
 var descriptor = Object.getOwnPropertyDescriptor(process, 'arch');
 Object.defineProperty(process, 'arch', {
 value : 'ia32',
 configurable : true,
 enumerable : true
 });
 var commonKey = require.resolve('../../app/common/common.js');
 delete require.cache[commonKey];

 var common = require('../../app/common/common.js');
 expect(common.ADX_UNIT_DIR_PATH).toEqual('/lib/adxshell_x86/');
 // Restore the original value
 Object.defineProperty(process, 'arch', descriptor);
 */
describe('common', function () {

    var fs              = require('fs'),
        clc             = require('cli-color'),
        uuid            = require('uuid'),
        pathHelper      = require('path'),
        util            = require('util'),
        path            = require('path'),
        spies           = {},
        common,
        errMsg;

    beforeEach(function () {
        // Clean the cache, obtain a fresh instance of the common each time
        var commonKey = require.resolve('../../app/common/common.js');
        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        // Messages
        errMsg      = common.messages.error;

        // Court-circuit the access of the filesystem
        spies.fs = {
            stat        : spyOn(fs, 'stat') ,
            statSync    : spyOn(fs, 'statSync'),
            readdirSync : spyOn(fs, 'readdirSync'),
            readdir     : spyOn(fs, 'readdir'),
            readFileSync : spyOn(fs, 'readFileSync')
        };

        // Court-circuit the uuid generator
        spyOn(uuid, 'v4').andReturn('guid');

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
    // Run the test in a given architecture (x64, ia32)
    function runInArch(arch, fn) {
        // process.arch is read-only use the propertyDescriptor to override it's value
        var descriptor = Object.getOwnPropertyDescriptor(process, 'arch');
        Object.defineProperty(process, 'arch', {
            value : arch,
            configurable : true,
            enumerable : true
        });

        // Run the test
        fn();

        // Restore the original value
        Object.defineProperty(process, 'arch', descriptor);
    }

    describe('#getTemplateList', function () {
        it('should throw an error when the `type` and `callback` arguments are not specified', function () {
            expect(function(){
                common.getTemplateList();
            }).toThrow(new Error(common.messages.error.missingTypeArgument));
        });

        it('should send an error in the `callback` when the `type` is incorrect', function () {
            runSync(function (done) {
                common.getTemplateList('', function (err) {
                    expect(err.message).toEqual(common.messages.error.incorrectADXType);
                    done();
                });
            });
        });

        function forEachADXType(type) {
            it('should list directories in the `template` `' + type.toUpperCase() + 's` path of the application', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spies.fs.statSync.andReturn({
                    isDirectory : function () {return true;}
                });
                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join(common.TEMPLATES_PATH,  type )) {
                        cb(null, [
                            'template1',
                            'template2',
                            'template3'
                        ]);
                    }
                    return cb(null, []);
                });
                runSync(function (done) {
                    common.getTemplateList(type, function (err, dirs) {
                        expect(dirs).toEqual([{
                            name : 'template1',
                            path : '\\templates\\' + type  + '\\template1'
                        }, {
                            name : 'template2',
                            path : '\\templates\\' + type  + '\\template2'
                        }, {
                            name : 'template3',
                            path : '\\templates\\' + type  + '\\template3'
                        }]);
                        done();
                    });
                });
            });

            it('should list directories in the `template` `' + type.toUpperCase() + 's` path of the program data', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spies.fs.statSync.andReturn({
                    isDirectory : function () {return true;}
                });
                process.env.ALLUSERSPROFILE = '\\ProgramData';

                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join(process.env.ALLUSERSPROFILE, common.APP_NAME, common.TEMPLATES_PATH, type)) {
                        cb(null, [
                            'template1',
                            'template2',
                            'template3'
                        ]);
                    }
                    return cb(null, []);
                });
                runSync(function (done) {
                    common.getTemplateList(type, function (err, dirs) {
                        expect(dirs).toEqual([{
                            name : 'template1',
                            path : '\\ProgramData\\ADXUtil\\templates\\' + type  + '\\template1'
                        }, {
                            name : 'template2',
                            path : '\\ProgramData\\ADXUtil\\templates\\' + type  + '\\template2'
                        }, {
                            name : 'template3',
                            path : '\\ProgramData\\ADXUtil\\templates\\' + type  + '\\template3'
                        }]);
                        done();
                    });
                });
            });

            it('should list directories in the `template` `' + type.toUpperCase() + 's` path of the user data', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spies.fs.statSync.andReturn({
                    isDirectory : function () {return true;}
                });
                process.env.APPDATA = '\\username.domain\\AppData\\Roaming';

                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join(process.env.APPDATA, common.APP_NAME, common.TEMPLATES_PATH, type)) {
                        cb(null, [
                            'template1',
                            'template2',
                            'template3'
                        ]);
                    }
                    return cb(null, []);
                });
                runSync(function (done) {
                    common.getTemplateList(type, function (err, dirs) {
                        expect(dirs).toEqual([{
                            name : 'template1',
                            path : '\\username.domain\\AppData\\Roaming\\ADXUtil\\templates\\' + type  + '\\template1'
                        }, {
                            name : 'template2',
                            path : '\\username.domain\\AppData\\Roaming\\ADXUtil\\templates\\' + type  + '\\template2'
                        }, {
                            name : 'template3',
                            path : '\\username.domain\\AppData\\Roaming\\ADXUtil\\templates\\' + type  + '\\template3'
                        }]);
                        done();
                    });
                });
            });

            it('should override the `' + type.toUpperCase() + 's` template when duplicate using the template nearest to the user data', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spies.fs.statSync.andReturn({
                    isDirectory : function () {return true;}
                });
                process.env.ALLUSERSPROFILE = '\\ProgramData';
                process.env.APPDATA = '\\username.domain\\AppData\\Roaming';

                spies.fs.readdir.andCallFake(function (path, cb) {
                    if (path === pathHelper.join(common.TEMPLATES_PATH, type)) {
                        cb(null, [
                            'template1',
                            'template2',
                            'template3'
                        ]);
                    }
                    if (path === pathHelper.join(process.env.ALLUSERSPROFILE, common.APP_NAME, common.TEMPLATES_PATH, type)) {
                        cb(null, [
                            'template2',
                            'template3'
                        ]);
                    }
                    if (path === pathHelper.join(process.env.APPDATA, common.APP_NAME, common.TEMPLATES_PATH, type)) {
                        cb(null, [
                            'template3'
                        ]);
                    }
                    return cb(null, []);
                });
                runSync(function (done) {
                    common.getTemplateList(type, function (err, dirs) {
                        expect(dirs).toEqual([{
                            name : 'template1',
                            path : '\\templates\\' + type  + '\\template1'
                        }, {
                            name : 'template2',
                            path : '\\ProgramData\\ADXUtil\\templates\\' + type  + '\\template2'
                        }, {
                            name : 'template3',
                            path : '\\username.domain\\AppData\\Roaming\\ADXUtil\\templates\\' + type  + '\\template3'
                        }]);
                        done();
                    });
                });
            });
        }

        ['adc', 'adp'].forEach(forEachADXType);

    });

    describe('#getTemplatePath', function () {

        it('should throw an error when the `type` and `callback` arguments are not specified', function () {
            expect(function(){
                common.getTemplatePath();
            }).toThrow(new Error(common.messages.error.missingTypeArgument));
        });

        it('should send an error in the `callback` when the second argument is a function', function () {
            runSync(function (done) {
                common.getTemplatePath('something', function (err) {
                    expect(err.message).toEqual(common.messages.error.missingNameArgument);
                    done();
                });
            });
        });

        it('should send an error in the `callback` when the `type` is incorrect', function () {
            runSync(function (done) {
                common.getTemplatePath('something', 'name',  function (err) {
                    expect(err.message).toEqual(common.messages.error.incorrectADXType);
                    done();
                });
            });
        });

        function forEachADXType(type) {
            it('should return the path template of ` `' + type.toUpperCase() + '` from user data if it\'s found', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spyOn(common, 'dirExists').andCallFake(function (path, cb) {
                    cb(null, true);
                });
                process.env.ALLUSERSPROFILE = '\\ProgramData';
                process.env.APPDATA = '\\username.domain\\AppData\\Roaming';
                runSync(function (done) {
                    common.getTemplatePath(type, 'template1', function (err, path) {
                        expect(path).toEqual('\\username.domain\\AppData\\Roaming\\ADXUtil\\templates\\' + type + '\\template1');
                        done();
                    });
                });
            });

            it('should return the path template of ` `' + type.toUpperCase() + '` from program  data if it\'s found', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spyOn(common, 'dirExists').andCallFake(function (path, cb) {
                    if (path === pathHelper.join(process.env.APPDATA, common.APP_NAME, common.TEMPLATES_PATH, type, 'template1')) {
                        cb(null, false);
                        return;
                    }
                    cb(null, true);
                });
                process.env.ALLUSERSPROFILE = '\\ProgramData';
                process.env.APPDATA = '\\username.domain\\AppData\\Roaming';
                runSync(function (done) {
                    common.getTemplatePath(type, 'template1', function (err, path) {
                        expect(path).toEqual('\\ProgramData\\ADXUtil\\templates\\' + type + '\\template1');
                        done();
                    });
                });
            });

            it('should return the path template of ` `' + type.toUpperCase() + '` from installation data if it\'s found', function () {
                spyOn(pathHelper, 'resolve').andReturn('');
                spyOn(common, 'dirExists').andCallFake(function (path, cb) {
                    if (path !== pathHelper.join(common.TEMPLATES_PATH, type, 'template1')) {
                        cb(null, false);
                        return;
                    }
                    cb(null, true);
                });
                process.env.ALLUSERSPROFILE = '\\ProgramData';
                process.env.APPDATA = '\\username.domain\\AppData\\Roaming';
                runSync(function (done) {
                    common.getTemplatePath(type, 'template1', function (err, path) {
                        expect(path).toEqual('\\templates\\' + type + '\\template1');
                        done();
                    });
                });
            });

            it('should return an error when the template of ` `' + type.toUpperCase() + '` is not found', function () {
                spyOn(common, 'dirExists').andCallFake(function (path, cb) {
                    cb(null, false);
                });
                runSync(function (done) {
                    common.getTemplatePath(type, 'template1', function (err) {
                        expect(err.message).toEqual(util.format(errMsg.cannotFoundTemplate, 'template1'));
                        done();
                    });
                });
            });
        }

        ['adc', 'adp'].forEach(forEachADXType);

    });

    describe('#dirExists', function () {
        it("should call the callback with false when the fs#stat return an error", function () {
            spies.fs.stat.andCallFake(function (path, callback) {
                callback(new Error('No such file or directory'));
            });
            common.dirExists('path', function (err, exist) {
                expect(exist).toBe(false);
            });
        });
        it("should call the callback with true when the fs#stat doesn't reutrn an error", function () {
            spies.fs.stat.andCallFake(function (path, callback) {
                callback(null);
            });
            common.dirExists('path', function (err, exist) {
                expect(exist).toBe(true);
            });
        });
    });

    describe("#isIgnoreFile", function () {
        it("should read the ADXIgnore file at the root of the app/ folder", function () {
            spyOn(pathHelper, 'resolve').andReturn('root/ADXIgnore');
            spies.fs.readFileSync.andReturn('test');
            common.isIgnoreFile('test');

            expect(fs.readFileSync).toHaveBeenCalledWith('root/ADXIgnore', 'utf8');
        });

        it("should not read the ADXIgnore file when it was already read", function () {
            common.adxIgnoreFiles = "test";
            common.isIgnoreFile('test');
            expect(fs.readFileSync).not.toHaveBeenCalled();
        });

        function testIgnore(f) {
            it("should return true when the file should be ignored (" + f + ")", function () {
                spies.fs.readFileSync.andReturn([
                    '# Based on gitignore file #',
                    '###########################',
                    '',
                    '# Compiled source #',
                    '###################',
                    '*.com',
                    '*.class',
                    '*.dll',
                    '*.exe',
                    '*.o',
                    '*.so',
                    '',
                    '# Packages #',
                    '############',
                    '# it\'s better to unpack these files and commit the raw source',
                    '# git has its own built in compression methods',
                    '*.7z',
                    '*.dmg',
                    '*.gz',
                    '*.iso',
                    '*.jar',
                    '*.rar',
                    '*.tar',
                    '*.zip',
                    '',
                    '# Logs and databases #',
                    '######################',
                    '*.log',
                    '*.sql',
                    '*.sqlite',
                    '',
                    '# OS generated files #',
                    '######################',
                    '.DS_Store',
                    '.DS_Store?',
                    '._*',
                    '.Spotlight-V100',
                    '.Trashes',
                    'Icon?',
                    'ehthumbs.db',
                    'Thumbs.db'
                ].join('\r\n'));
                var value = common.isIgnoreFile(f);
                expect(value).toBe(true);
            });
        }

        ['test.com', 'test.class', 'test.dll', 'test.exe', 'test.o', 'test.so',
         'test.7z', 'test.dmg', 'test.gz', 'test.iso', 'test.jar', 'test.rar', 'test.tar', 'test.zip',
         'test.log', 'test.sql', 'test.sqlite',
            '.DS_Store', '.DS_Stor', '._test', '.Spotlight-V100', '.Trashes', 'Ico', 'Icon', 'ehthumbs.db', 'Thumbs.db'
        ].forEach(testIgnore);
    });

    describe('#getDirStructure', function () {
       it("should return an array with the structure of the directory", function () {
           var fakeStructure = [
               {
                   name : 'a',
                   sub  : ['a1', 'a2', 'a3']
               },
               {
                   name : 'b',
                   sub  : ['b1', {
                       name : 'c',
                       sub : ['c1', 'c2', {
                           name : 'd',
                           sub : []
                       }, 'c3']
                   }, 'b2']
               }
           ],
           dirSequence = [['a', 'b'], ['a1', 'a2', 'a3'], ['b1', 'c', 'b2'], ['c1', 'c2', 'd', 'c3']],
           current = -1,
           dirStat = {
                isDirectory : function () {
                    return true;
                }
            },
            fileStat = {
                isDirectory : function () {
                    return false;
                }
            },
           result;

           spies.fs.stat.andCallFake(function (path, callback) {
                if (path === 'root' || path  === 'root/a' || path === 'root/b' || path === 'root/b/c' || path === 'root/b/c/d') {
                    callback(null, dirStat);
                } else {
                    callback(null, fileStat);
                }
           });
           spies.fs.statSync.andCallFake(function (path) {
               if (path === 'root' || path  === 'root/a' || path === 'root/b' || path === 'root/b/c' || path === 'root/b/c/d') {
                   return dirStat;
               } else {
                   return fileStat;
               }
           });
           spies.fs.readdirSync.andCallFake(function (path) {
               current++;
               return dirSequence[current];
           });

           common.getDirStructure('root', function (err, structure) {
                result = structure;
           });

           expect(result).toEqual(fakeStructure);
       });

       it("should exclude ignored file", function () {

       });
    });

    describe('#getNewZip', function () {
        it("should return a new zip object", function () {
            var zip = common.getNewZip();
            expect(typeof zip.file).toBe('function');
        });
    });

    describe('#getChildProcessEnv', function () {
        it("should return a copy process environment with adxshell/sys64 in the path for x64 arch", function () {
            runInArch('x64', function () {
                // Arrange
                var root =  pathHelper.resolve(__dirname, "../../");
                var adxShellSysPath = pathHelper.join(root, common.ADX_UNIT_DIR_PATH, 'sys64');
                var expected = JSON.parse(JSON.stringify(process.env));
                expected.Path += ';' + adxShellSysPath;

                // Act
                var actual = common.getChildProcessEnv();

                // Assert
                expect(actual).toEqual(expected);
            });
        });

        it("should return a copy process environment with adxshell/sys32 in the path for ia32 arch", function () {
            runInArch('ia32', function () {
                // Arrange
                var root =  pathHelper.resolve(__dirname, "../../");
                var adxShellSysPath = pathHelper.join(root, common.ADX_UNIT_DIR_PATH, 'sys32');
                var expected = JSON.parse(JSON.stringify(process.env));
                expected.Path += ';' + adxShellSysPath;

                // Act
                var actual = common.getChildProcessEnv();

                // Assert
                expect(actual).toEqual(expected);
            });
        });
    });

    describe('#writeError', function () {
       it("should call console#error with red output and prefix the message with [ERROR]", function () {
           spyOn(console, 'error');
           common.writeError('Test');
           expect(console.error).toHaveBeenCalledWith(clc.red.bold("[ERROR]: Test"));
       });
    });

    describe('#writeWarning', function () {
        it("should call console#log with yellow output and prefix the message with [WARNING]", function () {
            spyOn(console, 'log');
            common.writeWarning('Here %s, %s, %s', 'A', 'B', 'C');
            expect(console.log).toHaveBeenCalledWith(clc.yellowBright("[WARNING]: Here A, B, C"));
        });
    });

    describe('#writeSuccess', function () {
        it("should call console#log with green output and prefix the message with [SUCCESS]", function () {
            spyOn(console, 'log');
            common.writeSuccess('Here %s, %s, %s', 'A', 'B', 'C');
            expect(console.log).toHaveBeenCalledWith(clc.greenBright("[SUCCESS]: Here A, B, C"));
        });
    });

    describe('#writeMessage', function () {
        it("should call console#log", function () {
            spyOn(console, 'log');
            common.writeMessage('Here %s, %s, %s', 'A', 'B', 'C');
            expect(console.log).toHaveBeenCalledWith("Here A, B, C");
        });
    });

    describe('#formatXmlDate', function () {
       it("should return the date formatted for the xml", function () {
           var date = new Date(2000, 0, 1);
           var formattedDate = common.formatXmlDate(date);
           expect(formattedDate).toBe('2000-01-01');
       });
    });

    describe('#evalTemplate', function () {

        function testReplacement(obj) {
            it("should replace the `" + obj.pattern + "` by the right value", function () {
                spyOn(common, 'formatXmlDate').andReturn('2013-12-31');
                var result = common.evalTemplate(obj.pattern, {
                    info : {
                        name   : 'adxname',
                        description : 'My description',
                        author : 'MySelf',
                        email : 'myself@test.com',
                        company : 'My Company',
                        site : 'http://my/web/site.com'
                    }
                });
                expect(result).toBe(obj.replacement);
            });
        }

        var replacement = [
            {
                pattern : "{{ADXName}}",
                replacement : "adxname"
            },
            {
                pattern : "{{ADXGuid}}",
                replacement : "guid"
            },
            {
                pattern : "2000-01-01",
                replacement : "2013-12-31"
            },
            {
                pattern : '{{ADXDescription}}',
                replacement : 'My description'
            },
            {
                pattern : '{{ADXAuthor}}',
                replacement : 'MySelf <myself@test.com>'
            },
            {
                pattern : '{{ADXAuthor.Name}}',
                replacement : 'MySelf'
            },
            {
                pattern : '{{ADXAuthor.Email}}',
                replacement : 'myself@test.com'
            },
            {
                pattern : '{{ADXAuthor.Company}}',
                replacement : 'My Company'
            },
            {
                pattern : '{{ADXAuthor.website}}',
                replacement : 'http://my/web/site.com'
            }
        ];
        replacement.forEach(testReplacement);

        it('should use the third array arguments to do additional replacements', function () {
           var additionalRepls = [
               {
                   pattern : /toto/gi,
                   replacement : 'popo'
               },
               {
                   pattern: /titi/gi,
                   replacement: 'pipi'
               }
           ];

            var result = common.evalTemplate('Titi and toto was TITI and TOTO etc...', {}, additionalRepls);
            expect(result).toEqual('pipi and popo was pipi and popo etc...');
        });
    });

    describe('Sequence', function () {
        describe('#constructor', function () {
            it("should initialize the sequence object with the sequence in argument", function () {
                var seq = new common.Sequence(['a', 'b']);
                expect(seq.sequence).toEqual(['a', 'b']);
            });
            it("should initialize the sequence object with the current property equal to -1", function () {
                var seq = new common.Sequence(['a', 'b']);
                expect(seq.current).toBe(-1);
            });
            it("should initialize the sequence object with the callback property equal to the specified callback", function () {
                function cb() {}
                var seq = new common.Sequence(['a', 'b'], cb);
                expect(seq.callback).toBe(cb);
            });
        });

        describe('#hasNext', function () {
          it("should return true when there is another function in the sequence to execute", function () {
              var seq = new common.Sequence([function () {}, function () {}]);
              expect(seq.hasNext()).toBe(true);
          });
          it("should return false when the sequence is not defined", function () {
              var seq = new common.Sequence(null);
              expect(seq.hasNext()).toBe(false);
          });
          it("should return false when the sequence is not an array", function () {
              var seq = new common.Sequence({});
              expect(seq.hasNext()).toBe(false);
          });
          it("should return false when the sequence is empty", function () {
              var seq = new common.Sequence([]);
              expect(seq.hasNext()).toBe(false);
          });
          it("should return false when there is no other function to execute", function () {
               var seq = new common.Sequence([function () {}]);
               seq.current = 2;
               expect(seq.hasNext()).toBe(false);
           });
        });

        describe('#nextIndex', function () {
           it ("should return -1 when no other function to execute", function () {
               var seq = new common.Sequence([]);
               var index = seq.nextIndex();
               expect(index).toBe(-1);
           });
           it("should return the index of the first fucntion to execute", function () {
               var seq = new common.Sequence([function() {}]);
               var index = seq.nextIndex();
               expect(index).toBe(0);
           });
           it("should return the index of the next function to execute", function () {
               var seq = new common.Sequence(['a', 'b', function() {}]);
               var index = seq.nextIndex();
               expect(index).toBe(2);
           });
        });

        describe('#resume', function () {
            it("should call the next function with the thisArg specified in the constructor", function () {
                var calls = [];
                function first() {
                    this.push('first');
                }
                function second(){
                    this.push('second');
                }

                var seq = new common.Sequence([first, second], null, calls);
                seq.resume();
                seq.resume();
                expect(calls).toEqual(['first', 'second']);
            });
            it("should call the next function to execute", function () {
              var calls = [];
              function first() {
                  calls.push('first');
              }
              function second(){
                  calls.push('second');
              }

              var seq = new common.Sequence([first, second]);
              seq.resume();
              seq.resume();
              expect(calls).toEqual(['first', 'second']);
            });
            it("should call the callback function when no other function to execute", function () {
                var hasCalled = false;
                function cb() {
                    hasCalled = true;
                }
                var seq = new common.Sequence(null, cb);
                seq.resume();
                expect(hasCalled).toBe(true);
            });
            it("should call the callback function with the thisArg specified in the constructor", function () {
                var obj = {};
                function cb() {
                    this.hasCalled = true;
                }
                var seq = new common.Sequence(null, cb, obj);
                seq.resume();
                expect(obj.hasCalled).toBe(true);
            });
            it("should call the callback function with the error argument of the #resume", function () {
                var error = new Error('fake error'),
                    arg;
                function cb(err) {
                    arg = err;
                }
                var seq = new common.Sequence(null, cb);
                seq.resume(error);
                expect(arg).toBe(error);
            });
            it("should call the callback function when an error occurred in the current function execute", function () {
                var hasBeenCalled = false;
                function cb(){
                    hasBeenCalled = true;
                }
                function first() {
                    seq.resume(new Error('fake error'));
                }
                function second() {}
                var seq = new common.Sequence([first, second], cb);
                seq.resume();
                expect(hasBeenCalled).toBe(true);
            });
            it("should not call the remain function if one of them call #resume with an error in arg", function () {
                var calls = [];
                function first() {
                    calls.push('first');
                    seq.resume(new Error('fake error'));
                }
                function second() {
                    calls.push('second');
                }
                var seq = new common.Sequence([first, second]);
                seq.resume();
                expect(calls).toEqual(['first']);
            });

        });
    });

});
