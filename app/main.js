var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('ipc');
var workspaceController = require('./workspace/workspaceController.js');
var explorerController = require('./explorer/explorerController.js');
var previewController = require('./preview/previewController.js');
var menu = require('menu');
var dialog = require('dialog');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

//Default Menu of the app.
app.once('ready', function() {
  var template;
  if (process.platforn !== 'darwin') {
    template = [
      {
          label: '&File',
          submenu: [
            {
              label: '&New File',
              accelerator: 'Ctrl+N',
              click: function() {
                // Function to define in order to open a new tab and new content.
              }
            },
            {
              label: '&New Project',
              accelerator : 'Ctrl+Shift+N',
              click: function() {
                //Function to define in order to initialized a new project.
              }
            },
            {
              label: '&Open File',
              accelerator : 'Ctrl+O',
              click: function() {
                dialog.showOpenDialog({ properties: [ 'openFile']}, function(filepath) {
                    if (filepath && filepath.length) {
                        app.emit("menu-open-file", filepath[0]);
                    }
                });
                //Function to define in order to open file already been create.
              }
            },
            {
              label: '&Open Project',
              accelerator: 'Ctrl+Shift+O',
              click: function() {
                dialog.showOpenDialog({properties: ['openDirectory']}, function(folderpath) {
                  if (folderpath && folderpath.length) {
                      app.emit("menu-open-project", folderpath[0]);
                  }
                });

                  //Function to define in order to open folder/project already created.
              }
            },
            {
              type: 'separator'
            },
            {
              label: '&Save',
              accelerator: 'Ctrl+S',
              click: function() {
                  console.log("Save from main.js");
                //Function to define in order to save current file changed.
              }
            },
            {
              label: '&Save As...',
              accelerator: 'Ctrl+Shift+S',
              click: function() {
                  dialog.showSaveDialog({title:'file'});
                //Function to define in order to save new files.
              }
            },
            {
              label: '&Save All',
              click: function() {
                //Function to define in order to save all files open and changed.
              }
            }
          ]
      },
      {
        label: 'Build',
        submenu: [
          {
            label: '&Build',
            accelerator: 'Ctrl+B',
            click: function() {
              //function to define in order to build the ADC.
            }
          },
          {
            label: '&Preview',
            accelerator: 'F5',
            click: function() {
              //Function to define in order to see the preview of the ADC Builded.
              app.emit("menu-preview");
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow)
                focusedWindow.reload();
            }
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow)
                focusedWindow.toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'About',
        submenu: [
          {
            label: '&Askia',
            click: function() { require('shell').openExternal('http://www.askia.com/') }
          },
          {
            label: '&About Askia Design',
            click: function() { require('shell').openExternal('http://blog.askia.com/category/askiadesign/') }
          },
          {
            label: '&The team',
            click: function() { require('shell').openExternal('http://www.askia.com/about') }
          },
          {
            label: '&Ask us anything',
            click: function() { require('shell').openExternal('http://www.askia.com/contact') }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'ASKIA SCRIPT 2.0',
            click: function() { require('shell').openExternal('https://support.askia.com') }
          }
        ]
      }
    ];
  }

  var menuTemplate = menu.buildFromTemplate(template);
  menu.setApplicationMenu(menuTemplate);
});



// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create the browser window, but don't show
    mainWindow = new BrowserWindow({width: 800, height: 600, show : false});

    // Maximize it first
    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/main/index.html');

    // Now show it
    mainWindow.show();

    // Open the devtools.
    // mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
