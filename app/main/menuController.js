const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const shell = electron.shell;
const fs = require('fs');
const path = require('path');
const appSettings = require('../appSettings/appSettingsModel.js');

// Default Menu of the app.
app.once('ready', function createAppMenu () {
  let publish;
  let reload;
  let devTools;

  /**
   * Show/Hide Developer Tools Menu
   */
  function switchDevtools (bool) {
    reload.visible = bool;
    devTools.visible = bool;
  }

  /**
   * Show/Hide Zendesk Publish Menu
   */
  function switchZendesk (bool) {
    publish.visible = bool;
  }
  appSettings.getMostRecentlyUsed(function (err, mru) {
    if (err) throw err;

    function createOpenRecentMenu (mruItem) {
      return {
        label: path.basename(mruItem.path),
        click: function () {
          global.project.set(mruItem.path);
          app.emit('menu-open-project', mruItem.path);
        }
      };
    }

    /**
     * New project
     */
    function newProjectClick () {
      app.emit('menu-new-project');
    }

    /**
     * New file
     */
    function newFileClick () {
      dialog.showSaveDialog({
        properties: ['openFile'],
        defaultPath: global.project.getPath()
      }).then(result => {
        if (!result.filePaths[0]) {
          return;
        }

        fs.writeFile(result.filePaths[0], '', { encoding: 'utf8' }, function (err) {
          if (err) {
            app.emit('show-modal-dialog', {
              type: 'okOnly',
              message: err.message
            });
            return;
          }
          app.emit('menu-new-file', result.filePaths[0]);
        });
      }).catch(err => {
        console.log(err);
      });
    }

    /**
     * Open project
     */
    function openProjectClick () {

      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(result => {
        if (result.filePaths && result.filePaths.length) {
          global.project.set(result.filePaths[0]);
          app.emit('menu-open-project', result.filePaths[0]);
        }
      }).catch(err => {
        console.log(err)
      });
    }

    /**
     * Open file
     */
    function openFileClick () {
      dialog.showOpenDialog({
        properties: ['openFile']
      }).then(result => {
        if (result.filePaths && result.filePaths.length) {
          app.emit('menu-open-file', result.filePaths[0]);
        }
      }).catch(err => {
        console.log(err)
      });
    }

    /**
     * Save
     */
    function saveClick () {
      app.emit('menu-save-file');
    }

    /**
     * Save As
     */
    function saveAsClick () {
      app.emit('menu-save-file-as');
    }

    /**
     * Save all
     */
    function saveAllClick () {
      app.emit('menu-save-all-files');
    }

    /**
     * Project settings
     */
    function projectSettingsClick () {
      app.emit('menu-open-project-settings');
    }

    /**
     * Preferences
     */
    function preferencesClick () {
      app.emit('menu-open-preferences');
    }

    /**
     * Exit the application
     */
    function exitClick () {
      app.quit();
    }

    /**
     * Validate the ADX
     */
    function validateClick () {
      app.emit('menu-validate');
    }

    /**
     * Build the ADX
     */
    function buildClick () {
      app.emit('menu-build');
    }

    /**
     * Preview
     */
    function previewClick () {
      app.emit('menu-preview');
    }

    /**
     * Open the dev tools of the explorer view
     */
    function devToolsExplorerClick () {
      if (!devTools.visible) return;
      app.emit('menu-dev-tools', 'explorer');
    }

    /**
     * Open the dev tools of the workspace view
     */
    function devToolsWorkspaceClick () {
      if (!devTools.visible) return;
      app.emit('menu-dev-tools', 'workspace');
    }

    /**
     * About ADX Studio
     */
    function aboutADXStudioClick () {
      app.emit('menu-about-adxstudio');
    }

    function shortcutsClick () {
      app.emit('menu-shortcuts');
    }

    function importClick () {
      app.emit('menu-import-design');
    }

    let template;
    if (process.platform !== 'darwin') {
      template = [
        {
          label: '&File',
          submenu: [
            {
              label: '&New Project',
              accelerator: 'Ctrl+Shift+N',
              click: newProjectClick
            },
            {
              label: '&New File',
              accelerator: 'Ctrl+N',
              click: newFileClick
            },
            {
              label: '&Open Project',
              accelerator: 'Ctrl+Shift+O',
              click: openProjectClick
            },
            {
              label: '&Open File',
              accelerator: 'Ctrl+O',
              click: openFileClick
            },
            {
              label: '&Open Recent',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              label: '&Save',
              accelerator: 'Ctrl+S',
              click: saveClick
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
              click: projectSettingsClick
            },
            //{
            //  label: '&Import',
            //  click: importClick
            //},
            {
              type: 'separator'
            },
            {
              label: '&Preferences',
              click: preferencesClick
            },
            {
              type: 'separator'
            },
            {
              label: '&Exit',
              click: exitClick
            }
          ]
        },
        {
          label: 'Tools',
          submenu: [
            {
              label: '&Preview',
              accelerator: 'F5',
              click: previewClick
            },
            {
              type: 'separator'
            },
            {
              label: '&Validate',
              accelerator: 'Ctrl+Shift+T',
              click: validateClick
            },
            {
              label: '&Build',
              accelerator: 'Ctrl+Shift+B',
              click: buildClick
            },
            {
              type: 'separator'
            },
            {
              label: '&Publish',
              submenu: [
                {
                  label: '&Zendesk',
                  click: function publishZendeskClick () {
                    app.emit('menu-publish-zendesk');
                  }
                }
              ]
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
                app.emit('menu-next-tab');
              }
            },
            {
              label: '&Previous Tab',
              accelerator: 'Ctrl+Shift+Tab',
              click: function () {
                app.emit('menu-previous-tab');
              }
            },
            {
              type: 'separator'
            },
            {
              label: '&Reload',
              accelerator: 'Ctrl+R',
              click: function () {
                if (!reload.visible) return;
                let focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.reload();
                }
              }
            },
            {
              label: '&Developer Tools',
              submenu: [
                {
                  label: '&Main window',
                  accelerator: 'Alt+Ctrl+I',
                  click: function () {
                    if (!devTools.visible) return;
                    let focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                      focusedWindow.toggleDevTools();
                    }
                  }
                },
                {
                  label: '&Explorer view',
                  accelerator: 'Alt+Ctrl+E',
                  click: devToolsExplorerClick
                },
                {
                  label: '&Workspace view',
                  accelerator: 'Alt+Ctrl+W',
                  click: devToolsWorkspaceClick
                }
              ]
            }
          ]
        },
        {
          label: 'Help',
          submenu: [
            {
              label: '&About ADX Studio',
              click: aboutADXStudioClick
            },
            {
              type: 'separator'
            },
            {
              label: '&Keyboard Shortcuts',
              click: shortcutsClick
            },
            {
              type: 'separator'
            },
            {
              label: 'ADX Specifications',
              click: function () {
                shell.openExternal('https://github.com/AskiaADX/ADXStudio/wiki');
              }
            },
            {
              label: 'AskiaScript Documentation',
              click: function () {
                shell.openExternal('http://designhelp.askia.com/askiascript2_introduction_to_askiascript_2');
              }
            },
            {
              type: 'separator'
            },
            {
              label: '&About Askia',
              click: function () {
                shell.openExternal('http://www.askia.com/');
              }
            }
          ]
        }
      ];

      const menuFileIndex = 0;
      const menuOpenRecentIndex = 4;
      if (mru.length) {
        const subMenuOpenRecent = template[menuFileIndex].submenu[menuOpenRecentIndex].submenu;
        for (let i = 0, l = mru.length; i < l; i += 1) {
          subMenuOpenRecent.push(
            createOpenRecentMenu(mru[i])
          );
        }
      } else {
        template[menuFileIndex].submenu.splice(menuOpenRecentIndex, 1);
      }
    }

    appSettings.getPreferences(function (prefs) {
      let menuTemplate;
      menuTemplate = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menuTemplate);
      menuTemplate.items[1].submenu.items.some((menuItem) => {
        if (menuItem.label === '&Publish') {
          publish = menuItem;
          return true;
        }
        return false;
      });
      menuTemplate.items[2].submenu.items.some((menuItem) => {
        if (menuItem.label === '&Reload') {
          reload = menuItem;
        }
        if (menuItem.label === '&Developer Tools') {
          devTools = menuItem;
          return true;
        }
        return false;
      });
      switchZendesk(prefs.useZendesk);
      switchDevtools(prefs.devtools);
    });
  });

  // Show Hide developer tools menu
  app.removeListener('preference-switch-devtools', switchDevtools);
  app.on('preference-switch-devtools', switchDevtools);

  // Show Hide zendesk publish menu
  app.removeListener('preference-switch-zendesk', switchZendesk);
  app.on('preference-switch-zendesk', switchZendesk);
});
