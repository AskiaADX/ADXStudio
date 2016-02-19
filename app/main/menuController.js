const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const shell = electron.shell;
const fs = require('fs');
const path = require('path');
const ADC = require('adcutil').ADC;
const appSettings = require('../appSettings/appSettingsModel.js');

// Default Menu of the app.
app.once('ready', function createAppMenu() {


    appSettings.getMostRecentlyUsed(function (err, mru){
        const menuFileIndex = 0;
        const menuOpenRecentIndex = 4;

        var template;

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

        /**
         * New project
         */
        function newProjectClick() {
            app.emit('menu-new-project');
        }

        /**
         * New file
         */
        function newFileClick() {
            dialog.showSaveDialog({
                properties: ['openFile'],
                defaultPath : (global.project && global.project.path) || ''
            }, function (filepath) {
                if (!filepath) {
                    return;
                }

                fs.writeFile(filepath, '', { encoding : 'utf8'}, function (err) {
                    if (err) {
                        app.emit('show-modal-dialog', {
                            type : 'okOnly',
                            message : err.message
                        });
                        return;
                    }
                    app.emit('menu-new-file', filepath);
                });
            });
        }

        /**
         * Open project
         */
        function openProjectClick() {
            dialog.showOpenDialog({properties: ['openDirectory']}, function(folderpath) {
                if (folderpath && folderpath.length) {
                    global.project.path = folderpath[0];
                    global.project.adc = new ADC(folderpath[0]);

                    app.emit("menu-open-project", folderpath[0]);
                }
            });
        }

        /**
         * Open file
         */
        function openFileClick() {
            dialog.showOpenDialog({ properties: [ 'openFile']}, function(filepath) {
                if (filepath && filepath.length) {
                    app.emit("menu-open-file", filepath[0]);
                }
            });
        }

        /**
         * Save
         */
        function saveClick() {
            app.emit('menu-save-file');
        }

        /**
         * Save As
         */
        function saveAsClick() {
            app.emit('menu-save-file-as');
        }

        /**
         * Save all
         */
        function saveAllClick() {
            app.emit('menu-save-all-files');
        }

        /**
         * Project settings
         */
        function projectSettingsClick() {
            app.emit("menu-open-project-settings");
        }

        /**
         * Preferences
         */
        function preferencesClick() {
            app.emit("menu-open-preferences");
        }
        
        /**
         * Exit the application
         */
        function exitClick() {
            app.quit();
        }

        /**
         * Validate the ADC
         */
        function validateClick() {
            app.emit("menu-validate");
        }

        /**
         * Build the ADC
         */
        function buildClick() {
            app.emit("menu-build");
        }

        /**
         * Preview
         */
        function previewClick() {
            app.emit("menu-preview");
        }

        /**
         * Open the dev tools of the explorer view
         */
        function devToolsExplorerClick() {
            app.emit("menu-dev-tools", 'explorer');
        }

        /**
         * Open the dev tools of the workspace view
         */
        function devToolsWorkspaceClick() {
            app.emit("menu-dev-tools", 'workspace');
        }
        
        /**
         * About ADX Studio
         */
        function aboutADXStudioClick() {
            app.emit("menu-about-adxstudio");
        }

        if (process.platforn !== 'darwin') {
            template = [
                {
                    label: '&File',
                    submenu: [
                        {
                            label: '&New Project',
                            accelerator : 'Ctrl+Shift+N',
                            click : newProjectClick
                        },
                        {
                            label: '&New File',
                            accelerator: 'Ctrl+N',
                            click : newFileClick
                        },
                        {
                            label: '&Open Project',
                            accelerator: 'Ctrl+Shift+O',
                            click: openProjectClick
                        },
                        {
                            label: '&Open File',
                            accelerator : 'Ctrl+O',
                            click : openFileClick
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
                            click : saveClick
                        },
                        {
                            label: '&Save As...',
                            accelerator: 'Ctrl+Shift+S',
                            click: saveAsClick
                        },
                        {
                            label: '&Save All',
                            click: saveAllClick
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: '&Project settings',
                            click : projectSettingsClick
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label : '&Preferences',
                            click : preferencesClick
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label : '&Exit',
                            click : exitClick
                        }
                    ]
                },
                {
                    label: 'Tools',
                    submenu: [
                        {
                            label : '&Validate',
                            accelerator: 'Ctrl+Shift+T',
                            click : validateClick
                        },
                        {
                            label: '&Preview',
                            accelerator: 'F5',
                            click : previewClick
                        },
                        {
                            label: '&Build',
                            accelerator: 'Ctrl+Shift+B',
                            click: buildClick
                        }
                    ]
                },
                {
                    label: 'View',
                    submenu: [
                        {
                            label: '&Next Tab',
                            accelerator: 'Ctrl+Tab',
                            click: function () {
                                app.emit("menu-next-tab");
                            }
                        },
                        {
                            label: '&Previous Tab',
                            accelerator: 'Ctrl+Shift+Tab',
                            click: function () {
                                app.emit("menu-previous-tab");
                            }
                        },
                        {
                            type: 'separator'
                        },
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
                            label : '&Developer Tools',
                            submenu : [
                                {
                                    label: '&Main window',
                                    accelerator: 'Alt+Ctrl+I',
                                    click: function() {
                                        var focusedWindow = BrowserWindow.getFocusedWindow();
                                        if (focusedWindow) {
                                            focusedWindow.toggleDevTools();
                                        }
                                    }
                                },
                                {
                                    label : '&Explorer view',
                                    accelerator: 'Alt+Ctrl+E',
                                    click : devToolsExplorerClick
                                },
                                {
                                    label : '&Workspace view',
                                    accelerator: 'Alt+Ctrl+W',
                                    click : devToolsWorkspaceClick
                                }
                            ]
                        }
                    ]
                },
                {
                    label: 'Help',
                    submenu: [
                        {
                            label : '&About ADX Studio',
                            click : aboutADXStudioClick
                        },
                        {
                            type: 'separator'
                        },
                        {
                        	label : 'ADX Specifications',
                            click : function () { 
                                shell.openExternal('https://github.com/AskiaADX/ADXStudio/wiki');
                            }
                        },
                        {
                            label: 'AskiaScript Documentation',
                            click: function() { 
                                shell.openExternal('http://designhelp.askia.com/askiascript2_introduction_to_askiascript_2');
                            }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: '&About Askia',
                            click: function() {
                                shell.openExternal('http://www.askia.com/');
                            }
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

        var menuTemplate = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menuTemplate);
    });
});
