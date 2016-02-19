"use strict";

const electron = require('electron');
const app = electron.app;
const util = require('util');
const ipc = electron.ipcMain;
const appSettings = require('../appSettings/appSettingsModel.js');
const ADC = require('adcutil').ADC;
const fs = require("fs");
const path = require("path");
const uuid = require('node-uuid');
const packageJson = require('../../package.json');
let  mainView;

const workspaceController = require('../workspace/workspaceController.js');
require('../explorer/explorerController.js');
require('./menuController.js');

/**
 * Enforce the quit of the application even if files are editing
 * @type {boolean}
 */
let enforceQuit = false;

/**
 * Write message in the output window
 *
 * @param {String} text Message to write
 * @param {String|"message"|"error"|"warning"|"success"} type Type of the message
 */
function writeOutput(text, type) {
    mainView.send('output-write', text, type);
}

/**
 * Clear the output window
 */
function clearOutput() {
    mainView.send('output-clear');
}

/**
 * Close the output
 */
function closeOutput() {
    mainView.send('output-close');
}

/**
 * Logger for the ADCUtil
 */
global.adcLogger = {
    writeMessage : function writeMessage() {
        writeOutput(util.format.apply(null, arguments), 'message');
    },
    writeError : function writeError() {
        writeOutput(util.format.apply(null, arguments), 'error');
    },
    writeWarning : function writeWarning() {
        writeOutput(util.format.apply(null, arguments), 'warning');
    },
    writeSuccess : function writeSuccess() {
        writeOutput(util.format.apply(null, arguments), 'success');
    }
};

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
 * Close the modal dialog
 */
function closeModalDialog() {
    mainView.send('close-modal-dialog');
}

/**
 * Display the main loader
 *
 * @param {String} message Message to display
 */
function showLoader(message) {
    showModalDialog({
        type : 'loader',
        message : message
    });
}

/**
 * Display the about window
 */
function showAbout() {
    showModalDialog({
        type : 'about',
        app : {
            version : (packageJson && packageJson.version)
        }
    });
}

/**
 * Show the modal dialog to create a new project
 */
function newProject() {
    ADC.getTemplateList(function (err, templates) {
        showModalDialog({
            type : 'newADCProject',
            buttonText : {
                ok : "Create project"
            },
            adcTemplates : templates,
            defaultRootDir : app.getPath('documents')
        }, 'main-create-new-project');
    });
}

/**
 * Create a new project
 * @param {Object} event Event arg
 * @param {String} button Button clicked
 * @param {Object} options Project options
 */
function createNewProject(event, button, options) {
    if (button !== 'ok' && button !== 'yes') {
        return;
    }

    clearOutput();
    showLoader("Creating `" + options.name + "` ADC project ...");
    var project = {
        output: options.path,
        template: options.template,
        description: options.description
    };
    ADC.generate(options.name, project, function (err, adc) {
        closeModalDialog();
        if (err) {
            showModalDialog({
                type : 'okOnly',
                message : err.message      
            });
            return;
        }
        global.project.path = adc.path;
        global.project.adc = adc;

        // Open the project with the 'Project settings' tab open
        fs.mkdir(path.join(adc.path, '.adxstudio'), function () {
            fs.writeFile(path.join(adc.path, '.adxstudio', 'workspace.json'),  JSON.stringify({
                tabs: [
                    {
                        id: uuid.v4(),
                        pane: "main",
                        current: true,
                        config: {
                            path: adc.path,
                            type: "projectSettings"
                        }
                    }
                ]
            }), {encoding: 'utf8'}, function () {
                // Open the newest project
                app.emit('menu-open-project', adc.path);
            });
        });
    });
}

/**
 * Open a project
 */
function openProject() {
    clearOutput();
    closeOutput();
}

/**
 * Validate the project
 */
function validateProject() {
    var adc = global.project.adc;
    var logger = global.adcLogger;
    if (!adc || !adc.path) {
        return;
    }

    clearOutput();
    adc.validate({
        logger : logger
    });
}

/**
 * Build the project
 */
function buildProject() {
    var adc = global.project.adc;
    var logger = global.adcLogger;
    if (!adc || !adc.path) {
        return;
    }

    clearOutput();
    adc.build({
        logger : logger
    });
}

/**
 * Open preferences
 */
function openPreferences(){
    appSettings.getPreferences(function onReadPreferences(err, preferences){
        showModalDialog({
            type : 'preferences',
            preferences  : preferences
        }, 'main-save-preferences');
    });
}

/**
 * Save preferences
 */
function savePreferences(event, button, options) {
    if (button !== 'ok' && button !== 'yes') {
        return;
    }
    if (!options.preferences) {
        return;
    }
    appSettings.setPreferences(options.preferences);
}

/**
 * Closing the main window
 * @param event
 */
function onCloseMainWindow(event) {
    if (!enforceQuit && workspaceController.hasEditingTabs()) {
        event.preventDefault();
        showModalDialog({
            type : 'yesNoCancel',
            message : "Do you want to save modification before quit?"
        }, 'main-save-before-quit');
    }
}

/**
 * Save or not files before to quit
 */
function saveOrNotBeforeQuit(event, button) {
    switch (button) {
        case 'yes':
        case 'ok':
            app.on("workspace-save-all-finish", function () {
                app.quit();
            });
            app.emit('menu-save-all-files');
            break;
        case 'no':
            enforceQuit = true;
            app.quit();
            break;
        case 'cancel':
        default:
            // Do nothing
            break;
    }
}

/**
 * Open or close the dev tools of the specified view
 * @param event
 * @param {String} view Name of the webview from where to toggle the dev tools
 */
function toggleDevTools(view) {
    mainView.send('toggle-dev-tools', view);
}

/**
 * When the application gain the focus
 */
function onAppFocus() {
    mainView.send('application-focus');
}


/**
 * Fire when the main window is ready
 */
ipc.on('main-ready', function (event) {
    mainView = event.sender;

    app.removeListener('show-modal-dialog', showModalDialog);
    app.on('show-modal-dialog', showModalDialog);

    // When focused on the app
    app.removeListener('browser-window-focus', onAppFocus);
    app.on('browser-window-focus', onAppFocus);

    // New project
    app.removeListener('menu-new-project', newProject);
    app.on('menu-new-project', newProject);
    ipc.removeListener('main-create-new-project', createNewProject);
    ipc.on('main-create-new-project', createNewProject);

    // Open project
    app.removeListener('menu-open-project', openProject);
    app.on('menu-open-project', openProject);

    // Validate project
    app.removeListener('menu-validate', validateProject);
    app.on('menu-validate', validateProject);

    // Build project
    app.removeListener('menu-build', buildProject);
    app.on('menu-build', buildProject);

    app.removeListener('menu-dev-tools', toggleDevTools);
    app.on('menu-dev-tools', toggleDevTools);

    // About ADXStudio
    app.removeListener('menu-about-adxstudio', showAbout);
    app.on('menu-about-adxstudio', showAbout);
    
    // Preferences
    app.removeListener('menu-open-preferences', openPreferences);
    app.on('menu-open-preferences', openPreferences);
    ipc.removeListener('main-save-preferences', savePreferences);
    ipc.on('main-save-preferences', savePreferences);

    // Verify everything before to quit the application
    global.mainWindow.removeListener('close', onCloseMainWindow);
    global.mainWindow.on('close', onCloseMainWindow);
    ipc.removeListener('main-save-before-quit', saveOrNotBeforeQuit);
    ipc.on('main-save-before-quit', saveOrNotBeforeQuit);



});
