var app = require('app');
var ipc = require('ipc');
var path = require('path');
var fs = require('fs');
var workspace = require('./workspaceModel.js');
var servers   = require('../modules/servers/adxServers.js');
var workspaceView;

/**
 * Save the status of the workspace
 */
function saveWorkspaceStatus() {
    var adc = global.project.adc;
    if (!adc || !adc.path) {
        return;
    }

    fs.mkdir(path.join(adc.path, '.adxstudio'), function () {
        fs.writeFile(path.join(adc.path, '.adxstudio', 'workspace.json'),  JSON.stringify(workspace.toJSON()), {encoding: 'utf8'});
    });
}

/**
 * Open a file in new tab. If the file is already open, focus the tab.
 *
 * @param {String} file Path of file to open
 */
function openFile(file) {
    workspace.find(file, function (err, tab, pane) {

        // If the tab already exist only focus it
        if (tab) {
            // TODO::Look if the content of the tab has changed
            // TODO::Look if the file has been removed
            workspaceView.send('workspace-focus-tab', err, tab, pane);
            return;
        }

        // When the tab doesn't exist, create it
        workspace.createTab(file, function (err, tab, pane) {
            if (err) throw err;
            tab.loadFile(function (err) {
                workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
                saveWorkspaceStatus();
            });
        });
    });
}

/**
 * Open a file using the event from the explorer
 * @param event
 * @param {String|Object} file File to open
 */
function openFileFromExplorer(event, file) {
    openFile(file);
}

/**
 * Open project settings
 */
function openProjectSettings() {
    var adc = global.project.adc;
    if (!adc || !adc.path) {
        return;
    }
    workspace.find(adc.path, function (err, tab, pane) {

        // If the tab already exist only focus it
        if (tab) {
            // TODO::Look if the content of the tab has changed
            // TODO::Look if the file has been removed
            workspaceView.send('workspace-focus-tab', err, tab, pane);
            return;
        }

        // When the tab doesn't exist, create it
        workspace.createTab({
            path : adc.path,
            type : 'projectSettings'
        }, function (err, tab, pane) {
            // TODO::Don't throw the error but send it to the view
            if (err) throw err;
            adc.load(function (err) {
                tab.adcConfig = (!err)  ? adc.configurator.get() : {};
                workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
            });
        });
    });
}

/**
 * Open the ADX preview
 * @param {Object} options Options
 * @param {Number} options.httpPort HTTP Port listen
 * @param {Number} options.wsPort WS port listen
 */
function openPreview(options) {
    var adc = global.project.adc;
    if (!adc || !adc.path) {
        return;
    }

    workspace.find('::preview', function (err, tab, pane) {

        // If the tab already exist only focus it
        if (tab) {
            workspaceView.send('workspace-focus-tab', err, tab, pane);
            return;
        }

        // When the tab doesn't exist, create it
        // and enforce his creation on the second panel by default
        workspace.createTab({
            name : 'Preview',
            path : '::preview', 
            type : 'preview'
        }, 'second',  function (err, tab, pane) {
            if (err) {
                throw err
            }
            tab.ports     = {
                http : options.httpPort,
                ws   : options.wsPort
            };
            workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);
        });
    });
}

/**
 * Start the preview servers
 */
function startPreview() {
    if (!global.project.adc || !global.project.adc.path) {
        return;
    }

    servers.listen(openPreview);
}



/**
 * Set the current tab
 * @param event
 * @param {String} tabId Id of the tab
 */
function onSetCurrentTab(event, tabId) {
    workspace.find(tabId, function (err, tab) {
        if (err) {
            return;
        }
        workspace.currentTab(tab);
    });
}

/**
 * Close a tab
 * @param event
 * @param {String} tabId Id of the tab to close
 */
function onCloseTab(event, tabId) {
    workspace.removeTab(tabId, function (err, tab, pane) {
        workspaceView.send('workspace-remove-tab', err, tab, pane);
        saveWorkspaceStatus();
    });
}

/**
 * Move a tab into another pane
 * @param {Event} event
 * @param {String} tabId Id of the tab to move
 * @param {String} targetPane Pane to target
 */
function onMoveTab(event, tabId, targetPane) {
    workspace.moveTab(tabId, targetPane, function (err, tab, pane) {
		workspaceView.send('workspace-change-tab-location', err, tab, pane);
        saveWorkspaceStatus();
    });    
}

/**
 * On edit content
 * @param event
 * @param {String} tabId Id of the tab
 */
function onEditContent(event, tabId) {
    workspace.find(tabId, function (err, tab) {
        if (err) {
            return;
        }
        tab.edited = true;
    });
}

/**
 * On restore content
 * @param event
 * @param {String} tabId Id of the tab
 */
function onRestoreContent(event, tabId) {
    workspace.find(tabId, function (err, tab) {
        if (err) {
            return;
        }
        tab.edited = false;
    });
}

/**
 * Save content
 * @param event
 * @param {String} tabId Id of the tab
 * @param {String} content Content to save
 */
function onSaveContent(event, tabId, content) {
    workspace.find(tabId, function (err, tab, pane) {
        if (err) {
            workspaceView.send('workspace-update-tab', err, null, null);
            return;
        }
        tab.saveFile(content, function (err) {
            workspaceView.send('workspace-update-tab', err, tab, pane);
        });
    });
}

/**
 * Confirm reload tab
 */
function onConfirmReload(event, tab, answer) {
    if (answer === 'yes') {
        workspace.find(tab, function (err, tab, pane) {
            if (!tab) {
                return;
            }
            tab.loadFile(function (err) {
                workspaceView.send('workspace-reload-tab', err, tab, pane);
            });
        });
    }
}

/**
 * When the file has changed
 */
function onFileChanged(tab, pane) {
    if (!tab.edited) {
        tab.loadFile(function (err) {
            workspaceView.send('workspace-reload-tab', err, tab, pane);
        });
    } else {
        app.emit('show-modal-dialog', {
            message  : "The file `" + tab.path + "` has been changed, do you want to reload it? ",
            type     : 'yesNo'
        }, 'workspace-reload-or-not-reload', tab);
    }
}

/**
 * Open project in the workspace
 */
function openProject() {
	// Load the default path
    fs.readFile(path.join(global.project.path || '', '.adxstudio', 'workspace.json'), function (err, data) {
        var json = err ? {} : JSON.parse(data.toString());
        workspace.init(json, function () {
			// Reload the workspace as it where
            var adc = global.project.adc,
                currentTabIds = {
                    main   : workspace.panes.main.currentTabId,
                    second : workspace.panes.second.currentTabId
                };

            workspace.tabs.forEach(function loadTab(tab) {
                var pane = workspace.where(tab);
                var action = tab.id === currentTabIds[pane] ? 'workspace-create-and-focus-tab' : 'workspace-create-tab';
                
                switch (tab.type) {
					// Open the preview
                    case 'preview':
                        if (adc) {
                            servers.listen(function (options) {
                                tab.name = 'Preview';
                                tab.ports     = {
                                    http : options.httpPort,
                                    ws   : options.wsPort
                                };
                                workspaceView.send(action, err, tab, workspace.where(tab));
                            });
                        }
                        break;
                                       
					// Open the project settings
                    case 'projectSettings':
                        if (adc) {
                            adc.load(function (er) {
                                console.log('project settings was loaded');
                                
                                tab.adcConfig = (!er)  ? adc.configurator.get() : {};
                                workspaceView.send(action, er, tab, pane);
                            });
                        }
                        break;
                                       
					// Open file by default
                    case 'file':
                    default:
                        tab.loadFile(function (er) {
                            if (!er) {
                                workspaceView.send(action, er, tab, workspace.where(tab));
                            }
                        });
                        break;
                }
            });
        });    
    });
}

/**
 * Reload the workspace
 */
function reloadWorkspace() {
    workspaceView.reload();
}

ipc.on('workspace-ready', function (event) {
    
    // Keep the connection with the view
    workspaceView = event.sender;
    
    // Initialize the workspace
    openProject();
    
    ipc.removeListener('explorer-load-file', openFileFromExplorer); // Remove it first to avoid duplicate event
    ipc.on('explorer-load-file', openFileFromExplorer); // Add it back again

    ipc.removeListener('workspace-set-current-tab', onSetCurrentTab);
    ipc.on('workspace-set-current-tab', onSetCurrentTab);

    ipc.removeListener('workspace-close-tab', onCloseTab);
    ipc.on('workspace-close-tab', onCloseTab);

    ipc.removeListener('workspace-save-content', onSaveContent);
    ipc.on('workspace-save-content', onSaveContent);

    ipc.removeListener('workspace-edit-content', onEditContent);
    ipc.on('workspace-edit-content', onEditContent);

    ipc.removeListener('workspace-restore-content', onRestoreContent);
    ipc.on('workspace-restore-content', onRestoreContent);

    ipc.removeListener('workspace-move-tab', onMoveTab);
    ipc.on('workspace-move-tab', onMoveTab);

    app.removeListener('menu-open-project', reloadWorkspace); 
    app.on('menu-open-project', reloadWorkspace);
    
    app.removeListener('menu-new-file', openFile);
    app.on('menu-new-file', openFile);

    app.removeListener('menu-open-file', openFile);
    app.on('menu-open-file', openFile);

    app.removeListener('menu-show-project-settings', openProjectSettings);
    app.on('menu-show-project-settings', openProjectSettings);

    app.removeListener('menu-preview', startPreview);
    app.on('menu-preview', startPreview);

    workspace.removeListener('file-changed', onFileChanged);
    workspace.on('file-changed', onFileChanged);

    ipc.removeListener('workspace-reload-or-not-reload', onConfirmReload);
    ipc.on('workspace-reload-or-not-reload', onConfirmReload);

});



