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


    // Resizer between the explorer element and the workspace
    var resExpl = new adx.Resizer({
      element  : document.getElementById('panel_explorer'),
      direction: 'horizontal'
    });

    resExpl.start();

}());

//NEW CODE 27/07/2015 ---> hide background when dialog is open.


function hideWindow() {
  var hide = document.createElement('div');

  hide.className = 'hideWindow';
  document.body.appendChild(hide);
}


//TODO:: COMPLETE THE FUNCTION, DO THE IPC.SEND(...) IN MENUCONTROLLER.JS
/* ipc.on('HIDEoption', function(){
  var find = document.body.querySelector('.hideWindow');

  if (find) {
    return;
  } else {
    hideWindow();
  }

});
 */
