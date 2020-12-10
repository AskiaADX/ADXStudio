'use strict';
// If more details needed, then uncomment the next row for node js deprecation errors
// process.traceDeprecation = true;

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const appSettings = require('./appSettings/appSettingsModel.js');
const ADX = require('./modules/adxutil').ADX;
const shell = electron.shell;
const ipc = electron.ipcMain;

require('./main/mainController.js');

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
          // webSecurity: false,
          nodeIntegration: true,
          webviewTag: true
        }
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
