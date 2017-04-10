# Main

This is the entry point of the application, it manage the main window and processes.
It also manage the the main menu
  
  
  
## Menu Events

All menu events are emit through the `app` object.

You can attach event using the following code snippet:

      // menu-EVENT must be replace by the relevant event
      app.on('menu-EVENT', function () {
      
      });

### menu-open-file

The `menu-open-file` event is fire when the user has select a file to open.

It's fire with the following arguments:

* **filepath** Path of the file to open

### menu-open-project

The `menu-open-project` event is fire when the user has select the folder which contains the project to open.

It's fire with the following arguments:

* **folderpath** Path of the project folder to open


### menu-open-project-settings

The `menu-open-project-settings` event is fire when the user request to open the project settings tab.