var app = require('app');
var ipc = require('ipc');
var path = require('path');
var workspace = require('../../src/workspace/workspace.js');
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
            // TODO::Don't throw the error but send it to the view
            if (err) throw err;
            tab.loadFile(function (err) {
                workspaceView.send('workspace-create-and-focus-tab', err, tab, pane);

                 // TODO::Just for test switch to the other pane for the next tab
                workspace.panes.current(pane === 'main' ? 'second' : 'main');
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

    });

});



