var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var dialog = require('dialog');
var explorer = require('../../src/explorer/explorer.js');
var path = require('path');
var ADC   = require('adcutil').ADC;
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var explorerView;

    /**
 * Open a project in the explorer
 * @param {String} folderpath Path of the folder to load as root
 */
function openProject(folderpath) {

  explorer.load(folderpath, function(err, files) {
      explorerView.send('explorer-expand-folder', err, folderpath, files, true);
      global.project.path = folderpath;
      global.project.adc  = new ADC(global.project.path);
  });
}

/**
* Open a new project when a new project has been created in the explorer
*
* @param {Event} events Event of the message received.
* @param {String} folderpath Path of the folder to load as root
*/
function openNewProject(events, folderpath) {

  if (events || events === null) {
      explorer.load(folderpath.path, function(err, files) {
          explorerView.send('explorer-expand-folder', err, folderpath.path, files, true);
          global.project.path = folderpath.path;
          global.project.adc  = new ADC(global.project.path);
      });
  }

}


  /**
 * Can remove file or folder from the explorer.
 *
 * @param event
 * @param {String} folder-file/path Path of the folder or the file selected.
 *
 */
function removeFile(event, file) {

    console.log(event);
    console.log('TEST REMOVE DONE');

  var pathToRemove = file.path;

  explorer.remove(pathToRemove, function(err) {
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
    explorer.rename(oldPath, newPath, function(err) {
      if (err) {
          console.log(err.message);
      }
    });
}


function newProject(event, projectOptions) {

  console.log(projectOptions.path);

  ADC.generate(projectOptions.name, { output: projectOptions.path, template: projectOptions.tmp }, openNewProject );
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
    explorerView.send('explorer-expand-folder', null, dir, files);
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

    ipc.removeListener('explorer-remove', removeFile);
    ipc.on('explorer-remove', removeFile);

    ipc.removeListener('explorer-new-project', newProject);
    ipc.on('explorer-new-project', newProject);

    //Send a message to the view, to open a new Project.
    app.removeListener('menu-new-project', sendOpenProject);
    app.on('menu-new-project', sendOpenProject);

    // When the directory structure change, reload the view
    explorer.removeListener('change', onChange); // Remove it first
    explorer.on('change', onChange); // Add it back
});

ipc.on('explorer-load-folder', function(event, folderpath) {
  explorer.load(folderpath, function(err, files) {
    event.sender.send('explorer-expand-folder', err, folderpath, files);
  });
});
