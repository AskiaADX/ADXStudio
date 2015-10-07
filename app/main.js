var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('ipc');

require('./workspace/workspaceController.js');
require('./explorer/explorerController.js');
require('./main/menuController.js');


// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;


// Reference to the main view
var mainView;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});


// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function loadMainWindow() {
    // Initialize the global.project
    global.project = {};

    // Create the browser window, but don't show
    mainWindow = new BrowserWindow({width: 800, height: 600, show : false});

    // Maximize it first
    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/main/index.html');

    // Now show it
    mainWindow.show();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

/**
 * Show a modal dialog
 * @param {Object} options Options of the show modal dialog client api
 * @param {String} callbackEventName Name of the callback event
 */
function showModalDialog(options, callbackEventName) {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('show-modal-dialog');
    mainView.send.apply(mainView, args);
}


/**
 * Fire when the main window is ready
 */
ipc.on('main-ready', function (event) {
    var ADC = require('adcutil').ADC;

    mainView = event.sender;

    ADC.getTemplateList(function (err, templates) {
        if (err) {
            console.log(err);
            return;
        }
        mainView.send('set-template-list', templates);
    });

    app.removeListener('show-modal-dialog', showModalDialog);
    app.on('show-modal-dialog', showModalDialog);

});
