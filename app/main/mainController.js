var app = require('app');  // Module to control application life.
var util = require('util');
var ipc = require('ipc');
var appSettings = require('../appSettings/appSettingsModel.js');
var ADC = require('adcutil').ADC;
var fs = require("fs");
var path = require("path");
var uuid = require('node-uuid');
var mainView;

var workspaceController = require('../workspace/workspaceController.js');
require('../explorer/explorerController.js');
require('./menuController.js');

/**
 * Enforce the quit of the application even if files are editing
 * @type {boolean}
 */
var enforceQuit = false;

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
function clearOutput(){
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
 * Show the modal dialog to create a new project
 */
function newProject() {
    showModalDialog({
        type : 'newADCProject',
        buttonText : {
            ok : "Create project"
        }
    }, 'main-create-new-project');
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
            console.log('TODO::Manage error');
            console.log(err);
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
    switch(button) {
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
            // Do nothing
            break;
    }
}

/**
 * Fire when the main window is ready
 */
ipc.on('main-ready', function (event) {
    mainView = event.sender;

    ADC.getTemplateList(function (err, templates) {
        if (err) {
            console.log(err);
            return;
        }
        mainView.send('set-template-list', templates);
    });

    app.removeListener('show-modal-dialog', showModalDialog);
    app.on('show-modal-dialog', showModalDialog);

    app.removeListener('menu-new-project', newProject);
    app.on('menu-new-project', newProject);

    app.removeListener('menu-open-project', openProject);
    app.on('menu-open-project', openProject);

    app.removeListener('menu-validate', validateProject);
    app.on('menu-validate', validateProject);
    
    app.removeListener('menu-build', buildProject);
    app.on('menu-build', buildProject);

    ipc.removeListener('main-create-new-project', createNewProject);
    ipc.on('main-create-new-project', createNewProject);

    global.mainWindow.removeListener('close', onCloseMainWindow);
    global.mainWindow.on('close', onCloseMainWindow);

    ipc.removeListener('main-save-before-quit', saveOrNotBeforeQuit);
    ipc.on('main-save-before-quit', saveOrNotBeforeQuit);

});
