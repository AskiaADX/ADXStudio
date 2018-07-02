describe('ADXConfigurator', function () {

    var fs = require('fs'),
        path = require("path"),
        et = require('elementtree'),
        ElementTree = et.ElementTree,
        common,
        ADXConfigurator,
        spies = {},
        errMsg,
        successMsg;

    beforeEach(function () {
        // Clean the cache, obtain a fresh instance of the object each time
        var adxConfigKey = require.resolve('../../app/configurator/ADXConfigurator.js'),
            commonKey = require.resolve('../../app/common/common.js');

        delete require.cache[commonKey];
        common = require('../../app/common/common.js');

        delete require.cache[adxConfigKey];
        ADXConfigurator = require('../../app/configurator/ADXConfigurator.js').Configurator;

        // Messages
        errMsg = common.messages.error;
        successMsg = common.messages.success;

        // Court-circuit the validation outputs
        // spies.writeError    = spyOn(common, 'writeError');
        // spies.writeSuccess  = spyOn(common, 'writeSuccess');
        // spies.writeMessage  = spyOn(common, 'writeMessage');
        spies.dirExists     = spyOn(common, 'dirExists');

        // Court-circuit the access of the filesystem
        spies.fs = {
            readFile    : spyOn(fs, 'readFile'),
            writeFile   : spyOn(fs, 'writeFile')
        };

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

    describe("#constructor", function () {

        it("should throw an exception when the `path` argument of the constructor is a falsy", function () {

            expect(function () {
                var configurator = new ADXConfigurator();
            }).toThrow(errMsg.invalidPathArg);

        });

        it("should set the property #path to the object instance", function () {

            var configurator = new ADXConfigurator("my/path");
            expect(configurator.path).toEqual("my/path");
        });

    });

    describe("#load", function () {

        it("should return an error when the `path` specified via the constructor doesn't exist", function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(new Error(errMsg.noSuchFileOrDirectory));
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/invalid/path");
                configurator.load(function (err) {
                    expect(err.message).toEqual(errMsg.noSuchFileOrDirectory);
                    done();
                });
            });
        });

        it("should try to read the config.xml file", function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("a/valid/path");

                spies.fs.readFile.andCallFake(function (filepath) {
                    expect(filepath).toEqual(path.join("a/valid/path", "config.xml"));
                    done();
                });


                configurator.load();
            });
        });

        it("should return an error when it could not read the config.xml file", function () {
            var theError = new Error("A fake error");
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(theError, null);
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/invalid/path");
                configurator.load(function (err) {
                    expect(err).toBe(theError);
                    done();
                });
            });
        });

        it("should call the #fromXml() method with the content of the config.xml file", function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<xml></xml>');
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/invalid/path");
                var spyFromXml = spyOn(configurator, 'fromXml');
                configurator.load(function (err) {
                    expect(spyFromXml).toHaveBeenCalledWith('<xml></xml>');
                    done();
                });
            });
        });

    });

    describe("#fromXml", function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control>\n  <info>\n  <name>the-name</name>\n  <guid>the-guid</guid>\n  ' +
                    '<version>the-version</version>\n  <date>the-date</date>\n  <description><![CDATA[the-description]]></description>\n  ' +
                    '<company>the-company</company>\n  <author>the-author</author>\n  <site>the-site</site>\n  ' +
                    '<helpURL>the-helpURL</helpURL>\n  ' +
                    '<categories>\n    <category>cat-1</category>\n    <category>cat-2</category>\n  </categories>' +
                    '\n  <style width="200" height="400" />' +
                    '\n  <constraints>\n    <constraint on="questions" single="true" multiple="true" open="false" />' +
                    '\n    <constraint on="controls" label="true" responseblock="true" />' +
                    '\n    <constraint on="responses" min="2" max="*" />' +
                    '\n  </constraints>' +
                    '\n  </info></control>');
            });
        });

        it("should set the #xmldoc property with the XML parse result", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<control></control>');
            expect(configurator.xmldoc instanceof ElementTree).toBe(true);
        });

        it("should set the #projectType to 'adc' when the root node of the xml is `control`", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<control><info><guid>the-guid</guid><name>the-name</name></info></control>');
            expect(configurator.projectType).toEqual('adc');
        });

        it("should set the #projectType to 'adp' when the root node of the xml is `page`", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<page><info><guid>the-guid</guid><name>the-name</name></info></page>');
            expect(configurator.projectType).toEqual('adp');
        });

        it("should set the #projectVersion to '2.0.0' by default for the ADC", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<control><info><guid>the-guid</guid><name>the-name</name></info></control>');
            expect(configurator.projectVersion).toEqual('2.0.0');
        });

        it("should set the #projectVersion with the value defined in the root node of the ADC", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<control version="2.1.0"><info><guid>the-guid</guid><name>the-name</name></info></control>');
            expect(configurator.projectVersion).toEqual('2.1.0');
        });

        it("should set the #projectVersion to '2.1.0' by default for the ADP", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<page><info><guid>the-guid</guid><name>the-name</name></info></page>');
            expect(configurator.projectVersion).toEqual('2.1.0');
        });

        it("should set the #projectVersion with the value defined in the root node of the ADP", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            configurator.fromXml('<page version="2.1.1"><info><guid>the-guid</guid><name>the-name</name></info></page>');
            expect(configurator.projectVersion).toEqual('2.1.1');
        });

        it("should throw an error when the xml root node is not 'control' nor 'page'", function () {
            expect(function () {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.fromXml('<something><info><guid>the-guid</guid><name>the-name</name></info></something>');
            }).toThrow(new Error(common.messages.error.invalidConfigFile))
        });

        it("should reset the configuration with XML", function () {
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    configurator.fromXml('<control>\n  <info>\n  <name>new-name</name>\n  <guid>new-guid</guid>\n  ' +
                        '<version>new-version</version>\n  <date>new-date</date>\n  <description><![CDATA[new-description]]></description>\n  ' +
                        '<company>new-company</company>\n  <author>new-author</author>\n  <site>new-site</site>\n  ' +
                        '<helpURL>new-helpURL</helpURL>\n  ' +
                        '<categories>\n    <category>new-cat-1</category>\n    <category>new-cat-2</category>\n    <category>new-cat-3</category>\n  </categories>' +
                        '\n  <style width="300" height="500" />' +
                        '\n  <constraints>\n    <constraint on="questions" single="false" multiple="true" open="false" numeric="true" />' +
                        '\n    <constraint on="controls" label="false" responseblock="true" checkbox="true" />' +
                        '\n    <constraint on="responses" min="10" max="*" />' +
                        '\n  </constraints>' +
                        '\n  </info></control>');
                    var result = configurator.toXml();
                    expect(result ).toEqual('<?xml version="1.0" encoding="utf-8"?>'+
                        '\n<control  xmlns="http://www.askia.com/2.0.0/ADCSchema"' +
                        '\n          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                        '\n          xsi:schemaLocation="http://www.askia.com/2.0.0/ADCSchema https://raw.githubusercontent.com/AskiaADX/ADXSchema/2.0.0/ADCSchema.xsd"' +
                        '\n          version="2.0.0"' +
                        '\n          askiaCompat="5.3.3">' +
                        '\n  <info>' +
                        '\n    <name>new-name</name>' +
                        '\n    <guid>new-guid</guid>' +
                        '\n    <version>new-version</version>' +
                        '\n    <date>new-date</date>' +
                        '\n    <description><![CDATA[new-description]]></description>' +
                        '\n    <company>new-company</company>' +
                        '\n    <author><![CDATA[new-author]]></author>' +
                        '\n    <site>new-site</site>' +
                        '\n    <helpURL>new-helpURL</helpURL>' +
                        '\n    <categories>' +
                        '\n      <category>new-cat-1</category>' +
                        '\n      <category>new-cat-2</category>' +
                        '\n      <category>new-cat-3</category>' +
                        '\n    </categories>' +
                        '\n    <style width="300" height="500" />' +
                        '\n    <constraints>' +
                        '\n      <constraint on="questions" single="false" multiple="true" open="false" numeric="true" />' +
                        '\n      <constraint on="controls" label="false" responseblock="true" checkbox="true" />' +
                        '\n      <constraint on="responses" min="10" max="*" />' +
                        '\n    </constraints>' +
                        '\n  </info>' +
                        '\n</control>');
                    done();
                });
            });
        });


    });

    describe("#toXml", function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
        });

        it("should return the configuration of ADC 2.0 as XML", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</control>');
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    var result = configurator.toXml();
                    expect(result ).toEqual('<?xml version="1.0" encoding="utf-8"?>'+
                        '\n<control  xmlns="http://www.askia.com/2.0.0/ADCSchema"' +
                        '\n          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                        '\n          xsi:schemaLocation="http://www.askia.com/2.0.0/ADCSchema https://raw.githubusercontent.com/AskiaADX/ADXSchema/2.0.0/ADCSchema.xsd"' +
                        '\n          version="2.0.0"' +
                        '\n          askiaCompat="5.3.3">' +
                        '\n  <info>' +
                        '\n    <name>the-name</name>' +
                        '\n    <guid>the-guid</guid>' +
                        '\n    <version>the-version</version>' +
                        '\n    <date>the-date</date>' +
                        '\n    <description><![CDATA[the-description]]></description>' +
                        '\n    <company>the-company</company>' +
                        '\n    <author><![CDATA[the-author]]></author>' +
                        '\n    <site>the-site</site>' +
                        '\n    <helpURL>the-helpURL</helpURL>' +
                        '\n    <categories>' +
                        '\n      <category>cat-1</category>' +
                        '\n      <category>cat-2</category>' +
                        '\n    </categories>' +
                        '\n    <style width="200" height="400" />' +
                        '\n    <constraints>' +
                        '\n      <constraint on="questions" single="true" multiple="true" open="false" />' +
                        '\n      <constraint on="controls" label="true" responseblock="true" />' +
                        '\n      <constraint on="responses" min="2" max="*" />' +
                        '\n    </constraints>' +
                        '\n  </info>' +
                        '\n  <outputs defaultOutput="main">' +
                        '\n    <output id="main">' +
                        '\n      <description><![CDATA[Main output]]></description>' +
                        '\n      <content fileName="main.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                        '\n      <content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="second">' +
                        '\n      <description><![CDATA[Second output]]></description>' +
                        '\n      <condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '\n      <content fileName="second.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                        '\n      <content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="third" defaultGeneration="false" maxIterations="12">' +
                        '\n      <description><![CDATA[Third output]]></description>' +
                        '\n      <content fileName="third.css" type="css" mode="static" position="head">' +
                        '\n        <attribute name="rel">' +
                        '\n          <value><![CDATA[alternate]]></value>' +
                        '\n        </attribute>' +
                        '\n        <attribute name="media">' +
                        '\n          <value><![CDATA[print]]></value>' +
                        '\n        </attribute>' +
                        '\n      </content>' +
                        '\n      <content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '\n        <yield>' +
                        '<![CDATA[<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->]]>' +
                        '</yield>' +
                        '\n      </content>' +
                        '\n    </output>' +
                        '\n  </outputs>' +
                        '\n  <properties>' +
                        '\n    <category id="general" name="General">' +
                        '\n      <property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                        '\n        <description><![CDATA[Type of rendering]]></description>' +
                        '\n        <value><![CDATA[classic]]></value>' +
                        '\n        <options>' +
                        '\n          <option value="classic" text="Classic" />' +
                        '\n          <option value="image" text="Image" />' +
                        '\n        </options>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" numeric="true" open="true">' +
                        '\n        <description><![CDATA[Additional open-ended question that could be use to emulate semi-open]]></description>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="images" name="Rendering type images">' +
                        '\n      <property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of single question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Single.png]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of multiple question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Multiple.png]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="fake" name="Fake for test">' +
                        '\n      <property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" mode="dynamic" require="true" visible="false" min="12" max="100.5" decimal="3">' +
                        '\n        <description><![CDATA[Test number properties]]></description>' +
                        '\n        <value><![CDATA[13]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                        '\n        <description><![CDATA[Test color properties]]></description>' +
                        '\n        <value><![CDATA[255,255,255]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                        '\n        <description><![CDATA[Test question properties]]></description>' +
                        '\n        <value></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                        '\n        <description><![CDATA[Test file properties]]></description>' +
                        '\n        <value><![CDATA[file.test]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                        '\n        <description><![CDATA[Test string properties]]></description>' +
                        '\n        <value><![CDATA[test@test.com]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n  </properties>' +
                        '\n</control>');
                    done();
                });
            });
        });

        it("should return the configuration of ADC 2.1 as XML", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control version="2.1.0"><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</control>');
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    var result = configurator.toXml();
                    expect(result ).toEqual('<?xml version="1.0" encoding="utf-8"?>'+
                        '\n<control  xmlns="http://www.askia.com/2.1.0/ADCSchema"' +
                        '\n          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                        '\n          xsi:schemaLocation="http://www.askia.com/2.1.0/ADCSchema https://raw.githubusercontent.com/AskiaADX/ADXSchema/2.1.0/ADCSchema.xsd"' +
                        '\n          version="2.1.0"' +
                        '\n          askiaCompat="5.4.2">' +
                        '\n  <info>' +
                        '\n    <name>the-name</name>' +
                        '\n    <guid>the-guid</guid>' +
                        '\n    <version>the-version</version>' +
                        '\n    <date>the-date</date>' +
                        '\n    <description><![CDATA[the-description]]></description>' +
                        '\n    <company>the-company</company>' +
                        '\n    <author><![CDATA[the-author]]></author>' +
                        '\n    <site>the-site</site>' +
                        '\n    <helpURL>the-helpURL</helpURL>' +
                        '\n    <categories>' +
                        '\n      <category>cat-1</category>' +
                        '\n      <category>cat-2</category>' +
                        '\n    </categories>' +
                        '\n    <constraints>' +
                        '\n      <constraint on="questions" single="true" multiple="true" open="false" />' +
                        '\n      <constraint on="controls" label="true" responseblock="true" />' +
                        '\n      <constraint on="responses" min="2" max="*" />' +
                        '\n    </constraints>' +
                        '\n  </info>' +
                        '\n  <outputs defaultOutput="main">' +
                        '\n    <output id="main">' +
                        '\n      <description><![CDATA[Main output]]></description>' +
                        '\n      <content fileName="main.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                        '\n      <content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="second">' +
                        '\n      <description><![CDATA[Second output]]></description>' +
                        '\n      <condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '\n      <content fileName="second.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                        '\n      <content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="third" defaultGeneration="false" maxIterations="12">' +
                        '\n      <description><![CDATA[Third output]]></description>' +
                        '\n      <content fileName="third.css" type="css" mode="static" position="head">' +
                        '\n        <attribute name="rel">' +
                        '\n          <value><![CDATA[alternate]]></value>' +
                        '\n        </attribute>' +
                        '\n        <attribute name="media">' +
                        '\n          <value><![CDATA[print]]></value>' +
                        '\n        </attribute>' +
                        '\n      </content>' +
                        '\n      <content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '\n        <yield>' +
                        '<![CDATA[<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->]]>' +
                        '</yield>' +
                        '\n      </content>' +
                        '\n    </output>' +
                        '\n  </outputs>' +
                        '\n  <properties>' +
                        '\n    <category id="general" name="General">' +
                        '\n      <property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                        '\n        <description><![CDATA[Type of rendering]]></description>' +
                        '\n        <value><![CDATA[classic]]></value>' +
                        '\n        <options>' +
                        '\n          <option value="classic" text="Classic" />' +
                        '\n          <option value="image" text="Image" />' +
                        '\n        </options>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" numeric="true" open="true">' +
                        '\n        <description><![CDATA[Additional open-ended question that could be use to emulate semi-open]]></description>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="images" name="Rendering type images">' +
                        '\n      <property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of single question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Single.png]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of multiple question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Multiple.png]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="fake" name="Fake for test">' +
                        '\n      <property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" mode="dynamic" require="true" visible="false" min="12" max="100.5" decimal="3">' +
                        '\n        <description><![CDATA[Test number properties]]></description>' +
                        '\n        <value><![CDATA[13]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                        '\n        <description><![CDATA[Test color properties]]></description>' +
                        '\n        <value><![CDATA[255,255,255]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                        '\n        <description><![CDATA[Test question properties]]></description>' +
                        '\n        <value></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                        '\n        <description><![CDATA[Test file properties]]></description>' +
                        '\n        <value><![CDATA[file.test]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                        '\n        <description><![CDATA[Test string properties]]></description>' +
                        '\n        <value><![CDATA[test@test.com]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n  </properties>' +
                        '\n</control>');
                    done();
                });
            });
        });

        it("should return the configuration of ADP 2.1 as XML", function () {

            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main" masterPage="main.html">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second" masterPage="second.html">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" masterPage="third.html">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</page>');
            });
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    var result = configurator.toXml();
                    expect(result ).toEqual('<?xml version="1.0" encoding="utf-8"?>'+
                        '\n<page  xmlns="http://www.askia.com/2.1.0/ADPSchema"' +
                        '\n          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                        '\n          xsi:schemaLocation="http://www.askia.com/2.1.0/ADPSchema https://raw.githubusercontent.com/AskiaADX/ADXSchema/2.1.0/ADPSchema.xsd"' +
                        '\n          version="2.1.0"' +
                        '\n          askiaCompat="5.4.2">' +
                        '\n  <info>' +
                        '\n    <name>the-name</name>' +
                        '\n    <guid>the-guid</guid>' +
                        '\n    <version>the-version</version>' +
                        '\n    <date>the-date</date>' +
                        '\n    <description><![CDATA[the-description]]></description>' +
                        '\n    <company>the-company</company>' +
                        '\n    <author><![CDATA[the-author]]></author>' +
                        '\n    <site>the-site</site>' +
                        '\n    <helpURL>the-helpURL</helpURL>' +
                        '\n  </info>' +
                        '\n  <outputs defaultOutput="main">' +
                        '\n    <output id="main" masterPage="main.html">' +
                        '\n      <description><![CDATA[Main output]]></description>' +
                        '\n      <content fileName="main.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="second" masterPage="second.html">' +
                        '\n      <description><![CDATA[Second output]]></description>' +
                        '\n      <condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '\n      <content fileName="second.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="third" masterPage="third.html">' +
                        '\n      <description><![CDATA[Third output]]></description>' +
                        '\n      <content fileName="third.css" type="css" mode="static" position="head">' +
                        '\n        <attribute name="rel">' +
                        '\n          <value><![CDATA[alternate]]></value>' +
                        '\n        </attribute>' +
                        '\n        <attribute name="media">' +
                        '\n          <value><![CDATA[print]]></value>' +
                        '\n        </attribute>' +
                        '\n      </content>' +
                        '\n      <content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '\n        <yield>' +
                        '<![CDATA[<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->]]>' +
                        '</yield>' +
                        '\n      </content>' +
                        '\n    </output>' +
                        '\n  </outputs>' +
                        '\n  <properties>' +
                        '\n    <category id="general" name="General">' +
                        '\n      <property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                        '\n        <description><![CDATA[Type of rendering]]></description>' +
                        '\n        <value><![CDATA[classic]]></value>' +
                        '\n        <options>' +
                        '\n          <option value="classic" text="Classic" />' +
                        '\n          <option value="image" text="Image" />' +
                        '\n        </options>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="images" name="Rendering type images">' +
                        '\n      <property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of single question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Single.png]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '\n        <description><![CDATA[Image of multiple question when the rendering type is image]]></description>' +
                        '\n        <value><![CDATA[Multiple.png]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n    <category id="fake" name="Fake for test">' +
                        '\n      <property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" mode="dynamic" require="true" visible="false" min="12" max="100.5" decimal="3">' +
                        '\n        <description><![CDATA[Test number properties]]></description>' +
                        '\n        <value><![CDATA[13]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                        '\n        <description><![CDATA[Test color properties]]></description>' +
                        '\n        <value><![CDATA[255,255,255]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                        '\n        <description><![CDATA[Test file properties]]></description>' +
                        '\n        <value><![CDATA[file.test]]></value>' +
                        '\n      </property>' +
                        '\n      <property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                        '\n        <description><![CDATA[Test string properties]]></description>' +
                        '\n        <value><![CDATA[test@test.com]]></value>' +
                        '\n      </property>' +
                        '\n    </category>' +
                        '\n  </properties>' +
                        '\n</page>');
                    done();
                });
            });
        });
    });

    describe("#get", function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
        });

        it("should return the configuration of the ADC as object  (clean object)", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</control>');
            });

            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    var result = configurator.get();
                    expect(result ).toEqual({
                        info : {
                            name : "the-name",
                            guid : "the-guid",
                            version : "the-version",
                            date : "the-date",
                            description : "the-description",
                            company : "the-company",
                            author : "the-author",
                            site : "the-site",
                            helpURL : "the-helpURL",
                            categories : ["cat-1", "cat-2"],
                            style : {
                                width : 200,
                                height : 400
                            },
                            constraints : {
                                questions : {
                                    single : true,
                                    multiple : true,
                                    open : false
                                },
                                controls : {
                                    label : true,
                                    responseblock : true
                                },
                                responses : {
                                    min : 2,
                                    max : '*'
                                }
                            }
                        },
                        outputs : {
                            defaultOutput : 'main',
                            outputs : [
                                {
                                    id : "main",
                                    description : "Main output",
                                    contents : [
                                        {
                                            fileName : 'main.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "second",
                                    description : "Second output",
                                    condition : "Browser.Support(\"javascript\")",
                                    contents : [
                                        {
                                            fileName : 'second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "third",
                                    description : "Third output",
                                    maxIterations : 12,
                                    defaultGeneration : false,
                                    contents : [
                                        {
                                            fileName : "third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "rel",
                                                    value : "alternate"
                                                },
                                                {
                                                    name : "media",
                                                    value : "print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "general",
                                name: "General",
                                properties: [
                                    {
                                        id: "renderingType",
                                        name: "Rendering type",
                                        type: "string",
                                        description: "Type of rendering",
                                        value: "classic",
                                        options: [
                                            {
                                                value: "classic",
                                                text: "Classic"
                                            },
                                            {
                                                value: "image",
                                                text: "Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        numeric : true,
                                        open : true,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "fake",
                                    name : "Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "TEST",
                                            type : "number",
                                            mode : "dynamic",
                                            visible : false,
                                            require : true,
                                            min  :12,
                                            max : 100.5,
                                            decimal : 3,
                                            description : "Test number properties",
                                            value : "13"
                                        },
                                        {
                                            id : "testColor",
                                            name : "TEST",
                                            type : "color",
                                            colorFormat  :"rgb",
                                            description : "Test color properties",
                                            value : "255,255,255"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "TEST",
                                            type : "question",
                                            chapter : false,
                                            single : true,
                                            multiple : true,
                                            numeric : false,
                                            open : false,
                                            date : false,
                                            description : "Test question properties",
                                            value : ""
                                        },
                                        {
                                            id : "testFile",
                                            name : "TEST",
                                            type : "file",
                                            fileExtension : ".test, .test2",
                                            description : "Test file properties",
                                            value : "file.test"
                                        },
                                        {
                                            id : "testString",
                                            name : "TEST",
                                            type : "string",
                                            pattern : ".+@.+",
                                            description : "Test string properties",
                                            value : "test@test.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    done();
                });
            });
        });

        it("should return the configuration of the ADP as object (clean object)", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main" masterPage="default_main.html">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second" masterPage="default_second.html">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12" masterPage="default_third.html">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</page>');
            });

            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    var result = configurator.get();
                    expect(result ).toEqual({
                        info : {
                            name : "the-name",
                            guid : "the-guid",
                            version : "the-version",
                            date : "the-date",
                            description : "the-description",
                            company : "the-company",
                            author : "the-author",
                            site : "the-site",
                            helpURL : "the-helpURL"
                        },
                        outputs : {
                            defaultOutput : 'main',
                            outputs : [
                                {
                                    id : "main",
                                    masterPage : "default_main.html",
                                    description : "Main output",
                                    contents : [
                                        {
                                            fileName : 'main.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "second",
                                    masterPage : "default_second.html",
                                    description : "Second output",
                                    condition : "Browser.Support(\"javascript\")",
                                    contents : [
                                        {
                                            fileName : 'second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "third",
                                    description : "Third output",
                                    masterPage : "default_third.html",
                                    contents : [
                                        {
                                            fileName : "third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "rel",
                                                    value : "alternate"
                                                },
                                                {
                                                    name : "media",
                                                    value : "print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "general",
                                name: "General",
                                properties: [
                                    {
                                        id: "renderingType",
                                        name: "Rendering type",
                                        type: "string",
                                        description: "Type of rendering",
                                        value: "classic",
                                        options: [
                                            {
                                                value: "classic",
                                                text: "Classic"
                                            },
                                            {
                                                value: "image",
                                                text: "Image"
                                            }
                                        ]
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "fake",
                                    name : "Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "TEST",
                                            type : "number",
                                            mode : "dynamic",
                                            visible : false,
                                            require : true,
                                            min  :12,
                                            max : 100.5,
                                            decimal : 3,
                                            description : "Test number properties",
                                            value : "13"
                                        },
                                        {
                                            id : "testColor",
                                            name : "TEST",
                                            type : "color",
                                            colorFormat  :"rgb",
                                            description : "Test color properties",
                                            value : "255,255,255"
                                        },
                                        {
                                            id : "testFile",
                                            name : "TEST",
                                            type : "file",
                                            fileExtension : ".test, .test2",
                                            description : "Test file properties",
                                            value : "file.test"
                                        },
                                        {
                                            id : "testString",
                                            name : "TEST",
                                            type : "string",
                                            pattern : ".+@.+",
                                            description : "Test string properties",
                                            value : "test@test.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    done();
                });
            });
        });
    });

    describe("#set", function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
        });

        it("should set the configuration of the ADC using the object in arg (with cleaning)", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</control>');
            });

            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    configurator.set({
                        info : {
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        },
                        outputs : {
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        xsiType: "askiaProperty",
                                        id: "askia-theme",
                                        options: [
                                            {
                                                value: "new-red-theme",
                                                text: "New Red"
                                            },
                                            {
                                                value: "new-blue-theme",
                                                text: "New Blue"
                                            }
                                        ]
                                    },
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png",
                                            valueTheme : {
                                                "new-red-theme" : "SingleRed.png",
                                                "new-blue-theme" : "SingleBlue.png"
                                            }
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png",
                                            valueTheme : {
                                                "red-theme" : "MultipleRed.png",
                                                "blue-theme" : "MultipleBlue.png"
                                            }
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    var result = configurator.get();
                    expect(result ).toEqual({
                        info : {
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    multiple : true,
                                    open : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    responseblock : true,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10,
                                    max : "*"
                                }
                            }
                        },
                        outputs : {
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    done();
                });
            });
        });

        it("should set the configuration of the ADP using the object in arg (with cleaning)", function () {
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main" masterPage="default_main.html">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second" masterPage="default_second.html">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" masterPage="default_third.html">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</page>');
            });

            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                configurator.load(function () {
                    configurator.set({
                        info : {
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        },
                        outputs : {
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    masterPage : "new_default_main.html",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    masterPage : "new_default_second.html",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    masterPage : "new_default_third.html",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        xsiType: "askiaProperty",
                                        id: "askia-theme",
                                        options: [
                                            {
                                                value: "new-red-theme",
                                                text: "New Red"
                                            },
                                            {
                                                value: "new-blue-theme",
                                                text: "New Blue"
                                            }
                                        ]
                                    },
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png",
                                            valueTheme : {
                                                "new-red-theme" : "SingleRed.png",
                                                "new-blue-theme" : "SingleBlue.png"
                                            }
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png",
                                            valueTheme : {
                                                "red-theme" : "MultipleRed.png",
                                                "blue-theme" : "MultipleBlue.png"
                                            }
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    var result = configurator.get();
                    expect(result ).toEqual({
                        info : {
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL"
                        },
                        outputs : {
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    masterPage : "new_default_main.html",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    masterPage : "new_default_second.html",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    masterPage : "new_default_third.html",
                                    description : "New Third output",
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        },
                        properties : {
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        }
                    });
                    done();
                });
            });
        });
    });

    describe("#info", function () {

        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                if (p === 'adc\\path\\config.xml') {
                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info></control>');
                }
                else if (p === 'adc2.1\\path\\config.xml') {
                    cb(null, '<control version="2.1.0"><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info></control>');
                }
                else  if (p === 'adp\\path\\config.xml') {
                    cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '</info></page>');
                }
            });

        });

        describe("#get", function () {
            it("should return the ADC information as plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "the-name",
                            guid : "the-guid",
                            version : "the-version",
                            date : "the-date",
                            description : "the-description",
                            company : "the-company",
                            author : "the-author",
                            site : "the-site",
                            helpURL : "the-helpURL",
                            categories : ["cat-1", "cat-2"],
                            style : {
                                width : 200,
                                height : 400
                            },
                            constraints : {
                                questions : {
                                    single : true,
                                    multiple : true,
                                    open : false
                                },
                                controls : {
                                    label : true,
                                    responseblock : true
                                },
                                responses : {
                                    min : 2,
                                    max : '*'
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should return the ADC 2.1 information as plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "the-name",
                            guid : "the-guid",
                            version : "the-version",
                            date : "the-date",
                            description : "the-description",
                            company : "the-company",
                            author : "the-author",
                            site : "the-site",
                            helpURL : "the-helpURL",
                            categories : ["cat-1", "cat-2"],
                            constraints : {
                                questions : {
                                    single : true,
                                    multiple : true,
                                    open : false
                                },
                                controls : {
                                    label : true,
                                    responseblock : true
                                },
                                responses : {
                                    min : 2,
                                    max : '*'
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should return the ADP information as plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "the-name",
                            guid : "the-guid",
                            version : "the-version",
                            date : "the-date",
                            description : "the-description",
                            company : "the-company",
                            author : "the-author",
                            site : "the-site",
                            helpURL : "the-helpURL"
                        });
                        done();
                    });
                });
            });
        });

        describe("#set", function () {
            it("should set the ADC information with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    multiple : true,
                                    open : false,
                                    numeric : true
                                },
                                controls : {
                                    label : false,
                                    responseblock : true,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10,
                                    max : '*'
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should create the ADC information when it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<control></control>');
                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label : false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should set the ADC 2.1 information with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            constraints : {
                                questions : {
                                    single : false,
                                    multiple : true,
                                    open : false,
                                    numeric : true
                                },
                                controls : {
                                    label : false,
                                    responseblock : true,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10,
                                    max : '*'
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should create the ADC 2.1 information when it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<control version="2.1.0:"></control>');
                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            style : {
                                width : 300,
                                height : 500
                            },
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label :false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL",
                            categories : ["new-cat-1", "new-cat-2", "new-cat-3"],
                            constraints : {
                                questions : {
                                    single : false,
                                    numeric : true
                                },
                                controls : {
                                    label : false,
                                    checkbox : true
                                },
                                responses : {
                                    min : 10
                                }
                            }
                        });
                        done();
                    });
                });
            });

            it("should set the ADP information with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL"
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL"
                        });
                        done();
                    });
                });
            });

            it("should create the ADP information when it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<page></page>');
                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.info.set({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL"
                        });
                        var result = configurator.info.get();
                        expect(result ).toEqual({
                            name : "new-name",
                            guid : "new-guid",
                            version : "new-version",
                            date : "new-date",
                            description : "new-description",
                            company : "new-company",
                            author : "new-author",
                            site : "new-site",
                            helpURL : "new-helpURL"
                        });
                        done();
                    });
                });
            });
        });

        ["name", "guid", "version", "date", "description", "company", "author", "site", "helpURL"].forEach(function (propName) {

            ['adc', 'adp'].forEach(function (projectType) {
                describe("#" + propName, function () {

                    it("should return the value from the " + projectType.toUpperCase() + " xml node", function () {

                        runSync(function (done) {
                            var configurator = new ADXConfigurator(projectType + "/path");
                            configurator.load(function () {
                                var result = configurator.info[propName]();
                                expect(result).toEqual('the-' + propName);
                                done();
                            });
                        });
                    });

                    it("should set the value of " +
                        projectType.toUpperCase(), function () {
                        runSync(function (done) {
                            var configurator = new ADXConfigurator(projectType + "/path");
                            configurator.load(function () {
                                configurator.info[propName]('new-' + propName);
                                var result = configurator.info[propName]();
                                expect(result).toEqual('new-' + propName);
                                done();
                            });
                        });
                    });

                    it("should create the node when it's not defined in the " + projectType.toUpperCase() + " xml", function () {
                        spies.fs.readFile.andCallFake(function (p, cb) {
                            if (p === 'adc\\path\\config.xml') {
                                cb(null, '<control></control>');
                            } else {
                                cb(null, '<page></page>');
                            }

                        });
                        runSync(function (done) {
                            var configurator = new ADXConfigurator(projectType + "/path");
                            configurator.load(function () {
                                configurator.info[propName]('new-' + propName);
                                var result = configurator.info[propName]();
                                expect(result).toEqual('new-' + propName);
                                done();
                            });
                        });
                    });
                });
            });

        });

        describe("#style (ADC only)", function () {

            it("should return the value from the xml node (ADC only)", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.info.style();
                        expect(result ).toEqual({ width : 200, height : 400});
                        done();
                    });
                });
            });

            it("should set the value (ADC only)", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.info.style({width : 300, height : 500});
                        var result = configurator.info.style();
                        expect(result ).toEqual({width : 300, height : 500});
                        done();
                    });
                });
            });

            it("should NOT return the value from the xml node (ADC 2.1)", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        var result = configurator.info.style();
                        expect(result ).toEqual(undefined);
                        done();
                    });
                });
            });

            it("should NOT set the value (ADC 2.1)", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        configurator.info.style({width : 300, height : 500});
                        var result = configurator.info.style();
                        expect(result).toEqual(undefined);
                        done();
                    });
                });
            });
        });

        describe("#categories (ADC only)", function () {
            it("should return the value from the xml node (ADC only)", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.info.categories();
                        expect(result ).toEqual(['cat-1', 'cat-2']);
                        done();
                    });
                });
            });

            it("should set the value (ADC only)", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.info.categories(['new-1', 'new-2', 'new-3']);
                        var result = configurator.info.categories();
                        expect(result ).toEqual(['new-1', 'new-2', 'new-3']);
                        done();
                    });
                });
            });
        });

        describe("#constraints (ADC only)", function () {
            it("should return the value from the xml node (ADC only)", function () {

                 runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.info.constraints();
                        expect(result ).toEqual({
                            questions : {
                                single : true,
                                multiple : true,
                                open : false
                            },
                            controls : {
                                label : true,
                                responseblock : true
                            },
                            responses : {
                                min : 2,
                                max : '*'
                            }
                        });
                        done();
                    });
                });
            });

            it("should set the value (ADC only)", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.info.constraints({
                            questions : {
                                single : false,
                                open : true
                            },
                            controls : {
                                label : false
                            },
                            responses : {
                                max : 50
                            }
                        });
                        var result = configurator.info.constraints();
                        expect(result ).toEqual({
                            questions : {
                                single : false,
                                multiple : true,
                                open : true
                            },
                            controls : {
                                label : false,
                                responseblock : true
                            },
                            responses : {
                                min : 2,
                                max : 50
                            }
                        });
                        done();
                    });
                });
            });
        });

        describe("#constraint (ADC only)", function () {

            [
                {
                    name : "questions",
                    atts : [
                        {
                            name : "single",
                            value : true,
                            newValue : false
                        },
                        {
                            name : "multiple",
                            value : true,
                            newValue : false
                        },
                        {
                            name : "open",
                            value : false,
                            newValue : true
                        },
                        {
                            name : "numeric",
                            value : false,
                            newValue : true
                        }
                    ]
                },
                {
                    name : "controls",
                    atts : [
                        {
                            name : "label",
                            value : true,
                            newValue : false
                        },
                        {
                            name : "responseblock",
                            value : true,
                            newValue : false
                        },
                        {
                            name : "checkbox",
                            value : false,
                            newValue : true
                        }
                    ]
                },
                {
                    name : "responses",
                    atts : [
                        {
                            name : "min",
                            value : 2,
                            newValue : 10
                        },
                        {
                            name : "max",
                            value : Infinity,
                            newValue : 50
                        }
                    ]
                }
            ].forEach(function (target) {

                   describe("#constraint on=" + target.name + " (ADC only)", function () {
                        target.atts.forEach(function(att) {

                            it("should return the value from the xml attribute ('" + att.name + "') (ADC only)", function () {

                                runSync(function (done) {
                                    var configurator = new ADXConfigurator("adc/path");
                                    configurator.load(function () {
                                        var result = configurator.info.constraint(target.name, att.name);
                                        expect(result).toEqual(att.value);
                                        done();
                                    });
                                });
                            });

                            it("should set the value ('" + att.name + "') (ADC only)", function () {
                                runSync(function (done) {
                                    var configurator = new ADXConfigurator("adc/path");
                                    configurator.load(function () {
                                        configurator.info.constraint(target.name, att.name, att.newValue);
                                        var result = configurator.info.constraint(target.name, att.name);
                                        expect(result ).toEqual(att.newValue);
                                        done();
                                    });
                                });
                            });


                        });
                   });
            });

        });

        describe("#toXml", function () {
            it("should return the ADC information as Xml String", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.info.toXml();
                        expect(result ).toEqual('  <info>' +
                            '\n    <name>the-name</name>' +
                            '\n    <guid>the-guid</guid>' +
                            '\n    <version>the-version</version>' +
                            '\n    <date>the-date</date>' +
                            '\n    <description><![CDATA[the-description]]></description>' +
                            '\n    <company>the-company</company>' +
                            '\n    <author><![CDATA[the-author]]></author>' +
                            '\n    <site>the-site</site>' +
                            '\n    <helpURL>the-helpURL</helpURL>' +
                            '\n    <categories>' +
                            '\n      <category>cat-1</category>' +
                            '\n      <category>cat-2</category>' +
                            '\n    </categories>' +
                            '\n    <style width="200" height="400" />' +
                            '\n    <constraints>' +
                            '\n      <constraint on="questions" single="true" multiple="true" open="false" />' +
                            '\n      <constraint on="controls" label="true" responseblock="true" />' +
                            '\n      <constraint on="responses" min="2" max="*" />' +
                            '\n    </constraints>' +
                            '\n  </info>');
                        done();
                    });
                });
            });

            it("should return the ADC 2.1 information as Xml String", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc2.1/path");
                    configurator.load(function () {
                        var result = configurator.info.toXml();
                        expect(result ).toEqual('  <info>' +
                            '\n    <name>the-name</name>' +
                            '\n    <guid>the-guid</guid>' +
                            '\n    <version>the-version</version>' +
                            '\n    <date>the-date</date>' +
                            '\n    <description><![CDATA[the-description]]></description>' +
                            '\n    <company>the-company</company>' +
                            '\n    <author><![CDATA[the-author]]></author>' +
                            '\n    <site>the-site</site>' +
                            '\n    <helpURL>the-helpURL</helpURL>' +
                            '\n    <categories>' +
                            '\n      <category>cat-1</category>' +
                            '\n      <category>cat-2</category>' +
                            '\n    </categories>' +
                            '\n    <constraints>' +
                            '\n      <constraint on="questions" single="true" multiple="true" open="false" />' +
                            '\n      <constraint on="controls" label="true" responseblock="true" />' +
                            '\n      <constraint on="responses" min="2" max="*" />' +
                            '\n    </constraints>' +
                            '\n  </info>');
                        done();
                    });
                });
            });

            it("should return the ADP information as Xml String", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.info.toXml();
                        expect(result ).toEqual('  <info>' +
                            '\n    <name>the-name</name>' +
                            '\n    <guid>the-guid</guid>' +
                            '\n    <version>the-version</version>' +
                            '\n    <date>the-date</date>' +
                            '\n    <description><![CDATA[the-description]]></description>' +
                            '\n    <company>the-company</company>' +
                            '\n    <author><![CDATA[the-author]]></author>' +
                            '\n    <site>the-site</site>' +
                            '\n    <helpURL>the-helpURL</helpURL>' +
                            '\n  </info>');
                        done();
                    });
                });
            });
        });
    });

    describe('#outputs', function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                if (p === 'adc\\path\\config.xml') {
                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" defaultGeneration="false" maxIterations="12">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '</control>');
                } else if (p === 'adp\\path\\config.xml') {
                    cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main" masterPage="main.html">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second" masterPage="second.html">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" masterPage="third.html">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '</page>');
                }

            });
        });

        describe("#defaultOutput", function () {

            ['adc', 'adp'].forEach(function (projectType) {
                it("should return the id of the default " + projectType.toUpperCase() + " output", function () {

                    runSync(function (done) {
                        var configurator = new ADXConfigurator(projectType + "/path");
                        configurator.load(function () {
                            var result = configurator.outputs.defaultOutput();
                            expect(result ).toEqual('main');
                            done();
                        });
                    });
                });

                it("should set the id of the default " + projectType.toUpperCase() + " output", function () {
                    runSync(function (done) {
                        var configurator = new ADXConfigurator(projectType + "/path");
                        configurator.load(function () {
                            configurator.outputs.defaultOutput('second');
                            var result = configurator.outputs.defaultOutput();
                            expect(result ).toEqual('second');
                            done();
                        });
                    });
                });

                it("should create the " + projectType.toUpperCase() + " outputs when it's not defined in the xml", function () {
                    spies.fs.readFile.andCallFake(function (p, cb) {
                        if (projectType === 'adc') {
                            cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                                '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                                '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                                '<helpURL>the-helpURL</helpURL>' +
                                '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                                '<style width="200" height="400" />' +
                                '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                                '<constraint on="controls" label="true" responseblock="true" />' +
                                '<constraint on="responses" min="2" max="*" />' +
                                '</constraints>' +
                                '</info>' +
                                '</control>');
                        }
                        else if (projectType === 'adp') {
                            cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                                '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                                '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                                '<helpURL>the-helpURL</helpURL>' +
                                '</info>' +
                                '</page>');
                        }

                    });
                    runSync(function (done) {
                        var configurator = new ADXConfigurator(projectType + "/path");
                        configurator.load(function () {
                            configurator.outputs.defaultOutput('second');
                            var result = configurator.outputs.defaultOutput();
                            expect(result ).toEqual('second');
                            done();
                        });
                    });
                });
            });

        });

        describe('#get', function () {

            ['adc', 'adp'].forEach(function (projectType) {

                it("should return an " + projectType.toUpperCase() + " object with the keys: `defaultOutput` (a string) and `outputs` (an array)", function () {

                    runSync(function (done) {
                        var configurator = new ADXConfigurator(projectType + "/path");
                        configurator.load(function () {
                            var result = configurator.outputs.get();
                            expect(typeof result.defaultOutput).toEqual('string');
                            expect(Array.isArray(result.outputs)).toBe(true);
                            done();
                        });
                    });
                });

                it("should return an " + projectType.toUpperCase() + " object with the keys: `defaultOutput` set with the id of the default output", function () {

                    runSync(function (done) {
                        var configurator = new ADXConfigurator(projectType + "/path");
                        configurator.load(function () {
                            var result = configurator.outputs.get();
                            expect(result.defaultOutput).toEqual('main');
                            done();
                        });
                    });
                });
            });

            it("should return an ADC object with the keys: `outputs` which contains an array of output object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.outputs.get();
                        expect(result.outputs).toEqual([
                            {
                                id : "main",
                                description : "Main output",
                                contents : [
                                    {
                                        fileName : 'main.css',
                                        type : 'css',
                                        mode : 'static',
                                        position : 'head'
                                    },
                                    {
                                        fileName : 'main.html',
                                        type : 'html',
                                        mode : 'dynamic',
                                        position : 'placeholder'
                                    },
                                    {
                                        fileName : 'main.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position: 'foot'
                                    }
                                ]
                            },
                            {
                                id : "second",
                                description : "Second output",
                                condition : "Browser.Support(\"javascript\")",
                                contents : [
                                    {
                                        fileName : 'second.css',
                                        type : 'css',
                                        mode : 'static',
                                        position : 'head'
                                    },
                                    {
                                        fileName : 'second.html',
                                        type : 'html',
                                        mode : 'dynamic',
                                        position : 'placeholder'
                                    },
                                    {
                                        fileName : 'second.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position : 'foot'
                                    }
                                ]
                            },
                            {
                                id : "third",
                                description : "Third output",
                                maxIterations : 12,
                                defaultGeneration : false,
                                contents : [
                                    {
                                        fileName : "third.css",
                                        type  : "css",
                                        mode : "static",
                                        position : "head",
                                        attributes : [
                                            {
                                                name : "rel",
                                                value : "alternate"
                                            },
                                            {
                                                name : "media",
                                                value : "print"
                                            }
                                        ]
                                    },
                                    {
                                        fileName : 'HTML5Shim.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position : 'head',
                                        yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                    }
                                ]
                            }
                        ]);
                        done();
                    });
                });
            });

            it("should return an ADP object with the keys: `outputs` which contains an array of output object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.outputs.get();
                        expect(result.outputs).toEqual([
                            {
                                id : "main",
                                masterPage : "main.html",
                                description : "Main output",
                                contents : [
                                    {
                                        fileName : 'main.css',
                                        type : 'css',
                                        mode : 'static',
                                        position : 'head'
                                    },
                                    {
                                        fileName : 'main.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position: 'foot'
                                    }
                                ]
                            },
                            {
                                id : "second",
                                masterPage : "second.html",
                                description : "Second output",
                                condition : "Browser.Support(\"javascript\")",
                                contents : [
                                    {
                                        fileName : 'second.css',
                                        type : 'css',
                                        mode : 'static',
                                        position : 'head'
                                    },
                                    {
                                        fileName : 'second.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position : 'foot'
                                    }
                                ]
                            },
                            {
                                id : "third",
                                masterPage : "third.html",
                                description : "Third output",
                                contents : [
                                    {
                                        fileName : "third.css",
                                        type  : "css",
                                        mode : "static",
                                        position : "head",
                                        attributes : [
                                            {
                                                name : "rel",
                                                value : "alternate"
                                            },
                                            {
                                                name : "media",
                                                value : "print"
                                            }
                                        ]
                                    },
                                    {
                                        fileName : 'HTML5Shim.js',
                                        type : 'javascript',
                                        mode : 'static',
                                        position : 'head',
                                        yieldValue : '<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                    }
                                ]
                            }
                        ]);
                        done();
                    });
                });
            });

        });

        describe("#set", function () {
            it("should set the ADC outputs with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.outputs.set({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });
                        var result = configurator.outputs.get();
                        expect(result ).toEqual({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });

                        done();
                    });
                });
            });

            it("should create the ADC outputs if it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info>' +
                        '</control>');
                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.outputs.set({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });
                        var result = configurator.outputs.get();
                        expect(result ).toEqual({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });

                        done();
                    });
                });
            });

            it("should set the ADP outputs with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.outputs.set({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    masterPage : "new_main.html",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    masterPage : "new_second.html",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    masterPage : "new_third.html",
                                    description : "New Third output",
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });
                        var result = configurator.outputs.get();
                        expect(result ).toEqual({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    masterPage : "new_main.html",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    masterPage : "new_second.html",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    masterPage : "new_third.html",
                                    description : "New Third output",
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });

                        done();
                    });
                });
            });

            it("should create the ADP outputs if it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info>' +
                        '</control>');
                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.outputs.set({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });
                        var result = configurator.outputs.get();
                        expect(result ).toEqual({
                            defaultOutput : "new-second",
                            outputs : [
                                {
                                    id : "new-main",
                                    description : "New Main output",
                                    contents : [
                                        {
                                            fileName : 'new-main.css',
                                            type : 'css',
                                            mode : 'dynamic',
                                            position : 'none'
                                        },
                                        {
                                            fileName : 'new-main.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-main.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position: 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-second",
                                    description : "New Second output",
                                    condition : "Browser.Support(\"javascript\") and true",
                                    contents : [
                                        {
                                            fileName : 'new-second.css',
                                            type : 'css',
                                            mode : 'static',
                                            position : 'head'
                                        },
                                        {
                                            fileName : 'new-second.html',
                                            type : 'html',
                                            mode : 'dynamic',
                                            position : 'placeholder'
                                        },
                                        {
                                            fileName : 'new-second.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'foot'
                                        }
                                    ]
                                },
                                {
                                    id : "new-third",
                                    description : "New Third output",
                                    maxIterations : 50,
                                    defaultGeneration : true,
                                    contents : [
                                        {
                                            fileName : "new-third.css",
                                            type  : "css",
                                            mode : "static",
                                            position : "head",
                                            attributes : [
                                                {
                                                    name : "new-rel",
                                                    value : "new-alternate"
                                                },
                                                {
                                                    name : "new-media",
                                                    value : "new-print"
                                                }
                                            ]
                                        },
                                        {
                                            fileName : 'new-HTML5Shim.js',
                                            type : 'javascript',
                                            mode : 'static',
                                            position : 'head',
                                            yieldValue :'<!--New-->\n<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->'
                                        }
                                    ]
                                }
                            ]
                        });

                        done();
                    });
                });
            });
        });

        describe("#toXml", function () {
            it("should return the ADC outputs as Xml String", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.outputs.toXml();
                        expect(result).toEqual('  <outputs defaultOutput="main">' +
                            '\n    <output id="main">' +
                            '\n      <description><![CDATA[Main output]]></description>' +
                            '\n      <content fileName="main.css" type="css" mode="static" position="head" />' +
                            '\n      <content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                            '\n      <content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                            '\n    </output>' +
                            '\n    <output id="second">' +
                            '\n      <description><![CDATA[Second output]]></description>' +
                            '\n      <condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                            '\n      <content fileName="second.css" type="css" mode="static" position="head" />' +
                            '\n      <content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                            '\n      <content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                            '\n    </output>' +
                            '\n    <output id="third" defaultGeneration="false" maxIterations="12">' +
                            '\n      <description><![CDATA[Third output]]></description>' +
                            '\n      <content fileName="third.css" type="css" mode="static" position="head">' +
                            '\n        <attribute name="rel">' +
                            '\n          <value><![CDATA[alternate]]></value>' +
                            '\n        </attribute>' +
                            '\n        <attribute name="media">' +
                            '\n          <value><![CDATA[print]]></value>' +
                            '\n        </attribute>' +
                            '\n      </content>' +
                            '\n      <content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                            '\n        <yield>' +
                            '<![CDATA[<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->]]>' +
                            '</yield>' +
                            '\n      </content>' +
                            '\n    </output>' +
                            '\n  </outputs>');
                        done();
                    });
                });
            });
        });

        it("should return the ADP outputs as Xml String", function () {

            runSync(function (done) {
                var configurator = new ADXConfigurator("adp/path");
                configurator.load(function () {
                    var result = configurator.outputs.toXml();
                    expect(result).toEqual('  <outputs defaultOutput="main">' +
                        '\n    <output id="main" masterPage="main.html">' +
                        '\n      <description><![CDATA[Main output]]></description>' +
                        '\n      <content fileName="main.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="second" masterPage="second.html">' +
                        '\n      <description><![CDATA[Second output]]></description>' +
                        '\n      <condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '\n      <content fileName="second.css" type="css" mode="static" position="head" />' +
                        '\n      <content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '\n    </output>' +
                        '\n    <output id="third" masterPage="third.html">' +
                        '\n      <description><![CDATA[Third output]]></description>' +
                        '\n      <content fileName="third.css" type="css" mode="static" position="head">' +
                        '\n        <attribute name="rel">' +
                        '\n          <value><![CDATA[alternate]]></value>' +
                        '\n        </attribute>' +
                        '\n        <attribute name="media">' +
                        '\n          <value><![CDATA[print]]></value>' +
                        '\n        </attribute>' +
                        '\n      </content>' +
                        '\n      <content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '\n        <yield>' +
                        '<![CDATA[<!--[if lte IE 9]><script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script><![endif]-->]]>' +
                        '</yield>' +
                        '\n      </content>' +
                        '\n    </output>' +
                        '\n  </outputs>');
                    done();
                });
            });
        });
    });

    describe('#properties', function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                if (p === 'adc\\path\\config.xml') {
                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" defaultGeneration="false" maxIterations="12">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '<properties>' +
                        '<category id="general" name="General">' +
                        '<property xsi:type="askiaProperty" id="askia-theme">' +
                        '<options>' +
                        '<option value="red-theme" text="Red" />' +
                        '<option value="blue-theme" text="Blue" />' +
                        '</options>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                        '<description>Type of rendering</description>' +
                        '<value>classic</value>' +
                        '<options>' +
                        '<option value="classic" text="Classic"/>' +
                        '<option value="image" text="Image"/>' +
                        '</options>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                        '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                        '</property>' +
                        '</category>' +
                        '<category id="images" name="Rendering type images">' +
                        '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '<description>Image of single question when the rendering type is image</description>' +
                        '<value>Single.png</value>' +
                        '<value theme="red-theme">SingleRed.png</value>' +
                        '<value theme="blue-theme">SingleBlue.png</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '<description>Image of multiple question when the rendering type is image</description>' +
                        '<value>Multiple.png</value>' +
                        '<value theme="red-theme">MultipleRed.png</value>' +
                        '<value theme="blue-theme">MultipleBlue.png</value>' +
                        '</property>' +
                        '</category>' +
                        '<category id="fake" name="Fake for test">' +
                        '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                        '<description>Test number properties</description>' +
                        '<value>13</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                        '<description>Test color properties</description>' +
                        '<value>255,255,255</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                        '<description>Test question properties</description>' +
                        '<value></value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                        '<description>Test file properties</description>' +
                        '<value>file.test</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                        '<description>Test string properties</description>' +
                        '<value>test@test.com</value>' +
                        '</property>' +
                        '</category>' +
                        '</properties>' +
                        '</control>');

                } else if (p === 'adp\\path\\config.xml') {
                    cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main" masterPage="main.html">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second" masterPage="second.html">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" masterPage="third.html">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '<properties>' +
                        '<category id="general" name="General">' +
                        '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                        '<description>Type of rendering</description>' +
                        '<value>classic</value>' +
                        '<options>' +
                        '<option value="classic" text="Classic"/>' +
                        '<option value="image" text="Image"/>' +
                        '</options>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                        '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                        '</property>' +
                        '</category>' +
                        '<category id="images" name="Rendering type images">' +
                        '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '<description>Image of single question when the rendering type is image</description>' +
                        '<value>Single.png</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                        '<description>Image of multiple question when the rendering type is image</description>' +
                        '<value>Multiple.png</value>' +
                        '</property>' +
                        '</category>' +
                        '<category id="fake" name="Fake for test">' +
                        '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                        '<description>Test number properties</description>' +
                        '<value>13</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                        '<description>Test color properties</description>' +
                        '<value>255,255,255</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                        '<description>Test file properties</description>' +
                        '<value>file.test</value>' +
                        '</property>' +
                        '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                        '<description>Test string properties</description>' +
                        '<value>test@test.com</value>' +
                        '</property>' +
                        '</category>' +
                        '</properties>' +
                        '</page>');
                }

            });
        });

        describe('#get', function () {
            it("should return an ADC object with the keys: `categories` (an array)", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.properties.get();
                        expect(Array.isArray(result.categories)).toBe(true);
                        done();
                    });
                });
            });

            it("should return an ADC object which contains the definition of the categories / properties", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.properties.get();
                        expect(result).toEqual({
                            categories : [{
                                id: "general",
                                name: "General",
                                properties: [
                                    {
                                        id: "renderingType",
                                        name: "Rendering type",
                                        type: "string",
                                        description: "Type of rendering",
                                        value: "classic",
                                        options: [
                                            {
                                                value: "classic",
                                                text: "Classic"
                                            },
                                            {
                                                value: "image",
                                                text: "Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        numeric : true,
                                        open : true,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "fake",
                                    name : "Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "TEST",
                                            type : "number",
                                            mode : "dynamic",
                                            visible : false,
                                            require : true,
                                            min  :12,
                                            max : 100.5,
                                            decimal : 3,
                                            description : "Test number properties",
                                            value : "13"
                                        },
                                        {
                                            id : "testColor",
                                            name : "TEST",
                                            type : "color",
                                            colorFormat  :"rgb",
                                            description : "Test color properties",
                                            value : "255,255,255"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "TEST",
                                            type : "question",
                                            chapter : false,
                                            single : true,
                                            multiple : true,
                                            numeric : false,
                                            open : false,
                                            date : false,
                                            description : "Test question properties",
                                            value : ""
                                        },
                                        {
                                            id : "testFile",
                                            name : "TEST",
                                            type : "file",
                                            fileExtension : ".test, .test2",
                                            description : "Test file properties",
                                            value : "file.test"
                                        },
                                        {
                                            id : "testString",
                                            name : "TEST",
                                            type : "string",
                                            pattern : ".+@.+",
                                            description : "Test string properties",
                                            value : "test@test.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });

            it("should return an ADP object with the keys: `categories` (an array)", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.properties.get();
                        expect(Array.isArray(result.categories)).toBe(true);
                        done();
                    });
                });
            });

            it("should return an ADP object which contains the definition of the categories / properties", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.properties.get();
                        expect(result).toEqual({
                            categories : [{
                                id: "general",
                                name: "General",
                                properties: [
                                    {
                                        id: "renderingType",
                                        name: "Rendering type",
                                        type: "string",
                                        description: "Type of rendering",
                                        value: "classic",
                                        options: [
                                            {
                                                value: "classic",
                                                text: "Classic"
                                            },
                                            {
                                                value: "image",
                                                text: "Image"
                                            }
                                        ]
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "fake",
                                    name : "Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "TEST",
                                            type : "number",
                                            mode : "dynamic",
                                            visible : false,
                                            require : true,
                                            min  :12,
                                            max : 100.5,
                                            decimal : 3,
                                            description : "Test number properties",
                                            value : "13"
                                        },
                                        {
                                            id : "testColor",
                                            name : "TEST",
                                            type : "color",
                                            colorFormat  :"rgb",
                                            description : "Test color properties",
                                            value : "255,255,255"
                                        },
                                        {
                                            id : "testFile",
                                            name : "TEST",
                                            type : "file",
                                            fileExtension : ".test, .test2",
                                            description : "Test file properties",
                                            value : "file.test"
                                        },
                                        {
                                            id : "testString",
                                            name : "TEST",
                                            type : "string",
                                            pattern : ".+@.+",
                                            description : "Test string properties",
                                            value : "test@test.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });
        });

        describe("#set", function () {
            it("should set the ADC properties with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.properties.set({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });
                        var result = configurator.properties.get();
                        expect(result ).toEqual({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });

            it("should create ADC properties if it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {

                    cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                        '<style width="200" height="400" />' +
                        '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                        '<constraint on="controls" label="true" responseblock="true" />' +
                        '<constraint on="responses" min="2" max="*" />' +
                        '</constraints>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" defaultGeneration="false" maxIterations="12">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '</control>');

                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        configurator.properties.set({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });
                        var result = configurator.properties.get();
                        expect(result ).toEqual({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });

            it("should set the ADP properties with plain object", function () {

                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.properties.set({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });
                        var result = configurator.properties.get();
                        expect(result ).toEqual({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });

            it("should create ADP properties if it's not defined in the xml", function () {
                spies.fs.readFile.andCallFake(function (p, cb) {
                    cb(null, '<page><info><name>the-name</name><guid>the-guid</guid>' +
                        '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                        '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                        '<helpURL>the-helpURL</helpURL>' +
                        '</info>' +
                        '<outputs defaultOutput="main">' +
                        '<output id="main" masterPage="main.html">' +
                        '<description><![CDATA[Main output]]></description>' +
                        '<content fileName="main.css" type="css" mode="static" position="head" />' +
                        '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="second" masterPage="second.html">' +
                        '<description><![CDATA[Second output]]></description>' +
                        '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                        '<content fileName="second.css" type="css" mode="static" position="head" />' +
                        '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                        '</output>' +
                        '<output id="third" masterPage="third.html">' +
                        '<description><![CDATA[Third output]]></description>' +
                        '<content fileName="third.css" type="css" mode="static" position="head" >' +
                        ' <attribute name="rel">' +
                        '<value>alternate</value>' +
                        '</attribute>' +
                        '<attribute name="media">' +
                        '<value>print</value>' +
                        '</attribute>' +
                        '</content>' +
                        '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                        '<yield>' +
                        '<![CDATA[' +
                        '<!--[if lte IE 9]>' +
                        '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                        '<![endif]-->' +
                        ']]>' +
                        '</yield>' +
                        '</content>'+
                        '</output>' +
                        '</outputs>' +
                        '</page>');

                });
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        configurator.properties.set({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    },
                                    {
                                        id: "new-other",
                                        name: "Open-ended question for semi-open",
                                        type: "question",
                                        single : true,
                                        multiple : true,
                                        numeric : false,
                                        open : false,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testQuestion",
                                            name : "Question value",
                                            type : "question",
                                            chapter : true,
                                            single : false,
                                            multiple : false,
                                            numeric : true,
                                            open : true,
                                            date : true,
                                            description : "Test question properties",
                                            value : "CurrentQuestion"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });
                        var result = configurator.properties.get();
                        expect(result ).toEqual({
                            categories : [{
                                id: "new-general",
                                name: "New General",
                                properties: [
                                    {
                                        id: "newRenderingType",
                                        name: "New rendering type",
                                        type: "string",
                                        description: "New Type of rendering",
                                        value: "new-classic",
                                        options: [
                                            {
                                                value: "new-classic",
                                                text: "New Classic"
                                            },
                                            {
                                                value: "new-image",
                                                text: "New Image"
                                            }
                                        ]
                                    }
                                ]
                            },
                                {
                                    id : "images",
                                    name : "Rendering type images",
                                    properties : [
                                        {
                                            id : "singleImage",
                                            name : "Image for single question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of single question when the rendering type is image",
                                            value : "Single.png"
                                        },
                                        {
                                            id : "multipleImage",
                                            name : "Image for multiple question",
                                            type : "file",
                                            fileExtension : ".png, .gif, .jpg",
                                            description : "Image of multiple question when the rendering type is image",
                                            value : "Multiple.png"
                                        }
                                    ]
                                },
                                {
                                    id : "newFake",
                                    name : "New Fake for test",
                                    properties : [
                                        {
                                            id : "testNumber",
                                            name : "Number value",
                                            type : "number",
                                            mode : "static",
                                            visible : true,
                                            require : false,
                                            min  :25,
                                            max : 200,
                                            decimal : 1,
                                            description : "New Test number properties",
                                            value : "26"
                                        },
                                        {
                                            id : "testColor",
                                            name : "Color value",
                                            type : "color",
                                            colorFormat  :"rgba",
                                            description : "Test color properties",
                                            value : "255,255,255,.9"
                                        },
                                        {
                                            id : "testFile",
                                            name : "File value",
                                            type : "file",
                                            fileExtension : ".doc, .docx",
                                            description : "Test file properties",
                                            value : "file.docs"
                                        },
                                        {
                                            id : "testString",
                                            name : "String value",
                                            type : "string",
                                            pattern : "\w@\w",
                                            description : "Test string properties",
                                            value : "foo@bar.com"
                                        }
                                    ]
                                }]
                        });

                        done();
                    });
                });
            });
        });

        describe("#toXml", function () {
            it("should return the ADC properties as Xml String", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adc/path");
                    configurator.load(function () {
                        var result = configurator.properties.toXml();
                        expect(result).toEqual('  <properties>' +
                            '\n    <category id="general" name="General">' +
                            '\n      <property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                            '\n        <description><![CDATA[Type of rendering]]></description>' +
                            '\n        <value><![CDATA[classic]]></value>' +
                            '\n        <options>' +
                            '\n          <option value="classic" text="Classic" />' +
                            '\n          <option value="image" text="Image" />' +
                            '\n        </options>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" numeric="true" open="true">' +
                            '\n        <description><![CDATA[Additional open-ended question that could be use to emulate semi-open]]></description>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n    <category id="images" name="Rendering type images">' +
                            '\n      <property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                            '\n        <description><![CDATA[Image of single question when the rendering type is image]]></description>' +
                            '\n        <value><![CDATA[Single.png]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                            '\n        <description><![CDATA[Image of multiple question when the rendering type is image]]></description>' +
                            '\n        <value><![CDATA[Multiple.png]]></value>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n    <category id="fake" name="Fake for test">' +
                            '\n      <property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" mode="dynamic" require="true" visible="false" min="12" max="100.5" decimal="3">' +
                            '\n        <description><![CDATA[Test number properties]]></description>' +
                            '\n        <value><![CDATA[13]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                            '\n        <description><![CDATA[Test color properties]]></description>' +
                            '\n        <value><![CDATA[255,255,255]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                            '\n        <description><![CDATA[Test question properties]]></description>' +
                            '\n        <value></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                            '\n        <description><![CDATA[Test file properties]]></description>' +
                            '\n        <value><![CDATA[file.test]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                            '\n        <description><![CDATA[Test string properties]]></description>' +
                            '\n        <value><![CDATA[test@test.com]]></value>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n  </properties>');
                        done();
                    });
                });
            });

            it("should return the ADP properties as Xml String", function () {
                runSync(function (done) {
                    var configurator = new ADXConfigurator("adp/path");
                    configurator.load(function () {
                        var result = configurator.properties.toXml();
                        expect(result).toEqual('  <properties>' +
                            '\n    <category id="general" name="General">' +
                            '\n      <property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                            '\n        <description><![CDATA[Type of rendering]]></description>' +
                            '\n        <value><![CDATA[classic]]></value>' +
                            '\n        <options>' +
                            '\n          <option value="classic" text="Classic" />' +
                            '\n          <option value="image" text="Image" />' +
                            '\n        </options>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n    <category id="images" name="Rendering type images">' +
                            '\n      <property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                            '\n        <description><![CDATA[Image of single question when the rendering type is image]]></description>' +
                            '\n        <value><![CDATA[Single.png]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                            '\n        <description><![CDATA[Image of multiple question when the rendering type is image]]></description>' +
                            '\n        <value><![CDATA[Multiple.png]]></value>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n    <category id="fake" name="Fake for test">' +
                            '\n      <property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" mode="dynamic" require="true" visible="false" min="12" max="100.5" decimal="3">' +
                            '\n        <description><![CDATA[Test number properties]]></description>' +
                            '\n        <value><![CDATA[13]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                            '\n        <description><![CDATA[Test color properties]]></description>' +
                            '\n        <value><![CDATA[255,255,255]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                            '\n        <description><![CDATA[Test file properties]]></description>' +
                            '\n        <value><![CDATA[file.test]]></value>' +
                            '\n      </property>' +
                            '\n      <property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                            '\n        <description><![CDATA[Test string properties]]></description>' +
                            '\n        <value><![CDATA[test@test.com]]></value>' +
                            '\n      </property>' +
                            '\n    </category>' +
                            '\n  </properties>');
                        done();
                    });
                });
            });
        });
    });

    describe('#save', function () {
        beforeEach(function () {
            spies.dirExists.andCallFake(function (p, cb) {
                cb(null, true);
            });
            spies.fs.readFile.andCallFake(function (p, cb) {
                cb(null, '<control><info><name>the-name</name><guid>the-guid</guid>' +
                    '<version>the-version</version><date>the-date</date><description><![CDATA[the-description]]></description>' +
                    '<company>the-company</company><author>the-author</author><site>the-site</site>' +
                    '<helpURL>the-helpURL</helpURL>' +
                    '<categories><category>cat-1</category><category>cat-2</category></categories>' +
                    '<style width="200" height="400" />' +
                    '<constraints><constraint on="questions" single="true" multiple="true" open="false" />' +
                    '<constraint on="controls" label="true" responseblock="true" />' +
                    '<constraint on="responses" min="2" max="*" />' +
                    '</constraints>' +
                    '</info>' +
                    '<outputs defaultOutput="main">' +
                    '<output id="main">' +
                    '<description><![CDATA[Main output]]></description>' +
                    '<content fileName="main.css" type="css" mode="static" position="head" />' +
                    '<content fileName="main.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="main.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="second">' +
                    '<description><![CDATA[Second output]]></description>' +
                    '<condition><![CDATA[Browser.Support("javascript")]]></condition>' +
                    '<content fileName="second.css" type="css" mode="static" position="head" />' +
                    '<content fileName="second.html" type="html" mode="dynamic" position="placeholder" />' +
                    '<content fileName="second.js" type="javascript" mode="static" position="foot" />' +
                    '</output>' +
                    '<output id="third" defaultGeneration="false" maxIterations="12">' +
                    '<description><![CDATA[Third output]]></description>' +
                    '<content fileName="third.css" type="css" mode="static" position="head" >' +
                    ' <attribute name="rel">' +
                    '<value>alternate</value>' +
                    '</attribute>' +
                    '<attribute name="media">' +
                    '<value>print</value>' +
                    '</attribute>' +
                    '</content>' +
                    '<content fileName="HTML5Shim.js" type="javascript" mode="static" position="head">' +
                    '<yield>' +
                    '<![CDATA[' +
                    '<!--[if lte IE 9]>' +
                    '<script type="text/javascript"  src="{%= CurrentADC.URLTo("static/HTML5Shim.js") %}" ></script>' +
                    '<![endif]-->' +
                    ']]>' +
                    '</yield>' +
                    '</content>'+
                    '</output>' +
                    '</outputs>' +
                    '<properties>' +
                    '<category id="general" name="General">' +
                    '<property xsi:type="askiaProperty" id="askia-theme">' +
                    '<options>' +
                    '<option value="red-theme" text="Red" />' +
                    '<option value="blue-theme" text="Blue" />' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="renderingType" name="Rendering type" type="string">' +
                    '<description>Type of rendering</description>' +
                    '<value>classic</value>' +
                    '<options>' +
                    '<option value="classic" text="Classic"/>' +
                    '<option value="image" text="Image"/>' +
                    '</options>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="other" name="Open-ended question for semi-open" type="question" open="true" numeric="true">' +
                    '<description>Additional open-ended question that could be use to emulate semi-open</description>' +
                    '</property>' +
                    '</category>' +
                    '<category id="images" name="Rendering type images">' +
                    '<property xsi:type="standardProperty" id="singleImage" name="Image for single question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of single question when the rendering type is image</description>' +
                    '<value>Single.png</value>' +
                    '<value theme="red-theme">SingleRed.png</value>' +
                    '<value theme="blue-theme">SingleBlue.png</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="multipleImage" name="Image for multiple question" type="file" fileExtension=".png, .gif, .jpg">' +
                    '<description>Image of multiple question when the rendering type is image</description>' +
                    '<value>Multiple.png</value>' +
                    '<value theme="red-theme">MultipleRed.png</value>' +
                    '<value theme="blue-theme">MultipleBlue.png</value>' +
                    '</property>' +
                    '</category>' +
                    '<category id="fake" name="Fake for test">' +
                    '<property xsi:type="standardProperty" id="testNumber" name="TEST" type="number" min="12" max="100.5" decimal="3" mode="dynamic" visible="false" require="true">' +
                    '<description>Test number properties</description>' +
                    '<value>13</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testColor" name="TEST" type="color" colorFormat="rgb">' +
                    '<description>Test color properties</description>' +
                    '<value>255,255,255</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testQuestion" name="TEST" type="question" chapter="false" single="true" multiple="true" numeric="false" open="false" date="false">' +
                    '<description>Test question properties</description>' +
                    '<value></value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testFile" name="TEST" type="file" fileExtension=".test, .test2">' +
                    '<description>Test file properties</description>' +
                    '<value>file.test</value>' +
                    '</property>' +
                    '<property xsi:type="standardProperty" id="testString" name="TEST" type="string" pattern=".+@.+">' +
                    '<description>Test string properties</description>' +
                    '<value>test@test.com</value>' +
                    '</property>' +
                    '</category>' +
                    '</properties>' +
                    '</control>');
            });
        });

        it("should transform the current configurator to XML and write it into the config file", function () {
            runSync(function (done) {
                var configurator = new ADXConfigurator("an/valid/path");
                spyOn(configurator, 'toXml').andReturn('<thexml />');
                spies.fs.writeFile.andCallFake(function (filePath, content, options) {
                    expect(filePath).toBe(path.join('an/valid/path', common.CONFIG_FILE_NAME));
                    expect(content).toBe('<thexml />');
                    expect(options).toEqual({encoding : 'utf8'});
                    done();
                });
                configurator.load(function () {
                    configurator.save();
                });
            });

        });

        it("should reload the configurator when it was successfully saved", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            spyOn(configurator, 'toXml').andReturn('<thexml />');
            spies.fs.writeFile.andCallFake(function (filePath, content, options, cb) {
                cb(null);
            });
            configurator.load(function () {
                var spyLoad =  spyOn(configurator, 'load');
                function theCallback() {}
                configurator.save(theCallback);
                expect(spyLoad).toHaveBeenCalledWith(theCallback);
            });
        });

        it("should not reload the configurator when an error occurred while writing the the file", function () {
            var configurator = new ADXConfigurator("an/valid/path");
            var theError = new Error('An error');
            var resultError;
            spyOn(configurator, 'toXml').andReturn('<thexml />');
            spies.fs.writeFile.andCallFake(function (filePath, content, options, cb) {
                cb(theError);
            });
            configurator.load(function () {
                var spyLoad =  spyOn(configurator, 'load');
                configurator.save(function (err) {
                    resultError  = err;
                });
                expect(spyLoad).not.toHaveBeenCalled();
                expect(resultError).toBe(theError);
            });
        });
    });

});