var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var appSettings = require('../appSettings/appSettingsModel.js');
var ADC = require('adcutil').ADC;
var fs = require("fs");
var path = require("path");
var uuid = require('node-uuid');
var mainView;

require('../workspace/workspaceController.js');
require('../explorer/explorerController.js');
require('./menuController.js');

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
        type : 'newADCProject'
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

    ipc.removeListener('main-create-new-project', createNewProject);
    ipc.on('main-create-new-project', createNewProject);
});
