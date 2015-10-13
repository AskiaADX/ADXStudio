var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('./explorerModel.js');
var appSettings = require('../appSettings/appSettingsModel.js');
var path = require('path');
var ADC = require('adcutil').ADC;
var explorerView;

/**
 * Open a project in the explorer
 * @param {Object} event Event arg
 * @param {Object} options Project options
 */
function newProject(event, options) {
    var project = {
        output: options.path,
        template: options.template,
        description: options.description
    };
    project.author = {
        name: 'Maxime',
        email: 'nanana@gmail.com',
        company: 'askia',
        website: 'http://askia.com'
    };
    ADC.generate(options.name, project, function (err, adc) {
        if (err) {
            console.log(err);
            return;
        }
        openProject(adc.path);
    });
}

/**
 * Open the root folder
 * @param err
 * @param {String} dir Path of the root directory
 * @param {String[]} files Array of path
 */
function openRootFolder(err, dir, files) {
    var adc = global.project.adc;
    if (adc) {
        adc.load(function (err) {
            var name = (!err) ? adc.configurator.info.name() : path.basename(dir);
            explorerView.send('explorer-expand-folder', err, dir, files, true, name);
        });
    }
}

/**
 * Open a project in the explorer
 * @param {String} folderpath Path of the folder to load as root
 */
function openProject(folderpath) {
    appSettings.addMostRecentlyUsed({
        path : folderpath
    });
    explorer.load(folderpath, true, function (err, files) {
        openRootFolder(err, folderpath, files);
    });
}


/**
 * Can remove file or folder from the explorer.
 *
 * @param event
 * @param {String} file Path of the folder or the file selected.
 */
function removeFile(event, file) {
    var pathToRemove = file.path;

    explorer.remove(pathToRemove, function (err) {
        if (err) {
            console.log(err.message);
        }
    });
}

/**
 * Rename file event
 *
 * @param event
 * @param {Object} file File object (which contain name/path/type)
 * @param {String} newName New name of the file or folder
 */
function renameFile(event, file, newName) {
    var oldPath = file.path;
    var newPath = path.join(oldPath, '..', newName);
    explorer.rename(oldPath, newPath, function (err) {
        if (err) {
            console.log(err.message);
        }
    });
}

/**
 * Send a message to the view to Open new project.
 *
 */
function sendOpenProject(event) {
    explorerView.send('menu-new-project');
}

/**
 * When a directory change reload it
 * @param {String} dir Path of the directory that has changed
 * @param {Array} files Files or folders in the directory
 */
function onChange(dir, files) {
    var rootPath = explorer.getRootPath(),
        rg = new RegExp('^' + rootPath.replace(/\\/g, '\\\\') + '\\\\?$', 'i');

    if (rg.test(dir)) {
        openRootFolder(null, dir, files);
    } else {
        explorerView.send('explorer-expand-folder', null, dir, files);
    }
}

ipc.on('explorer-ready', function (event) {
    explorerView = event.sender; // Keep the connection with the view

    // Load the default path
    if (global.project.path) {
        explorer.load(global.project.path, true, function (err, files) {
            openRootFolder(err, global.project.path, files);
        });
    }
    

    app.removeListener('menu-open-project', openProject); // Remove it first to avoid duplicate event
    app.on('menu-open-project', openProject); // Add it back again

    ipc.removeListener('explorer-rename', renameFile);
    ipc.on('explorer-rename', renameFile);

    ipc.removeListener('explorer-remove', removeFile);
    ipc.on('explorer-remove', removeFile);
  
    ipc.removeListener('explorer-new-project', newProject);
    ipc.on('explorer-new-project', newProject);

    // Send a message to the view, to open a new Project.
    app.removeListener('menu-new-project', sendOpenProject);
    app.on('menu-new-project', sendOpenProject);

    // When the directory structure change, reload the view
    explorer.removeListener('change', onChange); // Remove it first
    explorer.on('change', onChange); // Add it back
});

ipc.on('explorer-load-folder', function (event, folderpath) {
    explorer.load(folderpath, function (err, files) {
        event.sender.send('explorer-expand-folder', err, folderpath, files);
    });
});
