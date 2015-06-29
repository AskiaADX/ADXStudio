var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1100,
    'auto-hide-menu-bar': false,
    'use-content-size': true,
  });
  mainWindow.loadUrl('file://' + __dirname + '/Firstapp.html');
  mainWindow.focus();
});
