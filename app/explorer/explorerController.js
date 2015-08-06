var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');
var path = require('path');
var ADC   = require('adcutil').ADC;

ipc.on('explorer-ready', function(event) {
    var sender = event.sender;

    var defaultPath = path.join(__dirname, '../../');
    explorer.load(defaultPath, function(err, files) {
        sender.send('explorer-expand-folder', err, files, 'root');
        global.project.path = defaultPath;
        global.project.adc  = new ADC(global.project.path);
    }); 

    app.on('menu-open-project', function (folderpath) {
        explorer.load(folderpath, function(err, files) {
            sender.send('explorer-expand-folder', err, files, 'root');
            global.project.path = folderpath;
            global.project.adc  = new ADC(global.project.path);
        });
    });
});

ipc.on('explorer-load-folder', function(event, folderpath, elementid) {
  explorer.load(folderpath, function(err, files) {
    event.sender.send('explorer-expand-folder', err, files, elementid);
  });
});
