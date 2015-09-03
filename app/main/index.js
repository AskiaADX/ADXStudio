(function () {
  var ipc = require('ipc'),
      exp = document.getElementById("explorer"),
      wks = document.getElementById("workspace"),
      countDownReadyWebView = 2; // 2 webviews must be loaded

    function catchConsoleLog(event) {
      console.log(event.message);
    }

    /**
     * Look how many web-views are loaded and fire the ready event when all are ready
     */
    function onWebViewLoaded(){
      countDownReadyWebView--;
      if (!countDownReadyWebView) {
        ipc.send('main-ready');
      }
    }

    exp.addEventListener('console-message', catchConsoleLog);
    wks.addEventListener('console-message', catchConsoleLog);

    // Dev tools of the webview
    exp.addEventListener("dom-ready", function(){
      onWebViewLoaded();
      exp.openDevTools();
    });

    wks.addEventListener("dom-ready", function(){
      onWebViewLoaded();
      wks.openDevTools();
    });


    // Resizer between the explorer element and the workspace
    var resExpl = new adx.Resizer({
      element  : document.getElementById('panel_explorer'),
      direction: 'horizontal'
    });

    resExpl.start();

      // Listen a potential ipc-message which channel is 'show-Modal-Dialog'.
      // Once triggered, we apply the showModalDialog API.
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
          ipc.send(event.args[1], event.args[2]);
          }
        });
      }

      if (event.channel ==='show-Modal-Dialog-form') {

        showModalDialog(event.args[0], function(result) {
          //Send informations.


          ipc.send(event.args[1], result);
          return result;
        });
      }

    });


    /**
     * Get the list of ADC templates
     */
    ipc.on('set-template-list', function (templates) {
        showModalDialog.adcTemplates = templates;
    });
}());
