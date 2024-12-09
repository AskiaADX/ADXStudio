# Explorer

The explorer is the left space in the IDE dedicated to the tree view when folders/projects are opened.

The explorer contains :

 * Folders name
 * Files name
 * Indentation of child Files or child Folders

In that way, you can easily see the architecture of the current project, and also have a fast access to files/folders.

## Events from View

The Explorer view trigger the following events:

### explorer-ready

The 'explorer-ready' event is fire when the DOM of the explorer is fully loaded and the view component is ready to be used.

### explorer-load-file

This event is fire when the user click on file.

### explorer-load-folder

This event is fire when the user click on folder.

### explorer-add-item

This event is fire when the user try add a new file or folder.

It's fire with the following arguments:

* **event** Event object
* **dirPath** Path of the directory where to create the new item.
* **type** Type of item it could be ('file', 'directory', 'html', 'css', 'js').
* **itemName** Name of the file or directory

### explorer-rename

This event is fire when the user try renaming a file or folder.

It's fire with the following arguments:

* **event** Event object
* **file** Object that contains old item definition (name, path, type).
* **newName** New name of the item.

### explorer-remove

This event is fire when the user try to remove a file or folder.

It's fire with the following arguments:

* **event** Event object
* **file** Object that contains the item definition (name, path, type).

### explorer-show-project-settings

This event is fire when the user wants to display the project settings

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
  * 'loadFolder' the message sent.
  * 'err' the information about the potential error.
  * 'files' the files selected.
  * 'elementid' the id of the file selected.
