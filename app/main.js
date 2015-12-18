const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const appSettings = require('./appSettings/appSettingsModel.js');
const ADC = require('adcutil').ADC;
const shell =  electron.shell;

require('./main/mainController.js');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
global.mainWindow = null;


// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function loadMainWindow() {
    // Initialize the global.project
    global.project = {};
    
    // Load the default project path earlier in the application lifetime
    appSettings.getInitialProject(function onInitialProject(projectPath) {
        if (projectPath) {
            global.project.path = projectPath;
            global.project.adc = new ADC(projectPath);
        }
        
        // Create the browser window, but don't show
        global.mainWindow = new BrowserWindow({
            width: 800, 
            height: 600, 
            show : false,
            title : "ADX Studio"
        });

        // Maximize it first
        global.mainWindow.maximize();

        // and load the index.html of the app.
        global.mainWindow.loadURL('file://' + __dirname + '/main/index.html');

        // redirect all new window url to the default browser
        global.mainWindow.webContents.on('new-window', function onNewWindow(event, url) {
            event.preventDefault();
            shell.openExternal(url);
        });
        
        // Now show it
        global.mainWindow.show();

        // Emitted when the window is closed.
        global.mainWindow.on('closed', function onMainWindowClose() {

            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            global.mainWindow = null;
            delete global.mainWindow;
        });
    });
});