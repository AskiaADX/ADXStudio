# ADXUtil

This utilities is use to facilitate the creation and the packaging of ADX project (ADP and ADC).

It contains validators and allow to display outputs of the ADX using the ADXEngine. 

ADXUtil is a CLI tools (Command Line Interface) but it also provide an API for NodeJS project. 

## Setup

Install NodeJs: https://nodejs.org/download/

Then install the npm package adxutil:
 
    npm install -g adxutil


## Run unit tests of ADXUtil

Install jasmine-node for unit tests

    npm install jasmine-node -g
    
Then run

    jasmine-node spec/

or

    npm test
    

## CLI Usage

This application works through Windows PowerShell


    adxutil [options] [command]

    Commands:

    generate <type> <name>        generate a new ADP or ADC structure (type is `adc` or `adp`)
    validate [<path>]             validate the uncompressed ADX structure
    publish <platform>            publish the adc on a web platform
    build [<path>]                build the ADX file
    show [<path>]                 show the output of the ADX
    import [<path>]               import an askia xml into fixtures of an ADX project
    config                        get or set the configuration (use the --authorXXX flags to set the config)

    Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -o, --output <name>       name of the output to display or path to the output directory for the generation
    -f, --fixture <name>      name of the fixture to use for the `show` command
    -m, --masterPage <path>   path of the master page to use for the `show` command (for ADC only)
    -p, --properties <props>  ADX properties (in url query string format) to set for the `show` command'
    -T, --no-test             skip the execution of ADX unit tests
    -X, --no-xml              skip the validation of the config.xml file
    -A, --no-autoTest         skip the execution of the auto-generated unit tests
    -t, --template <name>     name of the template to use to generate the ADX
    --authorName <name>       default name of the author to set in the config
    --authorEmail <email>     default email of the author to set in the config
    --authorCompany <name>    default company of the author to set in the config
    --authorWebsite <website> default website of the author to set in the config
    --username <name>         the username login to connect to the platform
    --pwd <password>          the password login to connect to the platform
    --url <uri>        		  the remote URI of the platform
	--demoUrl <url>			  the url to start the survey demo
    --section <title>    	  the name of the section where the adc will be posted (ZenDesk)
    --promoted                the article will be promoted (appear with a star in ZenDesk Platform)
    --disableComments         the comments will be disabled on the article corresponding to the ADC on ZenDesk
    --sourcePath              the path of the askia xml source
    --targetName              the name of the new xml fixture
    --currentQuestion         the name of the question to use in the xml target
    
    
### Generate

Start `Windows PowerShell` (`Start > All programs > Accessories > Windows PowerShell > Windows PowerShell`). 
Target the root directory where you want to generate the ADP or ADC (or use the *-o* or *--output* option).

    cd C:\Users\user_name\Documents\ADXProjects\

Then enter the following command:

    ADXUtil generate adc my_adc_name

Or 

    ADXUtil generate adp my_adp_name
    
That should produce an output like:

![generate (Example output)](ADCUtilGenerate.png "generate (Example output)")


To generate the ADX structure, ADCUtil uses templates stored under the `/ADXUtil/templates/`. 
By default, it use the `default` template (/ADXUtil/templates/adp/default/) or (/ADXUtil/templates/adc/default/).

That means that you can predefine many more templates and store them in the `/ADXUtil/templates/` folder. 
Then you only need to specify the name of the template folder you want to use to generate your ADX:

    ADXUtil --template my_adc_template_name generate adc my_adc_name
    
Or
    
    ADXUtil --template my_adp_template_name generate adp my_adp_name

#### List of possible error messages

**Errors**

    "The @name@ parameter is required"
    "The --output path is required"
    "The directory @%s@ already exists."
    "Incorrect ADX name. The name of the ADX should only contains letters, digits, spaces, @_,-,.@ characters"
    "Cannot found the @%s@ template"


### Publish

Start `Windows PowerShell` (`Start > All programs > Accessories > Windows PowerShell > Windows PowerShell`). 
Target your ADX directory.

    cd C:\Users\user_name\Documents\ADXProjects\my_adx_name
    
Then enter the following command with a platform argument and then the options you want:

    ADXUtil publish ZenDesk --url http://url/to/zendesk --section mySection --username myName --password secret


You can use following command line options for the ZenDesk publisher:

#### List of possible error messages

**Errors**

    "Invalid `platform` argument"
    "Missing `platform` argument"
    "Invalid `configurator` argument"
    "Invalid `options` argument"
    "Invalid `title` argument"
    "Non-existing section. Please check the section title or your logins"
    "Missing `configurator` argument"
    "The number of .adc files is incorrect"
    "Error when updating or creating this article : There are already at least two instances of this article on ZenDesk (Check in draft mode if you don't see them in help_center mode)"
    "Missing `title` arg"
    "Arguments are missing. Check the arguments in command line or your personal preferences file"

### Validate

Start `Windows PowerShell` (`Start > All programs > Accessories > Windows PowerShell > Windows PowerShell`). 
Target your ADX directory (or indicates the path of your ADX after the `validate` command).

    cd C:\Users\user_name\Documents\ADXProjects\my_adx_name

Then enter the following command:

    ADXUtil validate

That should produce an output like:

![validate (Example output)](ADCUtilValidate.png "validate (Example output)")


The validation will check:

* The presence of the config.xml file
* The directory structure
* The files extensions using a whitelist and a blacklist (All other extensions will produce a warning)
* The config.xml using the XSD schema
* The logical in the config.xml
** The name information
** The constraints nodes (at least one control or question must be specified for an ADC)
** The outputs, output, content and attribute nodes
** The properties nodes

It will also run the auto-generated unit tests and all unit tests of the ADX using the @ADXShell@ tool. 
You can skip some validations using the following options in the command line:

* -T, --no-test 
To skip the execution of the unit tests

* -A, --no-autoTest  
To skip the execution of the auto-generated unit tests

* -X, --no-xml           
To skip the validation of the config.xml file

#### List of possible error and warning messages

**Errors**

    "No such file or directory `%s`"
    "missing required argument `path`"
    "cannot find the `Config.xml` file in the directory"
    "File extension `%s` is forbidden"
    "The config.xml must contains the `info` node as a child of the xml root element"
    "The node `name` in `info` doesn't exist or is empty"
    "Duplicate constraints on `%s`"
    "The constraint on `%s` doesn't accept the `%s` attribute"
    "The constraint on `%s` requires at least one rule"
    "A constraint on `%s` is required"
    "Too many outputs with empty condition: `%s`"
    "At least one dynamic file is require for the `%s` output, or set the attribute `defaultGeneration=true` in the output node"
    "Cannot find the `resources` directory"
    "Cannot find the `%s` directory"
    "Output: `%s`. Cannot find the file `%s` in the `%s` directory"
    "Output: `%s`. Type `%s` could not be dynamic (`%s`)"
    "Output: `%s`. Attribute `%s` of the `%s` content could not be override"
    "Output: `%s`. `yield` node required for the binary content `%s` or set his position to `none`"
    "Output: `%s`. Duplicate `%s` attribute node in content `%s`"

**Warnings**

    "Untrust extension of the file `%s`"
    "Duplicate conditions in outputs `%s` and `%s`"
    "Output: `%s`. `attribute` nodes will be ignored for the `%s` content (`%s`)"
    "Output: `%s`. `attribute` nodes will be ignored for dynamic content (`%s`)"
    "Output: `%s`. `attribute` nodes will be ignored when using `yield` (`%s`)"
    "Output: `%s`. It's recommended to test the `Browser.Support(\"Javascript\")` in the condition node, before using `javascript` content."
    "Output: `%s`. It's recommended to test the `Browser.Support(\"Flash\")` in the condition node, before using `flash` content."
    "It's recommended to have at least one fallback with HTML only"
    "It's recommended to define at least one properties"
    "It's recommended to unit test your ADX project"

### Build

Start `Windows PowerShell` (`Start > All programs > Accessories > Windows PowerShell > Windows PowerShell`). 
Target your ADC directory (or indicate the path of your ADC after the `build` command).

    cd C:\Users\user_name\Documents\ADXProjects\my_adx_name

Then enter the following command:

    ADXUtil build

That should produce an output like:

![build (Example output)](ADCUtilBuild.png "build (Example output)")

The `build` command will first validate the ADX like the "validate command":#validate did (it will enforce the XML validation). 
If the validation fails, the build will stop otherwise it will compress all necessary files into a zip file with the *.adc or *.adp extension.

The file will be generated under the ADX directory in the `\bin\` folder.

#### List of possible error messages

**Errors**

    "Validation failed"
    "Build failed with errors."

### Show

Start @Windows PowerShell@ (@Start > All programs > Accessories > Windows PowerShell > Windows PowerShell@). 
Target your ADX directory (or indicate the path of your ADX after the @show@ command).

    cd C:\Users\user_name\Documents\ADXProjects\my_adx_name

Then enter the following command:

    ADXUtil show --output MyADXOutputName --fixture TheFixtureFileName.xml

OR

    ADXUtil show -o MyADXOutputName -f TheFixtureFileName.xml
    

That should show the result of the `MyADXOutputName` with the specified fixture.

#### List of possible error messages

**Errors**

    "Please specify the name of the output you want to show, using the option -o or --output.",
    "Please specify the name of the fixture you want to use, using the option -f or --fixture."

### Import

Start @Windows PowerShell@ (@Start > All programs > Accessories > Windows PowerShell > Windows PowerShell@). 
Target your ADX directory (or indicate the path of your ADX after the @show@ command).

    cd C:\Users\user_name\Documents\ADXProjects\my_adx_name

Then enter the following command:

    ADXUtil show --sourcePath "C:\Askia\adx.xml" --currentQuestion questionName --targetName fixture.xml


That should create an xml file in the test/fixture folder of the adx project

#### List of possible error messages

**Errors**

    "Please specify the path of the xml file you want to import, using the option --sourcePath.",
    "Please specify the path of the name of the fixture you want to create, using the option --targetName."
    "Please specify the path of the question you want to import, using the option --currentQuestion."


## API Usage

Please find the [full API documentation here](http://installers.askia.com/helpdesk/devs/ADXUtilDoc/ADX.html)

Example of usage of existing ADX

    const ADX = require('adxutil').ADX;
    
    const myAdx = new ADX('path/to/adx/dir');
        
    // Validate an ADX
    const configTest = {
        test : false, 
        autoTest : false
    }; 
    myAdx.validate(configTest, (err, report) => {
        // Callback when the ADX structure has been validated
    });
    
    // Show the output of an ADX
    const configShow = { 
        output : 'fallback', 
        fixture : 'single.xml'  
    };
    myAdx.show(configShow,  (err, output) => {
        // Callback with the output of the ADX
    });
    
    // Build the ADX (package it)
    const configBuild = {
        test : false, 
        autoTest : false
    };
    myAdx.build(configBuild, (err, path, report) => {
        // Callback when the ADX has been built 
    });
    

Generate and use the new ADX instance
    
    const configGeneration = {
        type : 'adc', 
        output : '/path/of/parent/dir', 
        template : 'blank'
    };
    ADX.generate('myNewADC', configGeneration , (err, adc) => {
        console.log(adc.path);
        adc.load((err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(adc.configurator.info.get());
        });
    });
    
    
OR

    const configGeneration = {
        type : 'adp', 
        output : '/path/of/parent/dir', 
        template : 'default'
    };
    ADX.generate('myNewADP', configGeneration, (err, adp) => {
        console.log(adp.path);
        adp.load((err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(adp.configurator.info.get());
        });
    });