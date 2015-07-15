var ipc = require('ipc');
var path = require('path');
var workspace = require('../../src/workspace/workspace.js');



ipc.on('workspace-ready', function (event) {
    var sender = event.sender;

    ipc.on('explorer-loadfile', function(event, file) {
      workspace.find(file, function (err, tab, pane) {

          // If the tab already exist only focus it
          if (tab) {
              // TODO::Look if the content of the tab has changed
              // TODO::Look if the file has been removed
              sender.send('workspace-focus-tab', err, tab, pane);
              return;
          }

          // When the tab doesn't exist, create it
          workspace.createTab(file, function (err, tab, pane) {
              if (err) throw err;
              tab.loadFile(function (err) {
                  sender.send('workspace-create-and-focus-tab', err, tab, pane);
              });
          });
      });

    });

});

ipc.on('workspace-close-tab', function (event, tabId) {
    workspace.removeTab(tabId, function (err, tab, pane) {
       event.sender.send('workspace-remote-tab', err, tab, pane);
    });
});
