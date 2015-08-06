
(function () {
  var ipc = require('ipc'),
      exp = document.getElementById("explorer"),
      wks = document.getElementById("workspace");

    function catchConsoleLog(event) {
      console.log( event.message );
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

/*ipc.on('explorer-rename', function() {
  showModalDialog({type:'prompt', text:'Rename your file here:'}, function(){
    console.log('ca marche');
  });
});
*/

}());
