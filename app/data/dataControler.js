var fs = require('fs');
var app = require('app');
var path = require('path');

  /*
  * Saving Datas about ADXStudio configurations:
  * -Last project opened
  * -Last files opened
  * -Last files modified
  * -Window size
  * -Window size of the preview
  *
  * Operation:
  *   1- At the launchment of ADXStudio, will check if the folder AppData contains the folder ADXStudio
  *      a. if not: Create the folder with all files needed
  *      b. if yes: Get informations of files inside AppData/ADXStudio
  *   2- The function will send informations that have been get from files AppData/ADXStudio.
  *   3- Informations will be used to be open everywhere in the project. ( Example: in the menu bar, 'Most recently used')
  *
  */



      /*
      * Sample of Code:
      *       app.on(identifier +'-data-information', function(event, info) {
      *
      *         var wksData = {};
      *         var explData = {};
      *
      *        switch(event) {
      *           case 'explorer-data-information':
      *
      *            for(i = 0; i <= 4; i++ ) {
      *              explData.lastItem[i].name = info.name;
      *              explData.lastItem[i].path = info.path;
      *            }
      *
      *           break;
      *
      *           case 'workspace-data-information':
      *           //...
      *           break;
      *
      *           default: ...
      *         }
      *
      *       });
      * @param event {String} To know the sender of data informations.
      * @param info {Object} Contains all informations about data sent, ( info.item1|info.item2|info.item3|info.item4|info.resizerPane1|info.resizerPane2|info.resizerPreview )
      *
      */
    function informationData() {

      fs.writeFile('C:/Users/DevTeam_Paris/AppData/ADXStudio/ADXtmpInfo.txt', 'Test1', function(err, fls) {
        console.log('test1 done');
      });

    }

     /*
     * Verify if the folder ADXStudio exist in the AppData folder.
     *
     *
     *
     */
    function pushInfoData() {

          var   objTemp = {
                            super: '12342',
                            cool: 'vrwerwe'
                          },
            pathInit    = app.getPath('appData'),
            pathAppData = path.join(pathInit, 'ADXStudio');

        console.log(pathInit);

        fs.writeFile( pathAppData + '/tmp.txt', JSON.stringify(objTemp), function() {
          console.log('Data have been saved inside: ' + pathAppData + '/tmp.txt');
        });
    }

  pushInfoData();
