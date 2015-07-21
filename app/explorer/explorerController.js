var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');
var path = require('path');

ipc.on('explorer-ready', function(event) {
    var sender = event.sender;

    var defaultPath = path.join(__dirname, '../../');
    explorer.load(defaultPath, function(err, files) {
        sender.send('loadFolder', err, files, 'root');
        global.project = global.project || {};
        global.project.path = defaultPath;
    });

    app.on('menu-open-project', function (folderpath) {
        explorer.load(folderpath, function(err, files) {
            sender.send('loadFolder', err, files, 'root');
            global.project = global.project || {};
            global.project.path = folderpath;
        });
    });
});

ipc.on('explorer-loadfolder', function(event, folderpath, elementid) {
  explorer.load(folderpath, function(err, files) {
    event.sender.send('loadFolder', err, files, elementid);
  });
});




