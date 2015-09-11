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


var fs = require('fs');
var app = require('app');
var path = require('path');
var ipc = require('ipc');
var pathInit    = app.getPath('appData'),
    pathAppData = path.join(pathInit, 'ADXStudio');


     /*
     * Push all informations in a "data file" where we can have: explorer data, workspace data and at least user data informations. (TODO)
     * this function will be called each time there is a changement in ADXStudio ( On event: resizer, open new folder... )
     *
     * There is twp files expData.txt and wksData.txt which are used to save user preferences.
     *
     *
     * @param expData {Object} Object which contains all explorer user preferences and last projects opened
     * @param wksData {Object} Object which contains all workspace user preferences and last tab opened
     */
    function pushInfoData(expData, wksData) {
      if (expData && (wksData === undefined || wksData)) {

        // Write new informations about explorer data --> explorer size, last project created or opened.
        fs.writeFile( pathAppData + '/expData.json', JSON.stringify(expData), function(err) {
          if (err) {
            throw err;
          }
          console.log('Data have been saved inside: ' + pathAppData + '/expData.txt');
        });
      }

      if (wksData && (expData === undefined || expData)) {
        // Write new informations about workspace data --> last tab open, preview size, grid size.
        fs.writeFile( pathAppData + '/wksData.json', JSON.stringify(wksData), function(err) {
          if (err) {
            throw err;
          }
          console.log('Data have been saved inside: ' + pathAppData + '/wksData.txt');
        });
      }
    }



    /*
    * Get all data of the workspace and the explorer to send it to other controlers/Views.
    * This function will be usually used when we open a new window of ADXStudio.
    *
    */
    function getDataInfo() {

      // Get explorer's data.
      fs.readFile(pathAppData + '/expData.json','utf8', function(err1, data1) {

        if (err1) {
          throw err1;
        }

        var newExpInfo = JSON.parse(data1);

        return newExpInfo;

      });

      //Get workspace's data.
      fs.readFile(pathAppData + '/wksData.json', 'utf8', function(err2, data2) {

        if (err2) {
          throw err2;
        }

        var newWksInfo = JSON.parse(data2);

        return newWksInfo;

      });

      ipc.send('data-load-newData', newExpInfo, newWksInfo);
    }

ipc.on('main-get-data', getDataInfo);

ipc.on('explorer-data-change', pushInfoData);
ipc.on('workspace-data-change', pushInfoData);


//exemple of the function pushInfoData.
var b = {
  testwks:'ok'
  };
var a = {
  testexp:'ok'
  };

pushInfoData(a,b);
