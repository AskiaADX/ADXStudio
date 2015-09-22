(function () {
  var ipc = require('ipc'),
      exp = document.getElementById("explorer"),
      wks = document.getElementById("workspace"),
      askia = window.askia,
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
          // Resizer between the explorer element and the workspace
          var resExpl = new askia.Resizer({
              element  : document.getElementById('panel_explorer'),
              direction: 'horizontal'
          });

          resExpl.start();
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



    // Listen a potential ipc-message which channel is 'show-Modal-Dialog'.
    // Once triggered, we apply the showModalDialog API.
    // in the callback of the API, we send the value returned : "result" ("clicked" in the API)
    // event.args[1] send a message. 'rename-file'
    // ipc.send --> explorerController.js
    exp.addEventListener('ipc-message', function(event) {
        if (event.channel === 'show-modal-dialog') {
            /*
             event.args[0] =  {type: 'prompt', message:'Rename your file here:', value: file.name}
             event.args[1] = 'explorer-rename'
             event.args[2] = {name:'toto', path:'nlah/blaj', type:'file' || 'folder'}
             */
            askia.modalDialog.show(event.args[0], function(result) {
                if (result.button === 'ok' || result.button === 'yes') {
                    var args = event.args.splice(1, event.args.length); // Remove the first arg
                    if (result.value) {
                        args.push(result.value);
                    }
                    ipc.send.apply(ipc, args);
                }
            });
        }

    });


    /**
     * Get the list of ADC templates
     */
    ipc.on('set-template-list', function (templates) {
        askia.modalDialog.adctemplates = templates;
    });
}());
