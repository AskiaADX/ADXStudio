var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('ipc');
var appSettings = require('./appSettings/appSettingsModel.js');
var ADC = require('adcutil').ADC;

require('./workspace/workspaceController.js');
require('./explorer/explorerController.js');
require('./main/menuController.js');


// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;


// Reference to the main view
var mainView;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function loadMainWindow() {
    // Initialize the global.project
    global.project = {};
    
    // Load the default project path earlier in the application lifetime
    appSettings.getInitialProject(function onInitialProject(projectPath) {
        if (projectPath) {
            global.project.path = projectPath;
            global.project.adc = new ADC(projectPath);
        }
        
        // Create the browser window, but don't show
        mainWindow = new BrowserWindow({width: 800, height: 600, show : false});

        // Maximize it first
        mainWindow.maximize();

        // and load the index.html of the app.
        mainWindow.loadUrl('file://' + __dirname + '/main/index.html');

        // Now show it
        mainWindow.show();

        // Emitted when the window is closed.
        mainWindow.on('closed', function onMainWindowClose() {

            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });
    });
});

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

    if (!options.name) {
        console.log('TODO::Manage error');
        console.log('Require a valid name');
        return;
    }

    showLoader("Create `" + options.name + "` ADC project");

    var project = {
        output: options.path,
        template: options.template,
        description: options.description
    };
    project.author = {
        name: 'Maxime',
        email: 'nanana@gmail.com',
        company: 'askia',
        website: 'http://askia.com'
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

        // Open the newest project
        app.emit('menu-open-project', adc.path);
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
