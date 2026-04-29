/******************************************************************************************************************************************************
 *																																					  *
 *													TODO:: UNITS TESTS ARE NOT MADE FOR THIS FEATURE TOO											  *
 *																																					  *
 ******************************************************************************************************************************************************/

describe("ADXPublisherGitHub", function() {

    var spies = {},
        options = {
            username : "a user",
            organization : "fakeAskiaOrg",
            useremail : "user@email.com",
            message : "a msg",
            password : "amazingSecret"
        },
        fs = require('fs'),
        git = require('simple-git'),
        common = require('../../app/common/common.js'),
        errMsg = common.messages.error,
        Configurator = require('../../app/configurator/ADXConfigurator.js').Configurator,
        PublisherGitHub = require('../../app/publisher/ADXPublisherGitHub.js').PublisherGitHub;      
    
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
    
    beforeEach(function() {
        spies.configurator = {
            get  : spyOn(Configurator.prototype, 'get')
        };
        spies.configurator.get.andReturn({
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
        spies.fs.stat.andCallFake(function (p, cb) {
            cb(null, {
                isFile : function () {
                    return true;
                }
            });
        });
        spies.fs.readFile.andCallFake(function (p, o, cb) {
            cb(null, 'a text');
        });
        spies.fs.createReadStream.andCallFake(function (p, o) {
            return p;
        });
        
    });
    
    describe("#Constructor", function() {
        it("should throw an error when the `configurator` argument is missing", function() {
            expect(function() {
                publisherGitHub = new PublisherGitHub();  
            }).toThrow(errMsg.missingConfiguratorArg);
        });

        it("should throw an error when the `configurator` argument is invalid", function() {
            expect(function() {
                publisherGitHub = new PublisherGitHub({});  
            }).toThrow(errMsg.invalidConfiguratorArg);
        });

        it("should throw an error when options are missing", function() {
            expect(function() {
                var notCompletedOptions = {
                    username	:	'fakeUser',
                };
                var config = new Configurator('.');
                var publisherGitHub = new PublisherGitHub(config, {}, notCompletedOptions);
            }).toThrow(errMsg.missingPublishArgs + '\n missing argument : useremail' );
        });

       /* it('should instantiate the github#configurator when everyting is ok', function () {
            var config = new Configurator('.');
            var publisherGitHub = new PublisherGitHub(config, {}, options);

            expect(publisherGitHub.configurator).toBe(config);
        });*/
    });
    
    describe("#publish", function() {
        //should create a repo when it doest not exist yet - 0 ms
    	//should not create a repo if it already exists
        describe("#checkIfRepoExists", function() {
            it("should create a repo when it doest not exist yet", function (){
                
            });
            
        });
    });
        
});

/*#Constructor - 3 ms
    should throw an error when the `configurator` argument is missing - 2 ms
    should throw an error when the `configurator` argument is invalid - 0 ms
    should throw an error when options are missing - 0 ms

#publish - 4 ms
    should call git#init if there is not a `.git` folder in the adc folder - 3 ms
    should not call git#init if there is a `.git` folder in the adc folder - 0 ms
    should always check if remote repo exists before acting - 1 ms

#checkIfRepoExists - 1 ms
    should create a repo when it doest not exist yet - 0 ms
    should not create a repo if it already exists - 1 ms*/