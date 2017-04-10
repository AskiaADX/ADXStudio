const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const path = require('path');
const fs = require('fs');
const dialog = electron.dialog;
const ADXConfigurator = require('adxutil').Configurator;
const workspace = require('./workspaceModel.js');
const servers = require('../modules/servers/adxServers.js');
let workspaceView;

/**
 * Save the status of the workspace
 */
function saveWorkspaceStatus () {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    return;
  }

  fs.mkdir(path.join(adx.path, '.adxstudio'), () => {
    fs.writeFile(path.join(adx.path, '.adxstudio', 'workspace.json'), JSON.stringify(workspace.toJSON()), { encoding: 'utf8' }, () => {
      //If not a callback function, nodejs throw an error
    });
  });
}

/**
 * Try to execute the function if the project is an ADX
 * @param {Function} fn
 * @param {ADX} fn.adx Instance of the ADX
 */
function tryIfADX (fn) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    return;
  }

  adx.load((err) => {
    if (err) {
      return;
    }
    if (!adx.configurator) {
      return;
    }
    if (!adx.configurator.info) {
      return;
    }

    const info = adx.configurator.info.get();
    if (!info || !info.name || !info.guid) {
      return;
    }
    // Ok seems to be an ADX
    fn(adx);
  });
}

/**
 * Build an array with all files in the directory
 * @param {String} dir Path of directory
 * @param {String[]} files Array of file name
 * @returns {Array}
 */
function buildFiles (dir, files) {
  const finalFiles = [];

  for (let i = 0, l = files.length; i < l; i += 1) {
    try {
      const stats = fs.statSync(path.join(dir, files[i]));
      if (stats.isFile()) {
        finalFiles.push(files[i]);
      }
    } catch (e) {
      // Do nothing
    }
  }

  return finalFiles;
}

/**
 * Return the structure of the resources directory of the current ADX
 * @param {Function} callback
 * @param {Object} callback.structure
 * @param {String[]} callback.structure.dynamic List of files in dynamic directory
 * @param {String[]} callback.structure.static List of files in static directory
 * @param {String[]} callback.structure.share List of files in share directory
 */
function getResourcesDirectoryStructure (callback) {
  if (typeof callback !== 'function') {
    return;
  }

  const adx = global.project.getADX();
  const sharePath = path.join(adx.path, 'resources/share');
  fs.readdir(sharePath, (errShare, shareFiles) => {
    const structure = {
      share: (!errShare) ? (buildFiles(sharePath, shareFiles) || []) : []
    };

    const staticPath = path.join(adx.path, 'resources/static');
    fs.readdir(staticPath, (errStatic, staticFiles) => {
      structure.static = (!errStatic) ? (buildFiles(staticPath, staticFiles) || []) : [];

      const dynamicPath = path.join(adx.path, 'resources/dynamic');
      fs.readdir(dynamicPath, (errDynamic, dynamicFiles) => {
        structure.dynamic = (!errDynamic) ? (buildFiles(dynamicPath, dynamicFiles) || []) : [];
        callback(structure);
      });
    });
  });
}

/**
 * Load and update the project settings tab
 * @param {Tab} tab
 * @param {Function} cb
 */
function loadProjectSettingsTab (tab, cb) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    cb(new Error('The ADX project is not defined in the global'), tab);
    return;
  }
  getResourcesDirectoryStructure((structure) => {
    tab.loadFile((err) => {
      adx.load((err2) => {
        tab.adxConfig = (!err2) ? adx.configurator.get() : {};
        tab.adxStructure = structure;
        if (tab.adxType === 'adp') {
          const outputs = tab.adxConfig.outputs.outputs;
          for (let i = 0, l = outputs.length; i < l; i += 1) {
            if (!outputs[i].contents) {
              outputs[i].contents = [];
            }
          }
        }
        cb(err || err2, tab);
      });
    });
  });
}

/**
 * Open project in the workspace
 */
function openProject () {
  workspace.removeListener('change', saveWorkspaceStatus);

  // Load the default path
  fs.readFile(path.join(global.project.getPath(), '.adxstudio', 'workspace.json'), (err, data) => {
    const json = err ? {} : JSON.parse(data.toString());
    workspace.init(json, () => {
      // Reload the workspace as it where before leaving the application
      const adx = global.project.getADX();
      const currentTabIds = {
        main: workspace.panes.main.currentTabId,
        second: workspace.panes.second.currentTabId
      };
      const configXmlPath = (adx && adx.path) ? path.join(adx.path, 'config.xml').toLowerCase() : '';
      // Copy the tabs before to iterate through it
      // the tabs could be modified by another async event
      // .slice() ensure we are working on a static copy
      const tabs = workspace.tabs.slice();
      let currentTabIndex = -1;
      let maxTabIndex = workspace.tabs.length;

      function openNextTab (callback) {
        currentTabIndex += 1;
        if (currentTabIndex >= maxTabIndex) {
          callback();
          return;
        }
        const tab = tabs[currentTabIndex];
        const pane = workspace.where(tab);
        const action = tab.id === currentTabIds[pane] ? 'workspace-create-and-focus-tab' : 'workspace-create-tab';

        // If the trying to open the config.xml, make sure we use the projectSettings tab
        if (configXmlPath && tab.path.toLowerCase() === configXmlPath) {
          tab.type = 'projectSettings';
          tryIfADX((adx2) => {
            if (!adx2 || !adx2.path) {
              openNextTab(callback);
              return;
            }
            tab.adxVersion = adx2.configurator.projectVersion;
            tab.adxType = adx2.configurator.projectType;

            // Open the project settings
            loadProjectSettingsTab(tab, (err) => {
              workspaceView.send(action, err, tab, pane);
              openNextTab(callback);
            });
          });
          return;
        }

        if (tab.type === 'preview') {
          // Open the preview
          if (!adx) {
            openNextTab(callback);
            return;
          }
          adx.checkTestsDirectory(() => {
            //startPreview();
            servers.listen(function (options) {
              tab.name = 'Preview';
              tab.ports = {
                http: options.httpPort,
                ws: options.wsPort
              };
              workspaceView.send(action, err, tab, workspace.where(tab));
              openNextTab(callback);
            });
          });
        } else {
          // Open file by default
          tab.loadFile((er) => {
            if (!er) {
              workspaceView.send(action, er, tab, workspace.where(tab));
            }
            openNextTab(callback);
          });
        }
      }

      openNextTab(() => {
        // Listen change now
        workspace.on('change', saveWorkspaceStatus);
      });
    });
  });
}

/**
 * Reload the workspace
 */
function reloadWorkspace () {
  workspaceView.reload();
}

/**
 * Open a file in new tab. If the file is already open, focus the tab.
 *
 * @param {String} file Path of file to open
 */
function openFile (file, fromExplorer) {
  const adx = global.project.getADX();
  const configXmlPath = (adx && adx.path) ? path.join(adx.path, 'config.xml').toLowerCase() : '';

  // If the trying to open the config.xml, make sure we use the projectSettings tab
  if (configXmlPath && file.toLowerCase() === configXmlPath) {
    openProjectSettings(fromExplorer);
    return;
  }

  workspace.find(file, (err, tab, pane) => {

    // If the tab already exist only focus it
    if (tab) {
      // TODO::Look if the content of the tab has changed
      // TODO::Look if the file has been removed
      workspaceView.send('workspace-focus-tab', err, tab, pane);
      return;
    }

    // When the tab doesn't exist, create it
    workspace.createTab(file, (err, tab, pane) => {
      if (err) {
        throw err;
      }
      tab.loadFile((err) => {
        workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
      });
    });
  });
}

/**
 * Open a file using the event from the explorer
 * @param event
 * @param {String|Object} file File to open
 */
function openFileFromExplorer (event, file) {
  const filePath = (typeof file === 'string') ? file : file.path;
  openFile(filePath, true);
}

/**
 * Open project settings
 */
function openProjectSettings (code) {
  tryIfADX((adx) => {
    if (!adx || !adx.path) {
      return;
    }
    const configXmlPath = path.join(adx.path, 'config.xml');
    workspace.find(configXmlPath, (err, tab, pane) => {
      if (code) {
        code = 'code';
      } else {
        code = 'form';
      }
      // If the tab already exist only focus it
      if (tab) {
        // TODO::Look if the content of the tab has changed
        // TODO::Look if the file has been removed
        if (tab.mode !== code) {
          tab.mode = code;
        }
        workspaceView.send('workspace-focus-tab', err, tab, pane);
        return;
      }
      // When the tab doesn't exist, create it
      workspace.createTab({
        path: configXmlPath,
        type: 'projectSettings',
        mode: code,
        adxVersion: adx.configurator.projectVersion,
        adxType: adx.configurator.projectType
      }, (err, tab, pane) => {
        // TODO::Don't throw the error but send it to the view
        if (err) {
          throw err;
        }
        loadProjectSettingsTab(tab, (err) => {
          workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
        });
      });
    });
  });
}

/**
 * Open the ADX preview
 * @param {Object} options Options
 * @param {Number} options.httpPort HTTP Port listen
 * @param {Number} options.wsPort WS port listen
 */
function openPreview (options) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    return;
  }

  workspace.find('::preview', (err, tab, pane) => {
    // If the tab already exist only focus it
    if (tab) {
      workspaceView.send('workspace-focus-tab', err, tab, pane);
      return;
    }
    // When the tab doesn't exist, create it
    // and enforce his creation on the second panel by default
    workspace.createTab({
      name: 'Preview',
      path: '::preview',
      type: 'preview'
    }, 'second', (err, tab, pane) => {
      if (err) {
        throw err;
      }
      tab.ports = {
        http: options.httpPort,
        ws: options.wsPort
      };
      workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
    });
  });
}

/**
 * Start the preview servers
 */
function startPreview () {
  tryIfADX((adx) => {
    if (!adx || !adx.path) {
      return;
    }

    adx.checkTestsDirectory(() => {
      servers.listen(openPreview);
    });
  });
}

/**
 * Save the current active file
 */
function saveFile () {
  workspaceView.send('workspace-save-active-file');
}

/**
 * Save as the current active file
 */
function saveFileAs () {
  workspaceView.send('workspace-save-as-active-file');
}

/**
 * Save all files
 */
function saveAllFiles () {
  workspaceView.send('workspace-save-all-files');
}

/**
 * Return the file structure of the ADX resources directory
 * @param event
 * @param {String} tabId Id of the tab that request the list of files
 */
function onGetAdxStructure (event, tabId) {
  tryIfADX((adx) => {
    if (!adx || !adx.path) {
      return;
    }
    getResourcesDirectoryStructure((structure) => {
      adx.load((err) => {
        workspaceView.send('workspace-update-adx-structure', err, tabId, structure);
      });
    });
  });
}

/**
 * Convert the config object to XML string
 * @param event
 * @param {Object} content
 */
function onConvertConfigToXml (event, content, tabId) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    workspaceView.send('workspace-config-to-xml', new Error('Could not find ADX project in global'));
    return;
  }
  const config = new ADXConfigurator(adx.path);
  config.load(() => {
    config.set(content);
    workspaceView.send('workspace-config-to-xml', null, config.toXml());
  });
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    tab.mode = 'code';
    tab.config.mode = 'code';
    saveWorkspaceStatus();
  });
}

/**
 * Convert the xml to config object
 * @param event
 * @param {String} content
 */
function onConvertXmlToConfig (event, content, tabId) {
  const adx = global.project.getADX();
  if (!adx || !adx.path) {
    workspaceView.send('workspace-xml-to-config', new Error('Could not find ADX project in global'));
    return;
  }
  const config = new ADXConfigurator(adx.path);
  config.load(() => {
    config.fromXml(content);
    workspaceView.send('workspace-xml-to-config', null, config.get());
  });
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    tab.mode = 'form';
    tab.config.mode = 'form';
    saveWorkspaceStatus();
  });
}

/**
 * Set the current tab
 * @param event
 * @param {String} tabId Id of the tab
 */
function onSetCurrentTab (event, tabId) {
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    workspace.currentTab(tab);
  });
}

/**
 * Close a tab
 * @param event
 * @param {String} tabId Id of the tab to close
 */
function onCloseTab (event, tabId) {
  workspace.removeTab(tabId, (err, tab, pane) => {
    workspaceView.send('workspace-remove-tab', err, tab, pane);
  });
}

/**
 * Close all tabs
 * @param event
 * @param {Object} [options]
 * @param {String} [options.except] Id of the tab to not closed
 */
function onCloseAllTabs (event, options) {
  workspace.removeAllTabs(options, (err, removedTabs) => {
    workspaceView.send('workspace-remove-tabs', err, removedTabs);
  });
}

/**
 * Move a tab into another pane
 * @param {Event} event
 * @param {String} tabId Id of the tab to move
 * @param {String} targetPane Pane to target
 */
function onMoveTab (event, tabId, targetPane) {
  workspace.moveTab(tabId, targetPane, (err) => {
    if (err) {
      console.warn(err);
    }
  });
}

/**
 * On edit content
 * @param event
 * @param {String} tabId Id of the tab
 */
function onEditContent (event, tabId) {
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    tab.edited = true;
  });
}

/**
 * On restore content
 * @param event
 * @param {String} tabId Id of the tab
 */
function onRestoreContent (event, tabId) {
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    tab.edited = false;
  });
}

/**
 * Send the update tab event
 * Called after saving a file
 */
function sendUpdateTabEvent (err, tab, pane) {
  tab.edited = false;
  workspaceView.send('workspace-update-tab', err, tab, pane);
  // Trigger the event in the app
  if (!exports.hasEditingTabs()) {
    app.emit('workspace-save-all-finish');
  }
}

/**
 * Save content
 * @param event
 * @param {String} tabId Id of the tab
 * @param {String} content Content to save
 */
function onSaveContent (event, tabId, content) {
  workspace.find(tabId, (err, tab, pane) => {
    if (err) {
      sendUpdateTabEvent(err, null, null);
      return;
    }
    if (tab.type === 'projectSettings') {
      const adx = global.project.getADX();
      if (!adx || !adx.path) {
        return;
      }

      if (typeof content === 'string') {
        adx.configurator.fromXml(content);
      } else {
        adx.configurator.set(content);
      }

      tab.saveFile(adx.configurator.toXml(), () => {
        loadProjectSettingsTab(tab, (err) => {
          sendUpdateTabEvent(err, tab, pane);
        });
      });
    } else {
      tab.saveFile(content, (err) => {
        sendUpdateTabEvent(err, tab, pane);
      });
    }
  });
}

/**
 * Show the modal dialog to save the file as ...
 *
 * @param {String} fileContent Content of the file to save
 */
function showSaveDialog (fileContent) {
  const fileName = fileNameWithoutExt + ' - Copy' + fileExt;
  const defaultPath = path.join(parentDir, fileName);

  dialog.showSaveDialog({
    title: 'Save As',
    properties: ['openFile'],
    defaultPath: defaultPath
  }, (filePath) => {
    if (!filePath) {
      return;
    }

    fs.writeFile(filePath, fileContent, { encoding: 'utf8' }, (err) => {
      if (err) {
        app.emit('show-modal-dialog', {
          type: 'okOnly',
          message: err.message
        });
      }
      openFile(filePath);
    });
  });
}


/**
 * Save content as
 * @param event
 * @param {String} tabId Id of the tab
 * @param {String} content Content to save
 */
function onSaveContentAs (event, tabId, content) {
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return; // Do nothing
    }

    if (tab.type === 'projectSettings') {
      // Use a fresh instance of the configurator based on the same file
      const configurator = new ADXConfigurator(tab.path);
      configurator.load((err) => {
        if (err) {
          return; // Do nothing
        }
        // Update the instance of the configurator with the new content
        if (typeof content === 'string') {
          configurator.fromXml(content);
        } else {
          configurator.set(content);
        }
        // Save the xml
        showSaveDialog(configurator.toXml());
      });
      return;
    }

    showSaveDialog(content);
  });
}


/**
 * Save the content and close the tab
 * @param event
 * @param {String} tabId Id of the tab
 * @param {String} content Content to save
 */
function onSaveContentAndClose (event, tabId, content) {
  workspace.find(tabId, (err, tab) => {
    if (err) {
      return;
    }
    if (tab.type === 'projectSettings') {
      const adx = global.project.getADX();
      if (!adx || !adx.path) {
        return;
      }

      if (typeof content === 'string') {
        adx.configurator.fromXml(content);
      } else {
        adx.configurator.set(content);
      }
      tab.saveFile(adx.configurator.toXml(), (err) => {
        if (err) throw err;
        adx.configurator.load();
        onCloseTab(event, tab.id);
      });
    } else {
      tab.saveFile(content, function () {
        onCloseTab(event, tab.id);
      });
    }
  });
}

/**
 * Confirm reload tab
 */
function onConfirmReload (event, tab, answer) {
  if (answer === 'yes') {
    workspace.find(tab, (err, tab, pane) => {
      if (err) throw err;
      if (!tab) {
        return;
      }
      tab.loadFile((err) => {
        workspaceView.send('workspace-reload-tab', err, tab, pane);
      });
    });
  }
}

/**
 * When the file has changed
 */
function onFileChanged (tab, pane) {
  if (!tab.edited) {
    tab.loadFile((err) => {
      workspaceView.send('workspace-reload-tab', err, tab, pane);
    });
  } else {
    app.emit('show-modal-dialog', {
      message: 'The file `' + tab.path + '` has been changed, do you want to reload it? ',
      type: 'yesNo'
    }, 'workspace-reload-or-not-reload', tab);
  }
}

/**
 * When a file has removed
 */
function onFileRemoved (tab) {
  workspace.removeTab(tab, (err, tab, pane) => {
    workspaceView.send('workspace-remove-tab', err, tab, pane);
  });
}

/**
 * A file is gonna to be rename in the explorer
 *
 * @param {String|'file'|'folder'} fileType Type of item (file or folder)
 * @param {String} oldPath Old file path (current)
 * @param {String} newPath New file path
 */
function explorerRenamingFile (fileType, oldPath) {
  if (fileType === 'file') {
    workspace.find(oldPath, (err, tab) => {
      if (err) {
        return;
      }
      tab.unwatch();
    });
  }
}

/**
 * A file should has been renamed in the explorer
 *
 * @param {Error}  err Error
 * @param {String|'file'|'folder'} fileType Type of item (file or folder)
 * @param {String} oldPath Old file path (current)
 * @param {String} newPath New file path
 */
function explorerRenamedFile (err, fileType, oldPath, newPath) {
  workspace.findAll(oldPath, (errFind, tabs, panes) => {
    if (errFind || !tabs.length) {
      return;
    }
    if (err) {
      tabs.forEach((tab) => {
        tab.watch();
      });
      return;
    }
    tabs.forEach((tab) => {
      if (fileType === 'file') {
        tab.changePath(newPath);
      } else {
        const newFilePath = tab.path.replace(oldPath, newPath);
        tab.changePath(newFilePath);
      }
      tab.watch();
    });

    workspaceView.send('workspace-rename-tabs', null, tabs, panes);
  });
}

/**
 * A file is gonna to be remove in the explorer
 *
 * @param {String|'file'|'folder'} fileType Type of item (file or folder)
 * @param {String} filePath Path of file to remove
 */
function explorerRemovingFile (fileType, filePath) {
  const testPath = path.join(global.project.getPath(), 'tests').toLowerCase();
  switch (fileType) {
  case 'file':
    workspace.find(filePath, (err, tab) => {
      if (err || !tab) {
        return;
      }
      tab.unwatch();
    });
    break;
  case 'folder':
      // If preview and we delete the tests directory 
      // then close the preview tab before removing folder
    if (testPath === filePath.toLowerCase()) {
      workspace.find('::preview', (err, tab, pane) => {
        if (tab) {
          workspaceView.send('workspace-remove-tab', err, tab, pane);
        }
        workspace.unwatchTabsIn(filePath);
      });
      return;
    }
    workspace.unwatchTabsIn(filePath);
    break;
  }
}

/**
 * A file should has been renamed in the explorer
 *
 * @param {Error}  err Error
 * @param {String|'file'|'folder'} fileType Type of item (file or folder)
 * @param {String} filePath Path of file to remove
 */
function explorerRemovedFile (err, fileType, filePath) {
  switch (fileType) {
  case 'file':
    workspace.find(filePath, (errFind, tab) => {
        // Rewatch the tab on error
      if (err) {
        if (tab) tab.watch();
        return;
      }
      if (tab) {
        onFileRemoved(tab);
      }
    });
    break;
  case 'folder':
    if (err) {
      workspace.rewatchTabsIn(filePath);
      return;
    }
    workspace.findRewatchableTabsIn(filePath, (err1, tabs) => {
      if (err1) {
        return;
      }
      tabs.forEach(onFileRemoved);
    });
    break;
  }
}

function menuNextTab () {
  workspaceView.send('next-tab');
}

function menuPrevTab () {
  workspaceView.send('prev-tab');
}

/**
 * Switch the current theme
 * @param {String} themeName The name of the new theme
 */
function switchTheme (themeName) {
  workspaceView.send('switch-theme', themeName);
}

function switchFontSize (fontSize) {
  workspaceView.send('switch-size', fontSize);
}



ipc.on('workspace-ready', (event) => {

  // Keep the connection with the view
  workspaceView = event.sender;

  // Initialize the workspace
  openProject();

  ipc.removeListener('explorer-load-file', openFileFromExplorer); // Remove it first to avoid duplicate event
  ipc.on('explorer-load-file', openFileFromExplorer); // Add it back again

  ipc.removeListener('workspace-set-current-tab', onSetCurrentTab);
  ipc.on('workspace-set-current-tab', onSetCurrentTab);

  ipc.removeListener('workspace-close-tab', onCloseTab);
  ipc.on('workspace-close-tab', onCloseTab);

  ipc.removeListener('workspace-close-all-tabs', onCloseAllTabs);
  ipc.on('workspace-close-all-tabs', onCloseAllTabs);

  ipc.removeListener('workspace-save-content', onSaveContent);
  ipc.on('workspace-save-content', onSaveContent);

  ipc.removeListener('workspace-save-content-as', onSaveContentAs);
  ipc.on('workspace-save-content-as', onSaveContentAs);

  ipc.removeListener('workspace-save-content-and-close', onSaveContentAndClose);
  ipc.on('workspace-save-content-and-close', onSaveContentAndClose);

  ipc.removeListener('workspace-edit-content', onEditContent);
  ipc.on('workspace-edit-content', onEditContent);

  ipc.removeListener('workspace-restore-content', onRestoreContent);
  ipc.on('workspace-restore-content', onRestoreContent);

  ipc.removeListener('workspace-move-tab', onMoveTab);
  ipc.on('workspace-move-tab', onMoveTab);

  ipc.removeListener('workspace-get-adx-structure', onGetAdxStructure);
  ipc.on('workspace-get-adx-structure', onGetAdxStructure);

  ipc.removeListener('workspace-convert-config-to-xml', onConvertConfigToXml);
  ipc.on('workspace-convert-config-to-xml', onConvertConfigToXml);

  ipc.removeListener('workspace-convert-xml-to-config', onConvertXmlToConfig);
  ipc.on('workspace-convert-xml-to-config', onConvertXmlToConfig);

  app.removeListener('menu-previous-tab', menuPrevTab);
  app.on('menu-previous-tab', menuPrevTab);

  app.removeListener('menu-next-tab', menuNextTab);
  app.on('menu-next-tab', menuNextTab);

  app.removeListener('menu-open-project', reloadWorkspace);
  app.on('menu-open-project', reloadWorkspace);

  app.removeListener('menu-new-file', openFile);
  app.on('menu-new-file', openFile);

  app.removeListener('menu-open-file', openFile);
  app.on('menu-open-file', openFile);

  app.removeListener('menu-save-file', saveFile);
  app.on('menu-save-file', saveFile);

  app.removeListener('menu-save-file-as', saveFileAs);
  app.on('menu-save-file-as', saveFileAs);

  app.removeListener('menu-save-all-files', saveAllFiles);
  app.on('menu-save-all-files', saveAllFiles);

  app.removeListener('menu-open-project-settings', openProjectSettings);
  app.on('menu-open-project-settings', openProjectSettings);

  app.removeListener('menu-preview', startPreview);
  app.on('menu-preview', startPreview);

  // A file is gonna to be remove in the explorer
  app.removeListener('explorer-file-removing', explorerRemovingFile);
  app.on('explorer-file-removing', explorerRemovingFile);

  // A file has been removed in the explorer
  app.removeListener('explorer-file-removed', explorerRemovedFile);
  app.on('explorer-file-removed', explorerRemovedFile);

  // A file is gonna to be rename in the explorer
  app.removeListener('explorer-file-renaming', explorerRenamingFile);
  app.on('explorer-file-renaming', explorerRenamingFile);

  // A file has been renamed in the explorer
  app.removeListener('explorer-file-renamed', explorerRenamedFile);
  app.on('explorer-file-renamed', explorerRenamedFile);

  app.removeListener('preference-switch-theme', switchTheme);
  app.on('preference-switch-theme', switchTheme);

  app.removeListener('preference-switch-size', switchFontSize);
  app.on('preference-switch-size', switchFontSize);

  workspace.removeListener('file-changed', onFileChanged);
  workspace.on('file-changed', onFileChanged);

  workspace.removeListener('file-removed', onFileRemoved);
  workspace.on('file-removed', onFileRemoved);

  ipc.removeListener('workspace-reload-or-not-reload', onConfirmReload);
  ipc.on('workspace-reload-or-not-reload', onConfirmReload);
});

/**
 * Indicates if some tabs is editing
 */
exports.hasEditingTabs = function hasEditingTabs () {
  return workspace.tabs.some((tab) => {
    return tab.edited;
  });
};