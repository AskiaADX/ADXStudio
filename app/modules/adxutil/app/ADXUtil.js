#!/usr/bin/env node

const Command = require('../node_modules/commander').Command;
const program = new Command();
const common  = require('../app/common/common.js');


program
    .version('2.0.0')
    .option('-o, --output <name>', 'name of the output to display or path to the output directory for the generation')
    .option('-f, --fixture <name>', 'name of the fixture to use for the `show` command')
    .option('-m, --masterPage <path>', 'path of the master page to use for the `show` command (for ADC)')
    .option('-p, --properties <props>', 'ADX properties (in url query string format) to set for the `show` command')
    .option('-th, --themes <themes>', 'ADX theme properties (in url query string format) to set for the `show` command')
    // .option('-f, --force', 'overwrite the output directory when it exist')
    .option('-T, --no-test', 'skip the execution of ADX unit tests')
    .option('-X, --no-xml', 'skip the validation of the config.xml file')
    .option('-A, --no-autoTest', 'skip the execution of the auto-generated unit tests')
    .option('-t, --template <name>', 'name of the template to use to generate the ADX')
    // Option for the config
    .option('--authorName <name>', 'default name of the author to set in the config')
    .option('--authorEmail <email>', 'default email of the author to set in the config')
    .option('--authorCompany <name>', 'default company of the author to set in the config')
    .option('--authorWebsite <website>', 'default website of the author to set in the config')
    // Options for the publisher
    .option('--username <name>', 'platform username for the publish')
    .option('--password <password>', 'platform password for the publish')
    .option('--url <uri>', 'platform URL for the publish')
    .option('--demoUrl <url>' , 'Demo URL of the demo, mostly used for the publish')
    // Options for the publisher ZenDesk specific
    .option('--section <title>', 'ZenDesk section where to publish')
    .option('--promoted', 'ZenDesk promoted article')
    .option('--disableComments', 'ZenDesk disable comments on the published article')
    // Options for import
    .option('--sourcePath <path>', 'The path of the source')
    .option('--targetName <name>', 'The name of the new fixture')
    .option('--currentQuestion <question>', 'The name of the question');


program
    .command('generate <type> <name>')
    .description('generate a new ADX structure (ADP or ADC)')
    .action((type, name) => {
        const adxGenerator = require('./generator/ADXGenerator.js');
        adxGenerator.generate(program, type, name);
    });

program
    .command('publish <platform> [<path>]')
    .description('publish an ADX on a platform')
    .action((platform, path) => {
        const adxPublisher = require('./publisher/ADXPublisher.js');
        adxPublisher.publish(program, platform, path)
    });

program
    .command('validate [<path>]')
    .description('validate the uncompressed ADX structure')
    .action((path) => {
        const adxValidator = require('./validator/ADXValidator.js');
        adxValidator.validate(program, path);
    });

program
    .command('build [<path>]')
    .description('build the ADX file')
    .action((path) => {
        const adxBuilder = require('./builder/ADXBuilder.js');
        adxBuilder.build(program, path);
    });

program
    .command('show [<path>]')
    .description('show the output of the ADX')
    .action((path) => {
        const adxShow = require('./show/ADXShow.js');
        adxShow.show(program, path);
    });

program
    .command('import [<path>]')
    .description('import an askia xml in fixtures')
    .action((path) => {
        const adxImport = require('./import/ADXImport.js');
        adxImport.adxImport(program, path);
    });


program
    .command('config')
    .description('get or set the configuration (use the --authorXXX flags to set the config)')
    .action(() =>{
        const adxPreferences = require('./preferences/ADXPreferences.js');
        // No option to set, so only read
        if (!program.authorName && !program.authorEmail && !program.authorCompany && !program.authorWebsite) {
            adxPreferences.read();
        } else {
            const preferences = {
                author : {}
            };

            if ('authorName' in program) {
                preferences.author.name = program.authorName;
            }
            if ('authorEmail' in program) {
                preferences.author.email = program.authorEmail;
            }
            if ('authorCompany' in program) {
                preferences.author.company = program.authorCompany;
            }
            if ('authorWebsite' in program) {
                preferences.author.website = program.authorWebsite;
            }
            adxPreferences.write(preferences);
        }
    });

program.parse(process.argv);
