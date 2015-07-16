var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');

ipc.on('explorer-ready', function(event) {
    var sender = event.sender;

    explorer.load(require('path').join(__dirname, '../../'), function(err, files) {
        sender.send('loadFolder', err, files, 'root');
    });

    app.on('menu-open-project', function (folderpath) {
        explorer.load(folderpath, function(err, files) {
            sender.send('loadFolder', err, files, 'root');
        });
    });
});

ipc.on('explorer-loadfolder', function(event, path, elementid) {
  explorer.load(path, function(err, files) {
    event.sender.send('loadFolder', err, files, elementid);
  });
});




