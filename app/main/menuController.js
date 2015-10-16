var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var menu = require('menu');
var dialog = require('dialog');
var shell = require('shell');
var fs = require('fs');
var path = require('path');
var ADC = require('adcutil').ADC;
var appSettings = require('../appSettings/appSettingsModel.js');

// Default Menu of the app.
app.once('ready', function createAppMenu() {
    appSettings.getMostRecentlyUsed(function (err, mru){
        var template, menuFileIndex = 0, menuOpenRecentIndex = 4;
        function createOpenRecentMenu(mruItem) {
            return {
                label : path.basename(mruItem.path),
                click : function () {
                    global.project.path = mruItem.path;
                    global.project.adc = new ADC(mruItem.path);

                    app.emit("menu-open-project", mruItem.path);
                }
            };
        }

        if (process.platforn !== 'darwin') {
            template = [
                {
                    label: '&File',
                    submenu: [
                         {
                            label: '&New Project',
                            accelerator : 'Ctrl+Shift+N',
                            click: function() {
                                app.emit('menu-new-project');
                            }
                        },
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
                            label: '&Open Project',
                            accelerator: 'Ctrl+Shift+O',
                            click: function() {
                                dialog.showOpenDialog({properties: ['openDirectory']}, function(folderpath) {
                                    if (folderpath && folderpath.length) {
                                        global.project.path = folderpath[0];
                                        global.project.adc = new ADC(folderpath[0]);

                                        app.emit("menu-open-project", folderpath[0]);
                                    }
                                });
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
                                // Function to define in order to open file already been create.
                            }
                        },
                        {
                            label : '&Open Recent',
                            submenu : []
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: '&Save',
                            accelerator: 'Ctrl+S',
                            click: function() {
                                console.log("Save from main.js");
                                // Function to define in order to save current file changed.
                            }
                        },
                        {
                            label: '&Save As...',
                            accelerator: 'Ctrl+Shift+S',
                            click: function() {
                                dialog.showSaveDialog({title:'file'});
                                // Function to define in order to save new files.
                            }
                        },
                        {
                            label: '&Save All',
                            click: function() {
                                // Function to define in order to save all files open and changed.
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
                                // function to define in order to build the ADC.
                            }
                        },
                        {
                            label: '&Preview',
                            accelerator: 'F5',
                            click: function() {
                                // Function to define in order to see the preview of the ADC Builded.
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
                                if (focusedWindow) {
                                    focusedWindow.reload();
                                }
                            }
                        },
                        {
                            label: 'Toggle &Full Screen',
                            accelerator: 'F11',
                            click: function() {
                                var focusedWindow = BrowserWindow.getFocusedWindow();
                                if (focusedWindow) {
                                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                                }
                            }
                        },
                        {
                            label: 'Toggle &Developer Tools',
                            accelerator: 'Alt+Ctrl+I',
                            click: function() {
                                var focusedWindow = BrowserWindow.getFocusedWindow();
                                if (focusedWindow) {
                                    focusedWindow.toggleDevTools();
                                }
                            }
                        }
                    ]
                },
                {
                    label: 'Help',
                    submenu: [
                        {
                            label: 'AskiaScript 2.0',
                            click: function() { shell.openExternal('https://support.askia.com/hc/en-us/articles/200003251-AskiaScript-2-0-specification') }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: '&About Askia',
                            click: function() { shell.openExternal('http://www.askia.com/') }
                        },
                        {
                            label: '&About Askia Design',
                            click: function() { shell.openExternal('http://www.askia.com/design') }
                        }
                    ]
                }
            ];
            
            if (mru.length) {
                var i, l, subMenuOpenRecent = template[menuFileIndex].submenu[menuOpenRecentIndex].submenu;
                for (i = 0, l = mru.length; i < l; i += 1) {
                    subMenuOpenRecent.push(
                        createOpenRecentMenu(mru[i])
                    );
                }
            } else {
                template[menuFileIndex].submenu.splice(menuOpenRecentIndex, 1);
            }
        }

        var menuTemplate = menu.buildFromTemplate(template);
        menu.setApplicationMenu(menuTemplate);
    });
});
