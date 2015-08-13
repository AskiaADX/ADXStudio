var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var menu = require('menu');
var dialog = require('dialog');
var shell = require('shell');
var fs = require('fs');

// Default Menu of the app.
app.once('ready', function createAppMenu() {
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

                          var tab = {
                            name:'untitled'
                          };

                          dialog.showSaveDialog({properties: ['openFile']}, function(filepath) {
                            if (filepath) {
                              fs.writeFile(filepath, '// Made with love in Paris', function(err){
                                if (err) {
                                  throw err;
                                }
                                /*
                                Send a message to other controllers in the main process in order to create a new File.
                                */
                                app.emit('menu-new-file', filepath);
                              });
                            }


                          });

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
                        label: '&Rename',
                        accelerator: 'Ctrl+Q',
                        click: function() {

                            //Function to define in order to save current file changed.
                        }
                    },
                  	{
                        label: '&Remove',
                        accelerator: 'Ctrl+B',
                        click: function() {

                            //Function to define in order to save current file changed.
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
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: '&Project settings',
                        click : function clickProjectSettingsMenu() {
                            app.emit("menu-show-project-settings");
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
                        click: function() { shell.openExternal('http://www.askia.com/') }
                    },
                    {
                        label: '&About Askia Design',
                        click: function() { shell.openExternal('http://www.askia.com/design') }
                    },
                    {
                        label: '&The team',
                        click: function() { shell.openExternal('http://www.askia.com/about') }
                    },
                    {
                        label: '&Ask us anything',
                        click: function() { shellopenExternal('http://www.askia.com/contact') }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'AskiaScript 2.0',
                        click: function() { shell.openExternal('https://support.askia.com/hc/en-us/articles/200003251-AskiaScript-2-0-specification') }
                    }
                ]
            }
        ];
    }

    var menuTemplate = menu.buildFromTemplate(template);
    menu.setApplicationMenu(menuTemplate);
});
