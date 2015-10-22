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

### workspace-set-current-tab

The `workspace-set-current-tab` event is fire when the current tab change

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the current active and focused tab     

### 'workspace-move-tab

The `workspace-move-tab` event is fire when the current tab should be move to another pane

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab to move
* **targetPane** Name of the target pane

### workspace-close-tab

The `workspace-close-tab` event is fire when the user try to close a tab.

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab to close

### workspace-close-all-tabs

The `workspace-close-all-tabs` event is fire when the user try to close all tabs.

It's fire with the following arguments:

* **event** Event object
* **options** Object with the optional keys: `except` (with the id of the tab to not close)

### workspace-edit-content

The `workspace-edit-content` event is fire only one time when the content start changing

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab that hold the content

### workspace-restore-content

The `workspace-restore-content` event is fire only one time when the changed content has been restored (back to the original content)

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab that hold the content

### workspace-save-content

The `workspace-save-content` event is fire when the user try to save the content of a given file.

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab that hold the content
* **content** The content to save

### workspace-save-content-as

The `workspace-save-content-as` event is fire when the user try to save the content to another file.

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab that hold the content
* **content** The content to save


### workspace-save-content-and-close

The `workspace-save-content-and-close` event is fire when the user try to close the tab but want to save the content before

It's fire with the following arguments:

* **event** Event object
* **tabId** Id of the tab that hold the content
* **content** The content to save
     
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
 
### workspace-save-active-file

The `workspace-save-active-file` event is fire when the user click on main `Save` menu.
 
It's fire with no arguments. 
The workspace view will trigger back relative events to save the current active content.

### workspace-save-as-active-file

The `workspace-save-as-active-file` event is fire when the user click on main `Save As` menu.
 
It's fire with no arguments. 
The workspace view will trigger back relative events to 'save as' the current active content.

### workspace-save-all-files

The `workspace-save-all-files` event is fire when the user click on main `Save All` menu.
 
It's fire with no arguments. 
The workspace view will trigger back relative events to save all the files.

 
### workspace-update-tab

The `workspace-update-tab` event is fire when the tab has been saved.

It's fire with the following arguments

 * **err** Possible error that could occurred, null when everything is ok.
 * **tab** Tab object, with id/name/content/path etc...
 * **pane** Name of the pane where the tab should be created
 
### workspace-reload-tab

The `workspace-reload-tab` event is fire when the tab has changed externally(renamed or modified).

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

### workspace-remove-tabs

The `workspace-remove-tabs` event is fire when tabs could be remove safely.
 
It's fire with following arguments:
 
 * **err** Possible error that could occurred, null when everything is ok.
 * **removedTabs** An array of object with the following keys: 
   - `tab` that Tab object, with id/name/content/path etc...
   - `pane` the name of the pane where the tab was


### workspace-change-tab-location
 
The `workspace-change-tab-location` event is fire when a tab could be move to another tab.
 
It's fire with following arguments:
 
 * **err** Possible error that could occurred, null when everything is ok.
 * **tab** Tab object, with id/name/content/path etc...
 * **pane** Name of the pane where the tab is located 
 
 