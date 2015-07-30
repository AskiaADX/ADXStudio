# Explorer

The explorer is the left space in the IDE dedicated to the tree view when folders/projetcs are opens.

The explorer contains :

 * Folders name
 * Files name
 * Indentation of child Files or child Folders

In that way, you can easily see the architecture of the current project, and also have a fast access to files/folders.

## Events from View

The Explorer view trigger the following events:

### explorer-ready

The 'explorer-ready' event is fire when the DOM of the explorer is fully loaded and the view component is ready to be used.

        var ipc = require('ipc');
        ipc.send('explorer-ready')


**In fact, the event 'explorer-ready' load a default folder (see 'explorer-load-file' event) that we will be able to change.**

### explorer-load-file

This event gives to the explorer the file we want to load. More precisely, the file selected.

**In Explorer**

        var ipc =  require('ipc');
        ipc.send('explorer-load-file', file);


### explorer-load-folder

This event gives to the explorer the folder, and its content.

**In Explorer**

        var ipc =  require('ipc');
        ipc.send('explorer-load-folder', file.path, item.id);
        //In order to send the path of the file selected and the id of the item.

## Events from Controller

The controller, will receive all sending messages, and execute functions with it :

## explorer-expand-folder

The controller will manage the reception of the event 'explorer-ready',
by create a function which will use the file send in param in the view side.

        var ipc = require('ipc');
        var explorer = require('../../src/explorer/explorer.js');


        ipc.on('explorer-ready', function(event) {
          var defaultPath = path.join(__dirname, '../../');
          explorer.load(defaultPath, function(err, files) {
            sender.send('explorer-expand-folder', err, files, root);
            //...
            });
          });


**In the sender.send(...)**

  * 'loadFolder' is message sent.
  * 'err' parameter which describe an error.
  * 'files', the file selected.
  * 'root', the origin of the path.


This event had been created in order to send message to the controller.
It will load the folder chosen.

        ipc.on('explorer-loadfolder', function(event, folderpath, elementid) {
          explorer.load(folderpath, function(err, files) {
            event.sender.send('explorer-expand-folder', err, files, elementid);
          });
        });

  **About the 'event.sender.send'**
  * 'loadFoler' the message sent.
  * 'err' the information about the potential error.
  * 'files' the files selected.
  * 'elementid' the id of the file selected.
