"use strict";

const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const explorer = require('./explorerModel.js');
const appSettings = require('../appSettings/appSettingsModel.js');
const path = require('path');
const fs = require('fs');
let  explorerView;

/**
 * Open the root folder
 * @param err
 * @param {String} dir Path of the root directory
 * @param {String[]} files Array of path
 */
function openRootFolder(err, dir, files) {
    const adc = global.project.adc;
    if (adc) {
        adc.load(function (err) {
            const name = (!err) ? adc.configurator.info.name() : path.basename(dir);
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
 * Add a new item (file or directory) at the specified path
 * @param event
 * @param {String} dirPath Path of the directory where to create the item
 * @param {String|'file'|'directory'|'html'|'css'|'js'} type Type of the item to create
 * @param {String} itemName Name of the item to create
 */
function addItem(event, dirPath, type, itemName) {
    const extension = path.extname(itemName);
    const finalItemName = (extension || type === 'directory' || type === 'file') ? itemName : itemName + '.' + type.toLocaleLowerCase();
    const filePath = path.join(dirPath, finalItemName);

    if (type !== 'directory') {
        fs.writeFile(filePath, '', { encoding : 'utf8'}, function (err) {
            if (err) {
                console.log("TODO::MANAGE ERROR");
                console.log(err);
                return;
            }
            app.emit('menu-new-file', filePath);
        });
    } else {
        fs.mkdir(filePath, function (err) {
            if (err) {
                console.log("TODO::MANAGE ERROR");
                console.log(err);
            }
        });
    }
}

/**
 * Can remove file or folder from the explorer.
 *
 * @param event
 * @param {String} file Path of the folder or the file selected.
 */
function removeFile(event, file) {
    const pathToRemove = file.path;
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
    const oldPath = file.path;
    const newPath = path.join(oldPath, '..', newName);
    // Notify that a file will be rename
    app.emit('explorer-file-renaming', file.type, oldPath, newPath);
    explorer.rename(oldPath, newPath, function (err) {
        if (err) {
            console.log(err.message);
        }
        // Notify that a file has been renamed (also send the error just in case)
        app.emit('explorer-file-renamed', err, file.type, oldPath, newPath);
    });
}

/**
 * Show the project settings
 */
function showProjectSettings() {
    app.emit("menu-open-project-settings");
}


/**
 * When a directory change reload it
 * @param {String} dir Path of the directory that has changed
 * @param {Array} files Files or folders in the directory
 */
function onChange(dir, files) {
    const rootPath = explorer.getRootPath(),
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

    ipc.removeListener('explorer-add-item', addItem);
    ipc.on('explorer-add-item', addItem);

    ipc.removeListener('explorer-rename', renameFile);
    ipc.on('explorer-rename', renameFile);

    ipc.removeListener('explorer-remove', removeFile);
    ipc.on('explorer-remove', removeFile);

    ipc.removeListener('explorer-show-project-settings', showProjectSettings);
    ipc.on('explorer-show-project-settings', showProjectSettings);

    // When the directory structure change, reload the view
    explorer.removeListener('change', onChange); // Remove it first
    explorer.on('change', onChange); // Add it back
});

ipc.on('explorer-load-folder', function (event, folderpath) {
    explorer.load(folderpath, function (err, files) {
        event.sender.send('explorer-expand-folder', err, folderpath, files);
    });
});
