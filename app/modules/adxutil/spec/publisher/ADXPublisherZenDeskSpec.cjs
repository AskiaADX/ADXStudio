describe("ADXPublisherZenDesk", function() {
    var fs					= require('fs'),
        path            	= require('path'),
        common              = require('../../app/common/common.cjs'),
        errMsg              = common.messages.error,
        Configurator        = require('../../app/configurator/ADXConfigurator.cjs').Configurator,
        PublisherZenDesk	= require('../../app/publisher/ADXPublisherZenDesk.cjs').PublisherZenDesk,
        zenDesk             = require('node-zendesk'),
        axios               = require('axios'),
        spies				= {},
        sectionLists        = [
            {
                name: "a_section",
                id: 40
            },
            {
                name: "section_found",
                id: 60
            }
        ],
        attachmentsLists = {
            article_attachments : [
                {
                    "id":           1428,
                    "article_id":   23,
                    "file_name":    "preview.png",
                    "content_url":  "https://aski.zendesk.com/hc/article_attachments/200109629/preview.png",
                    "content_type": "application/png",
                    "size":         1428,
                    "inline":       true
                },
                {
                    "id":           2857,
                    "article_id":   23,
                    "file_name":    "test-adx.qex",
                    "content_url":  "https://company.zendesk.com/hc/article_attachments/200109629/test-adx.qex",
                    "content_type": "application/qex",
                    "size":         58298,
                    "inline":       false
                },
                {
                    "id":           3485,
                    "article_id":   23,
                    "file_name":    "test-adx.adc",
                    "content_url":  "https://company.zendesk.com/hc/article_attachments/200109629/test-adx.adc",
                    "content_type": "application/adc",
                    "size":         58298,
                    "inline":       false
                }
            ]
        },
        article = {
            article : {
                "id":                1635,
                "author_id":         3465,
                "draft":             true,
                "comments_disabled": false
            }
        },
        options				= {
            url              :'https://uri',
            section          : 'a_section',
            username	     : 'a_username',
            password         : 'mdp',
            promoted         : false,
            disabledComments : false,
            demoUrl          : 'http://demo'
        },
        fakeClient          = {
            articles : {
                create : function (id, jsonArticle, cb) {
                    cb(null, null, {
                        id : 12,
                        body : 'something'
                    });
                },
                listBySection : function (id, cb) {
                    cb(null, null, []);
                },
                update : function (id, o, cb) {
                    if (typeof cb === 'function') {
                        cb(null);
                    }
                },
                delete : function (id, cb) {
                    cb(null);
                },
                show : function (id, cb) {
                    cb(article);
                }
            },
            translations : {
                updateForArticle : function (a, b, c, cb) {
                    if (typeof cb === 'function') {
                        cb(null);
                    }
                }
            },
            sections : {
                list : function (cb){
                    cb(null, null, sectionLists);
                }
            },
            articleattachments : {
                list : function (articleId, cb) {
                    cb(null, 200, attachmentsLists);
                },
                delete : function (id, cb) {
                    cb(null);
                }
            }
        };

    function runSync(fn) {
        let wasCalled = false;
        fn(function () {
            wasCalled = true;
        });
        expect(wasCalled).toBe(true);
    }

    beforeEach(function() {
        spies.configurator = {
            get  : spyOn(Configurator.prototype, 'get')
        };
        spies.configurator.get.and.returnValue({
            info : {
                name 		: 'test-adx',
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
            properties : {
                categories : [
                    {
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
                    }
                ]
            }
        });
        spies.fs = {
            readFile 			: spyOn(fs, 'readFile'),
            stat     			: spyOn(fs, 'stat'),
            createReadStream	: spyOn(fs, 'createReadStream')
        };
        spies.fs.stat.and.callFake(function (p, cb) {
            cb(null, {
                isFile : function () {
                    return true;
                }
            });
        });
        spies.fs.readFile.and.callFake(function (p, o, cb) {
            cb(null, 'a text');
        });
        spies.fs.createReadStream.and.callFake(function (p, o) {
            return p;
        });
        spies.zendesk = {
            createClient : spyOn(zenDesk, 'createClient')
        };
        spies.zendesk.createClient.and.returnValue(fakeClient);
        spies.axios = {
            post : spyOn(axios, 'post')
        };
        spies.axios.post.and.callFake(function (url, form, config) {
            return Promise.resolve({
                data: {
                    article_attachment: {
                        id: 'an id',
                        file_name: 'a file_name'
                    }
                }
            });
        });

        // Court-circuit the validation outputs
        spies.writeError   = spyOn(common, 'writeError');
        spies.writeSuccess = spyOn(common, 'writeSuccess');
        spies.writeMessage = spyOn(common, 'writeMessage');
        spies.writeWarning = spyOn(common, 'writeWarning');
    });

    describe("#Constructor", function() {
        it("should throw an error when the `configurator` argument is missing", function() {
            expect(function() {
                var publisherZenDesk = new PublisherZenDesk();
            }).toThrowError(errMsg.missingConfiguratorArg);
        });

        it("should throw an error when the `configurator` argument is invalid", function() {
            expect(function() {
                var publisherZenDesk = new PublisherZenDesk({});
            }).toThrowError(errMsg.invalidConfiguratorArg);
        });

        ['url', 'section', 'username', 'password'].forEach(function removeAnOption(option) {
            it("should throw an error when options `" + option + "`are missing", function() {
                expect(function() {
                    var notCompletedOptions = JSON.parse(JSON.stringify(options));
                    delete notCompletedOptions[option];

                    var config = new Configurator('.');
                    config.projectType = "adc";
                    var publisherZenDesk = new PublisherZenDesk(config, {}, notCompletedOptions);
                }).toThrowError(new RegExp('missing argument : ' + option));
            });
        });

        it('should instantiate the #configurator when everything is ok', function () {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);

            expect(publisherZenDesk.configurator).toBe(config);
        });

        it("should instantiate the zendesk client with the right options", function() {

            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);

            expect(spies.zendesk.createClient).toHaveBeenCalledWith({
                username          	: options.username,
                password          	: options.password,
                remoteUri	      	: options.url + '/api/v2/help_center',
                helpcenter			: true
            });
        });

        it("should instantiate the zendesk#client when everything is ok", function() {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);

            expect(publisherZenDesk.client).toBe(fakeClient);
        });
    });

    describe("#publish", function() {
        it("should request to post the adc file when he is present in " + common.ADX_BIN_PATH, function() {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);
            var name = config.get().info.name;
            var p = path.resolve(path.join(config.path, common.ADX_BIN_PATH, name + '.adc'));

            runSync(function (done) {
                spies.axios.post.and.callFake(function (url, form) {
                    expect(url).toEqual("https://uri/api/v2/help_center/articles/12/attachments.json");
                    expect((form._streams || []).join('')).toContain(p);
                    done();
                    return Promise.resolve({
                        data: {
                            article_attachment: {
                                id: 'an id',
                                file_name: 'a file_name'
                            }
                        }
                    });
                });
                publisherZenDesk.publish();
            });
        });

        it("should request to post the adp file when he is present in " + common.ADX_BIN_PATH, function() {
            var config = new Configurator('.');
            config.projectType = "adp";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);
            var name = config.get().info.name;
            var p = path.resolve(path.join(config.path, common.ADX_BIN_PATH, name + '.adp'));

            runSync(function (done) {
                spies.axios.post.and.callFake(function (url, form) {
                    expect(url).toEqual("https://uri/api/v2/help_center/articles/12/attachments.json");
                    expect((form._streams || []).join('')).toContain(p);
                    done();
                    return Promise.resolve({
                        data: {
                            article_attachment: {
                                id: 'an id',
                                file_name: 'a file_name'
                            }
                        }
                    });
                });
                publisherZenDesk.publish();
            });
        });

        it("should request to post the qex file when he is present in " + common.QEX_PATH, function(done) {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);
            var name = config.get().info.name;
            var p = path.resolve(path.join(config.path, common.QEX_PATH, name + '.qex'));
            var n = 0;

            spies.axios.post.and.callFake(function (url, form) {
                if (n === 1) {
                    expect(url).toEqual("https://uri/api/v2/help_center/articles/12/attachments.json");
                    expect((form._streams || []).join('')).toContain(p);
                }
                n++;
                return Promise.resolve({
                    data: {
                        article_attachment: {
                            id: 'an id',
                            file_name: 'a file_name'
                        }
                    }
                });
            });
            publisherZenDesk.publish(function (err) {
                expect(err).toBeNull();
                expect(n).toBeGreaterThan(1);
                done();
            });
        });

        it("should request to post the png file when he is present in root", function(done) {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);
            var p = path.resolve(path.join(config.path, 'preview.png'));
            var n = 0;

            spies.axios.post.and.callFake(function (url, form) {
                if (n === 2) {
                    expect(url).toEqual("https://uri/api/v2/help_center/articles/12/attachments.json");
                    expect((form._streams || []).join('')).toContain(p);
                }
                n++;
                return Promise.resolve({
                    data: {
                        article_attachment: {
                            id: 'an id',
                            file_name: 'a file_name'
                        }
                    }
                });
            });
            publisherZenDesk.publish(function (err) {
                expect(err).toBeNull();
                expect(n).toBeGreaterThan(2);
                done();
            });
        });

        it("should output an error when the .adc file is missing in " + common.ADX_BIN_PATH, function() {
            var config = new Configurator('.');
            config.projectType = "adc";
            var publisherZenDesk = new PublisherZenDesk(config, {}, options);
            spies.fs.stat.and.callFake(function (p, cb) {
                if (/test-adx\.adc$/.test(p)) {
                    cb(new Error('something wrong'));
                    return;
                }
                cb(null, {
                    isFile : function () {
                        return true;
                    }
                });
            });

            runSync(function (done) {
                publisherZenDesk.publish(function(err) {
                    expect(err).toBe(errMsg.badNumberOfADXFiles);
                    done();
                });
            });
        });


        describe("findSectionIdByTitle", function() {
            it("should output an error when the section is not found", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var opts = JSON.parse(JSON.stringify(options));
                opts.section = 'an non-existing section';
                var publisherZenDesk = new PublisherZenDesk(config, {}, opts);

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).not.toBe(null);
                        done();
                    });
                });
            });

            it("should output an error when the section's title is not a string'", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var opts = JSON.parse(JSON.stringify(options));
                opts.section = {name : 'a weird object'};
                var publisherZenDesk = new PublisherZenDesk(config, {}, opts);

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(errMsg.invalidSectionArg);
                        done();
                    });
                });
            });

            it("should output an error when it could not retrieve the list of sections", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('an error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);

                spyOn(fakeClient.sections, "list").and.callFake(function (cb) {
                    cb(error);
                });

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(error);
                        done();
                    });
                });
            });

            it("should create an article with the right section ID", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);

                runSync(function (done) {
                    spyOn(fakeClient.articles, "create").and.callFake(function (id) {
                        expect(id).toBe(40);
                        done();
                    });

                    publisherZenDesk.publish();
                });
            });

            it("should find the section with the same name case insensitive", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var opts = JSON.parse(JSON.stringify(options));
                opts.section = 'A_SECTION';
                var publisherZenDesk = new PublisherZenDesk(config, {}, opts);

                runSync(function (done) {
                    spyOn(fakeClient.articles, "create").and.callFake(function (id, JSON, cb) {
                        expect(id).toBe(40);
                        done();
                    });

                    publisherZenDesk.publish(function(err) {});
                });
            });
        });

        describe("createJSONArticle", function() {
            it("should output an error when it could not read the article template", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('An error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spies.fs.readFile.and.callFake(function (p, o, cb) {
                    cb(error);
                });

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(error);
                        done();
                    });
                });
            });

            it("should output an error when the JSON article is not correct", function() {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spies.fs.readFile.and.callFake(function (p, o, cb) {
                    cb(null, "body article");
                });

                runSync(function (done) {
                    spyOn(fakeClient.articles, "create").and.callFake(function (id, json) {
                        expect(json).toEqual({
                            "article" : {
                                "title": "test-adx",
                                "body": "body article",
                                "promoted": false,
                                "comments_disabled": false
                            }
                        });
                        done();
                    });
                    publisherZenDesk.publish();
                });
            });

            it("should eval the body with the right patterns for adc", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                var name = config.get().info.name;
                spies.fs.readFile.and.callFake(function (p, o, cb) {
                    expect(p).toEqual(path.join(__dirname,"../../", common.ZENDESK_ADC_ARTICLE_TEMPLATE_PATH));
                    cb(null, '{{ADXProperties:HTML}}, {{ADXListKeyWords}}, {{ADXConstraints}}');
                });

                runSync(function (done) {
                    spyOn(fakeClient.articles, "create").and.callFake(function (id, json) {

                        expect(json.article.body.indexOf("{{ADX")).toEqual(-1);
                        done();
                    });
                    publisherZenDesk.publish(function() {});

                });
            });

            it("should eval the body with the right patterns for adp", function () {
                var config = new Configurator('.');
                config.projectType = "adp";
                config.get.and.returnValue({
                    info: {
                        name: 'test-adx'
                    },
                    properties: {
                        categories: [
                            {
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
                                        numeric: true,
                                        open: true,
                                        description: "Additional open-ended question that could be use to emulate semi-open"
                                    }
                                ]
                            },
                            {
                                name: "Rendering type images",
                                properties: [
                                    {
                                        id: "singleImage",
                                        name: "Image for single question",
                                        type: "file",
                                        fileExtension: ".png, .gif, .jpg",
                                        description: "Image of single question when the rendering type is image",
                                        value: "Single.png"
                                    },
                                    {
                                        id: "multipleImage",
                                        name: "Image for multiple question",
                                        type: "file",
                                        fileExtension: ".png, .gif, .jpg",
                                        description: "Image of multiple question when the rendering type is image",
                                        value: "Multiple.png"
                                    }
                                ]
                            }
                        ]
                    }
                });
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                var name = config.get().info.name;
                spies.fs.readFile.and.callFake(function (p, o, cb) {
                    expect(p).toEqual(path.join(__dirname,"../../", common.ZENDESK_ADP_ARTICLE_TEMPLATE_PATH));
                    cb(null, '{{ADXProperties:HTML}}, {{ADXListKeyWords}}, {{ADXConstraints}}');
                });

                runSync(function (done) {
                    spyOn(fakeClient.articles, "create").and.callFake(function (id, json) {

                        expect(json.article.body.indexOf("{{ADX")).toEqual(-1);
                        done();
                    });
                    publisherZenDesk.publish(function() {});

                });
            });
        });

        describe("deleteAttachments", function(){
            it("should output an error when it could not retrieve the list of article within the section", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('An error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "listBySection").and.callFake(function (id, cb) {
                    cb(error);
                });

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(error);
                        done();
                    });
                });
            });

            it("should output an error when it could not retrieve the list of attachments within the article", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('An error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "listBySection").and.callFake(function (id, cb) {
                    cb(null, null, [
                        {id : 1, name : "test-adx"}
                    ]);
                });
                spyOn(fakeClient.articleattachments, "list").and.callFake(function (id, cb) {
                    cb(error);
                });

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(error);
                        done();
                    });
                });
            });

            it("should output an error when it found duplicate article title", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "listBySection").and.callFake(function (id, cb) {
                    cb(null, null, [
                        {id : 1, name : "test-adx"},
                        {id : 2, name : "test-adx"}
                    ]);
                });

                runSync(function (done) {
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBe(errMsg.tooManyArticlesExisting);
                        done();
                    });
                });
            });

            it("should delete the article's attachments when it found one article with the same name and if it have attachments", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "listBySection").and.callFake(function (id, cb) {
                    cb(null, null, [
                        {id : 1, name : "test-adx"}
                    ]);
                });

                runSync(function (done) {
                    var deleteMock = spyOn(fakeClient.articleattachments, "delete");
                    publisherZenDesk.publish(function() {});
                    expect(deleteMock).toHaveBeenCalled();
                    done();
                });
            });

            it("should not delete article's attachments when it not found the article", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);

                runSync(function (done) {
                    var deleteMock = spyOn(fakeClient.articleattachments, "list");
                    publisherZenDesk.publish(function() {});
                    expect(deleteMock).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should return the id of the article whitch already exist", function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('An error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "listBySection").and.callFake(function (id, cb) {
                    cb(null, null, [
                        {id : 1, name : "test-adx"}
                    ]);
                });

                runSync(function (done) {
                    spyOn(fakeClient.articles, "show").and.callFake(function (id, cb) {
                        expect(id).toEqual(1);
                        done();
                    });
                    publisherZenDesk.publish(function() {});
                });
            });
        });

        describe("uploadAvailableFiles", function() {
            it("should output an error when it could not send the request", function (done) {
                var config = new Configurator('.');
                config.projectType = "adc";
                var error = new Error('An error');
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spies.axios.post.and.callFake(function () {
                    return Promise.reject(error);
                });

                publisherZenDesk.publish(function(err) {
                    expect(err).toBe(error);
                    done();
                });
            });

            function testPost(o, index) {
                it("should call axios.post with the correct arguments for " + o.name, function(done) {
                    var config = new Configurator('.');
                    config.projectType = "adc";
                    var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                    var name = config.get().info.name;
                    o.path = path.resolve(path.join(config.path, o.suffix));
                    var n = 0;

                    spies.axios.post.and.callFake(function (url, form, config) {
                        if (index === n) {
                            expect(url).toEqual("https://uri/api/v2/help_center/articles/12/attachments.json");
                            expect(config.headers['Authorization']).toEqual("Basic " + Buffer.from(options.username + ":" + options.password).toString('base64'));
                        }
                        n++;
                        return Promise.resolve({
                            data: {
                                article_attachment: {
                                    id: 'an id',
                                    file_name: 'a file_name'
                                }
                            }
                        });
                    });
                    publisherZenDesk.publish(function(err) {
                        expect(err).toBeNull();
                        expect(n).toBeGreaterThan(index);
                        done();
                    });
                });
            }

            [
                {
                    name  : "adc",
                    suffix: path.join(common.ADX_BIN_PATH, 'test-adx.adc')
                },
                {
                    name  : "qex",
                    suffix: path.join(common.QEX_PATH, 'test-adx.qex')
                },
                {
                    name  : "png",
                    suffix: 'preview.png'
                }
            ].forEach(testPost);
        });

        describe("update article with attachments", function() {
            it("should call updateForArticle with the attachments", function (done) {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, options);
                spyOn(fakeClient.articles, "create").and.callFake(function (id, jsonArticle, cb) {
                    cb(null, null, {
                        id : 12,
                        body : '{{ADXQexFileURL}}, {{ADXFileURL}}, {{ADXPreview}}, {{ADXLiveDemo}}'
                    });
                });

                spyOn(fakeClient.translations, "updateForArticle").and.callFake(function(id, lang, obj, cb) {
                    var str = '<li>To download the qex file, <a href="/hc/en-us/article_attachments/an id/a file_name">click here</a></li>' +
                                ', <a href="/hc/en-us/article_attachments/an id/a file_name">click here</a>' +
                                ', <p><a href="http://demo" target="_blank"> <img style="max-width: 100%;" src="/hc/en-us/article_attachments/an id/a file_name" alt="" /> </a></p>' +
                                ', <li><a href="http://demo" target="_blank">To access to the live survey, click on the picture above.</a></li>';

                    expect(obj.body).toEqual(str);
                    cb(null);
                });
                publisherZenDesk.publish(function(err) {
                    expect(err).toBeNull();
                    done();
                });
            });
        });

        describe("update article with attachments", function() {
            it("should call update with the correct arguments", function (done) {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZenDesk = new PublisherZenDesk(config, {}, {
                    url              :'https://uri',
                    section          : 'a_section',
                    username	     : 'a_username',
                    password         : 'mdp',
                    promoted         : true,
                    disabledComments : false,
                    demoUrl          : 'http://demo'
                });
                spyOn(fakeClient.articles, "create").and.callFake(function (id, jsonArticle, cb) {
                    cb(null, null, {
                        id : 12,
                        body : '{{ADXQexFileURL}}, {{ADXFileURL}}, {{ADXPreview}}, {{ADXLiveDemo}}',
                        promoted : jsonArticle.article.promoted,
                        comments_disabled : jsonArticle.article.comments_disabled
                    });
                });

                spyOn(fakeClient.articles, "update").and.callFake(function(id, obj, cb) {
                    expect(obj.promoted).toEqual(true);
                    expect(obj.comments_disabled).toEqual(false);
                    cb(null);
                });
                publisherZenDesk.publish(function(err) {
                    expect(err).toBeNull();
                    done();
                });
            });
        });
    });

    function testLogger(method) {
        var className = method.toLowerCase().replace('write', '');
        describe('#'  + method, function () {
            it('should call the `common.' + method + '` when no #logger is defined', function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZendeskInstance = new PublisherZenDesk(config, {}, options);
                publisherZendeskInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should call the `common.' + method + '` when the #logger is defined but without the ' + method + ' method.', function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZendeskInstance = new PublisherZenDesk(config, {}, options);
                publisherZendeskInstance.logger = {};
                publisherZendeskInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should not call the `common.' + method + '` when the #logger is defined with the ' + method + ' method.', function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZendeskInstance = new PublisherZenDesk(config, {}, options);
                publisherZendeskInstance.logger = {};
                publisherZendeskInstance.logger[method] = function () {};
                publisherZendeskInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).not.toHaveBeenCalled();
            });

            it('should call the `logger.' + method + '` when it\'s defined', function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZendeskInstance = new PublisherZenDesk(config, {}, options);
                publisherZendeskInstance.logger = {};
                publisherZendeskInstance.logger[method] = function () {};
                var spy = spyOn(publisherZendeskInstance.logger, method);
                publisherZendeskInstance[method]('a message', 'arg 1', 'arg 2');
                expect(spy).toHaveBeenCalledWith('a message', 'arg 1', 'arg 2');
            });

            it('should wrap the message inside a div with the `' + className + '` when the printMode=html', function () {
                var config = new Configurator('.');
                config.projectType = "adc";
                var publisherZendeskInstance = new PublisherZenDesk(config, {}, options);
                publisherZendeskInstance.printMode = 'html';
                publisherZendeskInstance[method]('a message', 'arg 1', 'arg 2');
                expect(common[method]).toHaveBeenCalledWith('<div class="' + className + '">a message</div>', 'arg 1', 'arg 2');
            });
        });
    }

    ['writeMessage', 'writeSuccess', 'writeWarning', 'writeError'].forEach(testLogger);
});
