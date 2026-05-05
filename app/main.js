'use strict';
// If more details needed, then uncomment the next row for node js deprecation errors
// process.traceDeprecation = true;
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const electron = require('electron');
// Removed @electron/remote/main usage
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const appSettings = require('./appSettings/appSettingsModel.js');
const ADX = require('./modules/adxutil').ADX;
const shell = electron.shell;
const ipc = electron.ipcMain;


const mainController = require('./main/mainController.js');
const { show } = require('./modules/adxutil/app/show/ADXShow.cjs');

app.allowRendererProcessReuse = false;
app.commandLine.appendSwitch('disable-site-isolation-trials');

// IPC handler for tab context menu
ipc.on('menu:tab-context', (event, data) => {
  const { Menu } = require('electron');
  const menuTemplate = [
    {
      label: 'Close',
      click: () => {
        event.sender.send('workspace-remove-tab', data.tabId);
      }
    },
    {
      label: 'Close others',
      click: () => {
        event.sender.send('workspace-close-all-tabs', { except: data.tabId });
      }
    },
    {
      label: 'Close all',
      click: () => {
        event.sender.send('workspace-close-all-tabs');
      }
    },
    { type: 'separator' },
    {
      label: 'Move to other pane',
      click: () => {
        event.sender.send('workspace-move-to-other-pane', data.tabId);
      }
    }
  ];
  if (data.isHtml) {
    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: 'Open in browser',
      click: () => {
        shell.openPath(data.tabPath);
      }
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  menu.popup({ window: global.mainWindow });
});


// IPC handler for explorer context menu
ipc.on('explorer-context-menu', (event, files, parentFiles) => {
  const { Menu } = require('electron');

  let contextualMenu = new Menu();

  displayExplorerMenu(files, contextualMenu);



  /*
  const { Menu } = require('electron');
  const menuTemplate = [
    { label: 'Open', click: () => { event.sender.send('explorer-open', files[0]); } },
    { label: 'Rename', click: () => { event.sender.send('explorer-rename', files[0]); } },
    { label: 'Delete', click: () => { event.sender.send('explorer-delete', files[0]); } },
    { type: 'separator' },
    { label: 'Properties', click: () => { event.sender.send('explorer-properties', files[0]); } }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  */
  contextualMenu.popup({ window: BrowserWindow.getFocusedWindow() });
});




function displayExplorerMenu (files, contextualMenu) {
  const { MenuItem } = require('electron');

  let file = files[0];

  /* Add file */
  function addNewFile (menuItem) {
    let messageByType = {
      file: 'File name:',
      directory: 'Directory name:',
      html: 'HTML file name:',
      css: 'Stylesheet file name:',
      js: 'Javascript file name:',
      asx: 'Askia Script Xtension file name'
    };
    let filePath = file.path;
    if (file.type === 'file') { // Remove the file name
      filePath = filePath.replace(file.name, '');
    }
    app.emit('show-modal-dialog', {
      type: 'prompt',
      message: messageByType[menuItem.id],
      buttonText: {
        ok: 'Create',
        cancel: 'Don\'t create'
      }
    }, 'explorer-add-item', filePath, menuItem.id);
  }

  /* Remove files */
  function removeFiles (files) {
    let file = files[0];
    if (files.length === 1) {
      global.mainWindow.webContents.send('show-modal-dialog', {
        type: 'yesNo',
        message: 'Do you really want to remove `' + file.name + '`?',
        buttonText: {
          yes: 'Remove',
          no: 'Don\'t remove'
        }
      }, 'explorer-remove', file);
    } else {
      global.mainWindow.webContents.send('show-modal-dialog', {
        type: 'yesNo',
        message: 'Do you really want to remove these files?',
        buttonText: {
          yes: 'Remove',
          no: 'Don\'t remove'
        }
      }, 'explorer-remove-all', files);
    }
  }

  if (files.length === 1) {
    contextualMenu.append(new MenuItem({
      label: 'New',
      submenu: [
        {
          id: 'file',
          label: 'File',
          click: addNewFile
        },
        {
          id: 'directory',
          label: 'Directory',
          click: addNewFile
        },
        {
          type: 'separator'
        },
        {
          id: 'html',
          label: 'HTML file',
          click: addNewFile
        },
        {
          id: 'css',
          label: 'Stylesheet',
          click: addNewFile
        },
        {
          id: 'js',
          label: 'Javascript file',
          click: addNewFile
        },
        {
          id: 'asx',
          label: 'Askia Script Xtension file',
          click: addNewFile
        }
      ]
    }));

    if(file.type !== 'file') {
      contextualMenu.append(new MenuItem({
        label: 'Refresh',
        click: function onClickCut () {
          app.emit('explorer-refresh', file.path);
        }
      }));
    }

    contextualMenu.append(new MenuItem({ type: 'separator' }));

    if (!file.root) {
      /* Open file in the OS manner */
      if (/\.html?$/i.test(file.name)) {
        contextualMenu.append(new MenuItem({
          label: 'Open in browser',
          click: function onClickOpen () {
            shell.openExternal(file.path);
          }
        }));
      }

      /*cut file*/
      contextualMenu.append(new MenuItem({
        label: 'Cut',
        click: function onClickCut () {
          app.emit('cut-file', file);
        }
      }));

      /*copy file*/
      contextualMenu.append(new MenuItem({
        label: 'Copy',
        click: function onClickCopy () {
          app.emit('copy-file', file);
        }
      }));

      /*paste file*/
      contextualMenu.append(new MenuItem({
        label: 'Paste',
        click: function onClickPaste () {
          app.emit('paste-file', file);
        }
      }));

      contextualMenu.append(new MenuItem({ type: 'separator' }));

      /* Rename file */
      contextualMenu.append(new MenuItem({
        label: 'Rename',
        click: function onClickRename (evt) {
          global.mainWindow.webContents.send('show-modal-dialog', {
            type: 'prompt',
            message: 'Rename:',
            buttonText: {
              ok: 'Rename',
              cancel: 'Don\'t rename'
            },
            value: file.name
          }, 'explorer-rename', file);
        }
      }));

      /* Remove file */
      contextualMenu.append(new MenuItem({
        label: 'Remove',
        click: function () {
          removeFiles(files);
        }
      }));

      /* Minify file */
      if(file.path.endsWith('.js')) {
        contextualMenu.append(new MenuItem({
          label: 'Minify',
          click: function () {
            global.mainWindow.webContents.send('show-modal-dialog', {
              type: 'prompt',
              message: 'Minify:',
              buttonText: {
                ok: 'Minify',
                cancel: 'Cancel'
              },
              value: file.name.replace('.js', '.min.js')
            }, 'explorer-minify', file);
          }
        }));
      }

      /* Open explorer */
      if(file.type !== 'file') {
        contextualMenu.append(new MenuItem({
          label: 'Open in explorer',
          click: function () {
            app.emit('open-explorer', file.path);
          }
        }));
      }
    } else {
      contextualMenu.append(new MenuItem({
        label: 'Project settings',
        click: function () {
          app.emit('explorer-show-project-settings');
        }
      }));

      contextualMenu.append(new MenuItem({
        label: 'Open in explorer',
        click: function () {
          app.emit('open-explorer', file.path);
        }
      }));
    }
  }
  if (files.length > 1) {
    /*cut file*/
    contextualMenu.append(new MenuItem({
      label: 'Cut All',
      click: function onClickCut () {
        window.electronAPI.send('cut-all-file', files);
      }

    }));

    /*copy file*/
    contextualMenu.append(new MenuItem({
      label: 'Copy All',
      click: function onClickCopy () {
        window.electronAPI.send('copy-all-file', files);
      }
    }));

    /*paste file*/
    contextualMenu.append(new MenuItem({
      label: 'Paste All',
      click: function onClickPaste () {
        window.electronAPI.send('paste-file', file);
      }
    }));

    contextualMenu.append(new MenuItem({ type: 'separator' }));

    contextualMenu.append(new MenuItem({
      label: 'Remove All',
      click: function () {
        removeFiles(files);
      }
    }));
  }
}


/**
 * Manage the open project
 *
 * @singleton
 */
function Project () {
  if (global.project) { // Singleton object
    return global.project;
  }
  this._adx = null;
  global.project = this; // Singleton object
}

/**
 * Creates a new instance of project
 * @constructor
 */
Project.prototype.constructor = Project;

/**
 * Defines the project path and adx currently open
 *
 * @param {String|ADX} pathOrAdx Path of the project or ADX object
 */
Project.prototype.set = function setPath (pathOrAdx) {
  this.close();

  if (typeof pathOrAdx === 'string') {
    this._adx = new ADX(pathOrAdx);
  }
  if (pathOrAdx instanceof ADX) {
    this._adx = pathOrAdx;
  }
};

/**
 * Close the current open project
 */
Project.prototype.close = function close () {
  // Destroy the previous instance of the project
  if (this._adx) {
    this._adx.destroy();
  }
  this._adx = null;
};

/**
 * Returns the instance of the ADX object currently open
 */
Project.prototype.getADX = function getADX () {
  return this._adx;
};

/**
 * Returns the project path
 */
Project.prototype.getPath = function getPath () {
  return (this._adx && this._adx.path) || '';
};


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
global.mainWindow = null;


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function loadMainWindow () {

  // Initialize the global.project
  global.project = new Project();

  // Load the default project path earlier in the application lifetime
  appSettings.getInitialProject(function onInitialProject (projectPath) {
    if (projectPath) {
      global.project.set(projectPath);
    }

    // Load the preferences in order to have default theme etc...
    appSettings.getPreferences(function (preferences) {
      // Create the browser window, but don't show

      global.mainWindow = new BrowserWindow({
        //width: 800,
        //height: 600,
        show: false,
        title: 'ADX Studio',
        webPreferences: {
          nodeIntegration: false,
          webviewTag: true,
          contextIsolation: true,
          webSecurity: true,
          preload: __dirname + '/preload.js'
        }
      });
// IPC handlers for dialog and shell
ipc.handle('dialog:open', async (event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(global.mainWindow, options);
  return result;
});

ipc.on('shell:openExternal', (event, url) => {
  shell.openExternal(url);
});


      // and load the index.html of the app.
      const prefs = {
        theme: preferences.theme || 'default',
        editorFontSize: preferences.editorFontSize || '16',
        useDblClickByDefault: preferences.useDblClickByDefault || 'false'
      };
      global.mainWindow.loadURL('file://' + __dirname + '/main/index.html?prefs=' + encodeURIComponent(JSON.stringify(prefs)));
      global.mainWindow.once('ready-to-show', () => {
        global.mainWindow.maximize();
        global.mainWindow.show();
      });

      // redirect all new window url to the default browser
      global.mainWindow.webContents.on('new-window', function onNewWindow (event, url) {
        event.preventDefault();
        shell.openExternal(url);
      });

      // Now show it
      ipc.on('preload-ready', function (event) {
        event.sender.send('preload-app-preferences', preferences);
      });

      // Emitted when the window is closed.
      global.mainWindow.on('closed', function onMainWindowClose () {
        // Close the current project
        global.project.close();

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        global.mainWindow = null;
        delete global.mainWindow;
      });
    });
  });
});
