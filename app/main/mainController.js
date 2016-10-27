"use strict";

const electron = require('electron');
const app = electron.app;
const util = require('util');
const ipc = electron.ipcMain;
const appSettings = require('../appSettings/appSettingsModel.js');
const ADX = require('adxutil').ADX;
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
 */
function writeOutput(text) {
    mainView.send('output-write', util.format.apply(null, arguments));
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
 * Logger for the ADXUtil
 */
global.adxLogger = {
    writeMessage : writeOutput,
    writeError : writeOutput,
    writeWarning : writeOutput,
    writeSuccess : writeOutput
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

function showKeyboardShortcuts() {
    showModalDialog({
        type : 'Keyboard-Shortcuts'
    });
}

/**
 * Show the modal dialog to create a new project
 */
function newProject() {
    ADX.getTemplateList('adc', function (err, adcTemplates) {
        ADX.getTemplateList('adp', function (err, adpTemplates) {
            showModalDialog({
                type : 'newADXProject',
                buttonText : {
                    ok : "Create project"
                },
                adcTemplates : adcTemplates,
                adpTemplates : adpTemplates,
                defaultRootDir : app.getPath('documents')
            }, 'main-create-new-project');
        });
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
    showLoader("Creating `" + options.name + "` ADX project ...");
    var project = {
        output: options.path,
        template: options.template,
        description: options.description
    };
    ADX.generate(options.projectType, options.name, project, function (err, adx) {
        closeModalDialog();
        if (err) {
            showModalDialog({
                type : 'okOnly',
                message : err.message      
            });
            return;
        }
        global.project.set(adx);

        // Open the project with the 'Project settings' tab open
        fs.mkdir(path.join(adx.path, '.adxstudio'), function () {
            fs.writeFile(path.join(adx.path, '.adxstudio', 'workspace.json'),  JSON.stringify({
                tabs: [
                    {
                        id: uuid.v4(),
                        pane: "main",
                        current: true,
                        config: {
                            path: adx.path,
                            type: "projectSettings"
                        }
                    }
                ]
            }), {encoding: 'utf8'}, function () {
                // Open the newest project
                app.emit('menu-open-project', adx.path);
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
    var adx = global.project.getADX();
    var logger = global.adxLogger;
    if (!adx || !adx.path) {
        return;
    }

    clearOutput();
    adx.validate({
        logger : logger,
        printMode : 'html'
    });
}

/**
 * Build the project
 */
function buildProject() {
    var adx = global.project.getADX();
    var logger = global.adxLogger;
    if (!adx || !adx.path) {
        return;
    }

    clearOutput();
    adx.build({
        logger : logger,
        printMode : 'html'
    });
}

/**
 * Validate the publication project
 */
function publishZendeskProject() {
    showModalDialog({
            type : 'okCancel',
            message : "Do you want to publish your program on Zendesk?"
        }, 'publish-validation');
}

/**
 * Publish the project
 */
function publishZendesk(event, button) {
    if (button === "cancel") {
        return;
    }
    appSettings.getPreferences(function (err, preferences) {
        var adx = global.project.getADX();
        var logger = global.adxLogger;
        if (!adx || !adx.path) {
            return;
        }
        
        clearOutput();
        adx.publish("ZenDesk", {
            username 			: preferences.loginZendesk,
            password 			: preferences.password,
            url 	 			: preferences.uri,
            section  			: preferences.sectionTitle,
            promoted 			: preferences.promoted,
            demoUrl 			: preferences.uriDemo,
            comments_disabled 	: preferences.commentDisable,
            logger 				: logger,
            printMode 			: 'html'
        }, function (err) {
            if (err) {
                console.log(err);
            }
        });        
    })
}


/**
 * Open preferences
 */
function openPreferences(){
    appSettings.getPreferences(function onReadPreferences(err, preferences){
        fs.readdir(path.join(__dirname, '../themes'), function(err, files) {
            const dirs = [];
            files.forEach(function(file) {
                const stat = fs.statSync(path.join(__dirname, "../themes/", file));
                try {
                    fs.statSync(path.join(__dirname, "../themes/", file, "/application.css"));
                }
                catch (err) {
                    return;
                }
                
                if (stat.isDirectory()) {
                    dirs.push(file);
                }
            });
            showModalDialog({
                type : 'preferences',
                preferences  : preferences,
                themes : dirs || ['default']
            }, 'main-save-preferences');
        });
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
 * Switch the current theme
 * @param {String} themeName The name of the new theme
 */
function switchTheme(themeName) {
    mainView.send('switch-theme', themeName);
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
    
    // Publish the project on zendesk
    app.removeListener('menu-publish-zendesk', publishZendeskProject);
    app.on('menu-publish-zendesk', publishZendeskProject);
    ipc.removeListener('publish-validation', publishZendesk);
    ipc.on('publish-validation', publishZendesk);

    app.removeListener('menu-dev-tools', toggleDevTools);
    app.on('menu-dev-tools', toggleDevTools);

    // About ADXStudio
    app.removeListener('menu-about-adxstudio', showAbout);
    app.on('menu-about-adxstudio', showAbout);

    app.removeListener('menu-shortcuts', showKeyboardShortcuts);
    app.on('menu-shortcuts', showKeyboardShortcuts);

    // Preferences
    app.removeListener('menu-open-preferences', openPreferences);
    app.on('menu-open-preferences', openPreferences);
    ipc.removeListener('main-save-preferences', savePreferences);
    ipc.on('main-save-preferences', savePreferences);
    app.removeListener('preference-switch-theme', switchTheme);
    app.on('preference-switch-theme', switchTheme);

    // Verify everything before to quit the application
    global.mainWindow.removeListener('close', onCloseMainWindow);
    global.mainWindow.on('close', onCloseMainWindow);
    ipc.removeListener('main-save-before-quit', saveOrNotBeforeQuit);
    ipc.on('main-save-before-quit', saveOrNotBeforeQuit);
});