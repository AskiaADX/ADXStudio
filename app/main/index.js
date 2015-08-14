


(function () {
  var ipc = require('ipc'),
      exp = document.getElementById("explorer"),
      wks = document.getElementById("workspace");

    function catchConsoleLog(event) {
      console.log(event.message);
    }

    exp.addEventListener('console-message', catchConsoleLog);
    wks.addEventListener('console-message', catchConsoleLog);

    // Dev tools of the webview
    exp.addEventListener("dom-ready", function(){
      exp.openDevTools();
    });

    wks.addEventListener("dom-ready", function(){
      wks.openDevTools();
    });


    // Resizer between the explorer element and the workspace
    var resExpl = new adx.Resizer({
      element  : document.getElementById('panel_explorer'),
      direction: 'horizontal'
    });

    resExpl.start();

      // Listen a potential ipc-message which channel is 'show-Modal-Dialog'.
      // Once triggerd, we apply the showModalDialog API.
      // in the callback of the API, we send the value returned : "result" ("clicked" in the API)
      // event.args[1] send a message. 'rename-file'
      // ipc.send --> explorerController.js
    exp.addEventListener('ipc-message', function(event) {


      if (event.channel === 'show-Modal-Dialog') {

        /*
        event.args[0] =  {type: 'prompt', text:'Rename your file here:', value: file.name}
        event.args[1] = 'explorer-rename'
        event.args[2] = {name:'toto', path:'nlah/blaj', type:'file' || 'folder'}
        */
        showModalDialog(event.args[0], function(result) {

          if(result.button === 'ok' && result.value) {
          ipc.send(event.args[1], event.args[2], result.value);
          }
        });
      }


      if (event.channel === 'show-Modal-Dialog-remove') {


        showModalDialog(event.args[0], function(result) {

          if(result.button === 'yes') {
            console.log('send ' + event.args[1]);
          ipc.send(event.args[1], event.args[2]);
          }
        });
      }

    });

}());
