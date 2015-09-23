var app = require('app');
var ipc = require('ipc');
var path = require('path');
var workspace = require('./workspaceModel.js');
var preview   = require('../preview/previewController.js');
var workspaceView;

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
        workspace.createTab(adc.path, function (err, tab, pane) {
            // TODO::Don't throw the error but send it to the view
            if (err) throw err;
            adc.load(function (err) {
                tab.adcConfig = (!err)  ? adc.configurator.get(): {};
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
        var previousPane = workspace.panes.current();
        workspace.panes.current('second');
        workspace.createTab('::preview', function (err, tab, pane) {
            if (err) throw err;
            workspace.panes.current(previousPane.name); // Restore the previous active pane
            tab.name = 'Preview';
            tab.fileType  = 'preview';
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

    preview.servers.web.listen(function onHttpListening(httpPort) {
        // TODO::Don't open it externally for the moment
        // shell.openExternal('http://localhost:' + port + '/output/');

        preview.servers.webSocket.listen(function onWSListening(wsPort) {
            openPreview({
                httpPort : httpPort,
                wsPort   : wsPort
            });
        });
    });
}

/**
 * Set the current tab
 * @param event
 * @param {String} tabId Id of the tab
 */
function setCurrentTab(event, tabId) {
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
function closeTab(event, tabId) {
    workspace.removeTab(tabId, function (err, tab, pane) {
        workspaceView.send('workspace-remove-tab', err, tab, pane);
    });
}

/**
 * Save content
 * @param event
 * @param {String} tabId Id of the tab
 * @param {String} content Content to save
 */
function saveContent(event, tabId, content) {
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



ipc.on('workspace-ready', function (event) {
    // Keep the connection with the view
    workspaceView = event.sender;

    workspace.init(function () {
        ipc.removeListener('explorer-load-file', openFileFromExplorer); // Remove it first to avoid duplicate event
        ipc.on('explorer-load-file', openFileFromExplorer); // Add it back again

        ipc.removeListener('workspace-set-current-tab', setCurrentTab);
        ipc.on('workspace-set-current-tab', setCurrentTab);

        ipc.removeListener('workspace-close-tab', closeTab);
        ipc.on('workspace-close-tab', closeTab);

        ipc.removeListener('workspace-save-content', saveContent);
        ipc.on('workspace-save-content', saveContent);


        app.removeListener('menu-new-file', openFile);
        app.on('menu-new-file', openFile);

        app.removeListener('menu-open-file', openFile);
        app.on('menu-open-file', openFile);

        app.removeListener('menu-show-project-settings', openProjectSettings);
        app.on('menu-show-project-settings', openProjectSettings);


        app.removeListener('menu-preview', startPreview);
        app.on('menu-preview', startPreview);

    });

});



