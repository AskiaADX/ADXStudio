const ADXStudioPath = "C:/Program Files/Askia/ADXStudio/resources/app/app";
const args = require('minimist')(process.argv.slice(2));
const ADX = require(ADXStudioPath + '/modules/adxutil').ADX;
const fs = require('fs');

// Check if a project path is provided in the command line arguments
if (args.project && typeof args.project === 'string') {
    // Ensure the project path is absolute
    args.project = require('path').resolve(args.project);

    // Check if the project path exists
    if (!fs.existsSync(args.project)) {
        console.error(`Project path does not exist: ${args.project}`);
        process.exit(1);
    }

    // Check if config.xml exists in the project path
    const configPath = require('path').join(args.project, 'config.xml');
    if (!fs.existsSync(configPath)) {
        console.error(`config.xml not found in the project path: ${args.project}`);
        process.exit(1);
    }

    const adx = new ADX(args.project);
    adx.build();
} else {
    console.error('No project path provided. Please specify a project path using --project.');
    process.exit(1);
}


