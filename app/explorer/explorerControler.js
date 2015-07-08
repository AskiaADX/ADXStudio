var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');



ipc.on('explorer-ready', function(event) {
  explorer.load('C:/', function(err, files) {
    event.sender.send('loadFolder', err, files, 'root');
  });
});

ipc.on('explorer-loadfolder', function(event, path, elementid) {
  explorer.load(path, function(err, files) {
    event.sender.send('loadFolder', err, files, elementid);
  });
});
