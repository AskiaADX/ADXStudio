var ipc = require('ipc');
var path = require('path');
var workspace = require('../../src/workspace/workspace.js');



ipc.on('workspace-ready', function (event) {
    var sender = event.sender;

    ipc.on('explorer-loadfile', function(event, file) {
      workspace.createTab(file, function (err, tab, pane) {
          if (err) throw err;
          tab.loadFile(function (err) {
              sender.send('workspace-create-and-focus-tab', err, tab, pane);
          });
      });
    });

    workspace.createTab({
        name : 'workspace.css',
        path : path.join(__dirname, '/workspace.css'),
        type : 'file'
    }, function (err, tab, pane) {
        if (err) throw err;
        tab.loadFile(function (err) {
            sender.send('workspace-create-and-focus-tab', err, tab, pane);
            openTheSecond();
        });
    });

    function openTheSecond() {
        workspace.createTab({
            name : 'workspace.html',
            path : path.join(__dirname, '/workspace.html'),
            type : 'file'
        }, function (err, tab, pane) {
            if (err) throw err;
            tab.loadFile(function (err) {
                sender.send('workspace-create', err, tab, pane);
            });
        });
    }


});
