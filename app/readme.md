# Main

## Global variables

Global variables are accessible through the `global` object provide by NodeJS

### project

The `global.project` provide an object with the following structure:
 
      {
          path,        // {String} Path of the current open folder
          adc          // {ADC}    Instance of the ADC object
      }

     
## Events from View
 
 The main view trigger the following events:
 
### main-ready

The `main-ready` event is fire when the DOM of the main window is fully loaded.

     var ipc = require('ipc');
     ipc.on('main-ready', function (event) {
        // ... code that uses the workspace 
     });
     
    
## Events from Controller

The main controller trigger the following events:

### set-template-list

The `set-template-list` event is fire when the list of ADC templates is loaded.

It's fire with following arguments:

* **templates** List of templates (Array of objects with name/path values)