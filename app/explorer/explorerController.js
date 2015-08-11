var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');
var path = require('path');
var ADC   = require('adcutil').ADC;
var fs = require('fs');
var explorerView;

    /**
 * Open a new project in the explorer
 * @param {String} folderpath Path of the folder to load as root
 */
function openProject(folderpath) {
    explorer.load(folderpath, function(err, files) {
        explorerView.send('explorer-expand-folder', err, files, 'root');
        global.project.path = folderpath;
        global.project.adc  = new ADC(global.project.path);
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

    fs.stat(newPath, function(err, stats) {

        //if folder/file doesn't exist.
        if (err || (!stats.isFile() && !stats.isDirectory())) {

            fs.rename(oldPath, newPath, function(err) {
                if(err) {
                    console.log(err.message);
                } else {
                    console.log('Cool ca marche');

                    var parent = path.join(newPath,'..');
                    explorer.load(parent, function(err, files) {
                      explorerView.send('explorer-expand-folder', err, parent, files);
                    });
                }
            });
        } else {
            console.log('File or folder already exists.');

        }
    });

}

ipc.on('explorer-ready', function(event) {
    explorerView = event.sender; // Keep the connection with the view

    // Load the default path
    var defaultPath = path.join(__dirname, '../../');
    explorer.load(defaultPath, function(err, files) {
        explorerView.send('explorer-expand-folder', err, defaultPath, files, true);
        global.project.path = defaultPath;
        global.project.adc  = new ADC(global.project.path);
    });

    app.removeListener('menu-open-project', openProject); // Remove it first to avoid duplicate event
    app.on('menu-open-project', openProject); // Add it back again

    // Message from 'index.js' the view.
    // Here we receive the object sent from index.js.
    ipc.removeListener('explorer-rename', renameFile); // Remove it first
    ipc.on('explorer-rename', renameFile); // Add it back again
});

ipc.on('explorer-load-folder', function(event, folderpath) {
  explorer.load(folderpath, function(err, files) {
    event.sender.send('explorer-expand-folder', err, folderpath, files);
  });
});
