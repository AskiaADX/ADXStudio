# Workspace

The workspace is the central space in the IDE dedicated to edit the file content.

ADXStudio provide different kind of edition according to the type of file:

 * Text editor (HTML / XML / CSS / JS / AskiaScript)
 * ADC Configuration
 * Multimedia (Image / Video / Audio)
 
  
 ## Events from View
 
 The workspace view trigger the following events:
 
### workspace-ready

The `workspace-ready` event is fire when the DOM of the workspace is fully loaded and the view component is ready to be
use.

     var ipc = require('ipc');
     ipc.on('workspace-ready', function (event) {
        // ... code that uses the workspace 
     });

### workspace-close-tab

The `workspace-close-tab` event is fire when the user try to close a tab.

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab to close
     
## Events from Controller

The workspace controller trigger the following events:

### workspace-create-tab

The `workspace-create-tab` event is fire when the creation of a new tab is needed.

It's fire with following arguments:

* **err** Possible error that could occurred, null when everything is ok.
* **tab** Tab object, with id/name/content/path etc...
* **pane** Name of the pane where the tab should be created

### workspace-focus-tab

The `workspace-focus-tab` event is fire when it's needed to focus another existing tab.

It's fire with the following arguments:

* **err** Possible error that could occured, null when everything is ok.
* **tab** Tab to focus
* **pane** Name of the pane where the tab should be located

### workspace-create-and-focus-tab

The `workspace-create-and-focus-tab` is the combination of the two previous events.

It first create the tab and then focus it.

It's fire with the following arguments

 * **err** Possible error that could occurred, null when everything is ok.
 * **tab** Tab object, with id/name/content/path etc...
 * **pane** Name of the pane where the tab should be created
 
### workspace-remove-tab
 
The `workspace-remove-tab` event is fire when a tab could be remove safely.
 
It's fire with following arguments:
 
 * **err** Possible error that could occurred, null when everything is ok.
 * **tab** Tab object, with id/name/content/path etc...
 * **pane** Name of the pane where the tab is located 