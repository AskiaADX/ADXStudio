'use strict';

const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const explorer = require('./explorerModel.js');
const appSettings = require('../appSettings/appSettingsModel.js');
const path = require('path');
const fs = require('fs');
const fse = require('fs.extra');
const wrench = require('wrench');
let explorerView;
let lastCopy;
let fileToPaste;

/**
 * Open the root folder
 * @param err
 * @param {String} dir Path of the root directory
 * @param {String[]} files Array of path
 */
function openRootFolder (err, dir, files) {
  if (err) throw err;
  const adx = global.project.getADX();
  if (adx) {
    adx.load(function (err) {
      const name = (!err) ? adx.configurator.info.name() : path.basename(dir);
      explorerView.send('explorer-expand-folder', err, dir, files, true, name);
    });
  }
}

/**
 * Open a project in the explorer
 * @param {String} folderpath Path of the folder to load as root
 */
function openProject (folderpath) {
  appSettings.addMostRecentlyUsed({
    path: folderpath
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
function addItem (event, dirPath, type, itemName) {
  const extension = path.extname(itemName);
  const finalItemName = (extension || type === 'directory' || type === 'file') ? itemName : itemName + '.' + type.toLocaleLowerCase();
  const filePath = path.join(dirPath, finalItemName);

  if (type !== 'directory') {
    fs.writeFile(filePath, '', { encoding: 'utf8' }, function (err) {
      if (err) {
        app.emit('show-modal-dialog', {
          type: 'okOnly',
          message: err.message
        });
        return;
      }
      refreshExplorerView(filePath);
      app.emit('menu-new-file', filePath);
    });
  } else {
    fs.mkdir(filePath, function (err) {
      if (err) {
        app.emit('show-modal-dialog', {
          type: 'okOnly',
          message: err.message
        });
      }
    });
  }
}

/**
 * Sort the files with folder first
 * @param a
 * @param b
 * @returns {number}
 */
function sortFiles (a, b) {
  return a.path.localeCompare(b.path);
}

/**
 * Can remove files or folders from the explorer.
 *
 * @param event
 * @param {Array} files Array of tabs.
 */
function removeAllFiles (event, files) {
  files = files.sort(sortFiles).reverse();
  for (let i = 0, l = files.length; i < l; i++) {
    removeFile(event, files[i]);
  }
}

/**
 * Can remove file or folder from the explorer.
 *
 * @param event
 * @param {Tab} file Path of the folder or the file selected.
 */
function removeFile (event, file) {
  const pathToRemove = file.path;
  // Notify that a file will be remove
  app.emit('explorer-file-removing', file.type, file.path);
  explorer.remove(pathToRemove, function (err) {
    app.emit('explorer-file-removed', err, file.type, file.path);
    if (err) {
      app.emit('show-modal-dialog', {
        type: 'okOnly',
        message: err.message
      });
    }

    refreshExplorerView(file.path);
  });
}



/**
 * Rename file event
 *
 * @param event
 * @param {Object} file File object (which contain name/path/type)
 * @param {String} newName New name of the file or folder
 */
function renameFile (event, file, newName) {
  const oldPath = file.path;
  const newPath = path.join(oldPath, '..', newName);

  // Notify that a file will be rename
  app.emit('explorer-file-renaming', file.type, oldPath, newPath);
  explorer.rename(oldPath, newPath, function (err) {
    if (err) {
      app.emit('show-modal-dialog', {
        type: 'okOnly',
        message: err.message
      });
      return;
    }

    refreshExplorerView(newPath);

    // Notify that a file has been renamed (also send the error just in case)  
    app.emit('explorer-file-renamed', err, file.type, oldPath, newPath);
  });
}

/**
 * Minify file event
 *
 * @param event
 * @param {Object} file File object (which contain name/path/type)
 * @param {String} newName New name of the file or folder
 */
function minifyFile (event, file, newName) {
  const oldPath = file.path;
  const newPath = path.join(oldPath, '..', newName);
  // Notify that a file will be rename
  // app.emit('explorer-file-renaming', file.type, oldPath, newPath);
  explorer.minify(oldPath, newPath, function (err) {
    if (err) {
      app.emit('show-modal-dialog', {
        type: 'okOnly',
        message: err.message
      });
      return;
    }
    refreshExplorerView(newPath);

    // Notify that a file has been renamed (also send the error just in case)    
    app.emit('menu-new-file', newPath);
  });
}

/**
 * Show the project settings
 */
function showProjectSettings () {
  app.emit('menu-open-project-settings');
}


/**
 * When a directory change reload it
 * @param {String} dir Path of the directory that has changed
 * @param {Array} files Files or folders in the directory
 */
function onChange (dir, files) {
  const rootPath = explorer.getRootPath();
  const rg = new RegExp('^' + rootPath.replace(/\\/g, '\\\\') + '\\\\?$', 'i');

  if (rg.test(dir)) {
    openRootFolder(null, dir, files);
  } else {
    explorerView.send('explorer-expand-folder', null, dir, files);
  }
}

function copyAll (event, files) {
  lastCopy = {
    file: files,
    type: 'multiple',
    typeOfCopy: 'copy'
  };
}

function cutAll (event, files) {
  lastCopy = {
    file: files,
    type: 'multiple',
    typeOfCopy: 'cut'
  };
}

function copy (event, file) {
  lastCopy = {
    file: file,
    type: 'simple',
    typeOfCopy: 'copy'
  };
}

function cut (event, file) {
  lastCopy = {
    file: file,
    type: 'simple',
    typeOfCopy: 'cut'
  };
}

function paste (event, file) {
  fileToPaste = file;

  if (file.type === 'file') {
    let path = file.path.substring(0, (file.path.length - file.name.length - 1));
    file.path = path;
  }

  fs.readdir(file.path, function (err, files) {
    if (err) {
      console.log(err.message);
    }
    if (files.length && files.length >= 1) {
      for (let i = 0, l = files.length; i < l; i++) {
        if (files[i] === lastCopy.file.name) {
          app.emit('show-modal-dialog', {
            type: 'yesNo',
            message: 'Do you want to overwrite existing files ?',
            buttonText: {
              yes: 'Yes',
              no: 'No'
            }
          }, 'explorer-copy-override');
          return;
        }
      }
    }
    finalPaste(event, false);
  });
}

function copyFolder (src, dest, forceDel, event) {
  wrench.copyDirRecursive(src.path, dest, { forceDelete: forceDel }, function (err) {
    if (err) {
      console.log(err.message);
    }
    if (lastCopy.typeOfCopy === 'cut') {
      removeFile(event, src);
    }
  });
}

function copyFile (src, dest, forceDel, event) {
  fse.copy(src.path, dest, { replace: forceDel }, function (err) {
    if (err) {
      console.log(err.message);
    }
    if (lastCopy.typeOfCopy === 'cut') {
      removeFile(event, src);
    }
  });
}

function finalPaste (event, button) {
  const override = (button === 'yes');
  let filePath = fileToPaste.path;
  if (fileToPaste.type === 'file') {
    filePath = path.join(filePath, '../');
  }
  let fileToWrite;
  if (lastCopy.type === 'multiple') {
    for (let i = 0, l = lastCopy.file.length; i < l; i++) {
      fileToWrite = path.join(filePath, lastCopy.file[i].name);
      if (lastCopy.file[i].type === 'folder') {
        copyFolder(lastCopy.file[i], fileToWrite, override, event);
      }
      if (lastCopy.file[i].type === 'file') {
        copyFile(lastCopy.file[i], fileToWrite, override, event);
      }
    }
  } else {
    fileToWrite = path.join(filePath, lastCopy.file.name);
    if (lastCopy.file.type === 'folder') {
      copyFolder(lastCopy.file, fileToWrite, override, event);
    }
    if (lastCopy.file.type === 'file') {
      copyFile(lastCopy.file, fileToWrite, override, event);
    }
  }
}

function doRefreshExplorerView(event, filePath) {
  refreshExplorerView(filePath, false);
}

function refreshExplorerView(filePath, isFile = true) {
  var folderpath = filePath;
  
  if(isFile) {
    folderpath = path.dirname(filePath);
  }
  
  explorer.load(folderpath, function (err, files) {
    explorerView.send('explorer-expand-folder', err, folderpath, files);      
  });
}

function openExplorer(event, path) {
  var cmd = ``;
  switch (require(`os`).platform().toLowerCase().replace(/[0-9]/g, ``).replace(`darwin`, `macos`)) {
      case `win`:
          path = path || '=';
          cmd = `explorer`;
          break;
      case `linux`:
          path = path || '/';
          cmd = `xdg-open`;
          break;
      case `macos`:
          path = path || '/';
          cmd = `open`;
          break;
  }
  let p = require(`child_process`).spawn(cmd, [path]);

  p.on('error', (err) => {
      p.kill();
      // return callback(err);
  });
}

/**
 * Switch the current theme
 * @param {String} themeName The name of the new theme
 */
function switchTheme (themeName) {
  explorerView.send('switch-theme', themeName);
}

function switchClick (clickToUse) {
  //console.log(clickToUse);
  explorerView.send('switch-click', clickToUse);
}

ipc.on('explorer-ready', function (event) {
  explorerView = event.sender; // Keep the connection with the view
  let projectPath = global.project.getPath();

  // Load the default path
  if (projectPath) {
    explorer.load(projectPath, true, function (err, files) {
      openRootFolder(err, projectPath, files);
    });
  }

  app.removeListener('menu-open-project', openProject); // Remove it first to avoid duplicate event
  app.on('menu-open-project', openProject); // Add it back again

  app.removeListener('preference-switch-theme', switchTheme);
  app.on('preference-switch-theme', switchTheme);

  app.removeListener('preference-switch-click', switchClick);
  app.on('preference-switch-click', switchClick);

  ipc.removeListener('explorer-add-item', addItem);
  ipc.on('explorer-add-item', addItem);

  ipc.removeListener('explorer-rename', renameFile);
  ipc.on('explorer-rename', renameFile);

  ipc.removeListener('explorer-minify', minifyFile);
  ipc.on('explorer-minify', minifyFile);

  ipc.removeListener('explorer-refresh', doRefreshExplorerView);
  ipc.on('explorer-refresh', doRefreshExplorerView);

  ipc.removeListener('explorer-remove', removeFile);
  ipc.on('explorer-remove', removeFile);

  ipc.removeListener('explorer-remove-all', removeAllFiles);
  ipc.on('explorer-remove-all', removeAllFiles);

  ipc.removeListener('explorer-show-project-settings', showProjectSettings);
  ipc.on('explorer-show-project-settings', showProjectSettings);

  ipc.removeListener('cut-file', cut);
  ipc.on('cut-file', cut);

  ipc.removeListener('copy-file', copy);
  ipc.on('copy-file', copy);

  ipc.removeListener('paste-file', paste);
  ipc.on('paste-file', paste);

  ipc.removeListener('cut-all-file', cutAll);
  ipc.on('cut-all-file', cutAll);

  ipc.removeListener('copy-all-file', copyAll);
  ipc.on('copy-all-file', copyAll);

  ipc.removeListener('explorer-copy-override', finalPaste);
  ipc.on('explorer-copy-override', finalPaste);

  ipc.removeListener('open-explorer', openExplorer);
  ipc.on('open-explorer', openExplorer);

  // When the directory structure change, reload the view
  explorer.removeListener('change', onChange); // Remove it first
  explorer.on('change', onChange); // Add it back
});

ipc.on('explorer-load-folder', function (event, folderpath) {
  explorer.load(folderpath, function (err, files) {
    event.sender.send('explorer-expand-folder', err, folderpath, files);
  });
});
